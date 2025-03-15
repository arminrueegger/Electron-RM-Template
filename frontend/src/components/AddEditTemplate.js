import React, { useState, useEffect } from "react";

function AddEditTemplate({ template, onCancel, onSave }) {
    const [name, setName] = useState(template ? template.name : '');
    const [exercises, setExercises] = useState(template ? template.exercises : []);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

    useEffect(() => {
        window.electron.getExercises().then(setAvailableExercises);
    }, []);

    const handleAddExercise = () => {
        if (!selectedExercise || !sets || !reps) return;
        
        setExercises([...exercises, {
            exercise_id: selectedExercise,
            sets: parseInt(sets),
            reps: parseInt(reps)
        }]);
        
        setSelectedExercise('');
        setSets('');
        setReps('');
    };

    const handleSave = async () => {
        if (!name || exercises.length === 0) return;

        const templateData = {
            id: template ? template.id : undefined,
            name,
            exercises
        };

        await window.electron.saveTemplate(templateData);
        onSave();
    };

    const handleCancel = () => {
        if (name || exercises.length > 0) {
            setShowUnsavedChanges(true);
        } else {
            onCancel();
        }
    };

    return (
        <div>
            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>
                {template ? `Edit template "${template.name}"` : 'Add template'}
            </h1>
            
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ 
                        width: '100%',
                        padding: '8px',
                        border: '1px solid black'
                    }}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '10px' }}>Add Exercise</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <select 
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        style={{ padding: '8px' }}
                    >
                        <option value="">Select Exercise</option>
                        {availableExercises.map(exercise => (
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                    <input 
                        type="number"
                        placeholder="Sets"
                        value={sets}
                        onChange={(e) => setSets(e.target.value)}
                        style={{ padding: '8px', width: '100px' }}
                    />
                    <input 
                        type="number"
                        placeholder="Reps"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        style={{ padding: '8px', width: '100px' }}
                    />
                    <button 
                        onClick={handleAddExercise}
                        style={{ padding: '8px' }}
                    >
                        Add
                    </button>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Exercise</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Sets</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {exercises.map((exercise, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                {availableExercises.find(e => e.id === exercise.exercise_id)?.name}
                            </td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.sets}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{exercise.reps}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                <button 
                                    onClick={() => setExercises(exercises.filter((_, i) => i !== index))}
                                    style={{ padding: '2px 8px' }}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleCancel} style={{ padding: '2px 8px' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '2px 8px' }}>Save</button>
            </div>

            {showUnsavedChanges && (
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
                        <p>You have unsaved changes. Are you sure you want to cancel?</p>
                        <div style={{ marginTop: '20px' }}>
                            <button 
                                onClick={() => onCancel()}
                                style={{ marginRight: '10px', padding: '2px 8px' }}
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => setShowUnsavedChanges(false)}
                                style={{ padding: '2px 8px' }}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddEditTemplate; 