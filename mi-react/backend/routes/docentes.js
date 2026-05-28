const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM docentes WHERE activo = true ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, tipo, especialidad, email, max_horas, min_horas, disponibilidad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO docentes (nombre, tipo, especialidad, email, max_horas, min_horas, disponibilidad, activo) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *',
      [nombre, tipo, especialidad, email, max_horas ?? 25, min_horas ?? 10, JSON.stringify(disponibilidad ?? [0,1,2,3,4])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, tipo, especialidad, email, max_horas, min_horas, disponibilidad, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE docentes SET nombre=$1, tipo=$2, especialidad=$3, email=$4, max_horas=$5, min_horas=$6, disponibilidad=$7, activo=$8 WHERE id=$9 RETURNING *',
      [nombre, tipo, especialidad, email, max_horas, min_horas, JSON.stringify(disponibilidad), activo, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE docentes SET activo = false WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;