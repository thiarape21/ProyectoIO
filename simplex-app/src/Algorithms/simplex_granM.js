
import {
    simplexBasic, llenarSistemaEnMatriz, convertirfila1, calcularRadios, encontrarIndiceMenorValorFilaZ,
    encontrarIndiceColumnaMenorRadios, convertirColumnas0, extraerBVS
} from "./simplex_casoBase";

function cambiarA(matrix) {
    let linea0 = matrix[1].slice(2, -1); // Línea con z (fila 1, excluyendo primeros y últimos elementos)
    let nuevaFila = [...linea0]; // Crear una copia de la fila z

    // Iterar sobre todas las filas de la matriz
    for (let i = 0; i < nuevaFila.length; i++) {
        // Si encontramos una "M", reemplazamos el valor por 1000 en la fila de z
        if (linea0[i] === "M") {
            nuevaFila[i] = 1000; // Reemplaza "M" por 1000 en la fila 
        }
    }

    for (let i = 1; i < matrix.length; i++) { //! por motivo computacionales se toma M como 1000
        if (matrix[i][1].includes("a")) {
            let linea1 = matrix[i].slice(2, -1);
            nuevaFila = nuevaFila.map((valor, indexOf) => {
                if (typeof valor === 'number') {
                    return (-1000 * linea1[indexOf]) + valor;
                }
                return valor;
            });
        } else {
            continue;
        }
    }



    // Reemplazar los valores de la fila z (matrix[1]) con los nuevos resultados
    matrix[1].splice(2, nuevaFila.length, ...nuevaFila);
    console.log("como se ve con matriz M = 1000");
    console.log(matrix);

    return matrix;
}


// busca mayor de z 
export function encontrarIndiceMayorValorFilaZ(matriz, arti) {
    let filaZ = matriz[1];  // Asumiendo que la fila Z es la segunda fila
    let valores = [];
    
    // Determina el rango de los valores a evaluar en la fila Z según 'arti'
    if (arti === 0) {
        valores = filaZ.slice(2, -1);
    } else {
        valores = filaZ.slice(2, -2);
    }

    // Filtra los valores numéricos y encuentra el mayor
    let mayorValor = Math.max(...valores.filter(valor => typeof valor === 'number'));

    // Verifica si el mayor valor es positivo
    if (mayorValor > 0) {
        const indiceColumnaRadio = matriz[0].indexOf('Radios');
        let radios = matriz.slice(1).map(fila => fila[indiceColumnaRadio]);

        // Verifica si todos los radios son '+INF' o 'N/A'
        let todosSonInf = radios.every(valor => valor === '+INF' || valor === 'N/A');

        if (todosSonInf) {
            console.log("Problema no acotado: todos los radios son +INF y hay valores positivos en la fila Z.");
            return -2; // Indicador de problema no acotado
        }

        // Encuentra el índice del mayor valor
        let indiceMayorValor = valores.indexOf(mayorValor);

        return indiceMayorValor + 2; // Ajuste del índice para reflejar el tamaño real de la matriz
    } else {
        return -1;  // Si no encuentra un número positivo, retorna -1
    }
}

// busca mayor de los radios
export function encontrarIndiceColumnaMayorRadios(matriz) {
    const indiceColumnaRadio = matriz[0].indexOf('Radios');
    if (indiceColumnaRadio === -1) {
        throw new Error("'Radios' no se encuentra en la matriz");
    }

    let radios = matriz.slice(1).map(fila => fila[indiceColumnaRadio]);

    let valoresRadios = radios.map(valor => {
        if (valor === 'N/A' || valor === '+INF') {
            return -Infinity; // Considerar '+INF' o 'N/A' como menos infinito
        }
        return Number(valor); // Convertir a número
    });

    let mayorValor = Math.max(...valoresRadios); // Buscar el mayor valor en lugar del menor

    // Buscar todos los índices donde se encuentra el mayor valor
    let indicesMayoresValores = [];
    valoresRadios.forEach((valor, indice) => {
        if (valor === mayorValor) {
            indicesMayoresValores.push(indice + 1); // Sumar 1 para ajustar el índice a la matriz original
        }
    });

    // Si hay más de un índice, devolver la lista de índices, sino, el primero
    if (indicesMayoresValores.length > 1) {
        return extraerBVS(matriz, indicesMayoresValores); // Manejo de empate
    } else {
        return indicesMayoresValores[0]; // Devuelve solo el primer índice si no hay repetidos
    }
}



export function granM(sistema, vari, res, arti, holgura) {
    let sistema1 = [
        [-2, 2, 1, 1, 0, 0, 0, 'M', 'M', 0, 'N/A'],  // Función objetivo con penalización 'M'
        [1, 2, 1, 1, 1, 0, 0, 0, 0, 2, 0],           // Restricciones
        [1, -1, 1, 5, 0, -1, 0, 1, 0, 4, 0], 
        [2, -1, 1, 0, 0, 0, -1, 0, 1, 2, 0]
    ];

    let matrix1 = simplexBasic(4, 3, 2, 'Gran M', 3);
    let matrix2 = llenarSistemaEnMatriz(matrix1, sistema1, 3);
    let matriz = cambiarA(matrix2);

    let iteracion = 0;
    const iteraciones = [];

    // Verificamos si hay variables artificiales
    const tieneArtificialEnBVS = matriz.some(fila => fila[1].startsWith('a'));

    while (true) {
        // Guardar la matriz actual en el array de iteraciones
        iteraciones.push({
            iteracion: iteracion + 1,
            matriz: JSON.parse(JSON.stringify(matriz)) // Clonar la matriz para evitar referencias
        });

        let matrixConRadios =  calcularRadios(matriz, 2, 'Gran M');// cambiar el 2 por arti de verdad
        let mayorValorFilaZ = encontrarIndiceMayorValorFilaZ(matrixConRadios, 2);  // Buscar mayor en fila Z

        // Verificar si hay algún valor positivo en Z para continuar iterando
        const filaZ = matriz[1].slice(2, -1);  // Excluimos las primeras columnas
        const tienePositivosEnZ = filaZ.some(valor => valor > 0);

        if (!tienePositivosEnZ) {
            // Si no hay valores positivos y quedan variables artificiales en BVS, la solución no es factible
            if (tieneArtificialEnBVS) {
                console.log("Solución no factible: Hay variables artificiales en BVS.");
                return "Solución no factible";
            } else {
                console.log("Proceso completado. No hay más valores positivos en Z.");
                return iteraciones;
            }
        }

        if (mayorValorFilaZ !== -2) {
            // Buscar el mayor valor de la columna de radios
            let fila1 = encontrarIndiceColumnaMayorRadios(matriz, 2);  // Cambiado a mayor radio
            let iteracion1 = convertirfila1(matrixConRadios, 2);

            let linea = matriz[fila1].slice(2, -1);
            iteracion1 = convertirColumnas0(iteracion1, linea, 2);

            // Guardar la matriz modificada en el array de iteraciones
            iteraciones.push({
                iteracion: iteracion + 1,
                matriz: JSON.parse(JSON.stringify(iteracion1)) // Clonar la matriz para evitar referencias
            });

            // Actualizamos la matriz y seguimos iterando
            matriz = iteracion1;
            iteracion++;
        } else {
            console.log(iteraciones);
            console.log("Problema no acotado: todos los radios son +INF.");
            return "No acotado";
        }
    }
}
