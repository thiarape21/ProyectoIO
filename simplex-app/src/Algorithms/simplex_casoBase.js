
// caso basico 



// TODO: retorne cuando es no acotado 


// *programa asume 1 que la expresion ya esta convertida en negativos

//** Recibe como parametro la cantidad de variables y restricciones 
//devuelve la matriz vacia con 0 en donde van los numeros correspondientes del sistema
//arma la matrix segun la cantidad de restricciones y variables y cuantas varaibles artificial hay
export function simplexBasic(vari, res, arti) {//! aqui tiene que ser armar la matrix con el gran M
    const matrix = [];
    const rows = (arti === 0) ? res + 2 : res + 3;
    const colums = vari + res + arti + 4;
    matrix[0] = construirArray(vari, res, arti);
    const prueba = (arti > 0) ? 2 : 1;

    for (let i = 1; i < rows; i++) {
        matrix[i] = new Array(colums).fill(0);
        matrix[i][0] = i - 1;

        if (arti > 0) { // Si hay variables artificiales (dos fases)
            if (i === 1) {
                matrix[i][1] = "w";
            } else if (i === 2) {
                matrix[i][1] = "z";
            }
        } else { // Si no hay variables artificiales (una fase)
            if (i === 1) {
                matrix[i][1] = "z"; // Asigna "z" directamente en la fila 1 si no hay "w"
            }

        }

        if (i > prueba) {
            if (arti > 0 && i > 3) {
                matrix[i][1] = `a${vari + res + i - 3}`;
                arti--;
            } else {
                matrix[i][1] = `s${vari + i - 2}`;
            }
        }
    }
    console.log('asi se ve la matrix armada');
    console.table(matrix);
    return matrix;
}

// Necesita la cantidad de variables y restricciones
export function construirArray(vari, res, arti) { //! hace el encabezado de la matrix y el costado de la matriz del caso base
    let array = [];
    array.push("i");
    array.push("BVH");

    for (let i = 1; i <= vari; i++) {
        array.push(`x${i}`);
    }

    for (let j = 1; j <= res; j++) {
        array.push(`s${vari + j}`);
    }

    if (arti > 0) {
        for (let k = 0; k < arti; k++) {
            array.push(`a${vari + res + k + 1}`);
        }
    }


    array.push("RHS");
    array.push("Radios");
    return array;
}


// tiene que entrarle un sistema de ecuaciones  para poder remplazarlo en la matriz que se contruyo
//devuelve la matrix armada
export function llenarSistemaEnMatriz(matriz, sistema) {

    for (let i = 0; i < sistema.length; i++) {
        let ecuacion = sistema[i];
        for (let j = 2; j < matriz[i + 1].length - 1; j++) {
            matriz[i + 1][j] = ecuacion[j - 2] || 0;
        }
        matriz[i + 1][matriz[i + 1].length - 1] = ecuacion[ecuacion.length - 1];
    }

    return matriz;
}


//encuentra el menor de los datos en la fila de la z , recibe la matriz armada
//! aqui tiene que ser el empate con la variable de entrada 
/*tomar en consideracion lo siquiente 
    1. x2, s3
        Se selecciona siempre la variable de decision
        • X2
    2. x2, x4
        Se selecciona el subíndice menor
        • X2
    3. s4, s7
        Se selecciona la del subíndice menor
        • s4
*/
//! aqui es el no acotado
//!puede ser un problema a la hora de desplegar los datos 
export function encontrarIndiceMenorValorFilaZ(matriz, arti) {
    let filaZ = matriz[1];
    let valores = [];
    if (arti === 0) {
        valores = filaZ.slice(2, -1);
    }
    else {
        valores = filaZ.slice(2, -2);
    }

    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));


    if (menorValor < 0) {
        const indiceColumnaRadio = matriz[0].indexOf('Radios');
        let radios = matriz.slice(1).map(fila => fila[indiceColumnaRadio]);

        let todosSonInf = radios.every(valor => valor === '+INF' || valor === 'N/A');

        if (todosSonInf) {
            console.log("Problema no acotado: todos los radios son +INF y hay valores negativos en la fila z.");
            return -2; // Indicador de problema no acotado  si encuentra empate  lo manda a 
        }
        let indiceMenorValor = valores.indexOf(menorValor);

        return indiceMenorValor + 2;// ajuste del tamaño real de la matriz


    }
    else {
        return -1; //! si no encuentra un numero negativo retorna -1 
    }


}



