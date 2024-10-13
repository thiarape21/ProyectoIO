import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { casoBase } from '../Algorithms/simplex_casoBase';
import { faseUno } from '../Algorithms/simplex_dosFases';
import { granM } from '../Algorithms/simplex_granM';

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
    Array(parseInt(restrictions)).fill(method === 'General' ? '≥' : '≥') // Inicializa de acuerdo al método
  );

  const [errorMessage, setErrorMessage] = useState('');

  // Función para manejar el cambio de la función objetivo
  const handleObjectiveChange = (index, value) => {
    const newValues = [...objectiveValues];
    newValues[index] = parseFloat(value) || 0;
    setObjectiveValues(newValues);
  };

  // Función para manejar el cambio en las restricciones
  const handleRestrictionChange = (rowIndex, colIndex, value) => {
    const newValues = [...restrictionsValues];
    newValues[rowIndex][colIndex] = parseFloat(value) || 0;
    setRestrictionsValues(newValues);
  };

  // Función para manejar el cambio del operador de las restricciones
  const handleOperatorChange = (index) => {
    const updatedOperators = [...restrictionOperators];

    // Cambia el operador solo si el método no es 'General'
    if (method !== 'General') {
      updatedOperators[index] = updatedOperators[index] === '≥' ? '≤' : updatedOperators[index] === '≤' ? '=' : '≥';
    }

    setRestrictionOperators(updatedOperators);
  };

  // Función para validar el formulario
  const validateForm = () => {
    let isValid = true;
    let errorMessage = '';

    if (objectiveValues.some(val => isNaN(val) || val === null || val === "")) {
      isValid = false;
      errorMessage = 'Completa todos los campos de la función objetivo.';
    }

    restrictionsValues.forEach((row, rowIndex) => {
      if (row.some(val => isNaN(val) || val === null || val === "")) {
        isValid = false;
        errorMessage = `Completa todos los campos de las restricciones (fila ${rowIndex + 1}).`;
      }
    });

    if (restrictionsValues.some(row => isNaN(row[variables]) || row[variables] === null || row[variables] === "")) {
      isValid = false;
      errorMessage = 'Por favor, ingresa todos los valores de la parte derecha de las restricciones.';
    }

    setErrorMessage(errorMessage);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      let resultado;
      const objectiveType = objectiveFunction;

      if (method === 'Dos Fases') {
        const sistema = convertToMatrixDosFases();
        resultado = faseUno(objectiveValues, sistema, objectiveType);

      } else if (method === 'Gran M') {
        const sistema = convertToMatrix();
        resultado = granM(objectiveValues, sistema, objectiveType);

      } else if (method === 'Caso Base') {
        const sistema = convertToMatrix();
        resultado = casoBase(objectiveValues, restrictionsValues, objectiveType);

      } else {
        setErrorMessage('Método no reconocido.');
        return;
      }

      navigate('/data', { state: { resultado } });
    }
  };

  // Función para convertir los datos ingresados en una matriz para el algoritmo Simplex
  const convertToMatrix = () => {
    objectiveValues.push(0);
    const newValues = [objectiveValues];
    restrictionsValues.forEach((value) => newValues.push(value));
    const columna = parseInt(restrictionsValues[0].length) + parseInt(restrictions);


    for (let i = 0; i < newValues.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < columna; j++) {
        if (i === 0 && j >= variables) {
          matrix[i][j] = 0;
        } else if (i === 0 && j < variables) {
          matrix[i][j] = newValues[i][j] * -1;
        } else if (i > 0 && j >= variables) {
          matrix[i][j] = 0;
          matrix[i][variables - 1 + i] = 1;
          if (j === columna - 1) {
            matrix[i][j] = newValues[i][restrictionsValues[0].length - 1];
          }
        } else {
          matrix[i][j] = newValues[i][j];
        }
      }
    }

    return matrix;
  };

  const contarArtificiales = () => {
    return restrictionOperators.filter(elem => elem === "=" || elem === "≥").length;
  };

  const contarholgura = () => {
    return restrictionOperators.filter(elem => elem === "≥" || elem === "≤").length;
  };

  const convertToMatrixDosFases = () => {
    const holgura = contarholgura();
    const variables1 = variables;
    const columna = variables1 + holgura + contarArtificiales() + 1;
    const filas = restrictions + 2;
    const arti = variables1 + holgura;
    const matrix = [];
    if (parseInt(contarArtificiales()) !== 0) {
      const w = Array.from({ length: columna }, (_, k) => (k >= arti && k < columna - 1 ? 1 : 0));
      matrix.push(w);
    }
    const empezar = (parseInt(contarArtificiales()) > 0 ? 1 : 0);

    for (let i = empezar; i < filas; i++) {
      matrix[i] = [];
      for (let j = 0; j < columna; j++) {
        if (i === empezar) {
          if (j < variables) {
            matrix[i][j] = objectiveValues[j] * -1;

          }

          else if (j >= variables) {
            matrix[i][j] = 0;
          }
        } else {
          if (i > empezar && j >= variables) {
            matrix[i][j] = 0;
            if (restrictionOperators[i - 2] === "≤") {
              matrix[i][variables1 - 1 + i - 2] = 1;
              if (j === columna - 1) {
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 2] === "≥") {
              matrix[i][variables1 - 1 + i - 2] = -1;
              matrix[i][(variables1 + holgura - 1) + i - 1] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 2] === "=") {
              matrix[i][(variables1 + holgura - 1) + i - 1] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            }
          } else {
            matrix[i][j] = restrictionsValues[i - 2][j];
          }
        }
      }
    }
    console.log(matrix);
    return matrix;
  };
  const convertGranM = () => {   // Casos de min 
    const holgura = parseInt(contarholgura());
    const variables1 = parseInt(variables);
    const arti = variables1 + parseInt(contarholgura());
    const matrix = [];
    const filas = parseInt(restrictions)+1 ;
    const columna = variables1 + holgura + parseInt(contarArtificiales()) + 1;

    console.log(objectiveValues);
    console.log(restrictionsValues);
    console.log(`Cantidad de columnas: ${columna}`);
    console.log(`Cantidad de filas: ${filas}`);
    console.log(`Cantidad de artificiales: ${arti}`);
    console.log(`Cantidad de holgura: ${contarholgura()}`);
   
    

    for (let i = 0; i < filas; i++) {
      matrix[i] = [];
      for (let j = 0; j < columna; j++) {
        if (i === 0) {
          if (j < variables) {
            matrix[i][j] = objectiveValues[j] * -1;
          }
          else if (j >= arti && j < columna - 1) {
            matrix[i][j] = 'M';
          }
          else {
            matrix[i][j] = 0;
          }
        } else {
          // Filas de restricciones
          if (i > 0 && j >= variables) {
            matrix[i][j] = 0;
            if (restrictionOperators[i - 1] === "<=") {
              matrix[i][variables1 - 1 + i - 1] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 1][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 1] === ">=") {
              matrix[i][variables1 - 1 + i - 1] = -1;
              matrix[i][(variables1 + holgura - 1) + i - 1] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 1][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 1] === "=") {
              matrix[i][(variables1 + holgura - 1) + i ] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 1][restrictionsValues[0].length - 1];
              }
            }
          } else {
            matrix[i][j] = restrictionsValues[i-1][j];
          }
        }
      }
    }
    console.log(matrix);

    return matrix;


  }

  return (
    <div className="container">
      <h2>{method} - {objectiveFunction}</h2>
      <form>
        {/* Función Objetivo */}
        <h3>Función Objetivo:</h3>
        <div className="input-row">
          {Array.from({ length: variables }).map((_, index) => (
            <div key={index} className="input-group">
              <input
                type="number"
                className="variable-input"
                placeholder={`X${index + 1}`}
                onChange={(e) => handleObjectiveChange(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Restricciones */}
        <h3>Restricciones:</h3>
        {Array.from({ length: restrictions }).map((_, rowIndex) => (
          <div key={rowIndex} className="restriction-container">
            <div className="input-row">
              {Array.from({ length: variables }).map((_, colIndex) => (
                <div key={colIndex} className="input-group">
                  <input
                    type="number"
                    className="variable-input"
                    placeholder={`X${colIndex + 1}`}
                    onChange={(e) => handleRestrictionChange(rowIndex, colIndex, e.target.value)}
                  />
                </div>
              ))}
              <select
                className="operator-select"
                value={restrictionOperators[rowIndex]}
                onChange={() => handleOperatorChange(rowIndex)}
              >
                {method === 'General' ? (
                  <option value="≥">≥</option>
                ) : (
                  <>
                    <option value="≥">≥</option>
                    <option value="≤">≤</option>
                    <option value="=">=</option>
                  </>
                )}
              </select>

              <div className="input-group">
                <input
                  type="number"
                  className="variable-input"
                  placeholder="RHS"
                  onChange={(e) => handleRestrictionChange(rowIndex, variables, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <button type="submit" className="submit-button">Calcular</button>
      </form>
    </div>
  );
}

export default SimplexForm;