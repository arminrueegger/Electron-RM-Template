import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function Progress() {
    const { exerciseId } = useParams();
    const [exerciseData, setExerciseData] = useState([]);
    const [exerciseName, setExerciseName] = useState("");

    useEffect(() => {
        const loadData = async () => {
            const exercise = await window.electron.getExercise(exerciseId);
            setExerciseName(exercise.name);
            
            const workouts = await window.electron.getWorkouts();
            const exerciseHistory = workouts
                .filter(w => w.exercises.some(e => e.exercise_id === parseInt(exerciseId)))
                .map(w => ({
                    date: w.start_time,
                    volume: w.exercises
                        .find(e => e.exercise_id === parseInt(exerciseId))
                        .sets.reduce((total, set) => total + (set.weight * set.reps), 0)
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setExerciseData(exerciseHistory);
        };
        
        loadData();
    }, [exerciseId]);

    const calculateNextExpectedVolume = () => {
        if (exerciseData.length < 2) return null;

        const increases = [];
        for (let i = 1; i < exerciseData.length; i++) {
            increases.push(exerciseData[i].volume - exerciseData[i-1].volume);
        }

        const averageIncrease = increases.reduce((a, b) => a + b, 0) / increases.length;
        return exerciseData[exerciseData.length - 1].volume + averageIncrease;
    };

    const last3MonthsData = () => {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        return exerciseData.filter(data => new Date(data.date) >= threeMonthsAgo);
    };

    const chartData = {
        labels: [...last3MonthsData().map(d => new Date(d.date).toLocaleDateString()), 'Next (Expected)'],
        datasets: [
            {
                label: 'Total Volume',
                data: [...last3MonthsData().map(d => d.volume), calculateNextExpectedVolume()],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Exercise Progress (Last 3 Months)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Total Volume (kg)'
                }
            }
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <Link 
                    to="/"
                    style={{ 
                        textDecoration: 'none',
                        padding: '2px 8px',
                        border: '1px solid black',
                        color: 'black'
                    }}
                >
                    Back
                </Link>
            </div>

            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>
                Progress of {exerciseName}
            </h1>

            {exerciseData.length === 0 ? (
                <p>No data available for this exercise.</p>
            ) : (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <h2>History</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Date</th>
                                    <th style={{ border: '1px solid black', padding: '8px' }}>Total Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exerciseData.map((data, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>
                                            {new Date(data.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ border: '1px solid black', padding: '8px' }}>
                                            {data.volume} kg
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h2>Next Expected Volume</h2>
                        <p>{calculateNextExpectedVolume()?.toFixed(2) || 'N/A'} kg</p>
                    </div>

                    <div style={{ height: '400px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </>
            )}
        </div>
    );
}

export default Progress;
