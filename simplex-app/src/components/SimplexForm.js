import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { casoBase } from '../Algorithms/simplex_casoBase';

function SimplexForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { method, objectiveFunction, variables, restrictions } = location.state;

  // Estado para los valores de la función objetivo y las restricciones
  const [objectiveValues, setObjectiveValues] = useState(Array(variables).fill(0));
  const [restrictionsValues, setRestrictionsValues] = useState(
    Array(restrictions).fill().map(() => Array(variables).fill(0))
  );
 
  const [restrictionOperators, setRestrictionOperators] = useState(
    Array(restrictions).fill('≤')
  );

  // Función para manejar el cambio de los valores de la función objetivo
  const handleObjectiveChange = (index, value) => {
    if (index >= 0) {
      const newValues = [...objectiveValues];
      newValues[index] = parseFloat(value) || 0;
      setObjectiveValues(newValues);
    } else {
      console.error('Índice de la función objetivo fuera de rango.');
    }
  };



  const handleRestrictionChange = (rowIndex, colIndex, value) => {
    const newValues = [...restrictionsValues];
    if (!newValues[rowIndex]) {
      newValues[rowIndex] = [];
    }
    if (colIndex >= newValues[rowIndex].length) {
      for (let i = newValues[rowIndex].length; i <= colIndex; i++) {
        newValues[rowIndex][i] = 0;  // Asignar un valor por defecto (por ejemplo, 0)
      }
    }
    newValues[rowIndex][colIndex] = parseFloat(value) || 0;

    setRestrictionsValues(newValues);
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
    objectiveValues.push(0);
    const newValues = [];
    const matrix = [];
    newValues.push(objectiveValues);
    restrictionsValues.forEach((value) => newValues.push(value));
    const columna = parseInt(restrictionsValues[0].length) + parseInt(restrictions);

    for (let i = 0; i < newValues.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < columna; j++) {
        if (i === 0 && j >= variables) {// fila de la z 
          matrix[i][j] = 0;
        }
        else if(i === 0 && j < variables){
          matrix[i][j] = newValues[i][j] * -1;

        }
        else if (i > 0 && j >= variables) { // filas de las restricciones
          matrix[i][j] = 0;
          matrix[i][variables - 1 + i] = 1;
          if (j === columna - 1) { // RHS
            matrix[i][j] = newValues[i][restrictionsValues[0].length - 1];
          }
        }
        else {
          matrix[i][j] = newValues[i][j];
        }
      }

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
                onChange={(e) => handleRestrictionChange(index, variables, e.target.value)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="submit-button"
          onClick={() => {
            const sistema=convertToMatrix();
            const matrix = casoBase(parseInt(variables),parseInt(restrictions), sistema );
           navigate('/data', { state: { objectiveValues, restrictionsValues, variables, restrictions, matrix} }); // Redirigir a la página de Data con los datos necesarios 
          }}
        >
          Continuar
        </button>
      </form>
    </div>
  );
}

export default SimplexForm;