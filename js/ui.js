/**
 * Módulo de UI - Funções para manipulação da interface do usuário
 */

// Formatador de moeda
const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

// Variáveis globais para armazenar estado
// Removendo a declaração local para usar a global
// let resultadosLoteAtuais = [];
let detalhesAtuais = null;
let ordemAtual = 'menor';

/**
 * Atualiza a tabela de resultados com os dados atuais
 */
function atualizarTabelaResultados() {
    const tbody = document.getElementById('tabela-corpo');
    if (!tbody) {
        console.error('Elemento tabela-corpo não encontrado!');
        return;
    }
    
    tbody.innerHTML = '';
    
    console.log('Atualizando tabela com resultados:', window.resultadosLoteAtuais);
    
    if (!window.resultadosLoteAtuais || window.resultadosLoteAtuais.length === 0) {
        console.log('Nenhum resultado para exibir');
        return;
    }
    
    window.resultadosLoteAtuais.forEach((resultado, index) => {
        if (!resultado.resultados || resultado.resultados.length === 0) {
            return;
        }
        
        // Calcula fontes
        const fontesMl = resultado.resultados.filter(r => r.marketplace === 'Mercado Livre').length;
        const fontesGs = resultado.resultados.filter(r => r.marketplace === 'Google Shopping').length;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${resultado.produto}</td>
            <td>${resultado.resultados.length}</td>
            <td>${formatter.format(resultado.estatisticas.media)}</td>
            <td>${formatter.format(resultado.estatisticas.mediana)}</td>
            <td>${formatter.format(resultado.estatisticas.moda)}</td>
            <td>
                ${fontesMl > 0 ? `<span class="fonte-badge ml">ML: ${fontesMl}</span>` : ''}
                ${fontesGs > 0 ? `<span class="fonte-badge gs">GS: ${fontesGs}</span>` : ''}
            </td>
            <td>
                <button onclick="UI.mostrarDetalhes(${index})" class="btn-detalhes">Ver Detalhes</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Remove todos os outliers da análise atual
 */
function removerOutliers() {
    if (!detalhesAtuais || !detalhesAtuais.resultados) return;
    
    const stats = detalhesAtuais.estatisticas;
    
    // Filtra os produtos mantendo apenas os que não são outliers
    detalhesAtuais.resultados = detalhesAtuais.resultados.filter(produto => {
        return produto.preco >= stats.limiteInferior && produto.preco <= stats.limiteSuperior;
    });
    
    // Recalcula estatísticas
    const precos = detalhesAtuais.resultados.map(p => p.preco);
    detalhesAtuais.estatisticas = Statistics.calcularEstatisticas(precos);
    
    // Atualiza a interface
    atualizarListaProdutosModal(detalhesAtuais.resultados);
    atualizarGrafico(detalhesAtuais.resultados);
    
    // Atualiza os valores no modal
    document.getElementById('modal-quantidade').textContent = detalhesAtuais.resultados.length;
    document.getElementById('modal-media').textContent = formatter.format(detalhesAtuais.estatisticas.media);
    document.getElementById('modal-mediana').textContent = formatter.format(detalhesAtuais.estatisticas.mediana);
    document.getElementById('modal-moda').textContent = formatter.format(detalhesAtuais.estatisticas.moda);
    
    // Atualiza a tabela principal
    const prodIndex = window.resultadosLoteAtuais.findIndex(r => r.produto === detalhesAtuais.produto);
    if (prodIndex >= 0) {
        window.resultadosLoteAtuais[prodIndex] = detalhesAtuais;
        atualizarTabelaResultados();
    }
}

/**
 * Remove outliers de todos os itens do lote de uma vez
 */
function removerOutliersLote() {
    if (!window.resultadosLoteAtuais || window.resultadosLoteAtuais.length === 0) {
        alert('Não há resultados para processar');
        return;
    }

    let totalOutliersRemovidos = 0;
    let itensProcessados = 0;

    window.resultadosLoteAtuais.forEach(resultado => {
        if (!resultado.resultados || resultado.resultados.length === 0) return;

        const qtdAnterior = resultado.resultados.length;
        
        // Filtra os produtos mantendo apenas os que não são outliers
        resultado.resultados = resultado.resultados.filter(produto => {
            return produto.preco >= resultado.estatisticas.limiteInferior && 
                   produto.preco <= resultado.estatisticas.limiteSuperior;
        });

        // Recalcula estatísticas
        const precos = resultado.resultados.map(p => p.preco);
        resultado.estatisticas = Statistics.calcularEstatisticas(precos);

        totalOutliersRemovidos += (qtdAnterior - resultado.resultados.length);
        itensProcessados++;
    });

    // Atualiza a tabela
    atualizarTabelaResultados();

    // Mostra mensagem de feedback
    alert(`Processamento concluído!\n\nItens processados: ${itensProcessados}\nOutliers removidos: ${totalOutliersRemovidos}`);
}

/**
 * Alterna entre visualização em grade e lista
 * @param {string} view - Tipo de visualização ('grid' ou 'list')
 */
function alternarVisualizacao(view) {
    const container = document.getElementById('lista-produtos-modal');
    const buttons = document.querySelectorAll('.view-toggle button');
    
    // Remove classes antigas e adiciona a nova
    container.classList.remove('grid-view', 'list-view');
    container.classList.add(`${view}-view`);
    
    // Atualiza estado dos botões
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === view);
    });
}

