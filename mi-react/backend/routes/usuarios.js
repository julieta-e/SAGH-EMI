const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_usuario as id, nombres, apellidos, username as usuario, rol, correo as email, estado as activo FROM usuarios ORDER BY nombres'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombres, apellidos, ci, email, usuario, password, rol } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombres, apellidos, ci, correo, username, password_hash, rol, estado) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *',
      [nombres, apellidos, ci, email, usuario, password, rol]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombres, apellidos, rol, email, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombres=$1, apellidos=$2, rol=$3, correo=$4, estado=$5 WHERE id_usuario=$6 RETURNING *',
      [nombres, apellidos, rol, email, activo, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM usuarios WHERE id_usuario = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;