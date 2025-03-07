# Guia Detalhado para Configurar o GitHub Pages

Este guia fornece instruções passo a passo para configurar o GitHub Pages para o projeto MultiPreço.

## 1. Criar um Repositório no GitHub

1. Acesse [GitHub](https://github.com/) e faça login na sua conta.
2. Clique no botão "+" no canto superior direito e selecione "New repository".
3. Preencha os seguintes campos:
   - **Repository name**: `metapreco` (ou outro nome de sua preferência)
   - **Description**: "Buscador de preços com análise estatística"
   - **Visibility**: Public (para usar o GitHub Pages gratuitamente)
   - **Initialize this repository with**: Deixe todas as opções desmarcadas
4. Clique em "Create repository".

## 2. Preparar o Projeto Local

1. Abra o terminal no diretório do seu projeto.
2. Inicialize um repositório Git local (se ainda não tiver feito):
   ```bash
   git init
   ```
3. Adicione o repositório remoto:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/metapreco.git
   ```
   (Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub)

4. Crie um arquivo `.gitignore` para excluir arquivos desnecessários:
   ```
   node_modules/
   .env
   .DS_Store
   ```

5. Adicione todos os arquivos ao Git:
   ```bash
   git add .
   ```

6. Faça o commit inicial:
   ```bash
   git commit -m "Versão inicial do projeto MultiPreço"
   ```

7. Envie o código para o GitHub:
   ```bash
   git push -u origin main
   ```
   (Se o seu branch principal for chamado `master` em vez de `main`, use `master` no comando acima)

## 3. Configurar o GitHub Pages

1. Acesse o repositório no GitHub.
2. Clique na aba "Settings" (Configurações).
3. Role para baixo até a seção "GitHub Pages".
4. Em "Source", selecione o branch principal (geralmente `main` ou `master`).
5. Clique em "Save" (Salvar).
6. Aguarde alguns minutos para que o GitHub Pages publique seu site.
7. Após a publicação, você verá uma mensagem com o URL do seu site (geralmente `https://SEU_USUARIO.github.io/metapreco/`).

## 4. Configurar um Domínio Personalizado (Opcional)

Se você tiver um domínio personalizado e quiser usá-lo com o GitHub Pages:

1. Na seção "GitHub Pages" das configurações do repositório, em "Custom domain", digite seu domínio (por exemplo, `metapreco.com.br`).
2. Clique em "Save".
3. Configure os registros DNS do seu domínio:
   - Para um domínio apex (como `metapreco.com.br`), configure registros A apontando para os seguintes endereços IP:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Para um subdomínio (como `www.metapreco.com.br`), configure um registro CNAME apontando para `SEU_USUARIO.github.io`.
4. Aguarde a propagação do DNS (pode levar até 24 horas).
5. Marque a opção "Enforce HTTPS" para habilitar HTTPS para seu site.

## 5. Verificar a Publicação

1. Acesse o URL do seu site (fornecido pelo GitHub Pages ou seu domínio personalizado).
2. Verifique se todas as páginas estão funcionando corretamente.
3. Teste as funcionalidades principais, como:
   - Navegação entre páginas
   - Autenticação (login/registro)
   - Busca de produtos
   - Visualização do histórico de pesquisas

## 6. Atualizar o Site

Sempre que você fizer alterações no projeto e quiser atualizá-lo no GitHub Pages:

1. Faça as alterações necessárias nos arquivos.
2. Adicione as alterações ao Git:
   ```bash
   git add .
   ```
3. Faça um commit com uma mensagem descritiva:
   ```bash
   git commit -m "Descrição das alterações"
   ```
4. Envie as alterações para o GitHub:
   ```bash
   git push
   ```
5. O GitHub Pages atualizará automaticamente seu site em alguns minutos.

## 7. Solução de Problemas Comuns

### 7.1. Página 404 ao Navegar Diretamente para uma Rota

O GitHub Pages serve sites estáticos, então navegar diretamente para uma URL como `https://seu-site.com/login.html` pode não funcionar corretamente se você estiver usando um roteador de cliente.

**Solução**: Use o arquivo `404.html` fornecido neste projeto, que redireciona para a página inicial.

### 7.2. Problemas com CORS

Se você estiver fazendo solicitações para APIs externas, pode enfrentar problemas de CORS.

**Solução**: Use APIs que suportem CORS ou configure um proxy CORS.

### 7.3. Arquivos Grandes

O GitHub Pages tem um limite de tamanho de arquivo de 100 MB e um limite de repositório de 1 GB.

**Solução**: Otimize imagens e outros recursos grandes. Considere usar CDNs para arquivos maiores.

## 8. Recursos Adicionais

- [Documentação oficial do GitHub Pages](https://docs.github.com/en/pages)
- [Configurando um domínio personalizado para GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Solução de problemas do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites) 