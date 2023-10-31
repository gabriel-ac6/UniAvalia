const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const port = 3001;



// Configurar o middleware para analisar o corpo da solicitação
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure o Express para servir arquivos estáticos da pasta 'public'
app.use(express.static('Cadastro'));

// Configurar o mecanismo de visualização EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));

// Configurar a sessão
app.use(session({
  secret: 'seu_segredo_secreto', // Deve ser mantido em segredo
  resave: false,
  saveUninitialized: true,
}));

// Middleware para inicializar a variável de sessão

// Configurar o Express para servir arquivos estáticos do diretório 'public/Index'
app.use('/', express.static(path.join(__dirname, 'public/Index')));

app.get('/', (req, res) => {
  if (typeof req.session.loggedIn === 'undefined' || req.session.loggedIn === false) {
    req.session.loggedIn = false;
  }
  logado = req.session.loggedIn;
  res.render('Index/index', { logado });
});


// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/cadastro', express.static(path.join(__dirname, 'public/Cadastro')));

app.get('/cadastro', (req, res) => {
  // Renderizar o arquivo EJS de cadastro
  res.render('Cadastro/cadastro');
});


app.post('/fazer-cadastro', (req, res) => {
  // Obtenha os dados do formulário do objeto req.body
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password_confirmation = req.body.password_confirmation;
  const cpf = req.body.cpf;
  const dob = req.body.dob;

  console.log(name,email,password,password_confirmation,cpf,dob);

  // Dados a serem enviados na requisição POST
  const data = {
    name,
    email,
    password,
    password_confirmation,
    cpf,
    dob
  };

  // URL da API de registro
  const apiUrl = 'http://18.217.149.104/api/v1/auth/register';

  // Realize a requisição POST para a API
  axios.post(apiUrl, data)
    .then(response => {
      console.log('Resposta da API:', response.data);
      // Envie uma resposta de sucesso ao cliente, se necessário
      
      res.redirect('/');
    })
    .catch(error => {
      console.error('Erro na requisição para a API:', error);
      // Envie uma resposta de erro ao cliente, se necessário
      res.status(500).json({ error: 'Erro na requisição para a API' });
      res.redirect('/cadastro');
    });
});

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/login', express.static(path.join(__dirname, 'public/Login')));

app.get('/login', (req, res) => {
  if(req.session.loggedIn === false){
    // Renderizar o arquivo EJS de login
    res.render('Login/login');
  }else{
    res.redirect('/');
  }
  });

  app.post('/fazer-login', (req, res) => {
    if(req.session.loggedIn === false){

   
    // Obtenha os dados do formulário do objeto req.body
    const email = req.body.email;
    const senha = req.body.password;
  
    // URL da API de login
    const apiUrl = 'http://18.217.149.104/api/v1/auth/login';
  
    // Dados a serem enviados no corpo da requisição
    const data = {
      email: email,
      password: senha
    };
  
    // Realize a requisição POST para a API
    axios.post(apiUrl, data)
      .then(response => {
        const userData = response.data; // Suponha que a API retorna informações do usuário após o login
        req.session.user = userData; // Armazene os dados do usuário na sessão
        req.session.loggedIn = true; // Altere o valor da variável de sessão para true
      
        console.log('Resposta da API:', response.data);
        res.redirect('/');
      })
      .catch(error => {
        console.error('Erro na requisição para a API:', error);
        res.redirect('/login');
      });
    }else{
      res.redirect('/');
    }
  });

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/busca', express.static(path.join(__dirname, 'public/Busca')));

// Rota para renderizar o formulário de busca
app.get('/busca', (req, res) => {
  if (req.session.loggedIn === false) {
    res.redirect('/profile');
  } else {
    // Se loggedIn for true, continue com a rota normalmente
    const apiUrl = 'http://18.217.149.104/api/v1/course/list';

    // Fazer uma requisição GET para a URL da API externa
    axios.get(apiUrl)
      .then(response => {
        const data = response.data; // Dados da API
        // Você pode processar os dados ou passá-los para o template
        console.log(data);
        res.render('Busca/form_busca', { data });
      })
      .catch(error => {
        console.error('Erro na requisição para a API:', error);
        res.status(500).send('Erro na requisição para a API');
      });
  }
});

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/resultados', express.static(path.join(__dirname, 'public/Busca')));

app.post('/fazer-busca', (req, res) => {
  if (req.session.loggedIn === false) {
    res.redirect('/');
  }else{
  const apiUrl = 'http://18.217.149.104/api/v1/course/search';

  // Recupere os campos do formulário
  const course_id = req.body.course_id;
  const weightForCritTeachers = req.body.weightForCritTeachers;
  const weightForCritLab = req.body.weightForCritLab;
  const weightForCritCurriculum = req.body.weightForCritCurriculum;
  const weightForCritEmployability = req.body.weightForCritEmployability;

  // Dados a serem enviados no corpo da requisição
  const data = {
    course_id,
    weightForCritTeachers,
    weightForCritLab,
    weightForCritCurriculum,
    weightForCritEmployability
  };

  // Realize a requisição POST para a API
  axios.post(apiUrl, data)
    .then(response => {
      const searchData = response.data; // Dados da API de busca

      // Armazene 'searchData' na sessão
      req.session.searchData = searchData;
      console.log(req.session.searchData );

      // Redirecione o usuário para a rota '/resultados'
      res.redirect('/resultados');
    })
    .catch(error => {
      console.error('Erro na requisição para a API:', error);
      res.status(500).send('Erro na requisição para a API');
    });
  }
});

// Rota para exibir os resultados da busca
app.get('/resultados', (req, res) => {
  if (req.session.loggedIn === false) {
    res.redirect('/');
  } else {
    // Se loggedIn for true, continue com a rota normalmente
    console.log(req.session.searchData);
    res.render('Busca/Resultado', { searchData: req.session.searchData });
  }
});

// Rota para exibir os resultados da busca
app.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  res.redirect('/');
});

// Configurar o Express para servir arquivos estáticos do diretório 'src/mapa'
app.use('/profile', express.static(path.join(__dirname, 'public/profile')));
// Rota para exibir os resultados da busca
app.get('/profile', (req, res) => {
  if(req.session.loggedIn === false){
    res.redirect('/');
  }else{
    res.render('profile/profile');
  }
  
});

app.listen(port, () => {
  console.log(`O servidor está ouvindo na porta ${port}`);
});
