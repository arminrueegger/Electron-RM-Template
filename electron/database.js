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

    // Check if exercises table is empty and add sample data
    db.get('SELECT COUNT(*) as count FROM exercises', (err, row) => {
        if (err) {
            console.error('Error checking exercises:', err);
            return;
        }
        if (row.count > 0) return;

        // Add comprehensive sample exercises
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

        exercises.forEach(([name, description, type]) => {
            db.run('INSERT INTO exercises (name, description, type) VALUES (?, ?, ?)',
                [name, description, type], (err) => {
                    if (err) console.error('Error inserting exercise:', err);
                });
        });

        // Add sample templates
        const templates = [
            ['Full Body Workout', [['Bench Press', 3, 8], ['Squat', 3, 8], ['Pull-ups', 3, 8]]],
            ['Upper Body', [['Bench Press', 4, 8], ['Push-ups', 3, 12], ['Shoulder Press', 3, 10]]],
            ['Lower Body', [['Squat', 4, 8], ['Deadlift', 3, 8], ['Lunges', 3, 12]]]
        ];

        templates.forEach(([name, exercises]) => {
            db.run('INSERT INTO templates (name) VALUES (?)', [name], function(err) {
                if (err) {
                    console.error('Error inserting template:', err);
                    return;
                }
                const templateId = this.lastID;

                exercises.forEach(([exerciseName, sets, reps], index) => {
                    db.get('SELECT id FROM exercises WHERE name = ?', [exerciseName], (err, row) => {
                        if (!err && row) {
                            db.run(
                                'INSERT INTO template_exercises (template_id, exercise_id, sets, reps, position) VALUES (?, ?, ?, ?, ?)',
                                [templateId, row.id, sets, reps, index]
                            );
                        }
                    });
                });
            });
        });
    });
});

module.exports = db; 