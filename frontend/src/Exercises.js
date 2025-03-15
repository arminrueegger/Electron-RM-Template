import React, { useState, useEffect } from "react";

function Exercises() {
    const [data, setData] = useState({ exercises: [] });

    useEffect(() => {
        window.electron.getData().then(setData);
    }, []);

    return (
        <div>
            <h2>💪 Exercises</h2>
            <ul>
                {data.exercises.map((exercise) => (
                    <li key={exercise.name}>
                        {exercise.name} - {exercise.type}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Exercises;
