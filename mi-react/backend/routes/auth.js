const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND estado = true',
      [usuario]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    // Verificar con bcrypt
    const passwordValida = await bcrypt.compare(password, user.password_hash);
    if (!passwordValida)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    let rol = user.rol;
    if (usuario.endsWith('@doc.emi.edu.bo')) rol = 'Docente';

    const token = jwt.sign(
      { id: user.id_usuario, rol, nombre: user.nombres + ' ' + user.apellidos },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombres + ' ' + user.apellidos,
        rol,
        email: user.correo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;