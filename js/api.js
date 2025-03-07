/**
 * Módulo de API - Funções para comunicação com o backend
 */

// Configurações das APIs
const BASE_URL = 'https://metapreco-backend.onrender.com';
const APIs = {
    mercadoLivre: {
        baseUrl: `${BASE_URL}/api/mercadolivre`,
        search: '/search?q='
    },
    googleShopping: {
        baseUrl: `${BASE_URL}/api/google-shopping`,
        search: '/search?q='
    },
    imageProxy: `${BASE_URL}/api/image-proxy`
};

// Configurações do cache
const CACHE_CONFIG = {
    // Tempo de expiração do cache em milissegundos (24 horas)
    expiracaoCache: 24 * 60 * 60 * 1000,
    // Prefixos para as chaves de cache
    prefixos: {
        mercadoLivre: 'cache_ml_',
        googleShopping: 'cache_gs_'
    }
};

/**
 * Verifica se existe um cache válido para a pesquisa
 * @param {string} chave - Chave do cache
 * @returns {Array|null} Dados do cache ou null se não existir/expirado
 */
function obterCache(chave) {
    try {
        const cacheString = localStorage.getItem(chave);
        if (!cacheString) return null;
        
        const cache = JSON.parse(cacheString);
        
        // Verifica se o cache expirou
        if (Date.now() > cache.expiracao) {
            console.log(`Cache expirado para: ${chave}`);
            localStorage.removeItem(chave);
            return null;
        }
        
        console.log(`Cache encontrado para: ${chave}`);
        return cache.dados;
    } catch (error) {
        console.error('Erro ao obter cache:', error);
        return null;
    }
}

/**
 * Salva os dados no cache
 * @param {string} chave - Chave do cache
 * @param {Array} dados - Dados a serem armazenados
 */
function salvarCache(chave, dados) {
    try {
        const cache = {
            dados: dados,
            expiracao: Date.now() + CACHE_CONFIG.expiracaoCache,
            timestamp: Date.now()
        };
        
        localStorage.setItem(chave, JSON.stringify(cache));
        console.log(`Cache salvo para: ${chave}`);
    } catch (error) {
        console.error('Erro ao salvar cache:', error);
    }
}

/**
 * Limpa todos os caches expirados
 */