/**
 * Exibe os detalhes de um produto
 * @param {number} index - Índice do produto nos resultados
 */
function mostrarDetalhes(index) {
    const resultado = window.resultadosLoteAtuais[index];
    if (!resultado) {
        console.error('Resultado não encontrado para o índice:', index);
        return;
    }
    
    console.log('Mostrando detalhes para:', resultado.produto);
    
    // Armazena os detalhes atuais
    detalhesAtuais = resultado;
    
    // Atualiza o título do modal
    const modalTitulo = document.getElementById('modal-titulo');
    if (modalTitulo) {
        modalTitulo.textContent = `Detalhes: ${resultado.produto}`;
    }
    
    // Atualiza as estatísticas
    const modalQuantidade = document.getElementById('modal-quantidade');
    const modalMedia = document.getElementById('modal-media');
    const modalMediana = document.getElementById('modal-mediana');
    const modalModa = document.getElementById('modal-moda');
    
    if (modalQuantidade) modalQuantidade.textContent = resultado.resultados.length;
    if (modalMedia) modalMedia.textContent = formatter.format(resultado.estatisticas.media);
    if (modalMediana) modalMediana.textContent = formatter.format(resultado.estatisticas.mediana);
    if (modalModa) modalModa.textContent = formatter.format(resultado.estatisticas.moda);
    
    // Atualiza a contagem por fonte
    const fontesMl = resultado.resultados.filter(r => r.marketplace === 'Mercado Livre').length;
    const fontesGs = resultado.resultados.filter(r => r.marketplace === 'Google Shopping').length;
    
    const modalQtdMl = document.getElementById('modal-qtd-ml');
    const modalQtdGs = document.getElementById('modal-qtd-gs');
    
    if (modalQtdMl) modalQtdMl.textContent = `ML: ${fontesMl}`;
    if (modalQtdGs) modalQtdGs.textContent = `GS: ${fontesGs}`;
    
    // Atualiza a lista de produtos
    atualizarListaProdutosModal(resultado.resultados);
    
    // Atualiza o gráfico
    atualizarGrafico(resultado.resultados);
    
    // Configura os botões de visualização
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.addEventListener('click', () => {
            alternarVisualizacao(btn.getAttribute('data-view'));
        });
    });
    
    // Exibe o modal
    document.getElementById('modal-detalhes').style.display = 'block';
}

/**
 * Atualiza a lista de produtos no modal
 * @param {Array} produtos - Lista de produtos a exibir
 */
