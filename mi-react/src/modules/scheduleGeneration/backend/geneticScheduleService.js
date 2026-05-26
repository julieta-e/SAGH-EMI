// ============================================================
// SERVICIO DE GENERACIÓN DE HORARIOS — ALGORITMO GENÉTICO REAL
// Escuela Militar de Ingeniería · Ing. de Sistemas
// ============================================================

export const SCHEDULE_GENERATION_CONFIG = {
  academicPeriod: '2026-I',
  activeSemesters: [3, 4, 5, 6, 7, 8, 9, 10],
  daysPerWeek: 5,
  periodsPerDay: 8,
  periodDurationMinutes: 45,
  automaticBreakMinutes: 15,
  automaticBreakEveryPeriods: 3,
  // Parámetros del AG
  populationSize: 50,
  generations: 200,
  mutationRate: 0.05,
  crossoverRate: 0.8,
  tournamentSize: 5,
  eliteCount: 2, // mejores individuos que pasan sin cambios
  qualityWeights: {
    hardConflicts: 1000,      // conflicto docente/aula/grupo simultáneo
    weeklyHours: 400,         // periodos sin asignar
    teacherBalance: 70,       // desequilibrio de carga entre docentes
    continuity: 45,           // bloques continuos (positivo)
    fragmentation: 35,        // fragmentación (negativo)
    criticalSubjectPriority: 25, // materia crítica asignada (positivo)
    rac03Lunes: 200,          // incumplimiento Lunes 07:45
    aulaType: 150,            // tipo de aula incorrecto
  },
};

// ── Utilidades ────────────────────────────────────────────────────────────────

const SEMESTRES = SCHEDULE_GENERATION_CONFIG.activeSemesters;
const DAYS = 5;
const PERIODS = 8;

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dividirEnBloques(n) {
  if (n <= 1) return [1];
  if (n === 2) return [2];
  if (n === 3) return [3];
  if (n === 4) return [2, 2];
  if (n === 5) return [3, 2];
  if (n === 6) return [3, 3];
  if (n === 7) return [3, 2, 2];
  if (n === 8) return [3, 3, 2];
  const res = []; let r = n;
  while (r > 0) {
    if (r === 1) { res.length > 0 ? res[res.length - 1]++ : res.push(2); r = 0; }
    else if (r >= 3) { res.push(3); r -= 3; }
    else { res.push(2); r -= 2; }
  }
  return res;
}

// ── Cromosoma ─────────────────────────────────────────────────────────────────
// Estructura: { [semestre]: [ [periodo0..7], [periodo0..7] x5 días ] }
// Cada celda: null | { id, nombre, docenteId, aulaId, tipoAula, critica, semestre }

