/**
 * Módulo de Estatísticas - Funções para cálculos estatísticos
 */

/**
 * Calcula estatísticas para um conjunto de preços
 * @param {Array<number>} precos - Lista de preços
 * @returns {Object} Objeto com estatísticas calculadas
 */
function calcularEstatisticas(precos) {
    if (!precos || precos.length === 0) {
        return {
            media: 0,
            mediana: 0,
            moda: 0,
            min: 0,
            max: 0,
            limiteInferior: 0,
            limiteSuperior: 0,
            outliers: []
        };
    }

    // Ordena os preços
    const ordenados = [...precos].sort((a, b) => a - b);
    
    // Calcula quartis e IQR para identificar outliers
    const q1Index = Math.floor(ordenados.length * 0.25);
    const q3Index = Math.floor(ordenados.length * 0.75);
    const q1 = ordenados[q1Index];
    const q3 = ordenados[q3Index];
    const iqr = q3 - q1;
    
    // Define limites para outliers
    const limiteInferior = q1 - 1.5 * iqr;
    const limiteSuperior = q3 + 1.5 * iqr;
    
    // Identifica outliers
    const outliers = precos.filter(p => p < limiteInferior || p > limiteSuperior);
    
    // Calcula estatísticas básicas
    const media = precos.reduce((a, b) => a + b, 0) / precos.length;
    const min = ordenados[0];
    const max = ordenados[ordenados.length - 1];
    
    // Calcula a mediana
    const mediana = ordenados.length % 2 === 0
        ? (ordenados[ordenados.length / 2 - 1] + ordenados[ordenados.length / 2]) / 2
        : ordenados[Math.floor(ordenados.length / 2)];
    
    // Calcula a moda (valor mais frequente)
    const frequencia = {};
    precos.forEach(preco => {
        frequencia[preco] = (frequencia[preco] || 0) + 1;
    });
    
    let moda = precos[0];
    let maxFreq = 1;
    
    for (let preco in frequencia) {
        if (frequencia[preco] > maxFreq) {
            moda = parseFloat(preco);
            maxFreq = frequencia[preco];
        }
    }
    
    return {
        media,
        mediana,
        moda,
        min,
        max,
        limiteInferior,
        limiteSuperior,
        outliers
    };
}

// Exportar funções
window.Statistics = {
    calcularEstatisticas
}; 