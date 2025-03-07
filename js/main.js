/**
 * Arquivo principal - Coordena todos os módulos e inicializa a aplicação
 */

// Variáveis globais
let buscaEmAndamento = false;
window.resultadosLoteAtuais = []; // Garantir que a variável seja global

/**
 * Inicializa a aplicação quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando autenticação...');
    
    // Verificar se estamos na página de busca verificando elementos específicos da página
    const searchContent = document.getElementById('search-content');
    const btnBuscar = document.getElementById('btn-buscar');
    
    if (!searchContent || !btnBuscar) {
        console.log('Elementos da página de busca não encontrados, não inicializando a aplicação');
        return;
    }
    
    console.log('Página de busca detectada, inicializando aplicação...');
    
    // Verificar se o módulo de autenticação está disponível
    if (!window.authUtils || typeof window.authUtils.isAuthenticated !== 'function') {
        console.error('Módulo de autenticação não encontrado!');
        return;
    }
    
    // Verificar autenticação
    const isAuthenticated = window.authUtils.isAuthenticated();
    console.log('Status de autenticação:', isAuthenticated);
    
    // Verificar se o conteúdo de busca está visível (usuário autenticado)
    const authRequiredMessage = document.getElementById('auth-required-message');
    
    if (isAuthenticated) {
        // Usuário está autenticado, mostrar conteúdo de busca
        if (searchContent) searchContent.style.display = 'block';
        if (authRequiredMessage) authRequiredMessage.style.display = 'none';
        
        // Inicializa os event listeners
        inicializarEventListeners();
        
        // Limpa caches expirados ao iniciar a aplicação
        if (window.API && typeof window.API.limparCachesExpirados === 'function') {
            window.API.limparCachesExpirados();
        }
        
        console.log('Aplicação inicializada com sucesso!');
    } else {
        // Usuário não está autenticado, mostrar mensagem de acesso restrito
        if (searchContent) searchContent.style.display = 'none';
        if (authRequiredMessage) authRequiredMessage.style.display = 'block';
        console.log('Usuário não autenticado, conteúdo de busca não exibido');
    }
});

/**
 * Inicializa todos os event listeners da aplicação
 */
function inicializarEventListeners() {
    // Botão de busca
    const btnBuscar = document.getElementById('btn-buscar');
    if (btnBuscar) {
        console.log('Botão de busca encontrado, adicionando evento de clique');
        btnBuscar.addEventListener('click', buscarLote);
    } else {
        console.error('Botão de busca não encontrado!');
    }
    
    // Botões de ordenação
    const botoesOrdenacao = document.querySelectorAll('.btn-ordenar[data-ordem]');
    if (botoesOrdenacao.length > 0) {
        console.log(`Encontrados ${botoesOrdenacao.length} botões de ordenação`);
        botoesOrdenacao.forEach(btn => {
            btn.addEventListener('click', () => {
                const ordem = btn.getAttribute('data-ordem');
                if (btn.closest('.modal-content')) {
                    if (window.UI && typeof window.UI.ordenarDetalhes === 'function') {
                        window.UI.ordenarDetalhes(ordem);
                    }
                } else {
                    if (window.UI && typeof window.UI.ordenarTabelaLote === 'function') {
                        window.UI.ordenarTabelaLote(ordem);
                    }
                }
            });
        });
    } else {
        console.warn('Nenhum botão de ordenação encontrado');
    }
    
    // Botões de visualização
    const botoesVisualizacao = document.querySelectorAll('.view-toggle button[data-view]');
    if (botoesVisualizacao.length > 0) {
        console.log(`Encontrados ${botoesVisualizacao.length} botões de visualização`);
        botoesVisualizacao.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                
                // Remover classe active de todos os botões
                btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                
                // Adicionar classe active ao botão clicado
                btn.classList.add('active');
                
                if (window.UI && typeof window.UI.alternarVisualizacao === 'function') {
                    window.UI.alternarVisualizacao(view);
                }
            });
        });
    } else {
        console.warn('Nenhum botão de visualização encontrado');
    }
    
    // Botão de exportar para Excel
    const btnExportar = document.querySelector('.btn-exportar');
    if (btnExportar) {
        console.log('Botão de exportação encontrado');
        btnExportar.addEventListener('click', () => {
            if (window.UI && typeof window.UI.exportarParaExcel === 'function') {
                window.UI.exportarParaExcel();
            }
        });
    } else {
        console.warn('Botão de exportação não encontrado');
    }
    
    // Botão de limpar cache
    const btnLimparCache = document.getElementById('btn-limpar-cache');
    if (btnLimparCache) {
        console.log('Botão de limpar cache encontrado');
        btnLimparCache.addEventListener('click', () => {
            if (window.API && typeof window.API.limparTodoCache === 'function') {
                window.API.limparTodoCache();
                atualizarStatusCache();
            }
        });
    } else {
        console.warn('Botão de limpar cache não encontrado');
    }
    
    // Atualizar status do cache ao iniciar
    atualizarStatusCache();
}

/**
 * Busca produtos em lote
 */
