import React, { useState, useEffect } from "react";

function Workouts() {
    const [data, setData] = useState({ workouts: [] });

    useEffect(() => {
        if (window.electron) {
            window.electron.getData()
                .then((res) => {
                    console.log("📥 Received Data in React:", res); // ✅ Check if React gets data
                    setData(res);
                })
                .catch((err) => console.error("❌ Error getting data:", err));
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
                    {data.workouts.map((workout, index) => (
                        <li key={index}>
                            {workout.name} ({workout.duration} min)
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Workouts;
