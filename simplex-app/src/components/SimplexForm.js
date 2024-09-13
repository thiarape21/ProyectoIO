import React from 'react';
import { useLocation } from 'react-router-dom';

function SimplexForm() {
  const location = useLocation();
  const { method, objectiveFunction, variables, restrictions } = location.state;

  const renderInputs = (n, label) => {
    let inputs = [];
    for (let i = 0; i < n; i++) {
      inputs.push(
        <div key={i} style={{ display: 'inline-block', margin: '5px' }}>  {/* Usar 'div' en lugar de 'span' */}
          <input type="number" style={{ width: '60px' }} /> {/* Ajusta el ancho del input */}
          {label} X{i + 1} {/* El 'Xi' después */}
          {i < n - 1 && ' + '} {/* Añadir '+' solo si no es el último elemento */}
        </div>
      );
    }
    return inputs;
  };

  return (
    <div className="container">
      <h2>{method} - {objectiveFunction}</h2>
      <form>
        <h3>Función Objetivo:</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
          {renderInputs(variables, '')}
        </div>

        <h3>Restricciones:</h3>
        {[...Array(restrictions)].map((_, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              {renderInputs(variables, '')}
              <select style={{ margin: '10px', width: '60px', height: '45px', lineHeight: '45px' }}>
                <option value="<=">≤</option>
                <option value="=">=</option>
                <option value=">=">≥</option>
              </select>
              <input type="number" style={{ width: '60px', height: '45px', textAlign: 'center' }} />
            </div>
          </div>
        ))}

        <button type="submit">Continuar</button>
      </form>
    </div>
  );
}

export default SimplexForm;
