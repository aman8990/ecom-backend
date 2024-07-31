const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// app.use(
//   cors({
//     origin: 'http://127.0.0.1:4173',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }),
// );

// app.options('*', cors());

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:4173');
//   res.header('Access-Control-Allow-Credentials', true);
//   next();
// });

const allowedOrigins = [
  'http://127.0.0.1:4173',
  'https://aman-ecom.netlify.app/',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.options('*', cors());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
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
