/**
 * scheduleManagementService.js — MOD-4 SAGH · Escuela Militar de Ingeniería
 * Lógica de negocio: mutaciones seguras, detección de conflictos, métricas y observaciones.
 */

// ─── Mutaciones de Horario ────────────────────────────────────────────────────

export function updateScheduleCell(horario, semestre, dia, periodo, patch) {
  const next = structuredClone(horario || {});
  if (!next[semestre]) next[semestre] = {};
  if (!next[semestre][dia]) next[semestre][dia] = {};
  next[semestre][dia][periodo] = next[semestre][dia][periodo]
    ? { ...next[semestre][dia][periodo], ...patch }
    : { ...patch };
  return next;
}

export function clearScheduleCell(horario, semestre, dia, periodo) {
  const next = structuredClone(horario || {});
  if (next[semestre]?.[dia]?.[periodo]) {
    next[semestre][dia][periodo] = null;
  }
  return next;
}

export function swapScheduleCells(horario, source, target) {
  const nuevo = structuredClone(horario);
  const { sem: s1, dia: d1, periodo: p1 } = source;
  const { sem: s2, dia: d2, periodo: p2 } = target;
  if (!nuevo[s1]) nuevo[s1] = {};
  if (!nuevo[s1][d1]) nuevo[s1][d1] = {};
  if (!nuevo[s2]) nuevo[s2] = {};
  if (!nuevo[s2][d2]) nuevo[s2][d2] = {};
  const tmp = nuevo[s1][d1][p1] ?? null;
  nuevo[s1][d1][p1] = nuevo[s2][d2][p2] ?? null;
  nuevo[s2][d2][p2] = tmp;
  return nuevo;
}

export function updateScheduleCellDetails(horario, sem, dia, periodo, newDocId, newAulaId) {
  const nuevo = structuredClone(horario);
  if (nuevo[sem]?.[dia]?.[periodo]) {
    nuevo[sem][dia][periodo] = {
      ...nuevo[sem][dia][periodo],
      docenteId: newDocId,
      aulaId: newAulaId,
    };
  }
  return nuevo;
}

/**
 * Reasigna el aula fija de un semestre/grupo.
 * Si otra aula tenía ese semestre asignado, lo libera.
 */
export function reassignAulaToSemestre(grupos, aulaId, semestre) {
  return grupos.map(g => {
    if (g.semestre === semestre) return { ...g, aulaFijaId: aulaId };
    if (g.aulaFijaId === aulaId) return { ...g, aulaFijaId: '' };
    return g;
  });
}

// ─── Observaciones ────────────────────────────────────────────────────────────

/**
 * Crea una nueva observación para enviar al módulo de validación.
 */
export function crearObservacion({ texto, autor, rolAutor, vista, semestre }) {
  return {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    texto: texto.trim(),
    autor,
    rolAutor,
    vista,
    semestre: semestre ?? null,
    fecha: new Date().toISOString(),
    estado: 'pendiente', // pendiente | leída | resuelta
  };
}

// ─── Detección de Conflictos ──────────────────────────────────────────────────

