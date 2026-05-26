/**
 * scheduleManagementService.js — MOD-4 SAGH · Escuela Militar de Ingeniería
 * Lógica de negocio: mutaciones seguras, detección de conflictos y métricas.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Mutaciones de Horario ────────────────────────────────────────────────────

/**
 * Modifica de forma segura una celda específica dentro de la matriz del horario.
 * Implementa clonación profunda defensiva para evitar mutaciones directas.
 */
export function updateScheduleCell(horario, semestre, dia, periodo, patch) {
  const next = structuredClone(horario || {});
  if (!next[semestre]) next[semestre] = {};
  if (!next[semestre][dia]) next[semestre][dia] = {};
  next[semestre][dia][periodo] = next[semestre][dia][periodo]
    ? { ...next[semestre][dia][periodo], ...patch }
    : { ...patch };
  return next;
}

/**
 * Limpia la asignación de una celda garantizando la integridad estructural.
 */
export function clearScheduleCell(horario, semestre, dia, periodo) {
  const next = structuredClone(horario || {});
  if (next[semestre]?.[dia]?.[periodo]) {
    next[semestre][dia][periodo] = null;
  }
  return next;
}

/**
 * Intercambia dos celdas del horario de forma segura (sin mutación directa).
 */
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

/**
 * Reasigna docente y/o aula a una celda específica del horario.
 */
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

// ─── Detección de Conflictos ──────────────────────────────────────────────────

/**
 * Detecta todos los conflictos del horario:
 *   - doc:             Mismo docente asignado dos veces en el mismo día/período
 *   - aula:            Misma aula usada dos veces en el mismo día/período
 *   - disponibilidad:  Docente asignado en día no disponible
 *   - capacidad:       Aula con menor aforo que el número de estudiantes del grupo
 */
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

        // Tracking cruce docente
        if (c.docenteId) {
          const kd = `${c.docenteId}-${d}-${p}`;
          if (!docUsage[kd]) docUsage[kd] = [];
          docUsage[kd].push({ sem, d, p });
        }

        // Tracking cruce aula
        if (c.aulaId) {
          const ka = `${c.aulaId}-${d}-${p}`;
          if (!aulaUsage[ka]) aulaUsage[ka] = [];
          aulaUsage[ka].push({ sem, d, p });
        }

        // Disponibilidad docente
        const doc = (docentes || []).find(doc => doc.id === c.docenteId);
        if (doc?.disponibilidad && !doc.disponibilidad.includes(d)) {
          lista.push({ tipo: 'disponibilidad', sem, dia: d, periodo: p, msg: 'Doc. Indisponible' });
        }

        // Capacidad de aula
        if (c.aulaId && grupo) {
          const aula = (aulas || []).find(a => a.id === c.aulaId);
          if (aula && aula.capacidad < grupo.numEstudiantes) {
            lista.push({ tipo: 'capacidad', sem, dia: d, periodo: p, msg: 'Capacidad Insuficiente' });
          }
        }
      }
    }
  });

  // Cruces docente
  Object.values(docUsage).forEach(usages => {
    if (usages.length > 1) {
      usages.forEach(u => {
        if (!lista.some(l => l.tipo === 'doc' && l.sem === u.sem && l.dia === u.d && l.periodo === u.p)) {
          lista.push({ tipo: 'doc', sem: u.sem, dia: u.d, periodo: u.p, msg: 'Cruce Docente' });
        }
      });
    }
  });

  // Cruces aula
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

/**
 * Calcula el total de períodos semanales asignados por cada docente.
 */
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

/**
 * Calcula la ocupación de cada aula (períodos ocupados vs total posible).
 */
export function calculateAulaOccupancy(horario, aulas, SEMESTRES) {
  const semestres = SEMESTRES || Object.keys(horario || {}).map(Number);
  const totalSlots = 5 * 8; // días × períodos por semestre
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

// ─── Constantes de integración PostgreSQL ────────────────────────────────────
export const SCHEDULE_MANAGEMENT_POSTGRES_NOTES = {
  tables: ['horarios', 'horario_celdas', 'horario_versiones'],
  statuses: ['pendiente', 'aprobado', 'observado'],
};