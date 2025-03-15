import React from "react";
import { Link } from "react-router-dom";

function ViewWorkout({ workout, onBack }) {
    const calculateTotalVolume = () => {
        return workout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.reduce((setTotal, set) => {
                return setTotal + (set.weight * set.reps);
            }, 0);
        }, 0);
    };

    const calculateTotalSets = () => {
        return workout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.length;
        }, 0);
    };

    const calculateTotalReps = () => {
        return workout.exercises.reduce((total, exercise) => {
            return total + exercise.sets.reduce((setTotal, set) => {
                return setTotal + set.reps;
            }, 0);
        }, 0);
    };

    return (
        <div>
            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>
                Workout "{workout.name}"
            </h1>

            <div style={{ marginBottom: '20px' }}>
                <p>Start: {workout.start_time}</p>
                <p>End: {workout.end_time}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Exercise</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Sets</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Weight</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Reps</th>
                        <th style={{ border: '1px solid black', padding: '8px', textAlign: 'left' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {workout.exercises.map((exercise, exerciseIndex) => (
                        <React.Fragment key={exerciseIndex}>
                            {exercise.sets.map((set, setIndex) => (
                                <tr key={`${exerciseIndex}-${setIndex}`}>
                                    {setIndex === 0 && (
                                        <td 
                                            style={{ 
                                                border: '1px solid black', 
                                                padding: '8px',
                                                verticalAlign: 'top'
                                            }}
                                            rowSpan={exercise.sets.length}
                                        >
                                            {exercise.name}
                                        </td>
                                    )}
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        {setIndex + 1}
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        {set.weight} kg
                                    </td>
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        {set.reps}
                                    </td>
                                    {setIndex === 0 && (
                                        <td 
                                            style={{ 
                                                border: '1px solid black', 
                                                padding: '8px',
                                                verticalAlign: 'top'
                                            }}
                                            rowSpan={exercise.sets.length}
                                        >
                                            <Link 
                                                to={`/progress/${exercise.exercise_id}`}
                                                style={{ 
                                                    textDecoration: 'none',
                                                    padding: '2px 8px',
                                                    border: '1px solid black',
                                                    color: 'black'
                                                }}
                                            >
                                                MY PROGRESS
                                            </Link>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div style={{ 
                border: '1px solid black', 
                padding: '20px',
                marginBottom: '20px'
            }}>
                <h2 style={{ marginBottom: '10px' }}>Statistics</h2>
                <p>Total Volume: {calculateTotalVolume()} kg</p>
                <p>Total Sets: {calculateTotalSets()}</p>
                <p>Total Reps: {calculateTotalReps()}</p>
            </div>

            <button 
                onClick={onBack}
                style={{ padding: '2px 8px' }}
            >
                Back
            </button>
        </div>
    );
}

export default ViewWorkout; 