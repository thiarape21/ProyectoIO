import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimplexOptions from './components/SimplexOptions';
import SimplexForm from './components/SimplexForm';
import Data from './components/Data';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplexOptions />} />
        <Route path="/simplex-form" element={<SimplexForm />} />
        <Route path='/data' element={<Data/>} />;
      </Routes>
    </Router>
  );
}

export default App;