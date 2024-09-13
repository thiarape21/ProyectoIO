import './App.css'; 
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplexForm from './components/SimplexForm';
import SimplexOptions from './components/SimplexOptions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplexOptions />} />
        <Route path="/simplex-form" element={<SimplexForm />} />
      </Routes>
    </Router>
  );
}

export default App;
