# Bibliotecas Conectadas

Este projeto implementa um sistema de gerenciamento de unidades (bibliotecas) e livros, com funcionalidades de CRUD (Criar, Ler, Editar, Excluir) para ambos. Desenvolvido utilizando HTML, CSS, JavaScript vanilla, Web Components e Vite.

## Configuração e execução

### Pré-requisitos

- Node.js 18 ou superior.
- npm (incluído com o Node.js).
- Backend da aplicação disponível. Por padrão, o frontend usa `http://127.0.0.1:8000` durante o desenvolvimento.

### Instalação

Na raiz do projeto, instale as dependências e crie o arquivo de ambiente local:

```bash
npm ci
cp .env.example .env
```

Edite o `.env` e informe a URL raiz do backend em `VITE_API_URL`, sem acrescentar `/gestor`:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_ISBN_LOOKUP_ENABLED=true
```

Se o backend estiver em outro endereço, substitua a URL acima. Para desativar a busca automática de metadados por ISBN, defina `VITE_ISBN_LOOKUP_ENABLED=false`. O arquivo `.env` é local e não deve ser enviado ao repositório.

### Desenvolvimento

Inicie o servidor frontend:

```bash
npm run dev
```

Se o comando falhar com `sh: 1: vite: not found`, instale as dependências na raiz do projeto e tente novamente:

```bash
npm ci
npm run dev
```

Abra no navegador o endereço informado pelo Vite (normalmente `http://localhost:5173`). Mantenha o backend em execução para carregar e salvar livros, unidades, usuários e empréstimos.

### Build e preview

Para gerar a versão de produção e servi-la localmente para conferência:

```bash
npm run build
npm run preview
```

O build é criado em `dist/`; o comando de preview informa o endereço local onde ele está sendo servido.

### Docker

#### Instalar no Ubuntu

Instale o Docker Engine e o plugin Docker Compose V2 disponibilizados pelos repositórios do Ubuntu:

```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose-v2
```

Habilite e inicie o serviço do Docker:

```bash
sudo systemctl enable --now docker
```

Verifique a instalação. Os comandos Docker abaixo usam `sudo` para acessar o daemon:

```bash
sudo docker --version
sudo docker compose version
sudo docker run hello-world
```

#### Iniciar o projeto

Na raiz do repositório, crie `.env` a partir do exemplo `.env.example` somente se ainda não existir:

```bash
[ -f .env ] || cp .env.example .env
```

Configure `VITE_API_URL` no `.env` com a URL raiz do backend, sem acrescentar `/gestor`. Para produção, o padrão é `https://biblio-webapi.onrender.com`.

Construa e inicie o frontend:

```bash
sudo docker compose up --build -d
sudo docker ps
```

Para só iniciar o frontend

```bash
sudo docker compose up -d
sudo docker ps
```

O servidor de desenvolvimento do Vite ficará disponível em `http://localhost:5173`. O arquivo `.env` e a pasta `src/` são montados diretamente do host; alterações em `src/` são refletidas pelo Vite. O backend é executado separadamente. O alias `biblioteca-host` resolve, de dentro do container, para o gateway da máquina host. Use `http://biblioteca-host:<porta>` para alcançar um serviço do host na porta em que ele estiver ouvindo; o Compose não publica nem libera portas automaticamente. As chamadas feitas pelo navegador do usuário precisam usar um hostname acessível pelo próprio navegador.

Para acompanhar os logs ou encerrar os containers:

```bash
sudo docker compose logs -f frontend
sudo docker compose down
```

### Login

No estado atual, o login é temporário e aceita qualquer usuário e senha; ele não valida credenciais no backend. Não considere esse comportamento uma proteção de acesso para produção.

## Funcionalidades

O sistema permite:

- **Gerenciamento de Unidades (Bibliotecas):**
  - Listar todas as unidades cadastradas.
  - Adicionar novas unidades com informações como nome, endereço, telefone, e-mail e site.
  - Editar informações de unidades existentes.
  - Excluir unidades.
- **Gerenciamento de Livros:**
  - Listar todos os livros cadastrados.
  - Adicionar novos livros com informações como título, autor, editora, data de publicação, ISBN, número de páginas, URL da capa, idioma e gênero.
  - Preencher automaticamente campos do formulário a partir do ISBN (quando os demais campos ainda estão vazios).
  - Editar informações de livros existentes.
  - Excluir livros.

## Cadastro facilitado por ISBN

No formulário de livro, ao informar ISBN válido:

- A aplicação consulta o backend (`/gestor/livros/isbn-lookup/`).
- O backend busca metadados na Open Library e traduz textos para pt-BR.
- O formulário preenche somente campos vazios para evitar sobreposição de dados já digitados.

## Variáveis de ambiente

