const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { periodo_academico, datos_horario } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO horarios (periodo_academico, datos_horario, estado) VALUES ($1, $2, $3) RETURNING *',
      [periodo_academico, JSON.stringify(datos_horario), 'pendiente']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/ultimo', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM horarios ORDER BY creado_en DESC LIMIT 1'
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id/aprobar', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE horarios SET estado=$1, aprobado_en=NOW() WHERE id=$2 RETURNING *',
      ['aprobado', req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;