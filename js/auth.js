// Configuração da API
// Agora usamos o Supabase em vez do backend no Render
// const API_URL = 'https://metapreco-backend.onrender.com';
// const AUTH_ENDPOINT = `${API_URL}/api/auth`;

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

// Salvar token e informações do usuário no localStorage
function saveToken(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Obter token do localStorage
function getToken() {
    return localStorage.getItem('authToken');
}

// Limpar token e informações do usuário do localStorage
function clearToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Verificar se o usuário está autenticado
function isAuthenticated() {
    return !!getToken();
}

// Obter informações do usuário atual
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Função para fazer requisições à API usando Supabase
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        // Verificar se o Supabase está disponível
        if (!window.supabaseAuth) {
            throw new Error('Supabase não está disponível. Verifique se o script foi carregado corretamente.');
        }

        let result;

        // Mostrar status do servidor para requisições que podem demorar
        if (method !== 'GET') {
            showServerStatus();
        }

        // Executar a requisição com base no endpoint e método
        switch (endpoint) {
            case 'register':
                console.log('Registrando usuário com Supabase...');
                result = await window.supabaseAuth.signUp(
                    data.name,
                    data.email,
                    data.password
                );
                break;
            
            case 'login':
                console.log('Fazendo login com Supabase...');
                const loginResult = await window.supabaseAuth.signIn(
                    data.email,
                    data.password
                );
                
                // Formatar o resultado para manter compatibilidade com o código existente
                if (loginResult && loginResult.user) {
                    result = {
                        token: loginResult.session?.access_token || '',
                        user: {
                            id: loginResult.user.id,
                            name: loginResult.user.user_metadata?.name || data.email.split('@')[0],
                            email: loginResult.user.email
                        }
                    };
                } else {
                    result = loginResult;
                }
                break;
            
            case 'logout':
                console.log('Fazendo logout com Supabase...');
                await window.supabaseAuth.signOut();
                result = { success: true };
                break;
            
            default:
                throw new Error(`Endpoint não suportado: ${endpoint}`);
        }

        // Esconder status do servidor
        hideServerStatus();
        
        return result;
    } catch (error) {
        // Esconder status do servidor em caso de erro
        hideServerStatus();
        
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Configurar eventos para o formulário de login
function setupLoginEvents() {
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showAlert(alertMessage, 'Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            try {
                const result = await apiRequest('login', 'POST', { email, password });
                
                if (result && result.token) {
                    saveToken(result.token, result.user);
                    showAlert(alertMessage, 'Login realizado com sucesso! Redirecionando...', 'success');
                    
                    // Redirecionar após login bem-sucedido
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showAlert(alertMessage, 'Erro ao fazer login. Verifique suas credenciais.', 'error');
                }
            } catch (error) {
                showAlert(alertMessage, `Erro ao fazer login: ${error.message}`, 'error');
            }
        });
    }
    
    // Alternar para o formulário de registro
    if (toggleRegister && registerContainer && loginContainer) {
        toggleRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'block';
        });
    }
}

// Configurar eventos para o formulário de registro
function setupRegisterEvents() {
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!name || !email || !password || !confirmPassword) {
                showAlert(registerAlertMessage, 'Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert(registerAlertMessage, 'As senhas não coincidem.', 'error');
                return;
            }
            
            try {
                const result = await apiRequest('register', 'POST', { name, email, password });
                
                if (result && result.user) {
                    showAlert(registerAlertMessage, 'Registro realizado com sucesso! Você já pode fazer login.', 'success');
                    
                    // Limpar formulário
                    registerForm.reset();
                    
                    // Voltar para o formulário de login após alguns segundos
                    setTimeout(() => {
                        if (loginContainer && registerContainer) {
                            registerContainer.style.display = 'none';
                            loginContainer.style.display = 'block';
                        }
                    }, 2000);
                } else {
                    showAlert(registerAlertMessage, 'Erro ao registrar. Verifique os dados informados.', 'error');
                }
            } catch (error) {
                showAlert(registerAlertMessage, `Erro ao registrar: ${error.message}`, 'error');
            }
        });
    }
    
    // Alternar para o formulário de login
    if (toggleLogin && loginContainer && registerContainer) {
        toggleLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'block';
        });
    }
}

// Atualizar links de autenticação na barra de navegação
function updateAuthLinks() {
    const loginLink = document.querySelector('.login-link');
    const logoutLink = document.querySelector('.logout-link');
    const userInfo = document.querySelector('.user-info');
    const username = document.querySelector('.username');
    
    if (isAuthenticated()) {
        // Usuário está autenticado
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'inline-block';
            logoutLink.addEventListener('click', async function(e) {
                e.preventDefault();
                try {
                    await apiRequest('logout', 'POST');
                    clearToken();
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                    // Forçar logout mesmo em caso de erro
                    clearToken();
                    window.location.href = 'index.html';
                }
            });
        }
        
        if (userInfo && username) {
            userInfo.style.display = 'inline-block';
            const user = getCurrentUser();
            if (user) {
                username.textContent = user.name;
            }
        }
    } else {
        // Usuário não está autenticado
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setupLoginEvents();
    setupRegisterEvents();
    updateAuthLinks();
    
    // Verificar parâmetro register na URL
    const urlParams = new URLSearchParams(window.location.search);
    const showRegister = urlParams.get('register');
    
    if (showRegister === 'true' && loginContainer && registerContainer) {
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    }
});

// Exportar funções para uso global
window.authUtils = {
    isAuthenticated,
    getCurrentUser,
    clearToken
}; 