function limparCachesExpirados() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            
            // Verifica se é uma chave de cache da nossa aplicação
            if (chave.startsWith(CACHE_CONFIG.prefixos.mercadoLivre) || 
                chave.startsWith(CACHE_CONFIG.prefixos.googleShopping)) {
                
                const cacheString = localStorage.getItem(chave);
                if (cacheString) {
                    const cache = JSON.parse(cacheString);
                    
                    // Remove se expirou
                    if (Date.now() > cache.expiracao) {
                        localStorage.removeItem(chave);
                        console.log(`Cache expirado removido: ${chave}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erro ao limpar caches expirados:', error);
    }
}

/**
 * Processa URLs de imagens para usar o proxy quando necessário
 * @param {string} url - URL da imagem
 * @returns {string} URL processada
 */
function processarUrlImagem(url) {
    if (!url) return '/assets/no-image.png';
    
    // Se a URL já for do nosso proxy, retorna ela mesma
    if (url.startsWith('/api/image-proxy')) {
        return url;
    }
    
    // Se for uma URL HTTP/HTTPS, usa o proxy
    if (url.startsWith('http')) {
        return `${APIs.imageProxy}?url=${encodeURIComponent(url)}`;
    }
    
    // Se for uma URL de dados (base64), retorna ela mesma
    if (url.startsWith('data:')) {
        return url;
    }
    
    // Caso contrário, retorna a imagem padrão
    return '/assets/no-image.png';
}

/**
 * Busca produtos no Mercado Livre
 * @param {string} produto - Termo de busca
 * @returns {Promise<Array>} Lista de produtos encontrados
 */
async function buscarMercadoLivre(produto) {
    // Verifica se existe cache para esta pesquisa
    const chaveCache = `${CACHE_CONFIG.prefixos.mercadoLivre}${produto.toLowerCase().trim()}`;
    const dadosCache = obterCache(chaveCache);
    
    if (dadosCache) {
        console.log('Usando dados em cache para Mercado Livre:', produto);
        return dadosCache;
    }
    
    const url = `${APIs.mercadoLivre.baseUrl}${APIs.mercadoLivre.search}${encodeURIComponent(produto)}`;
    
    try {
        console.log('Buscando no Mercado Livre:', produto);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results) {
            return [];
        }
        
        const resultados = data.results
            .map(item => ({
                preco: item.price,
                titulo: item.title,
                link: item.permalink,
                marketplace: 'Mercado Livre',
                imagem: item.thumbnail ? item.thumbnail.replace(/\w\.jpg/g, 'W.jpg') : null
            }))
            .filter(item => item.preco > 0 && item.preco < 10000);
        
        // Salva os resultados no cache
        salvarCache(chaveCache, resultados);
        
        return resultados;
            
    } catch (error) {
        console.error('Erro ao buscar no Mercado Livre:', error);
        return [];
    }
}

/**
 * Busca produtos no Google Shopping
 * @param {string} produto - Termo de busca
 * @returns {Promise<Array>} Lista de produtos encontrados
 */
async function buscarGoogleShopping(produto) {
    // Verifica se existe cache para esta pesquisa
    const chaveCache = `${CACHE_CONFIG.prefixos.googleShopping}${produto.toLowerCase().trim()}`;
    const dadosCache = obterCache(chaveCache);
    
    if (dadosCache) {
        console.log('Usando dados em cache para Google Shopping:', produto);
        return dadosCache;
    }
    
    const url = `${APIs.googleShopping.baseUrl}${APIs.googleShopping.search}${encodeURIComponent(produto)}`;
    
    try {
        console.log('Buscando no Google Shopping:', produto);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.shopping_results) {
            return [];
        }

        const resultados = data.shopping_results
            .map(item => {
                return {
                    preco: parseFloat(item.price.replace(/[^0-9,]/g, '').replace(',', '.')),
                    titulo: item.title,
                    link: item.link,
                    marketplace: 'Google Shopping',
                    fonte: item.source || 'Loja não identificada',
                    imagem: item.thumbnail
                };
            })
            .filter(item => item.preco > 0 && item.preco < 10000);
        
        // Salva os resultados no cache
        salvarCache(chaveCache, resultados);
        
        return resultados;
            
    } catch (error) {
        console.error('Erro ao buscar no Google Shopping:', error);
        return [];
    }
}

/**
 * Limpa todo o cache de pesquisas
 */
function limparTodoCache() {
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const chave = localStorage.key(i);
            if (chave.startsWith(CACHE_CONFIG.prefixos.mercadoLivre) || 
                chave.startsWith(CACHE_CONFIG.prefixos.googleShopping)) {
                localStorage.removeItem(chave);
            }
        }
        console.log('Cache de pesquisas limpo com sucesso');
    } catch (error) {
        console.error('Erro ao limpar cache:', error);
    }
}

/**
 * Obtém o tamanho do cache em MB
 * @returns {number} Tamanho do cache em MB
 */
function obterTamanhoCacheMB() {
    try {
        const cache = localStorage.getItem('metapreco_cache');
        if (!cache) return 0;
        
        // Tamanho aproximado em bytes (2 bytes por caractere em UTF-16)
        const tamanhoBytes = cache.length * 2;
        // Converter para MB
        return tamanhoBytes / (1024 * 1024);
    } catch (error) {
        console.error('Erro ao calcular tamanho do cache:', error);
        return 0;
    }
}

// Exportar funções
window.API = {
    buscarMercadoLivre,
    buscarGoogleShopping,
    processarUrlImagem,
    limparTodoCache,
    limparCachesExpirados,
    obterTamanhoCacheMB
}; 