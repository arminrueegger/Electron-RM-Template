import React from 'react';
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Workouts from './components/Workouts';
import Exercises from './components/Exercises';
import Templates from './components/Templates';
import AddEditWorkout from './components/AddEditWorkout';
import ViewWorkout from './components/ViewWorkout';
import Progress from './components/Progress';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                                    Workouts
                                </Link>
                                <Link to="/exercises" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                                    Exercises
                                </Link>
                                <Link to="/templates" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                                    Templates
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Workouts />} />
                        <Route path="/exercises" element={<Exercises />} />
                        <Route path="/templates" element={<Templates />} />
                        <Route path="/workout/add" element={<AddEditWorkout />} />
                        <Route path="/workout/edit/:id" element={<AddEditWorkout />} />
                        <Route path="/workout/view/:id" element={<ViewWorkout />} />
                        <Route path="/progress/:exerciseId" element={<Progress />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
