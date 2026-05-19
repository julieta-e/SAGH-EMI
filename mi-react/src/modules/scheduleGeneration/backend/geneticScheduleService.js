// Valores propios a confirmar mediante indagacion institucional:
// gestion academica activa, jornada diaria, cantidad de generaciones,
// pesos de calidad, reglas RAC aplicables y prioridades por materia.
export const SCHEDULE_GENERATION_CONFIG = {
  academicPeriod: '2026-I',
  activeSemesters: [3, 4, 5, 6, 7, 8, 9, 10],
  daysPerWeek: 5,
  periodsPerDay: 8,
  periodDurationMinutes: 45,
  automaticBreakMinutes: 15,
  automaticBreakEveryPeriods: 3,
  populationSize: 40,
  generations: 80,
  mutationRate: 0.08,
  qualityWeights: {
    hardConflicts: 1000,
    weeklyHours: 400,
    teacherBalance: 70,
    continuity: 45,
    fragmentation: 35,
    criticalSubjectPriority: 25,
  },
};

export function defineAcademicPeriod(periodo = SCHEDULE_GENERATION_CONFIG.academicPeriod) {
  return { id: periodo, nombre: periodo, activo: true };
}

export function configureWeeklyBlocks(config = SCHEDULE_GENERATION_CONFIG) {
  const slots = [];
  for (let day = 0; day < config.daysPerWeek; day++) {
    for (let period = 0; period < config.periodsPerDay; period++) {
      slots.push({ day, period, durationMinutes: config.periodDurationMinutes });
    }
  }
  return slots;
}

export function defineAutomaticBreaks(config = SCHEDULE_GENERATION_CONFIG) {
  return Array.from({ length: Math.floor(config.periodsPerDay / config.automaticBreakEveryPeriods) }, (_, i) => ({
    afterPeriod: (i + 1) * config.automaticBreakEveryPeriods,
    durationMinutes: config.automaticBreakMinutes,
  }));
}

export const generarHorarios = (materias, docentes, aulas) => {
  const horario = {};
  const ocupacionDocentes = {};
  const horasDocentes = {};
  const ocupacionAulas = {};
  const docentesById = new Map(docentes.map((docente) => [docente.id, docente]));

  docentes.forEach(d => {
    horasDocentes[d.id] = 0;
    ocupacionDocentes[d.id] = Array(5).fill(null).map(() => Array(8).fill(false));
  });
  aulas.filter(a => a.disponible).forEach(a => {
    ocupacionAulas[a.id] = Array(5).fill(null).map(() => Array(8).fill(false));
  });

  const dividirEnBloques = (n) => {
    if (n === 2) return [2];
    if (n === 3) return [3];
    if (n === 4) return [2, 2];
    if (n === 5) return [3, 2];
    if (n === 6) return [3, 3];
    if (n === 7) return [3, 2, 2];
    if (n === 8) return [3, 3, 2];
    const res = []; let r = n;
    while (r > 0) {
      if (r === 1) { if (res.length > 0) res[res.length-1]++; else res.push(2); r = 0; }
      else if (r >= 3) { res.push(3); r -= 3; }
      else { res.push(2); r -= 2; }
    }
    return res;
  };

  const semestres = SCHEDULE_GENERATION_CONFIG.activeSemesters;
  semestres.forEach(sem => {
    horario[sem] = Array(5).fill(null).map(() => Array(8).fill(null));
    const materiasSem = materias.filter(m => m.semestre === sem && docentesById.has(m.docenteId));

    const puedeColocar = (mat, dia, pInicio, tam) => {
      if (!ocupacionDocentes[mat.docenteId]) return false;
      const maxH = docentesById.get(mat.docenteId)?.maxHoras || 25;
      if (pInicio + tam > 8) return false;
      if (horasDocentes[mat.docenteId] + tam > maxH) return false;
      for (let p = pInicio; p < pInicio + tam; p++) {
        if (horario[sem][dia][p] !== null) return false;
        if (ocupacionDocentes[mat.docenteId][dia][p]) return false;
      }
      return true;
    };

    const colocar = (mat, dia, pInicio, tam) => {
      const idxs = Array.from({length: tam}, (_,i) => pInicio + i);
      const aula = aulas.find(a =>
        a.disponible &&
        (a.tipo === mat.tipoAula || !mat.tipoAula) &&
        idxs.every(p => !ocupacionAulas[a.id]?.[dia]?.[p])
      ) || null;
      for (let p = pInicio; p < pInicio + tam; p++) {
        horario[sem][dia][p] = { ...mat, aulaId: aula?.id || null };
        if (ocupacionDocentes[mat.docenteId]) ocupacionDocentes[mat.docenteId][dia][p] = true;
        if (aula) ocupacionAulas[aula.id][dia][p] = true;
        horasDocentes[mat.docenteId] = (horasDocentes[mat.docenteId] || 0) + 1;
      }
    };

    const bloquesPendientes = [];
    // Preclasificación: materias críticas primero (HU-41)
    const materiasOrdenadas = [...materiasSem].sort((a, b) => (b.critica ? 1 : 0) - (a.critica ? 1 : 0));
    materiasOrdenadas.forEach(m => {
      dividirEnBloques(m.periodos).forEach(tam => bloquesPendientes.push({ mat: m, tam }));
    });
    bloquesPendientes.sort((a, b) => b.tam - a.tam);

    let lunesOk = false;
    for (let i = 0; i < bloquesPendientes.length && !lunesOk; i++) {
      const { mat, tam } = bloquesPendientes[i];
      if (puedeColocar(mat, 0, 0, tam)) {
        colocar(mat, 0, 0, tam);
        bloquesPendientes.splice(i, 1);
        lunesOk = true;
      }
    }

    bloquesPendientes.forEach(({ mat, tam }) => {
      const diasOcupados = new Set();
      for (let d = 0; d < 5; d++)
        for (let p = 0; p < 8; p++)
          if (horario[sem][d][p]?.id === mat.id) diasOcupados.add(d);

      const ordenDias = [0,1,2,3,4].sort((a,b) => (diasOcupados.has(a)?1:0) - (diasOcupados.has(b)?1:0));
      let asignado = false;
      for (const dia of ordenDias) {
        if (asignado) break;
        for (let pInicio = 0; pInicio <= 8 - tam && !asignado; pInicio++) {
          if (puedeColocar(mat, dia, pInicio, tam)) {
            colocar(mat, dia, pInicio, tam);
            asignado = true;
          }
        }
      }
    });
  });

  return { horario, horasDocentes };
};

