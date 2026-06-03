console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_USER:', process.env.DB_USER);
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

(async () => {
  try {
    const res = await pool.query('SELECT id_usuario, username, password_hash FROM usuarios');
    for (let user of res.rows) {
      // Si la contraseña actual NO empieza con $2b$ (bcrypt), entonces es texto plano
      if (!user.password_hash.startsWith('$2b$')) {
        const hashed = await bcrypt.hash(user.password_hash, 10);
        await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2', [hashed, user.id_usuario]);
        console.log(`✔ Hasheada contraseña de usuario: ${user.username}`);
      } else {
        console.log(`⚠ El usuario ${user.username} ya tiene hash bcrypt, se omite`);
      }
    }
    console.log('✅ Todas las contraseñas hasheadas correctamente.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit();
  }
})();