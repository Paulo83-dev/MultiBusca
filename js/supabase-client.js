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
      