function crearCromosoma(materias, docentes, aulas, restricciones) {
  const horario = {};
  const ocupDoc = {};   // ocupDoc[docenteId][dia][periodo] = bool
  const ocupAula = {};  // ocupAula[aulaId][dia][periodo] = bool
  const horasDoc = {};

  docentes.forEach(d => {
    ocupDoc[d.id] = Array.from({ length: DAYS }, () => Array(PERIODS).fill(false));
    horasDoc[d.id] = 0;
  });
  aulas.filter(a => a.disponible).forEach(a => {
    ocupAula[a.id] = Array.from({ length: DAYS }, () => Array(PERIODS).fill(false));
  });

  SEMESTRES.forEach(sem => {
    horario[sem] = Array.from({ length: DAYS }, () => Array(PERIODS).fill(null));
  });

  // Ordenar materias: críticas primero, luego por periodos desc
  const materiasOrdenadas = [...materias].sort((a, b) => {
    if (restricciones.criticas) {
      if (b.critica !== a.critica) return (b.critica ? 1 : 0) - (a.critica ? 1 : 0);
    }
    return (b.periodos || 0) - (a.periodos || 0);
  });

  // Construir lista de bloques a colocar
  const bloques = [];
  materiasOrdenadas.forEach(mat => {
    const doc = docentes.find(d => d.id === mat.docenteId);
    if (!doc) return;
    dividirEnBloques(Number(mat.periodos) || 2).forEach(tam => {
      bloques.push({ mat: { ...mat, semestre: mat.semestre }, tam, doc });
    });
  });

  // Mezclar aleatoriamente (componente genético) respetando prioridad crítica
  const criticos = bloques.filter(b => b.mat.critica);
  const normales = bloques.filter(b => !b.mat.critica).sort(() => Math.random() - 0.5);
  const ordenBloques = [...criticos, ...normales];

  // RAC-03: primer bloque del lunes debe tener clase si está activo
  let lunesOk = false;

  ordenBloques.forEach(({ mat, tam, doc }) => {
    const sem = mat.semestre;
    if (!horario[sem]) return;

    const maxH = doc.maxHoras || 25;

    const puedeColocar = (dia, pInicio) => {
      if (pInicio + tam > PERIODS) return false;
      // Restricción: no exceder horas máximas del docente
      if (restricciones.cargaHoras && horasDoc[doc.id] + tam > maxH) return false;
      for (let p = pInicio; p < pInicio + tam; p++) {
        if (horario[sem][dia][p] !== null) return false;
        // Restricción: disponibilidad docente
        if (restricciones.disponibilidad && ocupDoc[doc.id]?.[dia]?.[p]) return false;
      }
      return true;
    };

    const encontrarAula = (dia, pInicio) => {
      if (!restricciones.aulas) {
        // Sin restricción de aulas: cualquier aula disponible
        return aulas.find(a => a.disponible) || null;
      }
      return aulas.find(a =>
        a.disponible &&
        (!mat.tipoAula || a.tipo === mat.tipoAula) &&
        Array.from({ length: tam }, (_, i) => pInicio + i)
          .every(p => !ocupAula[a.id]?.[dia]?.[p])
      ) || null;
    };

    const colocar = (dia, pInicio) => {
      const aula = encontrarAula(dia, pInicio);
      for (let p = pInicio; p < pInicio + tam; p++) {
        horario[sem][dia][p] = {
          id: mat.id,
          nombre: mat.nombre,
          docenteId: doc.id,
          aulaId: aula?.id || null,
          tipoAula: mat.tipoAula || 'Aula',
          critica: mat.critica || false,
          semestre: sem,
        };
        if (ocupDoc[doc.id]) ocupDoc[doc.id][dia][p] = true;
        if (aula && ocupAula[aula.id]) ocupAula[aula.id][dia][p] = true;
        horasDoc[doc.id] = (horasDoc[doc.id] || 0) + 1;
      }
    };

    // RAC-03: intentar colocar algo el lunes a las 07:45 (periodo 0)
    if (restricciones.rac03 && !lunesOk) {
      if (puedeColocar(0, 0)) {
        colocar(0, 0);
        lunesOk = true;
        return;
      }
    }

    // Distribuir en días distintos si está activo
    const diasConMateria = new Set();
    for (let d = 0; d < DAYS; d++)
      for (let p = 0; p < PERIODS; p++)
        if (horario[sem][d][p]?.id === mat.id) diasConMateria.add(d);

    let diasOrden = [0, 1, 2, 3, 4];
    if (restricciones.distribucion) {
      diasOrden = [...diasOrden].sort((a, b) =>
        (diasConMateria.has(a) ? 1 : 0) - (diasConMateria.has(b) ? 1 : 0)
      );
    } else {
      diasOrden = diasOrden.sort(() => Math.random() - 0.5);
    }

    // Minimizar fragmentación: preferir periodos continuos
    const periodosOrden = restricciones.huecos
      ? [0, 3, 6, 1, 4, 2, 5].filter(p => p + tam <= PERIODS)
      : Array.from({ length: PERIODS - tam + 1 }, (_, i) => i).sort(() => Math.random() - 0.5);

    let asignado = false;
    for (const dia of diasOrden) {
      if (asignado) break;
      for (const pInicio of periodosOrden) {
        if (puedeColocar(dia, pInicio)) {
          colocar(dia, pInicio);
          asignado = true;
          break;
        }
      }
    }
  });

  return { horario, horasDoc };
}

