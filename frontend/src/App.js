import React, { useEffect, useState } from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
import Workouts from "./Workouts";
import Exercises from "./Exercises";
import Templates from "./Templates";
import Progress from "./Progress";

function App() {
    return (
        <Router>
            <div className="container">
                <nav className="bg-blue-600 p-3 text-white flex space-x-4">
                    <Link to="/" className="hover:underline">🏋️ Workouts</Link>
                    <Link to="/exercises" className="hover:underline">💪 Exercises</Link>
                    <Link to="/templates" className="hover:underline">📜 Templates</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<Workouts/>}/>
                    <Route path="/exercises" element={<Exercises/>}/>
                    <Route path="/templates" element={<Templates/>}/>
                    <Route path="/progress/:exerciseName" element={<Progress />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
