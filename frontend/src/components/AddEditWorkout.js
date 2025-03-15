import React, { useState, useEffect } from "react";

function AddEditWorkout({ workout, onCancel, onSave }) {
    const [name, setName] = useState(workout ? workout.name : '');
    const [startTime, setStartTime] = useState(workout ? workout.start_time : '');
    const [endTime, setEndTime] = useState(workout ? workout.end_time : '');
    const [exercises, setExercises] = useState(workout ? workout.exercises : []);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [showTemplateModal, setShowTemplateModal] = useState(!workout);
    const [templates, setTemplates] = useState([]);
    const [showUnsavedChanges, setShowUnsavedChanges] = useState(false);

    useEffect(() => {
        window.electron.getExercises().then(setAvailableExercises);
        window.electron.getTemplates().then(setTemplates);
    }, []);

    const handleAddExercise = () => {
        if (!selectedExercise) return;
        
        setExercises([...exercises, {
            exercise_id: selectedExercise,
            sets: []
        }]);
        
        setSelectedExercise('');
    };

    const handleAddSet = (exerciseIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets.push({
            weight: '',
            reps: ''
        });
        setExercises(newExercises);
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex][field] = value;
        setExercises(newExercises);
    };

    const handleDeleteSet = (exerciseIndex, setIndex) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets.splice(setIndex, 1);
        setExercises(newExercises);
    };

    const handleSave = async () => {
        if (!name || !startTime || !endTime || exercises.length === 0) return;

        const workoutData = {
            id: workout ? workout.id : undefined,
            name,
            start_time: startTime,
            end_time: endTime,
            exercises
        };

        await window.electron.saveWorkout(workoutData);
        onSave();
    };

    const handleTemplateSelect = async (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setExercises(template.exercises.map(e => ({
                exercise_id: e.exercise_id,
                sets: Array(e.sets).fill().map(() => ({
                    weight: '',
                    reps: e.reps
                }))
            })));
        }
        setShowTemplateModal(false);
    };

    return (
        <div>
            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>
                {workout ? `Edit workout "${workout.name}"` : 'Add workout'}
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

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Start Time</label>
                    <input 
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ padding: '8px', border: '1px solid black' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>End Time</label>
                    <input 
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ padding: '8px', border: '1px solid black' }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
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
                    <button 
                        onClick={handleAddExercise}
                        style={{ padding: '8px' }}
                    >
                        Add Exercise
                    </button>
                </div>
            </div>

            {exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} style={{ marginBottom: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>
                        {availableExercises.find(e => e.id === exercise.exercise_id)?.name}
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Set</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Weight (kg)</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Reps</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exercise.sets.map((set, setIndex) => (
                                <tr key={setIndex}>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>{setIndex + 1}</td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <input 
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', e.target.value)}
                                            style={{ width: '100%', padding: '4px' }}
                                        />
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <input 
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', e.target.value)}
                                            style={{ width: '100%', padding: '4px' }}
                                        />
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <button 
                                            onClick={() => handleDeleteSet(exerciseIndex, setIndex)}
                                            style={{ padding: '2px 8px' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button 
                        onClick={() => handleAddSet(exerciseIndex)}
                        style={{ padding: '2px 8px' }}
                    >
                        Add Set
                    </button>
                </div>
            ))}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => {
                    if (name || startTime || endTime || exercises.length > 0) {
                        setShowUnsavedChanges(true);
                    } else {
                        onCancel();
                    }
                }} style={{ padding: '2px 8px' }}>
                    Cancel
                </button>
                <button onClick={handleSave} style={{ padding: '2px 8px' }}>Save</button>
            </div>

            {showTemplateModal && (
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
                        <h2 style={{ marginBottom: '20px' }}>Select Template</h2>
                        {templates.length > 0 ? (
                            <>
                                {templates.map(template => (
                                    <button 
                                        key={template.id}
                                        onClick={() => handleTemplateSelect(template.id)}
                                        style={{ 
                                            display: 'block',
                                            width: '100%',
                                            padding: '8px',
                                            marginBottom: '10px'
                                        }}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </>
                        ) : (
                            <p>No templates available</p>
                        )}
                        <button 
                            onClick={() => setShowTemplateModal(false)}
                            style={{ padding: '2px 8px' }}
                        >
                            Start without template
                        </button>
                    </div>
                </div>
            )}

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

export default AddEditWorkout; 