
// caso basico 


export function simplexBasic(vari, res) { //arma la matrix segun la cantidad de restricciones y variables
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



export function construirArray(vari, res) { // hace el encabezado de la matrix
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



export function llenarSistemaEnMatriz(matriz, sistema) { // tiene que entrarle un sistema de ecuaciones como el de abajo para poder remplazarlo en la matriz que se contruyo

    for (let i = 0; i < sistema.length; i++) {
        let ecuacion = sistema[i]; 
        for (let j = 2; j < matriz[i + 1].length - 1; j++) {
            matriz[i + 1][j] = ecuacion[j - 2] || 0; 
        }
        matriz[i + 1][matriz[i + 1].length - 1] = ecuacion[ecuacion.length - 1];
    }

    return matriz;
}

let matrix1= simplexBasic(2,2);
console.log(matrix1);

let sistema = [
    [1, -1, -2, 0, 0, 'N/A'], // -2x1 - 1x2 + 0s3 + 0s4 = 0 radios 0
    [4, 1, 3, 0, 3, 0],   // 4x1 + 1x2 + 1s3 + 0s4 = 3 radios 0
    [4, 1, 0, 1, 2, 0]    // 4x1 + 1x2 + 0s3 + 1s4 = 2 radios 0
];

 let matrix = llenarSistemaEnMatriz(matrix1, sistema);
 console.log("matriz llena con el sistema :" );
console.log(matrix);


function encontrarIndiceMenorValorFilaZ(matriz) {
    let filaZ = matriz[1]; 
    let valores = filaZ.slice(2, -1); 
    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));
    let indiceMenorValor = valores.indexOf(menorValor);
    return indiceMenorValor + 2 ;// ajuste del tamaño real de la matriz
}

 console.log( "indice del valor del menor en z: " + encontrarIndiceMenorValorFilaZ(matrix));

// Función para calcular los valores en la columna de 'Radios'
function calcularRadios(matriz) {
    let columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz);
    let indiceColumnaRHS= matrix[1].length;
    
    for (let i = 1; i < matriz.length; i++) { 
        let valorColumna = matriz[i][columnaIndiceMenor];
        let rhs = matriz[i][indiceColumnaRHS-2]; 

        if (valorColumna === 0) {
            matriz[i][indiceColumnaRHS-1] = '+INF'; 
        } else if ((rhs < 0 && valorColumna > 0) || (rhs > 0 && valorColumna < 0)) {
            matriz[i][indiceColumnaRHS-1] = '+INF'; 
        } else if (rhs === 0) {
            matriz[i][indiceColumnaRHS-1] = '+INF'; 
        } else {
            matriz[i][indiceColumnaRHS-1] = rhs / valorColumna; 
        }
    }

    return matriz;
}

console.log(calcularRadios(matrix)); 

function encontrarIndiceColumnaMenorRadios(matriz) {

    let indiceColumnaRadio= matrix[1].length-1;
    let radios = matriz.slice(1).map(fila => fila[indiceColumnaRadio]); 
    console.log('radios: '+ radios);
    let valoresRadios = radios.map(valor => {
        if (valor === 'N/A' || valor === '+INF') return valor; // Considerar '+INF' como infinito
        return valor ; // Convertir a número
    });

    let menorValor = Math.min(...valoresRadios);
    let indiceMenorValor = valoresRadios.indexOf(menorValor);
    return indiceMenorValor + 3; 
}


console.log("Menor de los radios: "+ encontrarIndiceColumnaMenorRadios(matrix)); 

function iteraciones1(matrix){
    let fila = encontrarIndiceMenorValorFilaZ(matrix);
    let columna = encontrarIndiceColumnaMenorRadios(matrix);

    if (fila === undefined || columna === undefined || fila < 0 || columna < 0) {
        throw new Error("Índice de fila o columna inválido.");
    }


    console.log( "fila: " + fila + " columna: " + columna);
    let sub = matrix[fila-2][columna-2];
    console.log(sub);

    if (sub === 1){
        return matrix;
    }
    else{
        matrix[fila] = matrix[fila].map(valor => {
            if (valor === '+INF' || valor === 'N/A') {
                return valor; // No dividir valores especiales
            }
            if (typeof valor === 'number'){
                return valor / sub;
            }
            return valor;
        });
        return matrix;
    }

}




// let matriz = calcularRadios(matrix);
//  console.log("Matriz con Radios calculados:");
// console.log(matriz);

// let indiceColumnaMenorRadios = encontrarIndiceColumnaMenorRadios(matriz);
//  console.log("El índice de la fila con el menor valor en 'Radios' es:", indiceColumnaMenorRadios);
//  console.log('el indice menor de columna de los radios: ' + encontrarIndiceColumnaMenorRadios(matriz));

//  let matriz2 = iteraciones1(matriz);
// console.log(matriz2);

