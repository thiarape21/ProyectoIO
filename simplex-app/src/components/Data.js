import React from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/Data.css';

function Data() {
  const location = useLocation();
  console.log(location.state); // Agrega esto para verificar los datos recibidos
  const {  matrix } = location.state || {};

  if (!location.state) {
    return <div>No se recibieron datos.</div>;
  }

  return (
    <div className="datos-container">
      <h2>Solución del Método Simplex</h2>

      {matrix.map((iteracionObj, iterIndex) => (
        <div key={iterIndex} className="iteracion">
          <h3>Iteración: {iteracionObj.iteracion}</h3>

          {/* Mostrar la matriz */}
          <div className="matriz">
            <h4>Matriz:</h4>
            <table border="1">
              <thead>
                <tr>
                  {iteracionObj.matriz[0].map((colHeader, colIndex) => (
                    <th key={colIndex}>{colHeader}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {iteracionObj.matriz.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Data;