// Función para calcular los valores en la columna de 'Radios'
//recibe la matriz  armada y calcula los radios 
export function calcularRadios(matriz, arti) {
    const columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz, arti);
    const indiceColumnaRHS = matriz[1].length - 2;
    const indiceResultado = indiceColumnaRHS + 1;


    matriz[1][indiceResultado] = 'N/A';
    if (arti !== 0) {
        matriz[2][indiceResultado] = 'N/A';
    }


    const filaInicio = (arti === 0) ? 2 : 3;

    for (let i = filaInicio; i < matriz.length; i++) {
        const valorColumna = matriz[i][columnaIndiceMenor];
        const rhs = matriz[i][indiceColumnaRHS];
        if (valorColumna === 0 || rhs < 0) {
            matriz[i][indiceResultado] = '+INF';
        } else {
            matriz[i][indiceResultado] = rhs / valorColumna;
        }
    }
    return matriz;
}



//enntra la matriz  calcula el menor indice para sacar cual de los radios usar
//! aqui tiene que ser el empate con la variable de salida 
/*
Qué vamos a hacer si tenemos un empate en los radios
• Si la variable que sale x4, s5
• Saque s5 → Deje las X porque son las variables que queremos hacer básicas, sáquelas de último
• Si salen 2 X, saque cualquiera
• Si salen 2 variables de holgura, saque cualquiera
• Preferiblemente el del subíndice menor
• Si f3, f7 → saque f3

 */
export function encontrarIndiceColumnaMenorRadios(matriz) {

    const indiceColumnaRadio = matriz[0].indexOf('Radios');
    if (indiceColumnaRadio === -1) {
        throw new Error("'Radios' no se encuentra en la matriz");
    }
    let radios = matriz.slice(1).map(fila => fila[indiceColumnaRadio]);

    let valoresRadios = radios.map(valor => {
        if (valor === 'N/A' || valor === '+INF') {
            return Infinity; // Considerar '+INF' como infinito
        }
        return Number(valor); // Convertir a número
    });

    let menorValor = Math.min(...valoresRadios);
    // Buscar todos los índices donde el menor valor se encuentra
    let indicesMenoresValores = [];
    valoresRadios.forEach((valor, indice) => {
        if (valor === menorValor) {
            indicesMenoresValores.push(indice + 1); // Sumar 1 para ajustar el índice a la matriz original
        }
    });

    // Si hay más de un índice, devolver la lista de índices, sino, el primero
    if (indicesMenoresValores.length > 1) {
        return extraerBVS(matriz, indicesMenoresValores);
    } else {
        return indicesMenoresValores[0]; // Devuelve solo el primer índice si no hay repetidos
    }


}


export function extraerBVS(matrix, indiceMenores) {
    console.log('Hay empate en la variable saliente,indices: ');
    console.table(indiceMenores);
    let variableSeleccionada = 0;
    let menorIndice = Infinity;


    indiceMenores.forEach(indice => {//la fila es: el elemento 1 de los indices menores en la matrix y la columna 1
        let variable = matrix[indice][1];// devuelve la variable exacta
        if (variable.startsWith('x')) {
            let subindice = parseInt(variable.slice(1)); // Extraer el número de la variable
            if (subindice < menorIndice) {
                variableSeleccionada = indice; // tendria el numero de indice en matrix grande
                menorIndice = subindice;
            }

        } else if (variable.startsWith('s')) {
            // Si no hay variables 'x', verificamos las 's'
            let subindice = parseInt(variable.slice(1)); // Extraer el número de la variable
            if (variableSeleccionada === 0 || subindice < menorIndice) {
                variableSeleccionada = indice;
                menorIndice = subindice;
            }
        }



    });
    console.log('este indice variable seleecionada: ' + variableSeleccionada);
    return variableSeleccionada;
}


//** Pone el 1 donde debe ser  */