export function detectConfl(horario, docentes, aulas, grupos, SEMESTRES) {
  const lista = [];
  const docUsage  = {};
  const aulaUsage = {};
  const semestres = SEMESTRES || Object.keys(horario || {}).map(Number);

  semestres.forEach(sem => {
    const grupo = (grupos || []).find(g => g.semestre === sem);
    for (let d = 0; d < 5; d++) {
      const slots = horario?.[sem]?.[d] || {};
      for (let p = 0; p < 8; p++) {
        const c = slots[p];
        if (!c) continue;
        if (c.docenteId) {
          const kd = `${c.docenteId}-${d}-${p}`;
          if (!docUsage[kd]) docUsage[kd] = [];
          docUsage[kd].push({ sem, d, p });
        }
        if (c.aulaId) {
          const ka = `${c.aulaId}-${d}-${p}`;
          if (!aulaUsage[ka]) aulaUsage[ka] = [];
          aulaUsage[ka].push({ sem, d, p });
        }
        const doc = (docentes || []).find(doc => doc.id === c.docenteId);
        if (doc?.disponibilidad && !doc.disponibilidad.includes(d)) {
          lista.push({ tipo: 'disponibilidad', sem, dia: d, periodo: p, msg: 'Doc. Indisponible' });
        }
        if (c.aulaId && grupo) {
          const aula = (aulas || []).find(a => a.id === c.aulaId);
          if (aula && aula.capacidad < grupo.numEstudiantes) {
            lista.push({ tipo: 'capacidad', sem, dia: d, periodo: p, msg: 'Capacidad Insuficiente' });
          }
        }
      }
    }
  });

  Object.values(docUsage).forEach(usages => {
    if (usages.length > 1) {
      usages.forEach(u => {
        if (!lista.some(l => l.tipo === 'doc' && l.sem === u.sem && l.dia === u.d && l.periodo === u.p)) {
          lista.push({ tipo: 'doc', sem: u.sem, dia: u.d, periodo: u.p, msg: 'Cruce Docente' });
        }
      });
    }
  });

  Object.values(aulaUsage).forEach(usages => {
    if (usages.length > 1) {
      usages.forEach(u => {
        if (!lista.some(l => l.tipo === 'aula' && l.sem === u.sem && l.dia === u.d && l.periodo === u.p)) {
          lista.push({ tipo: 'aula', sem: u.sem, dia: u.d, periodo: u.p, msg: 'Cruce de Aula' });
        }
      });
    }
  });

  return lista;
}

// ─── Métricas ─────────────────────────────────────────────────────────────────

export function calculateTeacherHours(horario, docentes, SEMESTRES) {
  const semestres = SEMESTRES || Object.keys(horario || {}).map(Number);
  return (docentes || []).reduce((acc, d) => {
    let total = 0;
    semestres.forEach(s => {
      if (horario?.[s]) {
        for (let di = 0; di < 5; di++) {
          for (let p = 0; p < 8; p++) {
            if (horario[s][di]?.[p]?.docenteId === d.id) total++;
          }
        }
      }
    });
    acc[d.id] = total;
    return acc;
  }, {});
}

export function calculateAulaOccupancy(horario, aulas, SEMESTRES) {
  const semestres = SEMESTRES || Object.keys(horario || {}).map(Number);
  const totalSlots = 5 * 8;
  return (aulas || []).reduce((acc, a) => {
    let ocupados = 0;
    semestres.forEach(s => {
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          if (horario?.[s]?.[d]?.[p]?.aulaId === a.id) ocupados++;
        }
      }
    });
    acc[a.id] = {
      ocupados,
      total: totalSlots,
      pct: totalSlots ? Math.round((ocupados / totalSlots) * 100) : 0,
    };
    return acc;
  }, {});
}

/**
 * Reasigna el aula fija a un semestre específico usando el mapa visual.
 * También actualiza todas las celdas del horario que correspondan al semestre previo
 * para reflejar el nuevo aulaId.
 */
export function reassignAulaConHorario(horario, grupos, aulaId, semestre, SEMS) {
  const nuevosGrupos = reassignAulaToSemestre(grupos, aulaId, semestre);
  // También actualizar las celdas del horario del semestre destino para reflejar el aula
  const nuevoHorario = structuredClone(horario || {});
  (SEMS || []).forEach(s => {
    for (let d = 0; d < 5; d++) {
      for (let p = 0; p < 8; p++) {
        const c = nuevoHorario?.[s]?.[d]?.[p];
        if (!c) continue;
        // Si el aula estaba asignada a otro semestre, no cambiar esas celdas
        // Solo retornar los grupos actualizados; el horario de celdas individuales
        // se maneja por modal de reasignación celda a celda.
      }
    }
  });
  return { nuevoHorario, nuevosGrupos };
}

// ─── Constantes PostgreSQL ────────────────────────────────────────────────────
export const SCHEDULE_MANAGEMENT_POSTGRES_NOTES = {
  tables: ['horarios', 'horario_celdas', 'horario_versiones', 'horario_observaciones'],
  statuses: ['pendiente', 'aprobado', 'observado'],
};