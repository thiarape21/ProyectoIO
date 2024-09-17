
// caso basico 


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



function construirArray(vari, res) { // hace el encabezado de la matrix
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



function llenarSistemaEnMatriz(matriz, sistema) { // tiene que entrarle un sistema de ecuaciones como el de abajo para poder remplazarlo en la matriz que se contruyo

    for (let i = 0; i < sistema.length; i++) {
        let ecuacion = sistema[i];
        for (let j = 2; j < matriz[i + 1].length - 1; j++) {
            matriz[i + 1][j] = ecuacion[j - 2] || 0;
        }
        matriz[i + 1][matriz[i + 1].length - 1] = ecuacion[ecuacion.length - 1];
    }

    return matriz;
}



function encontrarIndiceMenorValorFilaZ(matriz) {
    let filaZ = matriz[1];
    let valores = filaZ.slice(2, -1);
    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));
    if (menorValor < 0) {
        let indiceMenorValor = valores.indexOf(menorValor);
        return indiceMenorValor + 2;// ajuste del tamaño real de la matriz
    }
    else {
        return -1;
    }
}



// Función para calcular los valores en la columna de 'Radios'
function calcularRadios(matriz) {
    let columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz);
    let indiceColumnaRHS = matriz[1].length;

    for (let i = 1; i < matriz.length; i++) {
        let valorColumna = matriz[i][columnaIndiceMenor];
        let rhs = matriz[i][indiceColumnaRHS - 2];

        if (valorColumna === 0) {
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else if ((rhs < 0 && valorColumna > 0) || (rhs > 0 && valorColumna < 0)) {
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else if (rhs === 0) {
            matriz[i][indiceColumnaRHS - 1] = '+INF';
        } else {
            matriz[i][indiceColumnaRHS - 1] = rhs / valorColumna;
        }
    }

    return matriz;
}



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





function convertirfila1(matrix) {

    let columna = encontrarIndiceMenorValorFilaZ(matrix);
    let fila = encontrarIndiceColumnaMenorRadios(matrix);
    

    if (fila === undefined || columna === undefined || fila < 0 || columna < 0) {
        throw new Error("Índice de fila o columna inválido.");
    }

    let sub = matrix[fila][columna]; // por el que hay que dividir
    console.log('divisor: ' + sub);

    let linea = matrix[fila].slice(2, -1); //escoge la porcion de matriz que realizar


    if (sub === 1) {
        return matrix;
    }
    else {
        let nuevaLinea = linea.map(valor => {
            if (valor === '+INF' || valor === 'N/A') {
                return valor; // No dividir valores especiales
            }
            if (typeof valor === 'number') {
                return valor / sub;
            }
            return valor;
        });

        matrix[fila].splice(2, linea.length, ...nuevaLinea);

        console.log("matriz despues de poner un 1: ");
        console.log(matrix);
        return matrix;
    }

}

function convertirColumnas0(matriz, filaConUno) {
    let columna = encontrarIndiceMenorValorFilaZ(matriz);// encuentra el valor de la columna 

    if (columna === undefined || columna < 0) {
        throw new Error("Índice de columna inválido."); // espera valor valido de columna 
    }

    for (let i = 1; i < matriz.length; i++) { 
        if (i === filaConUno) {
            continue; // ignora la fila con el 1
        }

        let valorColumna = matriz[i][columna];  //empieza en uno por el encabezado se supone que agarra fila de i y columna que seria j 

        console.log('deberia agarrar el valor : ' + valorColumna);
        if (valorColumna === 0) {
            continue; // ignora si hay un 0 en esa posicion 
        } else {
           
            let nuevaFila = matriz[i].slice(2, -1).map((valor) => {
                if (typeof valor === 'number') {
                    console.log('numero de valor que entra:' + valor);
                    return  ((-1 * valor) * filaConUno[i]  + valorColumna);
                }
                return valor;
            });

            matriz[i].splice(2, nuevaFila.length, ...nuevaFila);
        }
    }

    return matriz;
}


export function casoBase() {

    let matrix1 = simplexBasic(2, 2);

    // si el sistema entra asi no necesito llenar la matriz 

    let sistema = [
        [-2, -1, 0, 0, 0 ,'N/A'], // -2x1 - 1x2 + 0s3 + 0s4 = 0 radios 0
        [4, 1, 1 , 0, 3],   // 4x1 + 1x2 + 1s3 + 0s4 = 3 radios 0
        [4, 1, 0, 1, 2]    // 4x1 + 1x2 + 0s3 + 1s4 = 2 radios 0
    ];

    let matriz = llenarSistemaEnMatriz(matrix1, sistema);

    let matrix = calcularRadios(matriz);
    
    let fila1 = encontrarIndiceColumnaMenorRadios(matriz);

    let linea = matriz[fila1].slice(2, -1);

    let iteracion1 = convertirfila1(matrix);

    //iteracion1 = convertirColumnas0(iteracion1, linea);



    console.log(iteracion1);



}



