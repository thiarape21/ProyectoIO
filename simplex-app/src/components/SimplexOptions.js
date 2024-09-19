import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Options.css';


function SimplexOptions() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('');
  const [objectiveFunction, setObjectiveFunction] = useState('');
  const [variables, setVariables] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!method || !objectiveFunction) {
      setError('Debe seleccionar un método y una función objetivo.');
      return;
    }

    if (variables <= 0 || restrictions <= 0) {
      setError('La cantidad de variables y restricciones deben ser mayores que cero.');
      return;
    }

    setError('');
    navigate('/simplex-form', { state: { method, objectiveFunction, variables, restrictions } });
  };

  return (
    <div className="container">
      <h1>Calculadora Simplex</h1>
      <form onSubmit={handleSubmit}>
        <label>Método:  </label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">Seleccione un método</option>
          <option value="Dos Fases">Dos Fases</option>
          <option value="Gran M">Gran M</option>
        </select>

        <label>Función Objetivo: </label>
        <select value={objectiveFunction} onChange={(e) => setObjectiveFunction(e.target.value)}>
          <option value="">Seleccione el objetivo</option>
          <option value="Maximizar">Maximizar</option>
          <option value="Minimizar">Minimizar</option>
        </select>

        <label>Cantidad de variables: </label>
        <input
          type="number"
          value={variables}
          onChange={(e) => setVariables(e.target.value)}
          min="1"
  
        />

        <label>Cantidad de restricciones: </label>
        <input
          type="number"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          min="1"

        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Resolver</button>
      </form>
    </div>
  );
}

export default SimplexOptions;
