// Cliente Supabase para o navegador
const SUPABASE_URL = 'https://porzplkmrtfvdihcgwvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcnpwbGttcnRmdmRpaGNnd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzODM4MzgsImV4cCI6MjA1Njk1OTgzOH0.awCjsgAmhlim8pLZ90JWzY2gVU-YSSt79aGUHIUVi_M';

// Inicializar o cliente Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções de autenticação
const auth = {
  // Registrar um novo usuário
  async signUp(name, email, password) {
    try {
      // Primeiro, registrar o usuário na autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Em seguida, adicionar informações adicionais na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name,
            email,
            created_at: new Date(),
          },
        ]);

      if (userError) throw userError;

      return { user: authData.user, userData };
    } catch (error) {
      console.error('Erro ao registrar:', error.message);
      throw error;
    }
  },

  // Login de usuário
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login_at: new Date() })
        .eq('id', data.user.id);

      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      throw error;
    }
  },

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
      throw error;
    }
  },

  // Verificar se o usuário está logado
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error.message);
      return null;
    }
  }
};

// Funções para busca de produtos
const products = {
  // Salvar histórico de pesquisa
  async saveSearchHistory(searchTerm, resultCount, sources) {
    try {
      const user = await auth.getCurrentUser();
      
      const { data, error } = await supabase
        .from('search_history')
        .insert([
          {
            search_term: searchTerm,
            user_id: user ? user.id : null,
            result_count: resultCount,
            mercado_livre: sources.mercadoLivre,
            google_shopping: sources.googleShopping
          }
        ])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao salvar histórico de pesquisa:', error.message);
      throw error;
    }
  },

  // Salvar produtos encontrados
  async saveProducts(products, searchId) {
    try {
      const formattedProducts = products.map(product => ({
        title: product.title,
        price: product.price,
        link: product.link,
        image_url: product.imageUrl || '/assets/no-image.png',
        source: product.source,
        search_id: searchId,
        store: product.store,
        is_outlier: product.isOutlier || false
      }));

      // Salvar em lotes de 100 para evitar problemas com limites de tamanho
      const batchSize = 100;
      const results = [];

      for (let i = 0; i < formattedProducts.length; i += batchSize) {
        const batch = formattedProducts.slice(i, i + batchSize);
        const { data, error } = await supabase
          .from('products')
          .insert(batch)
          .select();

        if (error) throw error;
        results.push(...data);
      }

      return results;
    } catch (error) {
      console.error('Erro ao salvar produtos:', error.message);
      throw error;
    }
  },

  // Obter histórico de pesquisas do usuário
  async getUserSearchHistory() {
    try {
      const user = await auth.getCurrentUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter histórico de pesquisas:', error.message);
      throw error;
    }
  },

  // Obter produtos de uma pesquisa específica
  async getProductsBySearchId(searchId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('search_id', searchId)
        .order('price');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao obter produtos por ID de pesquisa:', error.message);
      throw error;
    }
  }
};

// Exportar as funções para uso global
window.supabaseAuth = auth;
window.supabaseProducts = products; 