# Buscador de Preços (MetaPreço)

Um aplicativo web profissional para análise e comparação de preços de produtos no Mercado Livre e Google Shopping, com recursos avançados de análise estatística e exportação de dados.

## ✨ Funcionalidades

### 🔍 Busca Avançada
- Busca em lote de múltiplos produtos simultaneamente
- Barra de progresso em tempo real
- Interface intuitiva para entrada de produtos

### 📊 Análise Estatística
- Cálculo automático de:
  - Preço médio
  - Preço mediano
  - Preço mais comum (moda)
  - Identificação de outliers (preços fora do padrão)
  - Preços mínimo e máximo

### 📈 Visualização de Dados
- Gráficos interativos mostrando a distribuição de preços
- Identificação visual de outliers
- Tabela organizada com todos os resultados
- Modal detalhado para cada produto

### 📑 Exportação de Dados
- Exportação para Excel com:
  - Formatação profissional
  - Links diretos para produtos
  - Valores formatados para análise
  - Produtos com preços mais próximos da média/mediana/moda

### 🎯 Recursos Adicionais
- Ordenação flexível dos resultados
- Remoção de produtos específicos da análise
- Interface responsiva para todos os dispositivos
- Design moderno e profissional

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Paulo83-dev/MultiPre-o.git
cd MultiPre-o
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente (se necessário):
- Crie um arquivo `.env` no diretório backend
- Adicione as configurações necessárias

## 💻 Como Usar

1. Para fácil inicialização, use o script start.bat localizado na pasta scripts:
```bash
cd scripts
start.bat
```

2. Ou inicie manualmente o servidor backend:
```bash
cd backend
node server.js
```

3. Abra o arquivo `index.html` em seu navegador ou acesse http://localhost:3000

4. Para buscar produtos:
   - Digite um ou mais produtos (um por linha)
   - Clique em "Buscar Produtos"
   - Aguarde a análise ser concluída

5. Para analisar os resultados:
   - Visualize a tabela com as estatísticas
   - Clique em "Ver Detalhes" para mais informações
   - Use os botões de ordenação conforme necessário

6. Para exportar dados:
   - Clique no botão "Exportar para Excel"
   - O arquivo será baixado automaticamente
   - Abra no Excel para análises adicionais

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5 semântico
- CSS3 com design responsivo
- JavaScript ES6+
- Chart.js para visualização de dados
- XLSX.js para exportação Excel

### Backend
- Node.js
- Express
- Axios para requisições HTTP
- CORS para comunicação cross-origin

## 🔄 Melhorias Recentes

### Reorganização da Estrutura do Projeto
- Código modularizado para melhor manutenção
- Separação clara entre frontend e backend
- Organização de arquivos por funcionalidade

### Melhorias no Backend
- Rotas separadas por funcionalidade
- Configuração centralizada
- Melhor tratamento de erros
- Documentação de APIs com comentários JSDoc

### Melhorias no Frontend
- Código JavaScript dividido em módulos:
  - API: Funções de comunicação com o backend
  - Statistics: Funções de cálculos estatísticos
  - UI: Funções de manipulação da interface
  - Main: Coordenação e inicialização
- Melhor organização de assets
- Melhor tratamento de eventos

### Scripts de Automação
- Scripts atualizados para a nova estrutura
- Melhor verificação de dependências
- Criação automática de diretórios necessários

## 📁 Estrutura do Projeto

```
📁 METAPREÇO/
├── 📁 frontend/                # Interface do usuário
│   ├── 📄 index.html          # Página principal
│   ├── 📄 styles.css          # Estilos CSS
│   ├── 📁 js/                 # Scripts JavaScript
│   │   ├── 📄 main.js         # Script principal
│   │   ├── 📄 api.js          # Funções de API
│   │   ├── 📄 statistics.js   # Funções estatísticas
│   │   └── 📄 ui.js           # Manipulação da interface
│   └── 📁 assets/             # Recursos estáticos
│       └── 📄 no-image.png    # Imagem padrão
├── 📁 backend/                # Servidor e API
│   ├── 📄 server.js           # Servidor Express
│   ├── 📁 routes/             # Rotas da API
│   │   ├── 📄 mercadolivre.js # Rotas do Mercado Livre
│   │   ├── 📄 google.js       # Rotas do Google Shopping
│   │   └── 📄 proxy.js        # Proxy de imagens
│   ├── 📁 services/           # Serviços de negócio
│   │   └── 📄 search.js       # Lógica de busca
│   └── 📄 package.json        # Dependências do backend
├── 📄 package.json            # Dependências do projeto
└── 📁 scripts/                # Scripts de automação
    ├── 📄 install.bat         # Script de instalação
    └── 📄 start.bat           # Script de inicialização
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📧 Contato

Paulo Fernando de Lima Filho - [paulofernandodelimafilho@gmail.com]

Link do Projeto: [https://github.com/Paulo83-dev/MultiPre-o.git]

## 🚀 Migração para GitHub Pages e Supabase

Este projeto foi migrado do MongoDB/Render/Netlify para usar Supabase como banco de dados e GitHub Pages para hospedagem. Isso simplifica a infraestrutura e reduz os custos de hospedagem.

### 📋 Documentação da Migração

- [MIGRACAO.md](MIGRACAO.md) - Instruções detalhadas sobre a migração do MongoDB para o Supabase
- [GITHUB_PAGES.md](GITHUB_PAGES.md) - Guia passo a passo para configurar o GitHub Pages

### 🔧 Tecnologias Atualizadas

- **Banco de Dados**: [Supabase](https://supabase.io) (PostgreSQL)
- **Hospedagem**: [GitHub Pages](https://pages.github.com)
- **Autenticação**: Sistema de autenticação do Supabase

### 🌐 Acesso ao Site

O site está disponível em: [https://SEU_USUARIO.github.io/metapreco/](https://SEU_USUARIO.github.io/metapreco/) (substitua com seu URL real)