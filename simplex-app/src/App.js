import './App.css'; 
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplexForm from './components/SimplexForm';
import SimplexOptions from './components/SimplexOptions';
import { casoBase} from './components/SimplexAlgorithm';


function App() {

  window.casoBase = casoBase;
 
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
