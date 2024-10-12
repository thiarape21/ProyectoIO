import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { casoBase } from '../Algorithms/simplex_casoBase';
//import { faseUno } from '../Algorithms/simplex_dosFases';

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
    Array(restrictions).fill('≤')
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
  const handleOperatorChange = (index, value) => {
    if (index >= 0) {
      const newOperators = [...restrictionOperators];
      newOperators[index] = value;
      console.log(restrictionOperators);
      setRestrictionOperators(newOperators);
    } else {
      console.error('Índice del operador fuera de rango.');
    }
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
    let conta = 0;
    restrictionOperators.forEach((elem) => {
      if (elem === "<=" || elem === ">=") {//!no esta agarrando bien los simbolos
        conta++;
      }
    });
    return conta;
  }

  //! aspectos al tomar encuenta , si son >= <= o =
  const convertToMatrixDosFases = () => {   // Casos de min 
      //  objectiveValues.pop();
    console.log(restrictionOperators);
    const columna = parseInt(variables) + parseInt(contarholgura()) + parseInt(contarArtificiales()) + 1 ;
    const filas= parseInt(restrictions)+2;
    const arti = parseInt(variables) + parseInt(contarholgura());
    const newValues = [];
    const matrix = []; 
    const empezar = (parseInt(contarArtificiales()) > 0 ? 1 : 0);
    if (parseInt(contarArtificiales()) !==0){
    const w = Array.from({ length: columna }, (_, k) => (k >= arti && k < columna - 1 ? 1 : 0));
    matrix.push(w);}
    // objectiveValues.push(0); 
    // newValues.push(objectiveValues);

 //   restrictionsValues.forEach((value) => newValues.push(value));
  /*   console.log(`new values primero`);
     */
    console.log(objectiveValues);
    console.log(restrictionsValues);
    console.log(`Cantidad de columnas: ${columna}`);
    console.log(`Cantidad de filas: ${filas}`);
    console.log(`Cantidad de artificiales: ${arti}`);
    console.log(`Cantidad de holgura: ${contarholgura()}`);
    console.log(`empezar: ${empezar}`);
 
  
    for (let i = empezar; i < filas; i++) {
        matrix[i] = [];
        for (let j = 0; j < columna; j++) {
            if (i === empezar && j < variables) {
                matrix[i][j] = objectiveValues[j] * -1;
            }
            else if (i === empezar && j >= variables) {
                matrix[i][j] = 0;
            }
            // Filas de restricciones
            else if (i > empezar && j >= variables) {
                matrix[i][j] = 0;
                if (restrictionOperators[i - 3] === "<=") {
                    matrix[i][variables - 1 + i] = 1;
                    if (j === columna - 1) { // RHS
                        matrix[i][j] = restrictionsValues[i-2][restrictionsValues[0].length - 1];
                    }
                } else if (restrictionOperators[i - 3] === ">=") {
                    matrix[i][variables - 1 + i] = -1;
                    matrix[i][variables - 1 + i + restrictions - 1] = 1;
                    if (j === columna - 1) { // RHS
                        matrix[i][j] = restrictionsValues[i-2][restrictionsValues[0].length - 1];
                    }
                } else if (restrictionOperators[i - 3] === "=") {
                    matrix[i][variables - 1 + i + restrictions - 1] = 1;
                    if (j === columna - 1) { // RHS
                        matrix[i][j] = restrictionsValues[i-2][restrictionsValues[0].length - 1];
                    }
                }
            } else {
              console.log(`i: ${i} , el j: ${j}`);
                matrix[i][j] = restrictionsValues[i-2][j];
            }
        }
    }  

    console.log(matrix);//!las cosas no cuadran por que no me estoy dando cuenta cuando hay variables de holgura 
    return matrix;
};

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
      const sistema = convertToMatrix();
      const matrix = casoBase(parseInt(variables), parseInt(restrictions), sistema);
      navigate('/data', { state: { objectiveValues, restrictionsValues, variables, restrictions, matrix } });
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