O arquivo `.env.example` lista as variáveis disponíveis. Copie-o para `.env` antes de iniciar o Vite e configure:

- `VITE_API_URL`: URL raiz do backend, por exemplo `http://127.0.0.1:8000` (sem `/gestor`). Se omitida, o frontend usa o backend local no desenvolvimento e `https://biblio-webapi.onrender.com` nos demais modos.
- `VITE_ISBN_LOOKUP_ENABLED`: habilita/desabilita o preenchimento automático por ISBN. Use `false` para desativar; se omitida, a funcionalidade fica habilitada.

## Estrutura do Projeto

```
bibliotecas-conectadas/
├── public/
│   ├── favicon.ico
│   └── assets/
│       └── imgs/
│           ├── icone.png
│           ├── logo.png
│           └── logotipo.png
├── src/
│   ├── components/
│   │   ├── app-header.js
│   │   ├── app-header.css
│   │   ├── livro/
│   │   │   ├── livro-form.js
│   │   │   ├── livro-form.css
│   │   │   └── livro-list.js
│   │   └── unidade/
│   │       ├── unidade-form.js
│   │       ├── unidade-form.css
│   │       ├── unidade-list.js
│   │       └── unidade-list.css
│   ├── css/
│   │   ├── pico.min.css
│   │   └── style.css
│   ├── domains/
│   │   ├── gestor/
│   │   │   ├── gestor-controller.js
│   │   │   ├── gestor-model.js
│   │   │   ├── gestor-service.js
│   │   │   └── gestor-view.js
│   │   └── auth/
│   │       ├── auth-controller.js
│   │       └── auth-view.js
│   └── main.js
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

- **`public/`**: Arquivos estáticos e imagens.
- **`src/components/`**: Web Components reutilizáveis para livros, unidades e header.
- **`src/domains/gestor/`**: Lógica de negócio, models, controllers e views para livros e unidades.
- **`src/domains/auth/`**: Autenticação.
- **`src/css/`**: Estilos globais e tema customizado.
- **`src/main.js`**: Ponto de entrada principal da aplicação.

## Observações

- Todos os arquivos relacionados a "biblioteca" foram migrados para "unidade".
- Utilize as rotas /livros e /unidades para acessar as funcionalidades principais.

## Bloco de Créditos

- base desenvolvida no PI i-III por Cláudio, Julian, Larissa e equipe, evoluída no PI VI pelo Grupo 1 do PJI610


## Dashboard integrado (versão independente)

Esta cópia inclui um dashboard nativo em JavaScript/Web Components, sem depender de incorporação do Power BI. O backend do PI VI já oferece rotas analíticas para indicadores, circulação, rankings, filtros e qualidade do acervo.

### Como executar

1. Instale o Node.js LTS e execute `npm ci` na raiz deste repositório.
2. Copie `.env.example` para `.env` e configure a **URL raiz** da API, sem `/gestor`:

```env
VITE_API_URL=https://biblio-webapi.onrender.com
VITE_ISBN_LOOKUP_ENABLED=true
```

3. Inicie `npm run dev` e abra `http://localhost:5173/login`.
4. Entre com uma conta **real da API**, autorizada para gestão (staff ou administrador). O login demonstrativo que aceitava quaisquer credenciais foi removido.
5. Após autenticar, o navegador abre `/dashboard`. Para sair, use o menu lateral.

O token retornado por `POST /gestor/auth/login/` é guardado no armazenamento da sessão do navegador; as chamadas autenticadas usam `Authorization: Token <token>`. Uma conta técnica de Power BI não substitui uma conta autorizada de usuário no login da aplicação. O backend pode precisar de CORS adicional se este frontend for publicado em um novo domínio. Não commite chaves ou senhas.

### Dados e limitações

- Dashboard: `GET /gestor/analytics/gestao-livros/` e `GET /gestor/analytics/gestao-livros/filtros/`.
- Resumo geral opcional: `GET /gestor/analytics/resumo/`, para totais gerais de usuários, unidades e movimentações.
- Filtros: unidade, categoria, ano inicial/final de **publicação** e período de circulação (máximo 36 meses).
- Gráficos, livros em destaque e tabelas exibem respostas reais da API; registros vazios não são preenchidos com dados simulados.
- O backend não mantém histórico de cadastro dos livros nem reservas; não confunda publicações por década com crescimento do acervo.
- Empréstimos recentes não exibem nomes, e-mails ou documentos dos leitores.

### Verificações

```bash
npm test
npm run build
```

Os testes automatizados verificam filtros, segurança de HTML, estados vazios, autenticação HTTP e comportamento do controlador do dashboard. A validação integrada com dados reais depende de uma API disponível e de credenciais autorizadas.

Backend de referência: https://github.com/larissalmg/biblio-webapi-pi6
