import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Form.css';
import { casoBase } from '../Algorithms/simplex_casoBase';
import { faseUno } from '../Algorithms/simplex_dosFases';

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

  /*   useEffect(() => {
      setRestrictionOperators(Array(restrictions).fill('<=')); // Resetear el array si cambian las restricciones
    }, [restrictions]); */

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
    const empezar = (parseInt(contarArtificiales()) > 0 ? 1 : 0);
    if (parseInt(contarArtificiales()) !== 0) {
      const w = Array.from({ length: columna }, (_, k) => (k >= arti && k < columna - 1 ? 1 : 0));
      matrix.push(w);
    }

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
              matrix[i][variables1  + (i-2)] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 2] === ">=") {
              matrix[i][variables1  + (i-2)] = -1;
              matrix[i][variables - 1 + holgura + i - 2] = 1;
              if (j === columna - 1) { // RHS
                matrix[i][j] = restrictionsValues[i - 2][restrictionsValues[0].length - 1];
              }
            } else if (restrictionOperators[i - 2] === "=") {
              matrix[i][variables - 1 + holgura + i - 2] = 1;
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
         //   const sistema = convertToMatrixDosFases();
              const sistema=convertToMatrix();
            // const faseUno1= faseUno();
            console.table(sistema);
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