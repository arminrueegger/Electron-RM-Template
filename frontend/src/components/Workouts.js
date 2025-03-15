import React, { useState, useEffect } from "react";
import AddEditWorkout from "./AddEditWorkout";
import ViewWorkout from "./ViewWorkout";

function Workouts() {
    const [workouts, setWorkouts] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [viewingWorkout, setViewingWorkout] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);

    useEffect(() => {
        loadWorkouts();
    }, []);

    const loadWorkouts = () => {
        window.electron.getWorkouts().then(setWorkouts);
    };

    const handleDelete = (workout) => {
        setWorkoutToDelete(workout);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        await window.electron.deleteWorkout(workoutToDelete.id);
        setShowDeleteConfirm(false);
        setWorkoutToDelete(null);
        loadWorkouts();
    };

    const formatDuration = (start, end) => {
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diff = endTime - startTime;
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min`;
    };

    return (
        <div>
            {!isAdding && !editingWorkout && !viewingWorkout ? (
                <>
                    <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>Your latest workouts</h1>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Workout Name</th>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Start</th>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>End</th>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Duration</th>
                                <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workouts.map((workout) => (
                                <tr key={workout.id}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{workout.name}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{workout.start_time}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{workout.end_time}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        {formatDuration(workout.start_time, workout.end_time)}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <button 
                                            onClick={() => setViewingWorkout(workout)}
                                            style={{ marginRight: '10px', padding: '2px 8px' }}
                                        >
                                            VIEW
                                        </button>
                                        <button 
                                            onClick={() => setEditingWorkout(workout)}
                                            style={{ marginRight: '10px', padding: '2px 8px' }}
                                        >
                                            EDIT
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(workout)}
                                            style={{ padding: '2px 8px' }}
                                        >
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '20px' }}>
                        <button 
                            onClick={() => setIsAdding(true)}
                            style={{ padding: '2px 8px' }}
                        >
                            ADD WORKOUT
                        </button>
                    </div>
                </>
            ) : viewingWorkout ? (
                <ViewWorkout 
                    workout={viewingWorkout}
                    onBack={() => setViewingWorkout(null)}
                />
            ) : (
                <AddEditWorkout 
                    workout={editingWorkout}
                    onCancel={() => {
                        setIsAdding(false);
                        setEditingWorkout(null);
                    }}
                    onSave={() => {
                        setIsAdding(false);
                        setEditingWorkout(null);
                        loadWorkouts();
                    }}
                />
            )}

            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '5px'
                    }}>
                        <p>Are you sure you want to delete this workout?</p>
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={confirmDelete}
                                style={{ marginRight: '10px', padding: '2px 8px' }}
                            >
                                YES
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{ padding: '2px 8px' }}
                            >
                                NO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workouts;
