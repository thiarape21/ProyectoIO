
import {
    simplexBasic, llenarSistemaEnMatriz, convertirfila1, calcularRadios, encontrarIndiceMenorValorFilaZ,
    encontrarIndiceColumnaMenorRadios, convertirColumnas0
} from "./simplex_casoBase";



function cambiarA(matrix) {

    let linea0 = matrix[1].slice(2, -1); // línea con de z
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




export function granM(sistema, vari , res, arti, holgura){
    let matrix1 = simplexBasic(vari, res, arti ,'Gran M', holgura);
    let matrix2 = llenarSistemaEnMatriz(matrix1, sistema, holgura);
  //  let matriz = cambiarA(matrix2);

    console.log(matrix2);


}