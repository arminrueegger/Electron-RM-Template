import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState({});
  const [inputValue, setInputValue] = useState("");

  // Load Data on Startup
  useEffect(() => {
    window.electronAPI.readJson().then(response => {
      setData(response);
    });
  }, []);

  // Save Data to JSON File
  const saveData = () => {
    const newData = { message: inputValue };
    window.electronAPI.writeJson(newData).then(response => {
      alert(response.message);
      setData(newData);
    });
  };

  return (
      <div>
        <h1>Electron + React JSON Storage</h1>
        <p>Stored Message: {data.message}</p>
        <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={saveData}>Save Data</button>
      </div>
  );
}

export default App;
