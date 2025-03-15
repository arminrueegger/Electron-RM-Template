import React, { useState, useEffect } from "react";

function Templates() {
    const [data, setData] = useState({ templates: [] });

    useEffect(() => {
        window.electron.getData().then(setData);
    }, []);

    return (
        <div>
            <h2>📜 Templates</h2>
            <ul>
                {data.templates.map((template) => (
                    <li key={template.name}>{template.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default Templates;
