import React from 'react';
import { useLocation } from 'react-router-dom';
import './Data.css';

function Data() {
  const location = useLocation();
  console.log(location.state); // Agrega esto para verificar los datos recibidos
  const { objectiveValues, restrictionsValues, restrictionRHS, variables, restrictions } = location.state || {};

  if (!location.state) {
    return <div>No se recibieron datos.</div>;
  }

  return (
    <div className="datos-container">
      <h2>Solución del Método Simplex</h2>

      {/* Mostrar la función objetivo */}
      <div className="equation">
        <h3>Función Objetivo:</h3>
        <p>Z = {objectiveValues.map((coef, index) => `${coef}x${index + 1}`).join(' + ')}</p>
      </div>

      {/* Mostrar las restricciones */}
      <div className="restrictions">
        <h3>Restricciones:</h3>
        {restrictionsValues.map((row, rowIndex) => (
          <p key={rowIndex}>
            {row.map((coef, colIndex) => `${coef}x${colIndex + 1}`).join(' + ')} {restrictionRHS[rowIndex]}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Data;