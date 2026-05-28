require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173' })); // Puerto de Vite
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/docentes', require('./routes/docentes'));
app.use('/api/horarios', require('./routes/horarios'));
app.use('/api/materias', require('./routes/materias')); // ← agregar
app.use('/api/aulas',    require('./routes/aulas'));  

app.listen(process.env.PORT || 3001, () =>
  console.log(`Backend corriendo en puerto ${process.env.PORT || 3001}`)
);