async function buscarLote() {
    if (buscaEmAndamento) {
        alert('Já existe uma busca em andamento. Aguarde a conclusão.');
        return;
    }
    
    // Obtém a lista de produtos
    const textarea = document.getElementById('lista-produtos');
    if (!textarea.value.trim()) {
        alert('Digite pelo menos um produto para buscar');
        return;
    }
    
    // Verifica quais fontes estão selecionadas
    const usarMercadoLivre = document.getElementById('fonte-ml').checked;
    const usarGoogleShopping = document.getElementById('fonte-gs').checked;
    
    if (!usarMercadoLivre && !usarGoogleShopping) {
        alert('Selecione pelo menos uma fonte de busca');
        return;
    }
    
    // Obtém a lista de produtos
    const produtos = textarea.value.split('\n').filter(p => p.trim());
    if (produtos.length === 0) {
        alert('Digite pelo menos um produto para buscar');
        return;
    }
    
    // Configura a interface para mostrar o progresso
    buscaEmAndamento = true;
    const progressoContainer = document.getElementById('progresso-container');
    const progressoTexto = document.getElementById('progresso-texto');
    const progressoPorcentagem = document.getElementById('progresso-porcentagem');
    const barraProgresso = document.getElementById('barra-progresso-preenchimento');
    const tabelaCorpo = document.getElementById('tabela-corpo');
    const cacheStatus = document.getElementById('cache-status');
    
    progressoContainer.style.display = 'block';
    progressoTexto.textContent = 'Iniciando busca...';
    progressoPorcentagem.textContent = '0%';
    barraProgresso.style.width = '0%';
    tabelaCorpo.innerHTML = '';
    cacheStatus.innerHTML = '';
    
    // Limpa resultados anteriores
    window.resultadosLoteAtuais = [];
    
    // Contadores para estatísticas de cache
    let totalBuscas = 0;
    let buscasDoCache = 0;
    
    try {
        // Busca cada produto
        for (let i = 0; i < produtos.length; i++) {
            const produto = produtos[i].trim();
            if (!produto) continue;
            
            progressoTexto.textContent = `Buscando: ${produto}`;
            const porcentagem = Math.round(((i + 1) / produtos.length) * 100);
            progressoPorcentagem.textContent = `${porcentagem}%`;
            barraProgresso.style.width = `${porcentagem}%`;
            
            // Verifica se existem caches para este produto
            const chaveCacheML = `cache_ml_${produto.toLowerCase().trim()}`;
            const chaveCacheGS = `cache_gs_${produto.toLowerCase().trim()}`;
            const temCacheML = usarMercadoLivre && localStorage.getItem(chaveCacheML);
            const temCacheGS = usarGoogleShopping && localStorage.getItem(chaveCacheGS);
            
            // Realiza as buscas em paralelo
            const buscas = [];
            
            if (usarMercadoLivre) {
                totalBuscas++;
                if (temCacheML) buscasDoCache++;
                buscas.push(API.buscarMercadoLivre(produto));
            }
            
            if (usarGoogleShopping) {
                totalBuscas++;
                if (temCacheGS) buscasDoCache++;
                buscas.push(API.buscarGoogleShopping(produto));
            }
            
            // Aguarda todas as buscas terminarem
            const resultados = await Promise.all(buscas);
            const todosResultados = resultados.flat();
            
            console.log(`Resultados para ${produto}:`, todosResultados.length);
            
            if (todosResultados.length > 0) {
                // Calcula estatísticas
                const precos = todosResultados.map(r => r.preco);
                const estatisticas = Statistics.calcularEstatisticas(precos);
                
                console.log(`Estatísticas para ${produto}:`, estatisticas);
                
                // Adiciona aos resultados
                window.resultadosLoteAtuais.push({
                    produto,
                    resultados: todosResultados,
                    estatisticas
                });
                
                console.log('Resultados atualizados:', window.resultadosLoteAtuais);
                
                // Atualiza a tabela
                UI.atualizarTabelaResultados();
            }
        }
        
        // Finaliza a busca
        progressoTexto.textContent = 'Busca concluída!';
        progressoPorcentagem.textContent = '100%';
        barraProgresso.style.width = '100%';
        
        // Atualiza informações de cache
        if (totalBuscas > 0) {
            const porcentagemCache = Math.round((buscasDoCache / totalBuscas) * 100);
            cacheStatus.innerHTML = `
                ${buscasDoCache} de ${totalBuscas} buscas vieram do cache (${porcentagemCache}%)
                ${buscasDoCache > 0 ? '<span class="cache-badge">Cache utilizado</span>' : ''}
            `;
        }
        
        // Esconde a barra de progresso após alguns segundos
        setTimeout(() => {
            progressoContainer.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Erro na busca:', error);
        alert(`Ocorreu um erro durante a busca: ${error.message}`);
        progressoTexto.textContent = 'Erro na busca!';
    } finally {
        buscaEmAndamento = false;
    }
}

/**
 * Atualiza o status do cache exibido na interface
 */
function atualizarStatusCache() {
    const cacheStatus = document.getElementById('cache-status');
    if (!cacheStatus) return;
    
    if (window.API && typeof window.API.obterTamanhoCacheMB === 'function') {
        const tamanhoCache = window.API.obterTamanhoCacheMB();
        cacheStatus.textContent = `Cache atual: ${tamanhoCache.toFixed(2)} MB`;
    } else {
        cacheStatus.textContent = 'Cache: indisponível';
    }
} 