// ── Función de fitness ────────────────────────────────────────────────────────

function calcularFitness(horario, materias, docentes, aulas, restricciones) {
  const w = SCHEDULE_GENERATION_CONFIG.qualityWeights;
  let score = 0;
  const docBusy = {};
  const aulaBusy = {};
  const grupoBusy = {};

  let conflictosDocente = 0;
  let conflictosAula = 0;
  let conflictosGrupo = 0;
  let continuidad = 0;
  let fragmentacion = 0;
  let criticasAsignadas = 0;
  let periodosAsignados = 0;
  let rac03Ok = false;
  let aulaTypeErrors = 0;

  SEMESTRES.forEach(sem => {
    const grid = horario[sem];
    if (!grid) return;

    // Verificar RAC-03: lunes 07:45 (periodo 0)
    if (restricciones.rac03 && grid[0][0] !== null) rac03Ok = true;

    for (let d = 0; d < DAYS; d++) {
      for (let p = 0; p < PERIODS; p++) {
        const cell = grid[d][p];
        if (!cell) continue;

        periodosAsignados++;
        if (cell.critica) criticasAsignadas++;

        // Conflicto docente simultáneo
        const dKey = `${cell.docenteId}-${d}-${p}`;
        if (docBusy[dKey]) conflictosDocente++;
        docBusy[dKey] = true;

        // Conflicto aula simultánea
        if (cell.aulaId) {
          const aKey = `${cell.aulaId}-${d}-${p}`;
          if (aulaBusy[aKey]) conflictosAula++;
          aulaBusy[aKey] = true;
        }

        // Conflicto grupo simultáneo
        const gKey = `${sem}-${d}-${p}`;
        if (grupoBusy[gKey]) conflictosGrupo++;
        grupoBusy[gKey] = true;

        // Tipo de aula incorrecto
        if (restricciones.aulas && cell.aulaId) {
          const aulaObj = aulas.find(a => a.id === cell.aulaId);
          if (aulaObj && cell.tipoAula && aulaObj.tipo !== cell.tipoAula) aulaTypeErrors++;
        }

        // Continuidad y fragmentación
        if (p > 0) {
          const prev = grid[d][p - 1];
          if (prev?.id === cell.id) continuidad++;
          else if (prev !== null) fragmentacion++;
        }
      }
    }
  });

  // Periodos requeridos vs asignados
  const periodosRequeridos = materias.reduce((s, m) => s + Number(m.periodos || 0), 0);
  const periodosFaltantes = Math.max(0, periodosRequeridos - periodosAsignados);

  // Balance de carga docente
  const cargas = docentes.map(d => {
    let cnt = 0;
    Object.values(docBusy).forEach(k => { /* ya contado */ });
    SEMESTRES.forEach(sem => {
      const grid = horario[sem];
      if (!grid) return;
      for (let d2 = 0; d2 < DAYS; d2++)
        for (let p = 0; p < PERIODS; p++)
          if (grid[d2][p]?.docenteId === d.id) cnt++;
    });
    return cnt;
  });
  const avgCarga = cargas.reduce((a, b) => a + b, 0) / (cargas.length || 1);
  const desbalance = cargas.reduce((s, c) => s + Math.abs(c - avgCarga), 0);

  // Calcular score
  score += periodosAsignados * 10;
  if (restricciones.criticas) score += criticasAsignadas * w.criticalSubjectPriority;
  if (restricciones.bloques) score += continuidad * w.continuity;
  if (restricciones.huecos) score -= fragmentacion * w.fragmentation;
  if (restricciones.disponibilidad) score -= conflictosDocente * w.hardConflicts;
  if (restricciones.aulas) score -= conflictosAula * w.hardConflicts;
  if (restricciones.grupos) score -= conflictosGrupo * w.hardConflicts;
  if (restricciones.cargaHoras) score -= periodosFaltantes * w.weeklyHours;
  if (restricciones.distribucion) score -= desbalance * w.teacherBalance;
  if (restricciones.rac03) score -= rac03Ok ? 0 : w.rac03Lunes;
  if (restricciones.aulas) score -= aulaTypeErrors * w.aulaType;

  return {
    score,
    metricas: {
      periodosAsignados,
      periodosRequeridos,
      periodosFaltantes,
      conflictosDocente,
      conflictosAula,
      conflictosGrupo,
      continuidad,
      fragmentacion,
      criticasAsignadas,
      rac03Ok,
      aulaTypeErrors,
      desbalance: Math.round(desbalance),
      equilibrio: Math.max(0, Math.round(100 - (desbalance / (docentes.length || 1)) * 5)),
    },
  };
}

