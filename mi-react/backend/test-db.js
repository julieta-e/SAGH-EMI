require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa, hora:', res.rows[0].now);
    const users = await pool.query('SELECT username FROM usuarios LIMIT 1');
    console.log('Usuarios encontrados:', users.rows);
  } catch (err) {
    console.error('Error de BD:', err);
  }
})();