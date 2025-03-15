const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const db = require('./database');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // In development, load from React dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Database operations
ipcMain.handle('getExercises', async () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM exercises', (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
});

ipcMain.handle('getExercise', async (_, id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM exercises WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
});

ipcMain.handle('saveExercise', async (_, exercise) => {
    return new Promise((resolve, reject) => {
        if (exercise.id) {
            db.run(
                'UPDATE exercises SET name = ?, description = ?, type = ? WHERE id = ?',
                [exercise.name, exercise.description, exercise.type, exercise.id],
                (err) => {
                    if (err) reject(err);
                    resolve(exercise.id);
                }
            );
        } else {
            db.run(
                'INSERT INTO exercises (name, description, type) VALUES (?, ?, ?)',
                [exercise.name, exercise.description, exercise.type],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        }
    });
});

ipcMain.handle('deleteExercise', async (_, id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM exercises WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
});

// Template handlers
ipcMain.handle('getTemplates', async () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT t.*, 
                   GROUP_CONCAT(te.exercise_id) as exercise_ids,
                   GROUP_CONCAT(te.sets) as sets,
                   GROUP_CONCAT(te.reps) as reps,
                   GROUP_CONCAT(te.position) as positions
            FROM templates t
            LEFT JOIN template_exercises te ON t.id = te.template_id
            GROUP BY t.id
            ORDER BY t.name
        `, (err, rows) => {
            if (err) reject(err);
            
            const templates = rows ? rows.map(row => ({
                id: row.id,
                name: row.name,
                exercises: row.exercise_ids ? row.exercise_ids.split(',').map((id, index) => ({
                    exercise_id: parseInt(id),
                    sets: parseInt(row.sets.split(',')[index]),
                    reps: parseInt(row.reps.split(',')[index]),
                    position: parseInt(row.positions.split(',')[index])
                })) : []
            })) : [];
            
            resolve(templates);
        });
    });
});

ipcMain.handle('saveTemplate', async (_, template) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            try {
                let templateId = template.id;
                if (!templateId) {
                    db.run(
                        'INSERT INTO templates (name) VALUES (?)',
                        [template.name],
                        function(err) {
                            if (err) throw err;
                            templateId = this.lastID;
                        }
                    );
                }

                db.run('DELETE FROM template_exercises WHERE template_id = ?', [templateId]);

                template.exercises.forEach((exercise, index) => {
                    db.run(
                        'INSERT INTO template_exercises (template_id, exercise_id, sets, reps, position) VALUES (?, ?, ?, ?, ?)',
                        [templateId, exercise.exercise_id, exercise.sets, exercise.reps, index]
                    );
                });

                db.run('COMMIT');
                resolve(templateId);
            } catch (err) {
                db.run('ROLLBACK');
                reject(err);
            }
        });
    });
});

// Workout handlers
ipcMain.handle('saveWorkout', async (_, workout) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const saveWorkout = () => {
                if (workout.id) {
                    return new Promise((res, rej) => {
                        db.run(
                            'UPDATE workouts SET name = ?, start_time = ?, end_time = ? WHERE id = ?',
                            [workout.name, workout.start_time, workout.end_time, workout.id],
                            (err) => {
                                if (err) rej(err);
                                res(workout.id);
                            }
                        );
                    });
                } else {
                    return new Promise((res, rej) => {
                        db.run(
                            'INSERT INTO workouts (name, start_time, end_time) VALUES (?, ?, ?)',
                            [workout.name, workout.start_time, workout.end_time],
                            function(err) {
                                if (err) rej(err);
                                res(this.lastID);
                            }
                        );
                    });
                }
            };

            saveWorkout()
                .then(workoutId => {
                    return new Promise((res, rej) => {
                        db.run('DELETE FROM workout_exercises WHERE workout_id = ?', [workoutId], (err) => {
                            if (err) rej(err);
                            res(workoutId);
                        });
                    });
                })
                .then(workoutId => {
                    const promises = workout.exercises.flatMap(exercise =>
                        exercise.sets.map((set, setIndex) =>
                            new Promise((res, rej) => {
                                db.run(
                                    'INSERT INTO workout_exercises (workout_id, exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
                                    [workoutId, exercise.exercise_id, setIndex + 1, set.weight, set.reps],
                                    (err) => {
                                        if (err) rej(err);
                                        res();
                                    }
                                );
                            })
                        )
                    );
                    return Promise.all(promises).then(() => workoutId);
                })
                .then(workoutId => {
                    db.run('COMMIT');
                    resolve(workoutId);
                })
                .catch(err => {
                    db.run('ROLLBACK');
                    reject(err);
                });
        });
    });
});

ipcMain.handle('getWorkouts', async () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT w.*, 
                   GROUP_CONCAT(we.exercise_id) as exercise_ids,
                   GROUP_CONCAT(we.set_number) as set_numbers,
                   GROUP_CONCAT(we.weight) as weights,
                   GROUP_CONCAT(we.reps) as reps
            FROM workouts w
            LEFT JOIN workout_exercises we ON w.id = we.workout_id
            GROUP BY w.id
            ORDER BY w.start_time DESC
        `, (err, rows) => {
            if (err) reject(err);
            
            const workouts = rows ? rows.map(row => ({
                id: row.id,
                name: row.name,
                start_time: row.start_time,
                end_time: row.end_time,
                exercises: row.exercise_ids ? row.exercise_ids.split(',').map((id, index) => ({
                    exercise_id: parseInt(id),
                    set_number: parseInt(row.set_numbers.split(',')[index]),
                    weight: parseFloat(row.weights.split(',')[index]),
                    reps: parseInt(row.reps.split(',')[index])
                })) : []
            })) : [];
            
            resolve(workouts);
        });
    });
});

ipcMain.handle('deleteWorkout', async (_, id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM workouts WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
});

ipcMain.handle('deleteTemplate', async (_, id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM templates WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            resolve();
        });
    });
});
