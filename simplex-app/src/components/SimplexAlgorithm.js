
// caso basico 
// TODO: empate con la variable saliente y variable entrante 
// TODO: hacer que funcionn casoBase reciba los parametros necesarios para que haga el caso base
// TODO: hacer que se vean las operaciones que se realizan en cada iteracion 


//** Recibe como parametro la cantidad de variables y restricciones 
//devuelve la matriz vacia con 0 en donde van los numeros correspondientes del sistema
function simplexBasic(vari, res) { //arma la matrix segun la cantidad de restricciones y variables
    let matrix = [];
    let rows = res + 2;
    let colums = vari + res + 4;

    for (let i = 0; i < rows; i++) {
        if (i === 0) {
            matrix[0] = construirArray(vari, res);
        } else {
            matrix[i] = [];
            for (let j = 0; j < colums; j++) {
                if (j === 0) {
                    matrix[i][j] = i - 1;
                } else if (i === 1 && j === 1) {
                    matrix[1][1] = "z";
                } else if (j === 1 && i > 1) {
                    matrix[i][1] = `s${vari + i - 1}`;
                } else {
                    matrix[i][j] = 0;
                }
            }
        }
    }
    return matrix;
}


// Necesita la cantidad de variables y restricciones
function construirArray(vari, res) { //! hace el encabezado de la matrix y el costado de la matriz del caso base
    let array = [];
    array.push("i");
    array.push("BVH");

    for (let i = 1; i <= vari; i++) {
        array.push(`x${i}`);
    }

    for (let j = 1; j <= res; j++) {
        array.push(`s${vari + j}`);
    }

    array.push("RHS");
    array.push("Radios");
    return array;
}


// tiene que entrarle un sistema de ecuaciones  para poder remplazarlo en la matriz que se contruyo
//devuelve la matrix armada
function llenarSistemaEnMatriz(matriz, sistema) {

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

function encontrarIndiceMenorValorFilaZ(matriz) {
    let filaZ = matriz[1];
    let valores = filaZ.slice(2, -1);
    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));
    if (menorValor < 0) {
        let indiceMenorValor = valores.indexOf(menorValor);
        return indiceMenorValor + 2;// ajuste del tamaño real de la matriz
    }
    else {
        return -1; //! si no encuentra un numero negativo retorna -1 
    }
}



// Función para calcular los valores en la columna de 'Radios'
//recibe la matriz  armada y calcula los radios 
function calcularRadios(matriz) {
    let columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz);
    let indiceColumnaRHS = matriz[1].length;
    matriz[1][indiceColumnaRHS - 1] = 'N/A'


    for (let i = 2; i < matriz.length; i++) {
        let valorColumna = matriz[i][columnaIndiceMenor];
        let rhs = matriz[i][indiceColumnaRHS - 2];

        if (valorColumna === 0) {
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else if ((rhs < 0 && valorColumna > 0) || (rhs < 0 && valorColumna < 0)) { //! revisar si esta condicion si existe los dos negativos
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else if (valorColumna < 0) {
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else {
            matriz[i][indiceColumnaRHS - 1] = rhs / valorColumna;
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

function encontrarIndiceColumnaMenorRadios(matriz) {

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

    let indiceMenorValor = valoresRadios.indexOf(menorValor);
    return indiceMenorValor + 1;
}




//** Pone el 1 donde debe ser  */

//! aqui hago el cambio en la matriz de las variables entrantes y saliente.
function convertirfila1(matrix) {

    let columna = encontrarIndiceMenorValorFilaZ(matrix);
    let fila = encontrarIndiceColumnaMenorRadios(matrix);
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
function arraysSonIguales(arr1, arr2) {
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
function convertirColumnas0(matriz, filaConUno) {
    let columna = encontrarIndiceMenorValorFilaZ(matriz);// encuentra el valor de la columna 
    if (columna === undefined || columna < 0) {
        throw new Error("Índice de columna inválido."); // espera valor valido de columna 
    }

    for (let i = 1; i < matriz.length; i++) {

        let valoresFilaActual = matriz[i].slice(2, -1);

        // console.log(valoresFilaActual);

        if (arraysSonIguales(filaConUno, valoresFilaActual)) {

            //  console.log('fila con el 1: ' + valoresFilaActual);
            continue; // ignora la fila con el 1
        }

        let valorColumna = matriz[i][columna];  // Toma el valor en la columna seleccionada para esta fila

        if (valorColumna === 0) {
            console.log(matriz);
            continue; // ignora si hay un 0 en esa posicion 

        } else {


            let nuevaFila = valoresFilaActual.map((valor, indexOf) => {
                if (typeof valor === 'number') {
                    return ((-1 * matriz[i][columna]) * filaConUno[indexOf] + valor);
                }
                return valor;

            });
            matriz[i].splice(2, nuevaFila.length, ...nuevaFila);
            // console.log(matriz);
        }
    }

    return matriz;
}







export function casoBase() {
    

    let matrix1 = simplexBasic(2, 2);

    let sistema2 = [
        [-5, -4, 0, 0, 0],
        [2, -1, 1, 0, 4],
        [5, 3, 0, 1, 15]
    ]

    let matriz = llenarSistemaEnMatriz(matrix1, sistema2);
    let negativo = 0;
    let iteracion = 0;

    while (negativo !== -1) {
        console.log(`\nIteración ${iteracion + 1}:`);
        console.log("Matriz actual antes de calcular radios:");
        console.table(matriz);

        // Calcular los radios y encontrar el índice de la columna
        let matrixConRadios = calcularRadios(matriz);
        let fila1 = encontrarIndiceColumnaMenorRadios(matriz);
        let iteracion1 = convertirfila1(matrixConRadios);

        // Convertir columnas a cero
        let linea = matriz[fila1].slice(2, -1);
        iteracion1 = convertirColumnas0(iteracion1, linea);

        // Mostrar la matriz después de cada iteración
        console.log("Matriz después de convertir columnas a cero:");
        console.table(iteracion1);

        // Encontrar si todavía hay valores negativos en la fila Z
        negativo = encontrarIndiceMenorValorFilaZ(iteracion1);

        // Actualizar matriz para la siguiente iteración
        matriz = iteracion1;
        iteracion++;
    }

  
    //! este es el que dice que ya no hay negativos encontrarIndiceMenorValorFilaZ(matriz);


}



