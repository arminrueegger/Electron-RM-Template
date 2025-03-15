import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Exercises() {
    const [exercises, setExercises] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = () => {
        window.electron.getExercises().then(setExercises);
    };

    const handleDelete = async () => {
        await window.electron.deleteExercise(exerciseToDelete.id);
        setShowDeleteConfirm(false);
        setExerciseToDelete(null);
        loadExercises();
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <Link to="/" style={{ marginRight: '20px', padding: '8px', border: '1px solid black' }}>
                    Back
                </Link>
                <h1 style={{ fontSize: '2em' }}>Exercises</h1>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Exercise</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Description</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Type</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {exercises.map((exercise) => (
                        <tr key={exercise.id}>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.name}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.description}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.type}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                <Link 
                                    to={`/progress/${exercise.id}`}
                                    style={{ marginRight: '10px', padding: '2px 8px' }}
                                >
                                    MY PROGRESS
                                </Link>
                                <button 
                                    onClick={() => {
                                        setExerciseToDelete(exercise);
                                        setShowDeleteConfirm(true);
                                    }}
                                    style={{ padding: '2px 8px' }}
                                >
                                    DELETE
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Delete confirmation modal */}
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
                        <p>Are you sure you want to delete this exercise?</p>
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={handleDelete}
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

export default Exercises;
