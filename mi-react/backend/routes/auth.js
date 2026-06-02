const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND estado = true',
      [usuario]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Comparación directa (solo desarrollo)
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    let rol = user.rol;
    if (usuario.endsWith('@doc.emi.edu.bo')) {
      rol = 'Docente';
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no definido en .env');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    const token = jwt.sign(
      {
        id: user.id_usuario,
        rol: rol,
        nombre: `${user.nombres} ${user.apellidos}`,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: `${user.nombres} ${user.apellidos}`,
        rol: rol,
        email: user.correo || null,
        docenteId: user.docente_id || null,
      },
    });
  } catch (err) {
    console.error('❌ ERROR EN LOGIN:', err);
    res.status(500).json({ error: 'Error del servidor', detalle: err.message });
  }
});

module.exports = router;