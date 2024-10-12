import React from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/Data.css';

function Data() {
  const location = useLocation();
  console.log(location.state); // Verificar los datos recibidos
  const { matrix } = location.state || {};

  if (!location.state) {
    return <div className="no-data">No se recibieron datos.</div>;
  }

  return (
    <div className="datos-container">
      <h1>Solución del Método Simplex</h1>

      {/* Iteraciones */}
      {matrix.map((iteracionObj, iterIndex) => (
        <div key={iterIndex} className="iteracion-card">
          <h2 className="iteracion-title">Iteración {iterIndex + 1}</h2>

          {/* Mostrar la matriz */}
          <div className="matriz-container">
            <h3>Matriz:</h3>
            <table className="simplex-table">
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

      {/* Mostrar la tabla de soluciones óptimas */}
      <div className="soluciones-optimas">
        <h2>Soluciones Óptimas</h2>
        <table className="optimum-table">
          <thead>
            <tr>
              <th>Variable</th>
              {Array.from({ length: matrix[0].matriz[0].length - 1 }).map((_, index) => (
                <th key={`X${index + 1}`}>X{index + 1}</th>
              ))}
              <th>RHS</th> {/* Right-hand side, el lado derecho */}
            </tr>
          </thead>
          <tbody>
            {matrix.map((iteracionObj, rowIndex) => (
              <tr key={rowIndex}>
                <td>{rowIndex === 0 ? 'Z' : `Restricción ${rowIndex}`}</td>
                {iteracionObj.matriz[0].map((value, colIndex) => (
                  <td key={colIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Data;
