const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_materia as id, nombre, id_semestre as semestre, periodos, docente_id, tipo_aula, critica FROM materias ORDER BY id_semestre, nombre'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, semestre, periodos, docente_id, tipo_aula, critica } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO materias (nombre, id_semestre, periodos, docente_id, tipo_aula, critica) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_materia as id, nombre, id_semestre as semestre, periodos, docente_id, tipo_aula, critica',
      [nombre, semestre, periodos, docente_id, tipo_aula, critica ?? false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, semestre, periodos, docente_id, tipo_aula, critica } = req.body;
  try {
    const result = await pool.query(
      'UPDATE materias SET nombre=$1, id_semestre=$2, periodos=$3, docente_id=$4, tipo_aula=$5, critica=$6 WHERE id_materia=$7 RETURNING id_materia as id, nombre, id_semestre as semestre, periodos, docente_id, tipo_aula, critica',
      [nombre, semestre, periodos, docente_id, tipo_aula, critica, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM materias WHERE id_materia = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;