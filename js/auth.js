// Configuração da API
const API_URL = 'https://metapreco-backend.onrender.com';
const AUTH_ENDPOINT = `${API_URL}/api/auth`;

// Referências aos elementos do DOM
// Usando querySelector para evitar erros quando os elementos não existem
const loginForm = document.querySelector('#loginForm');
const registerForm = document.querySelector('#registerForm');
const toggleRegister = document.querySelector('#toggleRegister');
const toggleLogin = document.querySelector('#toggleLogin');
const loginContainer = document.querySelector('#loginContainer');
const registerContainer = document.querySelector('#registerContainer');
const alertMessage = document.querySelector('#alertMessage');
const registerAlertMessage = document.querySelector('#registerAlertMessage');
const serverStatus = document.querySelector('#serverStatus');
const loadingTime = document.querySelector('#loadingTime');

// Variáveis de controle
let isLoading = false;
let timer = null;
let seconds = 0;

// Exibir alerta para um determinado elemento
function showAlert(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    element.className = `alert alert-${type}`;
}

// Mostrar alerta sobre servidor hibernando
function showServerStatus() {
    if (serverStatus) {
        serverStatus.style.display = 'flex';
        
        // Iniciar temporizador
        if (timer) clearInterval(timer);
        seconds = 0;
        
        timer = setInterval(() => {
            seconds++;
            if (loadingTime) loadingTime.textContent = seconds;
            
            if (seconds >= 20 && serverStatus) {
                const statusMessage = document.getElementById('serverStatusMessage');
                if (statusMessage) {
                    statusMessage.textContent = 
                        'O servidor está demorando mais do que o esperado. Ele pode estar hibernando. Por favor, aguarde...';
                }
            }
        }, 1000);
    }
}

// Esconder alerta sobre servidor hibernando
function hideServerStatus() {
    if (serverStatus) {
        serverStatus.style.display = 'none';
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
}

// Salvar token em localStorage
function saveToken(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Obter o token do localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Limpar token do localStorage
function clearToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Verificar se o usuário está autenticado
function isAuthenticated() {
    return !!getToken();
}

// Obter o usuário atual
function getCurrentUser() {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
}

// Fazer requisição para a API
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${AUTH_ENDPOINT}${endpoint}`;
    
    // Mostrar indicador de carregamento se for a primeira requisição
    if (!isLoading) {
        isLoading = true;
        showServerStatus();
    }
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Adicionar token de autenticação se disponível
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
        method,
        headers,
        credentials: 'include'
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        console.log(`Fazendo requisição para: ${url}`);
        const response = await fetch(url, options);
        
        // Esconder indicador de carregamento
        isLoading = false;
        hideServerStatus();
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Ocorreu um erro');
        }
        
        return responseData;
    } catch (error) {
        // Esconder indicador de carregamento
        isLoading = false;
        hideServerStatus();
        
        console.error('Erro na requisição:', error);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
        }
        
        throw error;
    }
}

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Configurar eventos de login e registro apenas se estivermos na página de login
    if (window.location.pathname.includes('login.html')) {
        setupLoginEvents();
        setupRegisterEvents();
    }
    
    // Configurar evento de logout em todas as páginas
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            clearToken();
            window.location.href = 'index.html';
        });
    }
    
    // Atualizar a exibição dos links de autenticação em todas as páginas
    updateAuthLinks();
    
    if (isAuthenticated()) {
        // Usuário já está logado, verificar se estamos na página de login
        const user = getCurrentUser();
        if (user && window.location.pathname.includes('login.html')) {
            // Estamos na página de login, mas o usuário já está autenticado
            if (alertMessage) {
                showAlert(alertMessage, `Você já está logado como ${user.name}. Redirecionando...`, 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Se não encontrarmos o elemento de alerta, redirecionar imediatamente
                window.location.href = 'index.html';
            }
        }
    }
});

// Configurar eventos para o formulário de login
function setupLoginEvents() {
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail');
        const password = document.getElementById('loginPassword');
        
        if (!email || !password) return;
        
        try {
            const response = await apiRequest('/login', 'POST', { 
                email: email.value, 
                password: password.value 
            });
            
            // Salvar token e dados do usuário
            saveToken(response.token, response.user);
            
            // Exibir mensagem de sucesso
            showAlert(alertMessage, 'Login realizado com sucesso! Redirecionando...', 'success');
            
            // Redirecionar para a página inicial após um breve delay
            setTimeout(() => {
                window.location.href = 'busca.html';
            }, 1500);
        } catch (error) {
            showAlert(alertMessage, error.message, 'error');
        }
    });
    
    // Alternar para o formulário de registro
    if (toggleRegister) {
        toggleRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginContainer) loginContainer.style.display = 'none';
            if (registerContainer) registerContainer.style.display = 'block';
        });
    }
}

// Configurar eventos para o formulário de registro
function setupRegisterEvents() {
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName');
        const email = document.getElementById('registerEmail');
        const password = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!name || !email || !password || !confirmPassword) return;
        
        // Validar se as senhas são iguais
        if (password.value !== confirmPassword.value) {
            return showAlert(registerAlertMessage, 'As senhas não coincidem', 'error');
        }
        
        try {
            const response = await apiRequest('/register', 'POST', { 
                name: name.value, 
                email: email.value, 
                password: password.value 
            });
            
            // Salvar token e dados do usuário
            saveToken(response.token, response.user);
            
            // Exibir mensagem de sucesso
            showAlert(registerAlertMessage, 'Cadastro realizado com sucesso! Redirecionando...', 'success');
            
            // Redirecionar para a página inicial após um breve delay
            setTimeout(() => {
                window.location.href = 'busca.html';
            }, 1500);
        } catch (error) {
            showAlert(registerAlertMessage, error.message, 'error');
        }
    });
    
    // Alternar para o formulário de login
    if (toggleLogin) {
        toggleLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerContainer) registerContainer.style.display = 'none';
            if (loginContainer) loginContainer.style.display = 'block';
        });
    }
}

// Atualizar a exibição dos links de autenticação
function updateAuthLinks() {
    const loginLink = document.querySelector('.login-link');
    const logoutLink = document.querySelector('.logout-link');
    const userInfo = document.querySelector('.user-info');
    const usernameSpan = document.querySelector('.username');
    
    const isUserAuthenticated = isAuthenticated();
    
    if (isUserAuthenticated) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline-block';
        if (userInfo) {
            userInfo.style.display = 'inline-block';
            const user = getCurrentUser();
            if (user && usernameSpan) {
                usernameSpan.textContent = user.name;
            }
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Exportar funções para uso em outros arquivos
window.authUtils = {
    isAuthenticated,
    getCurrentUser,
    getToken,
    clearToken,
    apiRequest,
    updateAuthLinks
}; 