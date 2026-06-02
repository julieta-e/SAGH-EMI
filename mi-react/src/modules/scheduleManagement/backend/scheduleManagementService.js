/**
 * scheduleManagementService.js — MOD-4 SAGH · Escuela Militar de Ingeniería
 * Lógica de negocio: mutaciones seguras, detección de conflictos, métricas y observaciones.
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

export function reassignAulaToSemestre(grupos, aulaId, semestre) {
  return grupos.map(g => {
    if (g.semestre === semestre) return { ...g, aulaFijaId: aulaId };
    if (g.aulaFijaId === aulaId) return { ...g, aulaFijaId: '' };
    return g;
  });
}

export function crearObservacion({ texto, autor, rolAutor, vista, semestre }) {
  return {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    texto: texto.trim(),
    autor,
    rolAutor,
    vista,
    semestre: semestre ?? null,
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  };
}

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

export const SCHEDULE_MANAGEMENT_POSTGRES_NOTES = {
  tables: ['horarios', 'horario_celdas', 'horario_versiones', 'horario_observaciones'],
  statuses: ['pendiente', 'aprobado', 'observado'],
};