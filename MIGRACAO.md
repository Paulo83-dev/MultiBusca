# Migração para Supabase e GitHub Pages

Este documento contém instruções detalhadas para migrar o projeto MultiPreço do MongoDB/Render/Netlify para Supabase/GitHub Pages.

## 1. Configuração do Supabase

### 1.1. Obtenha as credenciais do Supabase

1. Acesse o [painel do Supabase](https://app.supabase.io)
2. Selecione seu projeto
3. Vá para "Settings" > "API"
4. Copie a "URL" e a "anon key" (chave anônima)
5. Adicione essas informações ao arquivo `.env`:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_anon_do_supabase
```

### 1.2. Configuração do MCP (Model Context Protocol)

O arquivo `.cursor/mcp.json` já foi configurado com as informações do Supabase e GitHub:

```json
{
    "mcpServers": {
      "supabase": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://postgres:segundo2863@db.porzplkmrtfvdihcgwvc.supabase.co:5432/postgres"]
      },
      "github": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-github"]
      }
    }
}
```

### 1.3. Criação das tabelas no Supabase

Execute o script `create-tables.js` para criar as tabelas necessárias no Supabase:

```
node create-tables.js
```

Este script criará as seguintes tabelas no esquema `public`:
- `users`: para armazenar informações de usuários
- `search_history`: para armazenar histórico de pesquisas
- `products`: para armazenar informações de produtos

## 2. Migração de dados do MongoDB para o Supabase

### 2.1. Configuração do ambiente

Certifique-se de que o arquivo `.env` contém a string de conexão do MongoDB:

```
MONGODB_URI=sua_string_de_conexao_mongodb
```

### 2.2. Migração dos dados

Execute o script `migrate-data.js` para migrar os dados do MongoDB para o Supabase:

```
node migrate-data.js
```

Este script migrará:
- Usuários
- Histórico de pesquisas
- Produtos

## 3. Adaptação do código para GitHub Pages

### 3.1. Cliente Supabase para o navegador

O arquivo `js/supabase-client.js` contém o código necessário para interagir com o Supabase diretamente do navegador. Certifique-se de atualizar a URL e a chave anônima do Supabase neste arquivo.

### 3.2. Modificações nos arquivos HTML

Você precisará modificar os arquivos HTML para:

1. Incluir o script do Supabase:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
```

2. Substituir as chamadas de API para o backend Node.js por chamadas diretas ao Supabase usando as funções definidas em `supabase-client.js`.

### 3.3. Configuração do GitHub Pages

1. Crie um repositório no GitHub para o seu projeto
2. Faça push do código para o repositório
3. Vá para "Settings" > "Pages"
4. Selecione a branch principal (geralmente `main`) como source
5. Clique em "Save"

O GitHub Pages hospedará automaticamente seu site estático.

## 4. Considerações adicionais

### 4.1. Autenticação

O Supabase fornece um sistema de autenticação completo. O cliente Supabase para o navegador já inclui funções para:
- Registro de usuários
- Login
- Logout
- Verificação de usuário atual

### 4.2. Armazenamento de arquivos

Se seu aplicativo precisar armazenar arquivos, você pode usar o Storage do Supabase. Consulte a [documentação do Supabase Storage](https://supabase.io/docs/guides/storage) para mais informações.

### 4.3. Funções em tempo real

O Supabase oferece funcionalidades em tempo real que podem ser úteis para seu aplicativo. Consulte a [documentação de Realtime do Supabase](https://supabase.io/docs/guides/realtime) para mais informações.

## 5. Recursos adicionais

- [Documentação do Supabase](https://supabase.io/docs)
- [Documentação do GitHub Pages](https://docs.github.com/en/pages)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/introduction) 