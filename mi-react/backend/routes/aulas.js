const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_aula as id, numero_aula as nombre, tipo, capacidad, edificio, disponible FROM aulas ORDER BY numero_aula'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, tipo, capacidad, edificio, disponible } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO aulas (numero_aula, tipo, capacidad, edificio, disponible) VALUES ($1,$2,$3,$4,$5) RETURNING id_aula as id, numero_aula as nombre, tipo, capacidad, edificio, disponible',
      [nombre, tipo, capacidad, edificio, disponible ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, tipo, capacidad, edificio, disponible } = req.body;
  try {
    const result = await pool.query(
      'UPDATE aulas SET numero_aula=$1, tipo=$2, capacidad=$3, edificio=$4, disponible=$5 WHERE id_aula=$6 RETURNING id_aula as id, numero_aula as nombre, tipo, capacidad, edificio, disponible',
      [nombre, tipo, capacidad, edificio, disponible, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM aulas WHERE id_aula = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;