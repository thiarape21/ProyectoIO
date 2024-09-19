import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { simplexBasic } from '../Algorithms/SimplexAlgorithm';

function SimplexForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method, objectiveFunction, variables, restrictions } = location.state;

  // Estado para los valores de la función objetivo y las restricciones
  const [objectiveValues, setObjectiveValues] = useState(Array(variables).fill(0));
  const [restrictionsValues, setRestrictionsValues] = useState(
    Array(restrictions).fill().map(() => Array(variables).fill(0))
  );
  const [restrictionRHS, setRestrictionRHS] = useState(Array(restrictions).fill(0));
  const [restrictionOperators, setRestrictionOperators] = useState(
    Array(restrictions).fill('≤')
  );

  // Función para manejar el cambio de los valores de la función objetivo
  const handleObjectiveChange = (index, value) => {
    if (index >= 0 && index < objectiveValues.length) {
      const newValues = [...objectiveValues];
      newValues[index] = parseFloat(value) || 0;
      setObjectiveValues(newValues);
    } else {
      console.error('Índice de la función objetivo fuera de rango.');
    }
  };

  // Función para manejar el cambio de los valores de las restricciones
  const handleRestrictionChange = (rowIndex, colIndex, value) => {
    if (restrictionsValues[rowIndex] && colIndex >= 0 && colIndex < variables) {
      const newValues = [...restrictionsValues];
      newValues[rowIndex][colIndex] = parseFloat(value) || 0;
      setRestrictionsValues(newValues);
    } else {
      console.error('Índice de restricciones fuera de rango.');
    }
  };

  // Función para manejar el cambio de los valores del lado derecho de las restricciones
  const handleRHSChange = (index, value) => {
    if (index >= 0 && index < restrictionRHS.length) {
      const newValues = [...restrictionRHS];
      newValues[index] = parseFloat(value) || 0;
      setRestrictionRHS(newValues);
    } else {
      console.error('Índice del valor RHS fuera de rango.');
    }
  };

  // Función para manejar el cambio del operador de las restricciones
  const handleOperatorChange = (index, value) => {
    if (index >= 0 && index < restrictionOperators.length) {
      const newOperators = [...restrictionOperators];
      newOperators[index] = value;
      setRestrictionOperators(newOperators);
    } else {
      console.error('Índice del operador fuera de rango.');
    }
  };

  // Función para convertir los datos ingresados en una matriz para el algoritmo Simplex
  const convertToMatrix = () => {
    // Crear la matriz inicial
    const matrix = simplexBasic(variables, restrictions);

    // Llenar la matriz con la función objetivo
    matrix[1].splice(2, variables, ...objectiveValues);

    // Llenar la matriz con las restricciones
    restrictionsValues.forEach((row, i) => {
      matrix[i + 2].splice(2, variables, ...row);
      matrix[i + 2][matrix[i + 2].length - 2] = restrictionRHS[i];
    });

    // Agregar las variables artificiales a las restricciones
    for (let i = 0; i < restrictions; i++) {
      matrix[i + 2][variables + i + 2] = 1;
    }

    return matrix;
  };

  return (
    <div className="form-container">
      <h2>{method} - {objectiveFunction}</h2>
      <form>
        {/* Función Objetivo */}
        <h3>Función Objetivo:</h3>
        <div className="objective-function">
          {Array.from({ length: variables }).map((_, index) => (
            <div key={index} className="input-group">
              <input
                type="number"
                className="variable-input"
                placeholder={`X${index + 1}`}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
              />
              {index < variables - 1 && <span className="plus-sign"> + </span>}
            </div>
          ))}
        </div>

        {/* Restricciones */}
        <h3>Restricciones:</h3>
        {Array.from({ length: restrictions }).map((_, index) => (
          <div key={index} className="restriction-row">
            <div className="restriction-inputs">
              {Array.from({ length: variables }).map((_, colIndex) => (
                <input
                  key={colIndex}
                  type="number"
                  className="variable-input"
                  placeholder={`X${colIndex + 1}`}
                  onChange={(e) => handleRestrictionChange(index, colIndex, e.target.value)}
                />
              ))}
              <select
                className="operator-select"
                value={restrictionOperators[index]}
                onChange={(e) => handleOperatorChange(index, e.target.value)}
              >
                <option value="<=">≤</option>
                <option value="=">=</option>
                <option value=">=">≥</option>
              </select>
              <input
                type="number"
                className="value-input"
                placeholder="Valor"
                onChange={(e) => handleRHSChange(index, e.target.value)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="submit-button"
          onClick={() => {
            const matrix = convertToMatrix();
            console.log(matrix); // Puedes hacer algo con la matriz aquí, como pasarla a tu algoritmo
            navigate('/data', { state: { objectiveValues, restrictionsValues, restrictionRHS, variables, restrictions } }); // Redirigir a la página de Data con los datos necesarios
          }}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}

export default SimplexForm;