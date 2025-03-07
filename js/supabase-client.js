// Supabase Client
console.log('Carregando Supabase Client...');

// Configurações do Supabase
const SUPABASE_URL = 'https://porzplkmrtfvdihcgwvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcnpwbGttcnRmdmRpaGNnd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzODM4MzgsImV4cCI6MjA1Njk1OTgzOH0.awCjsgAmhlim8pLZ90JWzY2gVU-YSSt79aGUHIUVi_M';

// Inicializar o cliente Supabase
let supabaseClient = null;

// Função para inicializar o cliente Supabase
function initSupabase() {
  try {
    console.log('Inicializando cliente Supabase...');
    
    if (typeof supabase === 'undefined') {
      console.error('Biblioteca Supabase não encontrada.');
      return false;
    }
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Cliente Supabase inicializado com sucesso!');
    
    // Criar objeto de autenticação
    window.supabaseAuth = {
      async signUp(name, email, password) {
        try {
          if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');
          
          const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { name: name } }
          });
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Erro ao registrar:', error.message);
          throw error;
        }
      },
      
      async signIn(email, password) {
        try {
          if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');
          
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          return data;
        } catch (error) {
          console.error('Erro ao fazer login:', error.message);
          throw error;
        }
      },
      
      async signOut() {
        try {
          if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');
          
          const { error } = await supabaseClient.auth.signOut();
          if (error) throw error;
          return true;
        } catch (error) {
          console.error('Erro ao fazer logout:', error.message);
          throw error;
        }
      },
      
      async getCurrentUser() {
        try {
          if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');
          
          const { data, error } = await supabaseClient.auth.getUser();
          
          // Se o erro for "Auth session missing", significa que o usuário não está logado
          if (error && error.message === 'Auth session missing!') {
            console.log('Nenhum usuário logado.');
            return null;
          }
          
          if (error) throw error;
          return data.user;
        } catch (error) {
          console.error('Erro ao obter usuário atual:', error.message);
          return null;
        }
      }
    };
    
    // Criar objeto de produtos
    window.supabaseProducts = {
      async saveSearchHistory(searchTerm, resultCount, sources) {
        try {
          if (!supabaseClient) throw new Error('Cliente Supabase não inicializado');
          
          const user = await window.supabaseAuth.getCurrentUser();
          
          const { data, error } = await supabaseClient
            .from('search_history')
            .insert([{
              search_term: searchTerm,
              user_id: user ? user.id : null,
              result_count: resultCount,
              mercado_livre: sources.mercadoLivre,
              google_shopping: sources.googleShopping
            }])
            .select();
          
          if (error) throw error;
          return data[0];
        } catch (error) {
          console.error('Erro ao salvar histórico:', error.message);
          throw error;
        }
      }
    };
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Supabase:', error.message);
    return false;
  }
}

// Inicializar o Supabase quando o documento estiver pronto
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Documento já está pronto, inicializando Supabase agora...');
  initSupabase();
} else {
  console.log('Documento ainda não está pronto, aguardando evento DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Evento DOMContentLoaded disparado, inicializando Supabase...');
    initSupabase();
  });
}

// Garantir que o Supabase seja inicializado após um tempo
setTimeout(function() {
  if (!window.supabaseAuth) {
    console.log('Inicialização atrasada do Supabase...');
    initSupabase();
  }
}, 1000);   