function atualizarListaProdutosModal(produtos) {
    const container = document.getElementById('lista-produtos-modal');
    container.innerHTML = '';
    
    // Atualiza contadores de fontes
    const qtdMl = document.getElementById('modal-qtd-ml');
    const qtdGs = document.getElementById('modal-qtd-gs');
    
    const fontesMl = produtos.filter(p => p.marketplace === 'Mercado Livre').length;
    const fontesGs = produtos.filter(p => p.marketplace === 'Google Shopping').length;
    
    qtdMl.textContent = `ML: ${fontesMl}`;
    qtdGs.textContent = `GS: ${fontesGs}`;
    
    // Calcula estatísticas para identificar outliers
    const precos = produtos.map(p => p.preco);
    const stats = detalhesAtuais.estatisticas;
    
    // Cria cards para cada produto
    produtos.forEach((produto, i) => {
        const indexOriginal = detalhesAtuais.resultados.findIndex(p => 
            p.titulo === produto.titulo && 
            p.preco === produto.preco && 
            p.marketplace === produto.marketplace
        );
        
        const isOutlier = produto.preco < stats.limiteInferior || produto.preco > stats.limiteSuperior;
        
        const card = document.createElement('div');
        card.className = `produto-card ${isOutlier ? 'outlier' : ''}`;
        card.innerHTML = `
            <div class="imagem-container">
                <img 
                    src="${API.processarUrlImagem(produto.imagem)}" 
                    alt="${produto.titulo}" 
                    onerror="this.src='/assets/no-image.png'"
                >
            </div>
            <div class="produto-info">
                <h4>${produto.titulo}</h4>
                <p class="preco ${isOutlier ? 'outlier' : ''}">${formatter.format(produto.preco)}
                ${isOutlier ? '<span class="outlier-badge" title="Preço fora do padrão">⚠️</span>' : ''}
                </p>
                <p class="marketplace">
                    ${produto.marketplace}
                    ${produto.fonte ? ` - ${produto.fonte}` : ''}
                </p>
            </div>
            <div class="produto-acoes">
                <a href="${produto.link}" target="_blank" class="btn-ver">Ver na Loja</a>
                <button onclick="UI.removerProduto(${indexOriginal})" class="btn-remover">🗑️ Remover</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Atualiza o gráfico de distribuição de preços
 * @param {Array} produtos - Lista de produtos para o gráfico
 */
function atualizarGrafico(produtos) {
    const ctx = document.getElementById('grafico-modal').getContext('2d');
    const precos = produtos.map(p => p.preco);
    const stats = detalhesAtuais.estatisticas;
    
    // Destroi o gráfico anterior se existir
    if (window.graficoPrecos) {
        window.graficoPrecos.destroy();
    }
    
    // Prepara os dados para o gráfico
    const dadosGrafico = produtos.map((produto, index) => ({
        preco: produto.preco,
        isOutlier: produto.preco < stats.limiteInferior || produto.preco > stats.limiteSuperior,
        titulo: produto.titulo,
        marketplace: produto.marketplace
    }));

    // Ordena os dados por preço para melhor visualização
    dadosGrafico.sort((a, b) => a.preco - b.preco);
    
    // Cria um novo gráfico
    window.graficoPrecos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosGrafico.map((_, i) => i + 1),
            datasets: [{
                label: 'Preços',
                data: dadosGrafico.map(d => d.preco),
                backgroundColor: dadosGrafico.map(d => 
                    d.isOutlier ? 'rgba(255, 99, 132, 0.8)' : 'rgba(54, 162, 235, 0.8)'
                ),
                borderColor: dadosGrafico.map(d => 
                    d.isOutlier ? 'rgb(255, 99, 132)' : 'rgb(54, 162, 235)'
                ),
                borderWidth: 1
            }, {
                label: 'Média',
                data: Array(dadosGrafico.length).fill(stats.media),
                type: 'line',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }, {
                label: 'Mediana',
                data: Array(dadosGrafico.length).fill(stats.mediana),
                type: 'line',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }, {
                label: 'Limite Superior',
                data: Array(dadosGrafico.length).fill(stats.limiteSuperior),
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 1,
                borderDash: [2, 2],
                fill: false,
                pointRadius: 0
            }, {
                label: 'Limite Inferior',
                data: Array(dadosGrafico.length).fill(stats.limiteInferior),
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 1,
                borderDash: [2, 2],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Produtos'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Preço (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatter.format(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const dataset = context.dataset;
                            
                            if (dataset.label === 'Preços') {
                                const produto = dadosGrafico[index];
                                return [
                                    `Preço: ${formatter.format(produto.preco)}`,
                                    `Marketplace: ${produto.marketplace}`,
                                    produto.isOutlier ? '⚠️ Outlier' : ''
                                ].filter(Boolean);
                            } else {
                                return `${dataset.label}: ${formatter.format(context.raw)}`;
                            }
                        }
                    }
                }
            }
        }
    });
}

/**
 * Remove um produto da análise
 * @param {number} index - Índice do produto a remover
 */
function removerProduto(index) {
    if (!detalhesAtuais || index < 0 || index >= detalhesAtuais.resultados.length) {
        return;
    }
    
    // Remove o produto
    detalhesAtuais.resultados.splice(index, 1);
    
    // Recalcula estatísticas
    const precos = detalhesAtuais.resultados.map(p => p.preco);
    detalhesAtuais.estatisticas = Statistics.calcularEstatisticas(precos);
    
    // Atualiza a interface
    atualizarListaProdutosModal(detalhesAtuais.resultados);
    atualizarGrafico(detalhesAtuais.resultados);
    
    // Atualiza os valores no modal
    document.getElementById('modal-quantidade').textContent = detalhesAtuais.resultados.length;
    document.getElementById('modal-media').textContent = formatter.format(detalhesAtuais.estatisticas.media);
    document.getElementById('modal-mediana').textContent = formatter.format(detalhesAtuais.estatisticas.mediana);
    document.getElementById('modal-moda').textContent = formatter.format(detalhesAtuais.estatisticas.moda);
    
    // Atualiza a tabela principal
    const prodIndex = window.resultadosLoteAtuais.findIndex(r => r.produto === detalhesAtuais.produto);
    if (prodIndex >= 0) {
        window.resultadosLoteAtuais[prodIndex] = detalhesAtuais;
        atualizarTabelaResultados();
    }
}

/**
 * Ordena a tabela de resultados
 * @param {string} ordem - Critério de ordenação ('menor' ou 'maior')
 */
function ordenarTabelaLote(ordem) {
    ordemAtual = ordem;
    
    window.resultadosLoteAtuais.sort((a, b) => {
        if (ordem === 'menor') {
            return a.estatisticas.media - b.estatisticas.media;
        } else {
            return b.estatisticas.media - a.estatisticas.media;
        }
    });
    
    atualizarTabelaResultados();
    
    // Atualiza visual dos botões
    document.querySelectorAll('.btn-ordenar').forEach(btn => {
        btn.classList.remove('ativo');
    });
    document.querySelector(`.btn-ordenar[data-ordem="${ordem}"]`).classList.add('ativo');
}

/**
 * Ordena os detalhes de produtos no modal
 * @param {string} ordem - Critério de ordenação ('menor' ou 'maior')
 */
function ordenarDetalhes(ordem) {
    if (!detalhesAtuais) return;
    
    detalhesAtuais.resultados.sort((a, b) => {
        if (ordem === 'menor') {
            return a.preco - b.preco;
        } else {
            return b.preco - a.preco;
        }
    });
    
    atualizarListaProdutosModal(detalhesAtuais.resultados);
    
    // Atualiza visual dos botões
    document.querySelectorAll('.btn-ordenar').forEach(btn => {
        btn.classList.remove('ativo');
    });
    document.querySelector(`.btn-ordenar[data-ordem="${ordem}"]`).classList.add('ativo');
}

/**
 * Exporta os resultados para Excel
 */
function exportarParaExcel() {
    if (!window.resultadosLoteAtuais || window.resultadosLoteAtuais.length === 0) {
        alert('Não há dados para exportar');
        return;
    }
    
    // Data atual para incluir nos resultados
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // Cria um novo workbook
    const wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Análise de Preços",
        Subject: "Relatório de Preços",
        Author: "Buscador de Preços",
        CreatedDate: new Date()
    };
    
    // Prepara os dados no formato solicitado
    const dadosExcel = [];
    
    // Adiciona cabeçalho
    dadosExcel.push(['Item', 'Tipo', 'Preço', 'Data', 'Link']);
    
    // Para cada produto encontrado
    window.resultadosLoteAtuais.forEach(resultado => {
        if (!resultado.resultados || resultado.resultados.length === 0) return;
        
        const produto = resultado.produto;
        const estatisticas = resultado.estatisticas;
        const resultados = resultado.resultados;
        
        // Função para encontrar o produto com preço mais próximo de um valor
        function encontrarProdutoMaisProximo(valorAlvo) {
            if (resultados.length === 0) return null;
            
            return resultados.reduce((mais_proximo, atual) => {
                const difAtual = Math.abs(atual.preco - valorAlvo);
                const difProximo = Math.abs(mais_proximo.preco - valorAlvo);
                return difAtual < difProximo ? atual : mais_proximo;
            }, resultados[0]);
        }
        
        // Encontra o produto com o maior preço
        const produtoMaiorPreco = resultados.reduce((max, p) => p.preco > max.preco ? p : max, resultados[0]);
        
        // Encontra o produto com o menor preço
        const produtoMenorPreco = resultados.reduce((min, p) => p.preco < min.preco ? p : min, resultados[0]);
        
        // Encontra o produto com preço mais próximo da média
        const produtoMediaPreco = encontrarProdutoMaisProximo(estatisticas.media);
        
        // Encontra o produto com preço mais próximo da mediana
        const produtoMedianaPreco = encontrarProdutoMaisProximo(estatisticas.mediana);
        
        // Encontra o produto com preço mais próximo da moda
        const produtoModaPreco = encontrarProdutoMaisProximo(estatisticas.moda);
        
        // Função para criar célula de link
        function criarCelulaLink(url) {
            return { 
                v: 'Link do Produto', 
                t: 's',
                l: { Target: url, Tooltip: 'Clique para abrir o produto' }
            };
        }
        
        // Adiciona linhas para cada tipo de preço
        dadosExcel.push([
            produto,
            'Maior',
            produtoMaiorPreco.preco,
            dataAtual,
            criarCelulaLink(produtoMaiorPreco.link)
        ]);
        
        dadosExcel.push([
            produto,
            'Médio',
            estatisticas.media,
            dataAtual,
            criarCelulaLink(produtoMediaPreco.link)
        ]);
        
        dadosExcel.push([
            produto,
            'Mediano',
            estatisticas.mediana,
            dataAtual,
            criarCelulaLink(produtoMedianaPreco.link)
        ]);
        
        dadosExcel.push([
            produto,
            'Mais comum',
            estatisticas.moda,
            dataAtual,
            criarCelulaLink(produtoModaPreco.link)
        ]);
        
        dadosExcel.push([
            produto,
            'Menor',
            produtoMenorPreco.preco,
            dataAtual,
            criarCelulaLink(produtoMenorPreco.link)
        ]);
    });
    
    // Cria a planilha a partir dos dados
    const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
    
    // Define formatação das células
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Define largura das colunas
    ws['!cols'] = [
        { wch: 30 }, // Item
        { wch: 15 }, // Tipo
        { wch: 15 }, // Preço
        { wch: 15 }, // Data
        { wch: 60 }  // Link
    ];
    
    // Formata células de preço
    for (let row = 1; row <= range.e.r; row++) { // Começando em 1 para pular o cabeçalho
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 2 }); // Coluna de preço (índice 2)
        if (ws[cellRef]) {
            ws[cellRef].z = 'R$#,##0.00';
        }
    }
    
    // Adiciona a planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Preços");
    
    // Gera o arquivo e faz o download
    XLSX.writeFile(wb, `Análise de Preços - ${dataAtual.replace(/\//g, '-')}.xlsx`);
}

// Exportar funções
window.UI = {
    mostrarDetalhes,
    removerProduto,
    removerOutliers,
    removerOutliersLote,
    ordenarTabelaLote,
    ordenarDetalhes,
    exportarParaExcel,
    atualizarTabelaResultados,
    alternarVisualizacao
}; 