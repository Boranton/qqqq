const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { errorsMV } = require('./middlewares/errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const {
  login, createUser,
} = require('./controllers/users');
const router = require('./routes/index');
const {
  createUserValidation, loginValidation,
} = require('./middlewares/validation');
const { auth } = require('./middlewares/auth');

const corsMW = require('./middlewares/cors');

const app = express();

app.use(helmet());
mongoose.connect('mongodb://localhost:27017/mestodb', { family: 4 });

app.use(bodyParser.json());

app.use(requestLogger); // логгер запросов

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  max: 100, // можно совершить максимум 100 запросов с одного IP
});

// подключаем rate-limiter
app.use(limiter);

app.use(corsMW);

app.post('/signin', loginValidation, login);
app.post('/signup', createUserValidation, createUser);
app.use(auth);
app.use(router);

app.use(errorLogger); // логгер ошибок
app.use(errors()); // обработчик ошибок celebrate
app.use(errorsMV); // централизованный обработчик ошибок

app.listen(3000, () => {
  console.log('Сервер запущен rere!');
});
