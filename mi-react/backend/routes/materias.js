const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        m.id_materia as id,
        m.nombre,
        m.id_semestre as semestre,
        m.periodos,
        m.horas_teoria,
        m.horas_practica,
        m.horas_laboratorio,
        m.docente_id,
        m.tipo_aula,
        m.critica,
        m.estado,
        d.nombre as docente_nombre
       FROM materias m
       LEFT JOIN docentes d ON d.id = m.docente_id
       WHERE m.estado = true
       ORDER BY m.id_semestre, m.nombre`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, semestre, periodos, horas_teoria, horas_practica, horas_laboratorio, docente_id, tipo_aula, critica } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO materias (nombre, id_semestre, periodos, horas_teoria, horas_practica, horas_laboratorio, docente_id, tipo_aula, critica, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
       RETURNING id_materia as id, nombre, id_semestre as semestre, periodos, horas_teoria, horas_practica, horas_laboratorio, docente_id, tipo_aula, critica`,
      [nombre, semestre, periodos, horas_teoria||0, horas_practica||0, horas_laboratorio||0, docente_id, tipo_aula, critica ?? false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, semestre, periodos, horas_teoria, horas_practica, horas_laboratorio, docente_id, tipo_aula, critica } = req.body;
  try {
    const result = await pool.query(
      `UPDATE materias SET nombre=$1, id_semestre=$2, periodos=$3, horas_teoria=$4, horas_practica=$5, horas_laboratorio=$6, docente_id=$7, tipo_aula=$8, critica=$9
       WHERE id_materia=$10
       RETURNING id_materia as id, nombre, id_semestre as semestre, periodos, horas_teoria, horas_practica, horas_laboratorio, docente_id, tipo_aula, critica`,
      [nombre, semestre, periodos, horas_teoria||0, horas_practica||0, horas_laboratorio||0, docente_id, tipo_aula, critica, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE materias SET estado = false WHERE id_materia = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;