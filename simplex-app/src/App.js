import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimplexOptions from './components/SimplexOptions';
import SimplexForm from './components/SimplexForm';

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