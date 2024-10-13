
import {
    simplexBasic, llenarSistemaEnMatriz, convertirfila1, calcularRadios, encontrarIndiceMenorValorFilaZ,
    encontrarIndiceColumnaMenorRadios, convertirColumnas0
} from "./simplex_casoBase";

function cambiarA(matrix) {
    let linea0 = matrix[1].slice(2, -1); // Línea con z (fila 1, excluyendo primeros y últimos elementos)
    let nuevaFila = [...linea0]; // Crear una copia de la fila z

    // Iterar sobre todas las filas de la matriz
    for (let i = 1; i < matrix.length; i++) {
        // Si encontramos una "M", reemplazamos el valor por 1000 en la fila de z
        if (matrix[i][1].includes("M")) {
            for (let j = 2; j < matrix[i].length - 1; j++) { 
                if (matrix[1][j] === "M") {
                    matrix[1][j] = 1000; // Reemplaza "M" por 1000 en la fila z
                }
            }
        }

        // Verificar si hay una "a" o una "M" en la fila actual
        if (matrix[i][1].includes("a") || matrix[i][1].includes("M")) {
            let linea1 = matrix[i].slice(2, -1); // Extraer los valores de la fila i

            nuevaFila = nuevaFila.map((valor, indexOf) => {
                if (typeof valor === 'number') {
                    let resultado = (-1 * linea1[indexOf]) + valor;
                    
                    // Si hay una "M" en la fila, después de calcular el valor, lo hacemos 0
                    if (matrix[i][1].includes("M")) {
                        return 0;
                    }
                    return resultado;
                }
                return valor;
            });
        }
    }

    // Reemplazar los valores de la fila z (matrix[1]) con los nuevos resultados
    matrix[1].splice(2, nuevaFila.length, ...nuevaFila);

    return matrix;
}




export function granM(sistema, vari , res, arti, holgura){
    let matrix1 = simplexBasic(vari, res, arti ,'Gran M', holgura);
    let matrix2 = llenarSistemaEnMatriz(matrix1, sistema, holgura);
    let matriz = cambiarA(matrix2);

    console.log(matrix2);
    console.log(matriz);


}