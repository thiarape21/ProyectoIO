import './App.css'; 
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SimplexForm from './components/SimplexForm';
import SimplexOptions from './components/SimplexOptions';
import Data from './components/Data';
import { casoBase} from './Algorithms/simplex_casoBase';


function App() {

  window.casoBase = casoBase;
 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplexOptions />} />
        <Route path="/simplex-form" element={<SimplexForm />} />
        <Route path="/data" element={<Data/>}/>
      </Routes>
    </Router>
  );
}

export default App;
