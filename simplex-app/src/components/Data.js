import React from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/Data.css';

function Data() {
  const location = useLocation();
  const { resultado, matrix } = location.state || {};
  console.log('Resultado:', resultado);
  console.log('Matrix:', matrix);

  if (!resultado) {
    return <div className="no-data">No se recibieron datos.</div>;
  }

  const ultimaIteracion = resultado[resultado.length - 1];
  console.log('Ultima Iteracion:', ultimaIteracion);

  // Verifica si hay infactibilidad en la solución
  const isInfeasible = ultimaIteracion.matriz[0].slice(1).some(value => value < 0);
  console.log('Is Infeasible:', isInfeasible);

  return (
    <div className="datos-container">
      <h1>Solución del Método Simplex</h1>

      {resultado.map((iteracionObj, iterIndex) => (
        <div key={iterIndex} className="iteracion-card">
          <h2 className="iteracion-title">Iteración {iterIndex + 1}</h2>
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

      <div className="soluciones-optimas">
        <h2>Soluciones Óptimas</h2>
        {isInfeasible ? (
          <div className="infactible-message">
            <p>La solución no es factible.</p>
          </div>
        ) : (
          <table className="optimum-table">
            <thead>
              <tr>
                <th>Variable</th>
                {ultimaIteracion.matriz[0].slice(1).map((header, index) => (
                  <th key={index}>{header}</th> // Mostramos cabeceras de variables X
                ))}
                <th>RHS</th> 
              </tr>
            </thead>
            <tbody>
              {ultimaIteracion.matriz.map((row, rowIndex) => (
                <tr key={rowIndex}>
                 <td>{rowIndex === 0 ? 'Z' : `Restricción ${rowIndex}`}</td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Data;