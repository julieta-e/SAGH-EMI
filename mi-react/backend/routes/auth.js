const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  console.log('📥 Solicitud de login para usuario:', usuario);

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND estado = true',
      [usuario]
    );
    const user = result.rows[0];
    if (!user) {
      console.log('❌ Usuario no encontrado:', usuario);
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', user.username);
    console.log('🔑 Hash almacenado:', user.password_hash);
    console.log('🔐 Contraseña ingresada:', password);

    // Verificar con bcrypt
    const passwordValida = await bcrypt.compare(password, user.password_hash);
    console.log('🔍 Resultado de bcrypt.compare:', passwordValida);

    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta para usuario:', usuario);
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    let rol = user.rol;
    if (usuario.endsWith('@doc.emi.edu.bo')) rol = 'Docente';

    const token = jwt.sign(
      { id: user.id_usuario, rol, nombre: user.nombres + ' ' + user.apellidos },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    console.log('✅ Login exitoso para usuario:', usuario);
    res.json({
      token,
      usuario: {
        id: user.id_usuario,
        nombre: user.nombres + ' ' + user.apellidos,
        rol,
        email: user.correo,
        docenteId: user.docente_id || null,
      }
    });
  } catch (err) {
    console.error('💥 ERROR EN LOGIN:', err);
    res.status(500).json({ error: 'Error del servidor', detalle: err.message });
  }
});

module.exports = router;