// ── Operadores genéticos ──────────────────────────────────────────────────────

function cruce(padre, madre, materias, docentes, aulas, restricciones) {
  // Cruce por semestres: cada semestre se hereda de uno de los padres
  const hijoHorario = {};
  const hijoHorasDoc = {};

  SEMESTRES.forEach(sem => {
    const fuente = Math.random() < 0.5 ? padre : madre;
    hijoHorario[sem] = fuente.horario[sem].map(dia => [...dia]);
  });

  // Recalcular horas docentes
  docentes.forEach(d => { hijoHorasDoc[d.id] = 0; });
  SEMESTRES.forEach(sem => {
    hijoHorario[sem].forEach(dia => {
      dia.forEach(cell => {
        if (cell) hijoHorasDoc[cell.docenteId] = (hijoHorasDoc[cell.docenteId] || 0) + 1;
      });
    });
  });

  return { horario: hijoHorario, horasDoc: hijoHorasDoc };
}

function mutar(individuo, materias, docentes, aulas, restricciones) {
  const mutado = {
    horario: SEMESTRES.reduce((acc, sem) => {
      acc[sem] = individuo.horario[sem].map(dia => [...dia]);
      return acc;
    }, {}),
    horasDoc: { ...individuo.horasDoc },
  };

  // Mutar: intercambiar dos celdas aleatorias en un semestre aleatorio
  const sem = SEMESTRES[rng(0, SEMESTRES.length - 1)];
  const grid = mutado.horario[sem];
  const d1 = rng(0, DAYS - 1), p1 = rng(0, PERIODS - 1);
  const d2 = rng(0, DAYS - 1), p2 = rng(0, PERIODS - 1);

  const tmp = grid[d1][p1];
  grid[d1][p1] = grid[d2][p2];
  grid[d2][p2] = tmp;

  return mutado;
}

function seleccionTorneo(poblacion, fitnesses, k = 5) {
  let mejor = null;
  let mejorScore = -Infinity;
  for (let i = 0; i < k; i++) {
    const idx = rng(0, poblacion.length - 1);
    if (fitnesses[idx].score > mejorScore) {
      mejorScore = fitnesses[idx].score;
      mejor = idx;
    }
  }
  return poblacion[mejor];
}

// ── AG Principal ──────────────────────────────────────────────────────────────

