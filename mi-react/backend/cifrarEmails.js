const pool = require('./db');
const { cifrar } = require('./utils/crypto');
require('dotenv').config();

async function cifrarDatos() {
  const docentes = await pool.query(
    'SELECT id, email FROM docentes WHERE email IS NOT NULL'
  );
  
  for (const d of docentes.rows) {
    if (d.email) {
      const { cifrado, nonce } = cifrar(d.email);
      await pool.query(
        'UPDATE docentes SET email_cifrado = $1, nonce = $2 WHERE id = $3',
        [cifrado, nonce, d.id]
      );
      console.log('Docente ' + d.id + ' cifrado');
    }
  }
  console.log('Listo');
  process.exit(0);
}

cifrarDatos().catch(console.error);