export function evaluateScheduleQuality({ horario, materias = [], docentes = [], aulas = [] }) {
  if (!horario) return { score: 0, metrics: {} };
  const metrics = { hardConflicts: 0, assignedPeriods: 0, fragmentation: 0, continuity: 0, criticalAssigned: 0 };
  const teacherBusy = {};
  const classroomBusy = {};
  const groupBusy = {};

  Object.entries(horario).forEach(([semestre, days]) => {
    days.forEach((periods, day) => {
      periods.forEach((cell, period) => {
        if (!cell) return;
        metrics.assignedPeriods += 1;
        if (cell.critica) metrics.criticalAssigned += 1;
        const teacherKey = `${cell.docenteId}-${day}-${period}`;
        const classroomKey = `${cell.aulaId}-${day}-${period}`;
        const groupKey = `${semestre}-${day}-${period}`;
        if (teacherBusy[teacherKey] || classroomBusy[classroomKey] || groupBusy[groupKey]) metrics.hardConflicts += 1;
        teacherBusy[teacherKey] = true;
        classroomBusy[classroomKey] = true;
        groupBusy[groupKey] = true;
        if (period > 0 && periods[period - 1]?.id === cell.id) metrics.continuity += 1;
        if (period > 0 && periods[period - 1] && periods[period - 1]?.id !== cell.id) metrics.fragmentation += 1;
      });
    });
  });

  const requiredPeriods = materias.reduce((sum, m) => sum + Number(m.periodos || 0), 0);
  const teacherLoads = docentes.map((d) => Object.keys(teacherBusy).filter((key) => key.startsWith(`${d.id}-`)).length);
  const averageLoad = teacherLoads.length ? teacherLoads.reduce((a, b) => a + b, 0) / teacherLoads.length : 0;
  const balancePenalty = teacherLoads.reduce((sum, load) => sum + Math.abs(load - averageLoad), 0);
  const w = SCHEDULE_GENERATION_CONFIG.qualityWeights;
  const score =
    metrics.assignedPeriods * 10 +
    metrics.criticalAssigned * w.criticalSubjectPriority +
    metrics.continuity * w.continuity -
    metrics.fragmentation * w.fragmentation -
    metrics.hardConflicts * w.hardConflicts -
    Math.abs(requiredPeriods - metrics.assignedPeriods) * w.weeklyHours -
    balancePenalty * w.teacherBalance;

  return { score, metrics: { ...metrics, requiredPeriods, balancePenalty, aulasEvaluadas: aulas.length } };
}

export function selectBestGeneratedSolution(solutions) {
  return [...solutions].sort((a, b) => b.quality.score - a.quality.score)[0] || null;
}

export const SCHEDULE_GENERATION_POSTGRES_NOTES = {
  tables: ['periodos_academicos', 'bloques_horarios', 'recesos', 'restricciones', 'horarios_generados'],
  requiredInputs: ['docentes', 'materias', 'aulas', 'grupos', 'disponibilidad_docente', 'aula_fija_por_grupo'],
};

