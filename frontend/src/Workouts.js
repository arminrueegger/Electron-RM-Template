import React, { useState, useEffect } from "react";

function Workouts() {
    const [data, setData] = useState({ workouts: [] });

    useEffect(() => {
        if (window.electron) {
            window.electron.getData().then(setData).catch(console.error);
        } else {
            console.warn("Electron API not available – Running in browser mode.");
        }
    }, []);

    return (
        <div>
            <h2>🏋️ Workouts</h2>
            {data.workouts.length === 0 ? (
                <p>No workouts available.</p>
            ) : (
                <ul>
                    {data.workouts.map((workout) => (
                        <li key={workout.name}>
                            {workout.name} ({workout.duration} min)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Workouts;
