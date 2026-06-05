const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/activa', async (req, res) => {
  try {
    const gestion = await pool.query(
      "SELECT * FROM gestiones WHERE estado = 'activa' ORDER BY creado_en DESC LIMIT 1"
    );
    if (!gestion.rows[0]) return res.json(null);
    const g = gestion.rows[0];
    const versiones = await pool.query(
      `SELECT v.*, 
        COALESCE(json_agg(
          json_build_object('id',o.id,'texto',o.texto,'usuario_nombre',o.usuario_nombre,'usuario_rol',o.usuario_rol,'fecha',o.fecha)
          ORDER BY o.fecha DESC
        ) FILTER (WHERE o.id IS NOT NULL), '[]') as observaciones
       FROM versiones_horario v
       LEFT JOIN observaciones_version o ON o.version_id = v.id
       WHERE v.gestion_id = $1
       GROUP BY v.id
       ORDER BY v.version_numero DESC`,
      [g.id]
    );
    res.json({ ...g, versiones: versiones.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/todas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gestiones ORDER BY creado_en DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gestiones ORDER BY creado_en DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/versiones', async (req, res) => {
  const { datos_horario, generado_por } = req.body;
  try {
    const gestion = await pool.query(
      "SELECT * FROM gestiones WHERE estado = 'activa' ORDER BY creado_en DESC LIMIT 1"
    );
    if (!gestion.rows[0]) return res.status(400).json({ error: 'No hay gestión activa' });
    const g = gestion.rows[0];
    const ultimaVersion = await pool.query(
      'SELECT MAX(version_numero) as max FROM versiones_horario WHERE gestion_id = $1',
      [g.id]
    );
    const nuevaVersion = (ultimaVersion.rows[0].max || 0) + 1;
    const result = await pool.query(
      `INSERT INTO versiones_horario (gestion_id, version_numero, datos_horario, generado_por, estado)
       VALUES ($1,$2,$3,$4,'pendiente') RETURNING *`,
      [g.id, nuevaVersion, JSON.stringify(datos_horario), generado_por]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/versiones/:id/aprobar', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE versiones_horario SET estado='aprobado', aprobado_en=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/versiones/:id/observaciones', async (req, res) => {
  const { texto, usuario_nombre, usuario_rol } = req.body;
  try {
    const version = await pool.query(
      'SELECT gestion_id FROM versiones_horario WHERE id = $1', [req.params.id]
    );
    if (!version.rows[0]) return res.status(404).json({ error: 'Versión no encontrada' });
    const result = await pool.query(
      `INSERT INTO observaciones_version (version_id, gestion_id, texto, usuario_nombre, usuario_rol)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.id, version.rows[0].gestion_id, texto, usuario_nombre, usuario_rol]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/versiones/ultima', async (req, res) => {
  try {
    const gestion = await pool.query(
      "SELECT * FROM gestiones WHERE estado = 'activa' ORDER BY creado_en DESC LIMIT 1"
    );
    if (!gestion.rows[0]) return res.json(null);
    const result = await pool.query(
      `SELECT * FROM versiones_horario WHERE gestion_id=$1 ORDER BY version_numero DESC LIMIT 1`,
      [gestion.rows[0].id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;