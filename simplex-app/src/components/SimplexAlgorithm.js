

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


let sistema = [
    [-1, -1, -2, 0, 0, 'N/A'], // -2x1 - 1x2 + 0s3 + 0s4 = 0 radios 0
    [4, 1, 3, 0, 3, 0],   // 4x1 + 1x2 + 1s3 + 0s4 = 3 radios 0
    [4, 1, 0, 1, 2, 0]    // 4x1 + 1x2 + 0s3 + 1s4 = 2 radios 0
];

let matrix = llenarSistemaEnMatriz(simplexBasic(2,2), sistema);
console.log("matriz llena con el sistema :" );
console.log(matrix);


function encontrarIndiceMenorValorFilaZ(matriz) {
    let filaZ = matriz[1]; 
    let valores = filaZ.slice(2, -1); 
    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));
    let indiceMenorValor = valores.indexOf(menorValor);
    return indiceMenorValor + 2;
}

console.log( "indice del valor del menor en z: " + encontrarIndiceMenorValorFilaZ(matrix));

// Función para calcular los valores en la columna de 'Radios'
function calcularRadios(matriz) {
    let columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz);
    
    for (let i = 1; i < matriz.length; i++) { 
        let valorColumna = matriz[i][columnaIndiceMenor];
        let rhs = matriz[i][6]; 

        if (valorColumna === 0) {
            matriz[i][7] = '+INF'; 
        } else if ((rhs < 0 && valorColumna > 0) || (rhs > 0 && valorColumna < 0)) {
            matriz[i][7] = '+INF'; 
        } else if (rhs === 0) {
            matriz[i][7] = '+INF'; 
        } else {
            matriz[i][7] = rhs / valorColumna; 
        }
    }

    return matriz;
}


function encontrarIndiceColumnaMenorRadios(matriz) {

    let radios = matriz.slice(1).map(fila => fila[7]); 
    let valoresRadios = radios.map(valor => {
        if (valor === 'N/A' || valor === '+INF') return Infinity; // Considerar '+INF' como infinito
        return '+INF' ; // Convertir a número
    });

    let menorValor = Math.min(...valoresRadios);
    let indiceMenorValor = valoresRadios.indexOf(menorValor);
    return indiceMenorValor + 3; 
}


function iteraciones1(matrix){
    let fila = encontrarIndiceMenorValorFilaZ(matrix);
    let columna = encontrarIndiceColumnaMenorRadios(matrix);

    let sub = matrix[fila][columna];
    if (sub === 1){
        return matrix;
    }
    else{
        matrix[fila] = matrix[fila].map(valor => {
            if (valor === '+INF' || valor === 'N/A') {
                return valor; // No dividir valores especiales
            }
            return typeof valor === 'number' ? valor / sub : valor;   // no correcto corregir 
        });
    }

}


let matriz = calcularRadios(matrix);
console.log("Matriz con Radios calculados:");
console.log(matriz);

let indiceColumnaMenorRadios = encontrarIndiceColumnaMenorRadios(matriz);
console.log("El índice de la fila con el menor valor en 'Radios' es:", indiceColumnaMenorRadios);