export const generarHorarios = (materias, docentes, aulas, restricciones = {}) => {
  const restr = {
    disponibilidad: true,
    huecos: true,
    criticas: true,
    recesos: true,
    distribucion: true,
    bloques: true,
    rac03: true,
    aulas: true,
    grupos: true,
    cargaHoras: true,
    ...restricciones,
  };

  const cfg = SCHEDULE_GENERATION_CONFIG;

  // 1. Generar población inicial
  let poblacion = Array.from({ length: cfg.populationSize }, () =>
    crearCromosoma(materias, docentes, aulas, restr)
  );

  let mejorIndividuo = null;
  let mejorFitness = { score: -Infinity, metricas: {} };

  // 2. Evolucionar por generaciones
  for (let gen = 0; gen < cfg.generations; gen++) {
    // Evaluar fitness de toda la población
    const fitnesses = poblacion.map(ind =>
      calcularFitness(ind.horario, materias, docentes, aulas, restr)
    );

    // Encontrar el mejor de esta generación
    fitnesses.forEach((f, i) => {
      if (f.score > mejorFitness.score) {
        mejorFitness = f;
        mejorIndividuo = poblacion[i];
      }
    });

    // Elitismo: los mejores pasan directo
    const ordenados = fitnesses
      .map((f, i) => ({ f, i }))
      .sort((a, b) => b.f.score - a.f.score);
    const elite = ordenados.slice(0, cfg.eliteCount).map(e => poblacion[e.i]);

    // Nueva generación
    const nuevaPoblacion = [...elite];
    while (nuevaPoblacion.length < cfg.populationSize) {
      const padre = seleccionTorneo(poblacion, fitnesses, cfg.tournamentSize);
      const madre = seleccionTorneo(poblacion, fitnesses, cfg.tournamentSize);

      let hijo = Math.random() < cfg.crossoverRate
        ? cruce(padre, madre, materias, docentes, aulas, restr)
        : { ...padre };

      if (Math.random() < cfg.mutationRate) {
        hijo = mutar(hijo, materias, docentes, aulas, restr);
      }

      nuevaPoblacion.push(hijo);
    }

    poblacion = nuevaPoblacion;

    // Convergencia temprana: si no hay conflictos duros, parar
    if (
      mejorFitness.metricas.conflictosDocente === 0 &&
      mejorFitness.metricas.conflictosAula === 0 &&
      mejorFitness.metricas.conflictosGrupo === 0 &&
      mejorFitness.metricas.periodosFaltantes === 0
    ) break;
  }

  // Calcular horas docentes del mejor individuo
  const horasDocentes = {};
  docentes.forEach(d => { horasDocentes[d.id] = 0; });
  if (mejorIndividuo) {
    SEMESTRES.forEach(sem => {
      mejorIndividuo.horario[sem]?.forEach(dia => {
        dia.forEach(cell => {
          if (cell) horasDocentes[cell.docenteId] = (horasDocentes[cell.docenteId] || 0) + 1;
        });
      });
    });
  }

  return {
    horario: mejorIndividuo?.horario || {},
    horasDocentes,
    metricas: mejorFitness.metricas,
  };
};

// ── Evaluación externa ────────────────────────────────────────────────────────

export function evaluateScheduleQuality({ horario, materias = [], docentes = [], aulas = [] }) {
  const restr = { disponibilidad: true, huecos: true, criticas: true, recesos: true, distribucion: true, bloques: true, rac03: true, aulas: true, grupos: true, cargaHoras: true };
  return calcularFitness(horario, materias, docentes, aulas, restr);
}

export function defineAcademicPeriod(periodo = SCHEDULE_GENERATION_CONFIG.academicPeriod) {
  return { id: periodo, nombre: periodo, activo: true };
}

export function configureWeeklyBlocks(config = SCHEDULE_GENERATION_CONFIG) {
  const slots = [];
  for (let day = 0; day < config.daysPerWeek; day++)
    for (let period = 0; period < config.periodsPerDay; period++)
      slots.push({ day, period, durationMinutes: config.periodDurationMinutes });
  return slots;
}

export function defineAutomaticBreaks(config = SCHEDULE_GENERATION_CONFIG) {
  return Array.from(
    { length: Math.floor(config.periodsPerDay / config.automaticBreakEveryPeriods) },
    (_, i) => ({ afterPeriod: (i + 1) * config.automaticBreakEveryPeriods, durationMinutes: config.automaticBreakMinutes })
  );
}

export function selectBestGeneratedSolution(solutions) {
  return [...solutions].sort((a, b) => b.quality.score - a.quality.score)[0] || null;
}

export const SCHEDULE_GENERATION_POSTGRES_NOTES = {
  tables: ['periodos_academicos', 'bloques_horarios', 'recesos', 'restricciones', 'horarios_generados'],
  requiredInputs: ['docentes', 'materias', 'aulas', 'grupos', 'disponibilidad_docente', 'aula_fija_por_grupo'],
};