import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";

function Progress() {
    const { exerciseName } = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        window.electron.getData().then((json) => {
            const exerciseData = json.workouts
                .flatMap((w) => w.exercises)
                .filter((e) => e.name === exerciseName);
            setData(exerciseData);
        });
    }, [exerciseName]);

    const chartData = {
        labels: data.map((_, i) => `Session ${i + 1}`),
        datasets: [
            {
                label: "Total Volume",
                data: data.map((e) => e.weight * e.reps),
                borderColor: "blue",
                fill: false,
            },
        ],
    };

    return (
        <div>
            <h2>📈 Progress of {exerciseName}</h2>
            {data.length === 0 ? <p>No data available.</p> : <Line data={chartData} />}
        </div>
    );
}

export default Progress;
