const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(
  cors({
    origin: 'https://aman-ecom.netlify.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.options('*', cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://aman-ecom.netlify.app');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(helmet());

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.enable('trust proxy');

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    status: 'error',
    message: err.message || 'An unknown error occurred',
  });
});

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello from the server side!', app: 'app' });
// });

app.get('/', (req, res) => {
  res.send('Hello from the server side!');
});

app.use('/api/admin', adminRouter);
app.use('/api/users', userRouter);

app.use(globalErrorHandler);

module.exports = app;
