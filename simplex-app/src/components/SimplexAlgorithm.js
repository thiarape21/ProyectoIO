
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



export function encontrarIndiceMenorValorFilaZ(matriz) {
    let filaZ = matriz[1]; 
    let valores = filaZ.slice(2, -1); 
    let menorValor = Math.min(...valores.filter(valor => typeof valor === 'number'));
    let indiceMenorValor = valores.indexOf(menorValor);
    return indiceMenorValor + 2 ;// ajuste del tamaño real de la matriz
}



// Función para calcular los valores en la columna de 'Radios'
export function calcularRadios(matriz) {
    let columnaIndiceMenor = encontrarIndiceMenorValorFilaZ(matriz);
    let indiceColumnaRHS= matriz[1].length;
    
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

    let indiceMenorValor = valoresRadios.indexOf(menorValor);
    return indiceMenorValor + 1; 
}





function convertirfila1(matrix){

    let columna = encontrarIndiceMenorValorFilaZ(matrix);
    let fila = encontrarIndiceColumnaMenorRadios(matrix);

    if (fila === undefined || columna === undefined || fila < 0 || columna < 0) {
        throw new Error("Índice de fila o columna inválido.");
    }


    console.log( "fila: " + fila + " columna: " + columna);
    let sub = matrix[fila][columna];
    console.log(sub);

    let linea = matrix[fila].slice(2,-1);
    console.log(linea);

    if (sub === 1){
        return matrix;
    }
    else{
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

        return matrix;
    }

}


export function casoBase(){
    
let matrix1= simplexBasic(2,2);

// si el sistema entra asi no necesito llenar la matriz 

let sistema = [
    [1, -1, -2, 0, 0, 'N/A'], // -2x1 - 1x2 + 0s3 + 0s4 = 0 radios 0
    [4, 1, 3, 0, 3, 0],   // 4x1 + 1x2 + 1s3 + 0s4 = 3 radios 0
    [4, 1, 0, 1, 2, 0]    // 4x1 + 1x2 + 0s3 + 1s4 = 2 radios 0
];

let matriz = llenarSistemaEnMatriz(matrix1,sistema);

let matrix = calcularRadios(matriz);

let iteracion1= convertirfila1(matrix);



console.log(iteracion1);



}



