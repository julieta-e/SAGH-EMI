require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();

// CAPTURA 1: Cabeceras HTTP de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));

// CAPTURA 2: CORS configurado
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// CAPTURA 3: Rate Limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', loginLimiter);

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/usuarios',      require('./routes/usuarios'));
app.use('/api/docentes',      require('./routes/docentes'));
app.use('/api/horarios',      require('./routes/horarios'));
app.use('/api/materias',      require('./routes/materias'));
app.use('/api/aulas',         require('./routes/aulas'));
app.use('/api/observaciones', require('./routes/observaciones'));


app.listen(process.env.PORT || 3001, () =>
  console.log(`Backend corriendo en puerto ${process.env.PORT || 3001}`)
);