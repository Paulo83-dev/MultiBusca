document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado na página de histórico, verificando autenticação...');
    
    // Elementos da UI para verificar se estamos na página de histórico
    const historicoContent = document.getElementById('historico-content');
    const historicoTabela = document.getElementById('historico-dados');
    
    // Verificar se estamos na página de histórico pelos elementos específicos
    if (!historicoContent || !historicoTabela) {
        console.log('Elementos da página de histórico não encontrados, não inicializando');
        return;
    }
    
    console.log('Página de histórico detectada, inicializando...');
    
    // Verificar se o módulo de autenticação está disponível
    if (!window.authUtils || typeof window.authUtils.isAuthenticated !== 'function') {
        console.error('Módulo de autenticação não encontrado!');
        return;
    }
    
    // URL base da API - Definindo no início para evitar problemas de referência
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1') 
        ? 'http://localhost:3001' 
        : 'https://metapreco-backend.onrender.com';
    
    // Verificar autenticação
    const isAuthenticated = window.authUtils.isAuthenticated();
    console.log('Status de autenticação:', isAuthenticated);
    
    // Elementos adicionais da UI
    const authRequiredMessage = document.getElementById('auth-required-message');
    const historicoLoading = document.getElementById('historico-loading');
    const semHistorico = document.getElementById('sem-historico');
    const filtroPesquisa = document.getElementById('filtro-pesquisa');
    const btnLimparFiltro = document.getElementById('btn-limpar-filtro');
    
    // Elementos de estatísticas
    const totalPesquisas = document.getElementById('total-pesquisas');
    const totalProdutos = document.getElementById('total-produtos');
    const termoPopular = document.getElementById('termo-popular');
    
    // Elementos do modal
    const modal = document.getElementById('modal-detalhes');
    const fecharModal = document.querySelector('.fechar-modal');
    const modalTitulo = document.getElementById('modal-titulo');
    const detalheTermo = document.getElementById('detalhe-termo');
    const detalheData = document.getElementById('detalhe-data');
    const detalheContagem = document.getElementById('detalhe-contagem');
    const detalheFontes = document.getElementById('detalhe-fontes');
    const produtosContainer = document.getElementById('produtos-container');
    const produtosLoading = document.getElementById('produtos-loading');
    const semProdutos = document.getElementById('sem-produtos');
    
    // Botões de visualização
    const btnViewGrid = document.getElementById('btn-view-grid');
    const btnViewList = document.getElementById('btn-view-list');
    
    if (isAuthenticated) {
        // Usuário está autenticado, mostrar conteúdo do histórico
        if (historicoContent) historicoContent.style.display = 'block';
        if (authRequiredMessage) authRequiredMessage.style.display = 'none';
        
        // Inicializar a página de histórico
        inicializarHistorico();
    } else {
        // Usuário não está autenticado, mostrar mensagem de acesso restrito
        if (historicoContent) historicoContent.style.display = 'none';
        if (authRequiredMessage) authRequiredMessage.style.display = 'block';
        console.log('Usuário não autenticado, conteúdo do histórico não exibido');
        return;
    }
    
    // Variáveis de estado
    let historicoCompleto = [];
    let historicoFiltrado = [];
    let searchIdAtual = null;
    
    // Funções auxiliares
    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(preco);
    };
    
    // Mostrar mensagem de erro clara para o usuário
    const mostrarErroDeServidor = (mensagem) => {
        historicoLoading.style.display = 'none';
        semHistorico.style.display = 'flex';
        
        // Atualizar mensagem de erro
        const mensagemElement = semHistorico.querySelector('p');
        mensagemElement.innerHTML = `
            <strong>Erro ao conectar ao servidor:</strong><br>
            ${mensagem}<br><br>
            O servidor pode estar em manutenção ou iniciando. 
            Os servidores gratuitos do Render às vezes hibernam quando não são usados e podem levar 
            alguns minutos para iniciar. Por favor, tente novamente em alguns minutos.
        `;
        
        // Atualizar estatísticas para "Indisponível"
        totalPesquisas.textContent = 'Indisponível';
        totalProdutos.textContent = 'Indisponível';
        termoPopular.textContent = 'Indisponível';
    };
    
    // Carregar histórico de pesquisas
    function carregarHistorico() {
        const apiUrl = `${API_BASE_URL}/api/search-history`;
        console.log('Acessando API URL:', apiUrl);
        
        // Mostrar indicador de carregamento
        const historicoTable = document.getElementById('historico-dados');
        historicoTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <p class="mt-2">Carregando seu histórico de pesquisas...</p>
                </td>
            </tr>
        `;
        
        // Obter token de autenticação
        const token = window.authUtils.getToken();
        
        // Fazer requisição para a API
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Histórico carregado:', data);
            
            if (data && Array.isArray(data)) {
                historicoCompleto = data;
                historicoFiltrado = [...historicoCompleto];
                
                // Exibir histórico na tabela
                exibirHistorico(historicoCompleto);
                
                // Atualizar estatísticas
                atualizarEstatisticas(historicoCompleto);
            } else {
                mostrarErroDeServidor('Formato de resposta inválido');
            }
        })
        .catch(error => {
            console.error('Erro ao carregar histórico:', error);
            mostrarErroDeServidor(`Erro ao carregar histórico: ${error.message}`);
        });
    }
    
    // Exibir dados do histórico na tabela
    const exibirHistorico = (historico) => {
        historicoTabela.innerHTML = '';
        
        historico.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.searchTerm}</td>
                <td>${formatarData(item.timestamp)}</td>
                <td>${item.resultCount}</td>
                <td>
                    ${item.sources.mercadoLivre ? '<span class="fonte-badge ml">ML</span>' : ''}
                    ${item.sources.googleShopping ? '<span class="fonte-badge gs">GS</span>' : ''}
                </td>
                <td>
                    <button class="btn-ver" data-id="${item._id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </td>
            `;
            
            historicoTabela.appendChild(row);
        });
        
        // Adicionar listeners aos botões
        document.querySelectorAll('.btn-ver').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                abrirDetalhes(id);
            });
        });
    };
    
    // Calcular e exibir estatísticas
    const atualizarEstatisticas = (historico) => {
        if (historico.length === 0) {
            totalPesquisas.textContent = '0';
            totalProdutos.textContent = '0';
            termoPopular.textContent = 'N/A';
            return;
        }
        
        // Total de pesquisas
        totalPesquisas.textContent = historico.length;
        
        // Total de produtos
        const produtos = historico.reduce((total, item) => total + item.resultCount, 0);
        totalProdutos.textContent = produtos;
        
        // Termo mais buscado
        const termos = historico.map(item => item.searchTerm.toLowerCase());
        const contagem = {};
        
        termos.forEach(termo => {
            contagem[termo] = (contagem[termo] || 0) + 1;
        });
        
        let termoPop = '';
        let maxContagem = 0;
        
        Object.entries(contagem).forEach(([termo, count]) => {
            if (count > maxContagem) {
                maxContagem = count;
                termoPop = termo;
            }
        });
        
        termoPopular.textContent = termoPop.charAt(0).toUpperCase() + termoPop.slice(1);
    };
    
    // Abrir modal com detalhes da pesquisa
    const abrirDetalhes = async (id) => {
        searchIdAtual = id;
        produtosContainer.innerHTML = '';
        produtosLoading.style.display = 'flex';
        semProdutos.style.display = 'none';
        
        // Encontrar a pesquisa no histórico
        const pesquisa = historicoCompleto.find(item => item._id === id);
        
        if (pesquisa) {
            modalTitulo.textContent = `Detalhes: "${pesquisa.searchTerm}"`;
            detalheTermo.textContent = pesquisa.searchTerm;
            detalheData.textContent = formatarData(pesquisa.timestamp);
            detalheContagem.textContent = pesquisa.resultCount;
            
            // Montar texto das fontes
            const fontes = [];
            if (pesquisa.sources.mercadoLivre) fontes.push('Mercado Livre');
            if (pesquisa.sources.googleShopping) fontes.push('Google Shopping');
            detalheFontes.textContent = fontes.join(', ');
        }
        
        modal.style.display = 'block';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/search-products/${id}`);
            const produtos = await response.json();
            
            produtosLoading.style.display = 'none';
            
            if (produtos.length === 0) {
                semProdutos.style.display = 'flex';
                return;
            }
            
            exibirProdutos(produtos);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            produtosLoading.style.display = 'none';
            semProdutos.style.display = 'flex';
            semProdutos.querySelector('p').textContent = 'Erro ao carregar produtos. Tente novamente mais tarde.';
        }
    };
    
    // Exibir produtos no modal
    const exibirProdutos = (produtos) => {
        produtosContainer.innerHTML = '';
        
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'produto-card';
            if (produto.isOutlier) card.classList.add('outlier');
            
            card.innerHTML = `
                <div class="produto-header">
                    <div class="imagem-container">
                        <img src="${produto.imageUrl.startsWith('http') ? API_BASE_URL + '/api/image-proxy?url=' + encodeURIComponent(produto.imageUrl) : produto.imageUrl}" 
                             alt="${produto.title}" 
                             onerror="this.src='/assets/no-image.png'">
                    </div>
                </div>
                <div class="produto-info">
                    <h4>${produto.title}</h4>
                    <p class="preco ${produto.isOutlier ? 'outlier' : ''}">${formatarPreco(produto.price)}</p>
                    <p class="marketplace">
                        <span class="fonte-badge ${produto.source === 'mercadolivre' ? 'ml' : 'gs'}">
                            ${produto.source === 'mercadolivre' ? 'ML' : 'GS'}
                        </span>
                        ${produto.store}
                    </p>
                </div>
                <div class="produto-acoes">
                    <a href="${produto.link}" target="_blank" class="btn-ver">
                        <i class="fas fa-external-link-alt"></i> Visitar
                    </a>
                </div>
            `;
            
            produtosContainer.appendChild(card);
        });
    };
    
    // Funções auxiliares
    // Declarando as funções com function em vez de const para evitar problemas de hoisting
    function filtrarHistorico() {
        const termo = filtroPesquisa.value.toLowerCase().trim();
        
        if (!termo) {
            historicoFiltrado = [...historicoCompleto];
        } else {
            historicoFiltrado = historicoCompleto.filter(item => 
                item.searchTerm.toLowerCase().includes(termo)
            );
        }
        
        exibirHistorico(historicoFiltrado);
        
        if (historicoFiltrado.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="5" class="sem-resultados">
                    Nenhum resultado encontrado para "${termo}".
                    <button id="btn-limpar-filtro-inline" class="btn-link">Limpar filtro</button>
                </td>
            `;
            historicoTabela.appendChild(row);
            
            document.getElementById('btn-limpar-filtro-inline').addEventListener('click', limparFiltro);
        }
    }

    function limparFiltro() {
        filtroPesquisa.value = '';
        historicoFiltrado = [...historicoCompleto];
        exibirHistorico(historicoFiltrado);
    }

    function inicializarHistorico() {
        console.log('Inicializando página de histórico...');
        
        // Carregar histórico
        carregarHistorico();
    }

    // Event Listeners
    if (fecharModal) {
        fecharModal.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (event) => {
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (filtroPesquisa) {
        filtroPesquisa.addEventListener('input', filtrarHistorico);
    }

    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', limparFiltro);
    }

    if (btnViewGrid) {
        btnViewGrid.addEventListener('click', () => {
            if (produtosContainer) produtosContainer.className = 'produtos-container grid-view';
            if (btnViewGrid) btnViewGrid.classList.add('active');
            if (btnViewList) btnViewList.classList.remove('active');
        });
    }

    if (btnViewList) {
        btnViewList.addEventListener('click', () => {
            if (produtosContainer) produtosContainer.className = 'produtos-container list-view';
            if (btnViewList) btnViewList.classList.add('active');
            if (btnViewGrid) btnViewGrid.classList.remove('active');
        });
    }
}); 