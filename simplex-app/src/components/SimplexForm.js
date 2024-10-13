import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { casoBase } from '../Algorithms/simplex_casoBase';
import { faseUno, encogerMatriz } from '../Algorithms/simplex_dosFases';
import { granM } from '../Algorithms/simplex_granM';

// Aquí agregas los imports del método de la Gran M y el de dos fases
// import { granM } from '../Algorithms/simplex_granM';
// import { faseDosFases } from '../Algorithms/simplex_dosFases';

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
    Array(parseInt(restrictions)).fill('<=')
  );

  const [errorMessage, setErrorMessage] = useState('');

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
  const handleOperatorChange = (index, newOperator) => {
    // Crear una copia del array para no mutar el estado directamente
    const updatedOperators = [...restrictionOperators];
    // Cambiar solo el valor en la posición correspondiente
    updatedOperators[index] = newOperator || '<=';
    // Actualizar el estado con la nueva copia
    setRestrictionOperators(updatedOperators);
    console.log("Como se ve:", updatedOperators); // Verificar cómo se ve el array después del cambio
  };

  const validateForm = () => {
    let isValid = true;
    let errorMessage = '';

    // Verificar si hay algún campo vacío en la función objetivo
    if (objectiveValues.some(val => isNaN(val) || val === null || val === "")) {
      isValid = false;
      errorMessage = 'Completa todos los campos de la función objetivo.';
    }

    // Verificar si hay algún campo vacío en las restricciones
    restrictionsValues.forEach((row, rowIndex) => {
      if (row.some(val => isNaN(val) || val === null || val === "")) {
        isValid = false;
        errorMessage = `Completa todos los campos de las restricciones (fila ${rowIndex + 1}).`;
      }
    });

    // Verificar si los valores de RHS en las restricciones están completos
    if (restrictionsValues.some(row => isNaN(row[variables]) || row[variables] === null || row[variables] === "")) {
      isValid = false;
      errorMessage = 'Por favor, ingresa todos los valores de la parte derecha de las restricciones.';
    }

    setErrorMessage(errorMessage);
    return isValid;
  };

  // Función para convertir los datos ingresados en una matriz para el algoritmo Simplex
  const convertToMatrix = () => {//casos basicos de max
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
        else if (i === 0 && j < variables) {
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


  const contarArtificiales = () => {
    let conta = 0;
    restrictionOperators.forEach((elem) => {
      if (elem === "=" || elem === ">=") {
        conta++;

      }
    });
    return conta;
  }

  const contarholgura = () => {
    let holgura = 0;
    restrictionOperators.forEach((elem) => {
      if (elem === ">=" || elem === "<=") {
        holgura++;
      }
    });
    //
    return holgura;
  }



  //! aspectos al tomar encuenta , si son >= <= o =
  const convertToMatrixDosFases = () => {   // Casos de min 
    const holgura = parseInt(contarholgura());
    const variables1 = parseInt(variables);
    const columna = variables1 + holgura + parseInt(contarArtificiales()) + 1;
    const filas = parseInt(restrictions) + 2;
    const arti = variables1 + parseInt(contarholgura());
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
          // Filas de restricciones
          if (i > empezar && j >= variables) {
            matrix[i][j] = 0;
            if (restrictionOperators[i - 2] === "<=") {
              matrix[i][variables1 - 1 + i - 2] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 2] === ">=") {
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
              {index < variables - 1 && <span className="plus-sign"> + </span>}
            </div>
          ))}
        </div>

        {/* Restricciones */}
        <h3>Restricciones:</h3>
        {Array.from({ length: restrictions }).map((_, index) => (
          <div key={index} className="restriction-row">
            <div className="input-row"> {/* Cambié aquí para usar input-row */}
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

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button
          type="button"
          className="submit-button"
          onClick={() => {
            if (validateForm()) {
        //      const sistema = convertToMatrixDosFases();
           //  const sistema = convertGranM();
        //    const matrix = granM(sistema, parseInt(variables), parseInt(restrictions), 
        //     parseInt(contarArtificiales()),parseInt( contarholgura()) );
           //   const fase1 = faseUno(sistema, parseInt(variables), parseInt(restrictions), parseInt(contarArtificiales()),
         //    parseInt( contarholgura()));
             
              // console.log(matrix);

                    const sistema = convertToMatrix();
                      const matrix = casoBase(parseInt(variables), parseInt(restrictions), sistema, 0, parseInt( contarholgura()) );
                 //   navigate('/data', { state: { objectiveValues, restrictionsValues, variables, restrictions, matrix } }); 
            }
          }}
        >
          Resolver
        </button>
      </form>
    </div>
  );
}

export default SimplexForm;