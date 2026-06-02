const bcrypt = require('bcryptjs');
const pool = require('./db');
require('dotenv').config();

async function hashear() {
  const result = await pool.query('SELECT id_usuario, password_hash FROM usuarios');
  
  for (const u of result.rows) {
    if (!u.password_hash.startsWith('$2b$')) {
      const hash = await bcrypt.hash(u.password_hash, 12);
      await pool.query(
        'UPDATE usuarios SET password_hash = $1 WHERE id_usuario = $2',
        [hash, u.id_usuario]
      );
      console.log(`Usuario ${u.id_usuario} hasheado`);
    }
  }
  console.log('Listo');
  process.exit(0);
}

hashear().catch(console.error);
