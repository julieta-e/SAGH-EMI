const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM observaciones ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/:semestre', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM observaciones WHERE semestre = $1 ORDER BY fecha DESC',
      [req.params.semestre]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { semestre, texto, usuario_nombre, usuario_rol } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO observaciones (semestre, texto, usuario_nombre, usuario_rol) VALUES ($1,$2,$3,$4) RETURNING *',
      [semestre, texto, usuario_nombre, usuario_rol]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;