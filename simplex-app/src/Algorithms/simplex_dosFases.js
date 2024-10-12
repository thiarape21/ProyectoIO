// TODO : que haga la primera fase 

import {
    simplexBasic, llenarSistemaEnMatriz, convertirfila1, calcularRadios, encontrarIndiceMenorValorFilaZ,
    encontrarIndiceColumnaMenorRadios, convertirColumnas0
} from "./simplex_casoBase";

function cambiarA(matrix) {

    let linea0 = matrix[1].slice(2, -1); // línea con de W
    let nuevaFila = [...linea0];

    for (let i = 1; i < matrix.length; i++) {
        if (matrix[i][1].includes("a")) {
            let linea1 = matrix[i].slice(2, -1);
            nuevaFila = nuevaFila.map((valor, indexOf) => {
                if (typeof valor === 'number') {
                    return (-1 * linea1[indexOf]) + valor;
                }
                return valor;
            });
        } else {
            continue;
        }
    }
    matrix[1].splice(2, nuevaFila.length, ...nuevaFila);
    return matrix;
}


function esFactible(matriz){
    for (let i = 1; i < matriz.length; i++) { 
        const variable = matriz[i][1]; 
        if (typeof variable === 'string' && variable.startsWith('a')) {
            return false ;
        }
    }
    return true ;
}

function encogerMatriz(matriz) {
    const indicesColumnas = [];

    matriz[0].forEach((valor, index) => {
        if (typeof valor === 'string' && valor.startsWith('a')) {
            indicesColumnas.push(index); // Guardamos el índice de la columna que tiene 'a'
        }
    });

    for (let i = 1; i < matriz.length; i++) {
        if (matriz[i][1] === 'w') {
            matriz.splice(i, 1); 
        }
    }

    indicesColumnas.sort((a, b) => b - a); // Ordenar en orden descendente
    matriz.forEach(fila => {
        indicesColumnas.forEach(index => {
            fila.splice(index, 1); // Eliminar la columna en el índice correspondiente
        });
    });


    console.table(matriz);
    return matriz;
}

export function separarMatriz(matrix){
    

}


//! tiene que entrarle  sistema , var, res y arti
export function faseUno(sistema, vari , res, arti) {// minimizacion 



    let matrix1 = simplexBasic(vari, res, arti);
    let matrix2 = llenarSistemaEnMatriz(matrix1, sistema);
    let matriz = cambiarA(matrix2);
    let negativo = 0;
    let iteracion = 0;
    const iteraciones = []; 
    while (negativo !== -1) {
        

        // Guardar la matriz actual en el array de iteraciones
        iteraciones.push({
            iteracion: iteracion + 1,
            matriz: JSON.parse(JSON.stringify(matriz)) // Clonar la matriz para evitar referencias
        });

       
        let matrixConRadios = calcularRadios(matriz,arti);
        negativo = encontrarIndiceMenorValorFilaZ(matrixConRadios,arti);

       

        if (negativo !== -2) {
            let fila1 = encontrarIndiceColumnaMenorRadios(matriz);
            let iteracion1 = convertirfila1(matrixConRadios, arti);

           
            let linea = matriz[fila1].slice(2, -1);
            iteracion1 = convertirColumnas0(iteracion1, linea, arti);


            // Guardar la matriz modificada en el array de iteraciones
            iteraciones.push({
                iteracion: iteracion + 1,
                matriz: JSON.parse(JSON.stringify(iteracion1)) // Clonar la matriz para evitar referencias
            });

            
            negativo = encontrarIndiceMenorValorFilaZ(iteracion1,arti);

            
            matriz = iteracion1;
            iteracion++;
        }else if(negativo === -2){
            return "No acotado";
        }
        
        else {
            iteraciones.push({
                iteracion: iteracion + 1,
                matriz: JSON.parse(JSON.stringify(matriz))
            });

        } 
    }
    
    console.log(iteraciones);

    const devuelvo = ( esFactible(matriz)) ? iteraciones : 'no factible' ; //! esto se podria hacer del front end 

    console.log('asi se ve reducida');
    encogerMatriz(matriz);
   
    return devuelvo;


}