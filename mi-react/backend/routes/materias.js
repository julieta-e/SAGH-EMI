const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/materias — todas las materias activas con datos del docente
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id_materia          AS id,
        m.nombre,
        m.id_semestre         AS semestre,
        m.periodos,
        m.horas_semanales,
        m.creditos,
        m.horas_teoria,
        m.horas_practica,
        m.horas_laboratorio,
        m.docente_id          AS "docenteId",
        m.tipo_aula           AS "tipoAula",
        m.critica,
        m.estado,
        d.nombre              AS "docenteNombre"
      FROM materias m
      LEFT JOIN docentes d ON d.id = m.docente_id
      WHERE m.estado = true
      ORDER BY m.id_semestre, m.nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('[materias GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/materias — crear materia
router.post('/', async (req, res) => {
  const {
    nombre, semestre, periodos, horas_teoria, horas_practica,
    horas_laboratorio, docente_id, tipo_aula, critica,
    horas_semanales, creditos,
  } = req.body;

  // tipo_aula se deduce automáticamente si no viene
  const tipoAulaFinal = tipo_aula ||
    (horas_laboratorio > 0 ? 'Laboratorio' : 'Aula');

  try {
    const result = await pool.query(`
      INSERT INTO materias
        (nombre, id_semestre, periodos, horas_teoria, horas_practica,
         horas_laboratorio, docente_id, tipo_aula, critica, estado,
         horas_semanales, creditos)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11)
      RETURNING
        id_materia AS id, nombre, id_semestre AS semestre, periodos,
        horas_teoria, horas_practica, horas_laboratorio,
        docente_id AS "docenteId", tipo_aula AS "tipoAula", critica, estado
    `, [
      nombre,
      semestre,
      periodos           || 0,
      horas_teoria       || 0,
      horas_practica     || 0,
      horas_laboratorio  || 0,
      docente_id         || null,
      tipoAulaFinal,
      critica            ?? false,
      horas_semanales    || periodos || 0,
      creditos           || 0,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[materias POST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/materias/:id — editar materia
router.put('/:id', async (req, res) => {
  const {
    nombre, semestre, periodos, horas_teoria, horas_practica,
    horas_laboratorio, docente_id, tipo_aula, critica, horas_semanales, creditos,
  } = req.body;

  const tipoAulaFinal = tipo_aula ||
    (horas_laboratorio > 0 ? 'Laboratorio' : 'Aula');

  try {
    const result = await pool.query(`
      UPDATE materias SET
        nombre             = $1,
        id_semestre        = $2,
        periodos           = $3,
        horas_teoria       = $4,
        horas_practica     = $5,
        horas_laboratorio  = $6,
        docente_id         = $7,
        tipo_aula          = $8,
        critica            = $9,
        horas_semanales    = $10,
        creditos           = $11
      WHERE id_materia = $12
      RETURNING
        id_materia AS id, nombre, id_semestre AS semestre, periodos,
        horas_teoria, horas_practica, horas_laboratorio,
        docente_id AS "docenteId", tipo_aula AS "tipoAula", critica, estado
    `, [
      nombre,
      semestre,
      periodos           || 0,
      horas_teoria       || 0,
      horas_practica     || 0,
      horas_laboratorio  || 0,
      docente_id         || null,
      tipoAulaFinal,
      critica            ?? false,
      horas_semanales    || periodos || 0,
      creditos           || 0,
      req.params.id,
    ]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Materia no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[materias PUT]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/materias/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE materias SET estado = false WHERE id_materia = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[materias DELETE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;