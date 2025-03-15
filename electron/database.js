const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'athlitrack.db'));

db.serialize(() => {
    // Exercises table
    db.run(`CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL
    )`);

    // Templates table
    db.run(`CREATE TABLE IF NOT EXISTS templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )`);

    // Template exercises table
    db.run(`CREATE TABLE IF NOT EXISTS template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        position INTEGER NOT NULL,
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )`);

    // Workouts table
    db.run(`CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL
    )`);

    // Workout exercises table
    db.run(`CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        weight REAL NOT NULL,
        reps INTEGER NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
    )`);
});

// Add sample data in a separate transaction
db.serialize(() => {
    db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
        if (err) {
            console.error('Error checking exercises:', err);
            return;
        }
        
        if (row.count > 0) {
            console.log('Database already has data, skipping initialization');
            return;
        }

        console.log('Initializing database with sample data...');
        
        db.run('BEGIN TRANSACTION', (err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                return;
            }

            const exercises = [
                ['Bench Press', 'Barbell bench press for chest development', 'strength'],
                ['Squat', 'Barbell back squat for leg strength', 'strength'],
                ['Deadlift', 'Conventional deadlift for overall strength', 'strength'],
                ['Pull-ups', 'Bodyweight back exercise', 'strength'],
                ['Push-ups', 'Bodyweight chest exercise', 'bodyweight'],
                ['Dumbbell Rows', 'Single-arm back exercise', 'strength'],
                ['Shoulder Press', 'Overhead press for shoulders', 'strength'],
                ['Lunges', 'Walking lunges for legs', 'strength'],
                ['Plank', 'Core stability exercise', 'bodyweight'],
                ['Bicep Curls', 'Isolation exercise for biceps', 'accessory']
            ];

            const insertExercise = (index) => {
                if (index >= exercises.length) {
                    insertTemplates();
                    return;
                }

                const [name, description, type] = exercises[index];
                db.run('INSERT INTO exercises (name, description, type) VALUES (?, ?, ?)',
                    [name, description, type], (err) => {
                        if (err) {
                            console.error('Error inserting exercise:', err);
                            db.run('ROLLBACK');
                            return;
                        }
                        insertExercise(index + 1);
                    });
            };

            const insertTemplates = () => {
                const templates = [
                    ['Full Body Workout', [['Bench Press', 3, 8], ['Squat', 3, 8], ['Pull-ups', 3, 8]]],
                    ['Upper Body', [['Bench Press', 4, 8], ['Push-ups', 3, 12], ['Shoulder Press', 3, 10]]],
                    ['Lower Body', [['Squat', 4, 8], ['Deadlift', 3, 8], ['Lunges', 3, 12]]]
                ];

                const insertTemplate = (index) => {
                    if (index >= templates.length) {
                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error('Error committing transaction:', err);
                                db.run('ROLLBACK');
                            } else {
                                console.log('Sample data inserted successfully');
                                insertWorkouts();
                            }
                        });
                        return;
                    }

                    const [name, exercises] = templates[index];
                    db.run('INSERT INTO templates (name) VALUES (?)', [name], function(err) {
                        if (err) {
                            console.error('Error inserting template:', err);
                            db.run('ROLLBACK');
                            return;
                        }
                        const templateId = this.lastID;
                        let exercisesInserted = 0;

                        exercises.forEach(([exerciseName, sets, reps], position) => {
                            db.get('SELECT id FROM exercises WHERE name = ?', [exerciseName], (err, row) => {
                                if (err || !row) {
                                    console.error('Error getting exercise id:', err);
                                    return;
                                }
                                db.run(
                                    'INSERT INTO template_exercises (template_id, exercise_id, sets, reps, position) VALUES (?, ?, ?, ?, ?)',
                                    [templateId, row.id, sets, reps, position],
                                    (err) => {
                                        if (err) {
                                            console.error('Error inserting template exercise:', err);
                                            return;
                                        }
                                        exercisesInserted++;
                                        if (exercisesInserted === exercises.length) {
                                            insertTemplate(index + 1);
                                        }
                                    }
                                );
                            });
                        });
                    });
                };

                insertTemplate(0);
            };

            const insertWorkouts = () => {
                const workouts = [
                    {
                        name: 'Morning Workout',
                        start_time: '2024-03-15 08:00:00',
                        end_time: '2024-03-15 09:00:00',
                        exercises: [
                            {
                                name: 'Bench Press',
                                sets: [
                                    { weight: 60, reps: 10 },
                                    { weight: 70, reps: 8 },
                                    { weight: 75, reps: 6 }
                                ]
                            },
                            {
                                name: 'Squat',
                                sets: [
                                    { weight: 80, reps: 8 },
                                    { weight: 90, reps: 6 },
                                    { weight: 100, reps: 4 }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'Evening Session',
                        start_time: '2024-03-15 18:00:00',
                        end_time: '2024-03-15 19:00:00',
                        exercises: [
                            {
                                name: 'Pull-ups',
                                sets: [
                                    { weight: 0, reps: 12 },
                                    { weight: 0, reps: 10 },
                                    { weight: 0, reps: 8 }
                                ]
                            },
                            {
                                name: 'Deadlift',
                                sets: [
                                    { weight: 100, reps: 5 },
                                    { weight: 120, reps: 3 },
                                    { weight: 130, reps: 2 }
                                ]
                            }
                        ]
                    }
                ];

                workouts.forEach(workout => {
                    db.run(
                        'INSERT INTO workouts (name, start_time, end_time) VALUES (?, ?, ?)',
                        [workout.name, workout.start_time, workout.end_time],
                        function(err) {
                            if (err) {
                                console.error('Error inserting workout:', err);
                                return;
                            }
                            const workoutId = this.lastID;

                            workout.exercises.forEach(exercise => {
                                db.get('SELECT id FROM exercises WHERE name = ?', [exercise.name], (err, row) => {
                                    if (err || !row) {
                                        console.error('Error getting exercise id:', err);
                                        return;
                                    }
                                    exercise.sets.forEach((set, setIndex) => {
                                        db.run(
                                            'INSERT INTO workout_exercises (workout_id, exercise_id, set_number, weight, reps) VALUES (?, ?, ?, ?, ?)',
                                            [workoutId, row.id, setIndex + 1, set.weight, set.reps]
                                        );
                                    });
                                });
                            });
                        }
                    );
                });
            };

            insertExercise(0);
        });
    });
});

module.exports = db; 