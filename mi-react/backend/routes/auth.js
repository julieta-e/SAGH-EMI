const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
console.log('Recibido:', usuario, password);

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND estado = true',
      [usuario]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    if (user.password_hash !== password)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol, nombre: user.nombres + ' ' + user.apellidos },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
console.log('Usuario encontrado:', result.rows[0]); // ← y esta
    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombres + ' ' + user.apellidos,
        rol: user.rol,
        email: user.correo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