//! aqui hago el cambio en la matriz de las variables entrantes y saliente.
export function convertirfila1(matrix, arti) {

    let columna = encontrarIndiceMenorValorFilaZ(matrix, arti);
    let fila = encontrarIndiceColumnaMenorRadios(matrix, arti);
    let variableEntrante = matrix[0][columna];
    // let variableSaliente = matrix[fila][1];

    //  console.log(`La variable Entrante es: ${variableEntrante}, La variante Saliente es: ${variableSaliente}`);

    if (fila === undefined || columna === undefined || fila < 0 || columna < 0) {
        throw new Error("Índice de fila o columna inválido.");
    }

    let sub = matrix[fila][columna]; // por el que hay que dividir
    //  console.log('divisor: ' + sub);

    let linea = matrix[fila].slice(2, -1); //escoge la porcion de matriz que realizar


    if (sub === 1) {
        matrix[fila][1] = variableEntrante;
        return matrix;
    }
    else {
        let nuevaLinea = linea.map(valor => {
            if (valor === '+INF' || valor === 'N/A') {
                return valor; // No dividir valores especiales
            }
            if (typeof valor === 'number') {
                matrix[fila][1] = variableEntrante;
                return valor / sub;
            }
            return valor;
        });

        matrix[fila].splice(2, linea.length, ...nuevaLinea);
        return matrix; //? se  podria hacer que indique la variable entrante y la saliente.
    }

}

//**compara arrays */
export function arraysSonIguales(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}


//** coloca ceros en todos la columna */
export function convertirColumnas0(matriz, filaConUno, arti) {
    let columna = encontrarIndiceMenorValorFilaZ(matriz, arti);// encuentra el valor de la columna 
    if (columna === undefined || columna < 0) {
        throw new Error("Índice de columna inválido."); // espera valor valido de columna 
    }

    for (let i = 1; i < matriz.length; i++) {

        let valoresFilaActual = matriz[i].slice(2, -1);
        if (arraysSonIguales(filaConUno, valoresFilaActual)) {
            continue; // ignora la fila con el 1
        }

        let valorColumna = matriz[i][columna];  // Toma el valor en la columna seleccionada para esta fila

        if (valorColumna === 0) {
            continue; // ignora si hay un 0 en esa posicion 

        } else {


            let nuevaFila = valoresFilaActual.map((valor, indexOf) => {
                if (typeof valor === 'number') {
                    return ((-1 * matriz[i][columna]) * filaConUno[indexOf] + valor);
                }
                return valor;

            });
            matriz[i].splice(2, nuevaFila.length, ...nuevaFila);
        }
    }

    return matriz;
}

export function casoBase(variable, res, sistema, arti) {

    let matriz;

    if (arti > 0) {
        let matrix1 = simplexBasic(variable, res, 0);
         matriz = llenarSistemaEnMatriz(matrix1, sistema);
    }

    else{
         matriz = sistema;
    }

    let negativo = 0;
    let iteracion = 0;
    const iteraciones = [];

    while (negativo !== -1) {


        // Guardar la matriz actual en el array de iteraciones
        iteraciones.push({
            iteracion: iteracion + 1,
            matriz: JSON.parse(JSON.stringify(matriz)) // Clonar la matriz para evitar referencias
        });


        let matrixConRadios = calcularRadios(matriz, 0);
        negativo = encontrarIndiceMenorValorFilaZ(matrixConRadios, 0);

        if (negativo !== -2) {
            let fila1 = encontrarIndiceColumnaMenorRadios(matriz, 0);
            let iteracion1 = convertirfila1(matrixConRadios, 0);


            let linea = matriz[fila1].slice(2, -1);
            iteracion1 = convertirColumnas0(iteracion1, linea, 0);


            // Guardar la matriz modificada en el array de iteraciones
            iteraciones.push({
                iteracion: iteracion + 1,
                matriz: JSON.parse(JSON.stringify(iteracion1)) // Clonar la matriz para evitar referencias
            });


            negativo = encontrarIndiceMenorValorFilaZ(iteracion1, 0);


            matriz = iteracion1;
            iteracion++;
        } else if (negativo === -2) {
            return "No acotado";
        }

        else {
            iteraciones.push({
                iteracion: iteracion + 1,
                matriz: JSON.parse(JSON.stringify(matriz))
            });

        }
    }

    return iteraciones;
}



