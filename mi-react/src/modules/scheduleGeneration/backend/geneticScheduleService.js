// ============================================================
// SERVICIO DE GENERACIÓN DE HORARIOS — ALGORITMO GENÉTICO
// Escuela Militar de Ingeniería · Ingeniería de Sistemas
// Normativa RAC-03 | SAGH v1.0
//
// RESTRICCIONES DURAS (penalización 1000x):
//   H1 - Sin cruce de docentes (un docente no puede estar en 2 lugares a la vez)
//   H2 - Sin cruce de aulas (un aula no puede tener 2 grupos a la vez)
//   H3 - Sin cruce de grupos (un semestre no puede tener 2 materias a la vez)
//   H4 - Respetar disponibilidad horaria del docente
//   H5 - Respetar tipo de aula requerido (Laboratorio vs Aula)
//   H6 - Respetar horas máximas del docente (RAC-03)
//
// RESTRICCIONES BLANDAS (penalización variable):
//   S1 - Equilibrar carga horaria entre docentes
//   S2 - Favorecer continuidad de bloques (no fragmentar)
//   S3 - Minimizar huecos entre clases del mismo semestre
//   S4 - Priorizar materias críticas en horarios tempranos
//   S5 - Todos los periodos requeridos deben asignarse
//   S6 - RAC-03: Lunes inicio 07:45 (periodo 0)
// ============================================================

// ── Configuración global ──────────────────────────────────────────────────────
export const SCHEDULE_GENERATION_CONFIG = {
  academicPeriod: '2026-I',
  activeSemesters: [3, 4, 5, 6, 7, 8, 9, 10],
  daysPerWeek: 5,
  periodsPerDay: 8,
  periodDurationMinutes: 45,
  automaticBreakMinutes: 15,
  automaticBreakEveryPeriods: 3,
  // Parámetros AG
  populationSize: 60,
  generations: 300,
  mutationRate: 0.08,
  crossoverRate: 0.85,
  tournamentSize: 5,
  eliteCount: 3,
  // Pesos de fitness
  qualityWeights: {
    // Restricciones DURAS — penalización alta
    cruceDependente: 10000,   // H1: cruce de docente
    cruceAula:       10000,   // H2: cruce de aula
    cruceGrupo:      10000,   // H3: cruce de grupo
    disponibilidad:  8000,    // H4: docente no disponible ese día
    tipoAula:        5000,    // H5: tipo de aula incorrecto
    maxHoras:        6000,    // H6: excede horas máximas RAC-03
    // Restricciones BLANDAS — penalización moderada
    periodoFaltante: 500,     // S5: periodo sin asignar
    desbalanceCarga: 80,      // S1: desbalance de horas
    fragmentacion:   60,      // S2: bloques no continuos
    hueco:           40,      // S3: hueco entre clases
    // Bonificaciones (positivas)
    continuidad:     50,      // S2: bloque continuo bien formado
    criticaTemprana: 30,      // S4: materia crítica en primeros periodos
    rac03Lunes:      200,     // S6: primer lunes lleno
  },
};

const SEMS   = SCHEDULE_GENERATION_CONFIG.activeSemesters;
const DAYS   = SCHEDULE_GENERATION_CONFIG.daysPerWeek;
const PMAX   = SCHEDULE_GENERATION_CONFIG.periodsPerDay;

// ── Utilidades ────────────────────────────────────────────────────────────────

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Divide N periodos en bloques de 2-3 periodos continuos (RAC-03).
 * Evita bloques de 1 periodo aislado.
 */
function dividirEnBloques(n) {
  if (n <= 0) return [];
  if (n === 1) return [1];
  if (n === 2) return [2];
  if (n === 3) return [3];
  if (n === 4) return [2, 2];
  if (n === 5) return [3, 2];
  if (n === 6) return [3, 3];
  if (n === 7) return [3, 2, 2];
  if (n === 8) return [3, 3, 2];
  // Para n > 8: repartir en bloques de 3 y 2
  const res = [];
  let r = n;
  while (r > 0) {
    if (r === 1) {
      // Agregar al último bloque para evitar solitarios
      if (res.length > 0) res[res.length - 1]++;
      else res.push(2);
      r = 0;
    } else if (r >= 3) {
      res.push(3); r -= 3;
    } else {
      res.push(2); r -= 2;
    }
  }
  return res;
}

/**
 * Crear estructura vacía del horario para todos los semestres.
 * horario[sem][dia][periodo] = null | CeldaHorario
 */
function crearHorarioVacio() {
  const h = {};
  SEMS.forEach(sem => {
    h[sem] = Array.from({ length: DAYS }, () => Array(PMAX).fill(null));
  });
  return h;
}

/**
 * Crea mapas de ocupación para docentes y aulas (por día y periodo).
 * ocupDoc[docenteId][dia][periodo] = bool
 * ocupAula[aulaId][dia][periodo] = bool
 */
function crearMapasOcupacion(docentes, aulas) {
  const ocupDoc  = {};
  const ocupAula = {};
  docentes.forEach(d => {
    ocupDoc[d.id] = Array.from({ length: DAYS }, () => Array(PMAX).fill(false));
  });
  aulas.filter(a => a.disponible !== false).forEach(a => {
    ocupAula[a.id] = Array.from({ length: DAYS }, () => Array(PMAX).fill(false));
  });
  return { ocupDoc, ocupAula };
}

// ── Cromosoma (individuo del AG) ──────────────────────────────────────────────
/**
 * Genera un cromosoma válido: horario completo para todos los semestres.
 * Respeta restricciones duras durante la construcción para mejorar calidad inicial.
 */
function crearCromosoma(materias, docentes, aulas, restricciones) {
  const horario  = crearHorarioVacio();
  const { ocupDoc, ocupAula } = crearMapasOcupacion(docentes, aulas);
  const horasDoc = {};
  docentes.forEach(d => { horasDoc[d.id] = 0; });

  // ── Ordenar materias: críticas primero, luego por nº periodos desc ──────────
  const materiasOrdenadas = [...materias].sort((a, b) => {
    // Primero las que tienen docente asignado
    const aDocente = docentes.find(d => d.id === a.docenteId);
    const bDocente = docentes.find(d => d.id === b.docenteId);
    if (!aDocente && bDocente) return 1;
    if (aDocente && !bDocente) return -1;
    // Críticas primero (S4)
    if (restricciones.criticas) {
      if (b.critica !== a.critica) return (b.critica ? 1 : 0) - (a.critica ? 1 : 0);
    }
    // Mayor cantidad de periodos primero (más difíciles de ubicar)
    return (b.periodos || 0) - (a.periodos || 0);
  });

  // ── Construir lista de bloques a colocar ────────────────────────────────────
  const bloques = [];
  materiasOrdenadas.forEach(mat => {
    const doc = docentes.find(d => d.id === mat.docenteId);
    if (!doc) return; // sin docente asignado → no se puede colocar
    const periodos = Number(mat.periodos) || 2;
    dividirEnBloques(periodos).forEach(tam => {
      bloques.push({
        mat: {
          id:        mat.id,
          nombre:    mat.nombre,
          semestre:  mat.semestre || mat.id_semestre,
          docenteId: doc.id,
          tipoAula:  mat.tipo_aula || mat.tipoAula || 'Aula',
          critica:   mat.critica || false,
          periodos:  periodos,
          horas_teoria:       mat.horas_teoria || 0,
          horas_practica:     mat.horas_practica || 0,
          horas_laboratorio:  mat.horas_laboratorio || 0,
        },
        tam,
        doc,
      });
    });
  });

  // Mezcla aleatoria respetando prioridad: críticas siempre al frente
  const criticos = bloques.filter(b => b.mat.critica);
  const normales = bloques.filter(b => !b.mat.critica).sort(() => Math.random() - 0.5);
  const ordenBloques = [...criticos, ...normales];

  // ── Colocar cada bloque en el horario ───────────────────────────────────────
  let rac03LunesCubierto = false;

  ordenBloques.forEach(({ mat, tam, doc }) => {
    const sem = mat.semestre;
    if (!horario[sem]) return;

    const maxH = doc.max_horas || doc.maxHoras || 25;

    // Verificar si el bloque cabe sin exceder horas máximas
    if (restricciones.cargaHoras && horasDoc[doc.id] + tam > maxH) return;

    /**
     * Verifica si es posible colocar un bloque de tamaño `tam` en (dia, pInicio).
     * Chequea: celda libre en semestre + docente disponible + aula disponible.
     */
    const puedeColocar = (dia, pInicio, aulaId) => {
      if (pInicio + tam > PMAX) return false;
      // Verificar disponibilidad declarada del docente (por día)
      if (restricciones.disponibilidad && doc.disponibilidad) {
        const disp = Array.isArray(doc.disponibilidad)
          ? doc.disponibilidad
          : (typeof doc.disponibilidad === 'object' ? Object.values(doc.disponibilidad).flat() : []);
        // Si tiene restricciones de días y este día NO está disponible → no colocar
        if (disp.length > 0 && !disp.includes(dia)) return false;
      }
      for (let p = pInicio; p < pInicio + tam; p++) {
        // Celda ocupada en este semestre
        if (horario[sem][dia][p] !== null) return false;
        // Docente ya tiene clase en otro semestre a esta hora
        if (restricciones.disponibilidad && ocupDoc[doc.id]?.[dia]?.[p]) return false;
        // Aula ocupada
        if (aulaId && restricciones.aulas && ocupAula[aulaId]?.[dia]?.[p]) return false;
      }
      return true;
    };

    /**
     * Busca la mejor aula disponible para el bloque:
     * - Respeta tipo (Laboratorio / Aula)
     * - Respeta ocupación
     */
    const encontrarAula = (dia, pInicio) => {
      const tipoReq = mat.tipoAula;
      const aulasDisp = aulas.filter(a => {
        if (a.disponible === false) return false;
        if (!ocupAula[a.id]) return false; // aula sin mapa = no disponible
        // Verificar tipo de aula
        if (restricciones.aulas && tipoReq && tipoReq !== 'Aula') {
          // Laboratorio o especializada: debe coincidir
          if (a.tipo !== tipoReq) return false;
        }
        // Verificar que esté libre en todos los periodos del bloque
        for (let p = pInicio; p < pInicio + tam; p++) {
          if (ocupAula[a.id][dia][p]) return false;
        }
        return true;
      });
      if (aulasDisp.length === 0) {
        // Fallback: cualquier aula libre aunque no sea del tipo correcto
        return aulas.find(a => {
          if (a.disponible === false || !ocupAula[a.id]) return false;
          for (let p = pInicio; p < pInicio + tam; p++) {
            if (ocupAula[a.id][dia][p]) return false;
          }
          return true;
        }) || null;
      }
      // Preferir aulas del tipo correcto
      return aulasDisp[rng(0, aulasDisp.length - 1)];
    };

    /**
     * Coloca el bloque en el horario y actualiza los mapas de ocupación.
     */
    const colocar = (dia, pInicio) => {
      const aula = encontrarAula(dia, pInicio);
      for (let p = pInicio; p < pInicio + tam; p++) {
        horario[sem][dia][p] = {
          id:                mat.id,
          nombre:            mat.nombre,
          docenteId:         doc.id,
          aulaId:            aula?.id || null,
          tipoAula:          mat.tipoAula || 'Aula',
          critica:           mat.critica || false,
          semestre:          sem,
          tipoPeriodo:       mat.tipoAula === 'Laboratorio' ? 'Laboratorio'
                           : p < (mat.horas_teoria || 3) ? 'Teórico' : 'Práctico',
          horas_teoria:      mat.horas_teoria,
          horas_practica:    mat.horas_practica,
          horas_laboratorio: mat.horas_laboratorio,
        };
        if (ocupDoc[doc.id]) ocupDoc[doc.id][dia][p] = true;
        if (aula && ocupAula[aula.id]) ocupAula[aula.id][dia][p] = true;
      }
      horasDoc[doc.id] = (horasDoc[doc.id] || 0) + tam;
    };

    // ── RAC-03: cubrir Lunes 07:45 (periodo 0) con la primera materia posible ──
    if (restricciones.rac03 && !rac03LunesCubierto) {
      if (puedeColocar(0, 0, null)) {
        colocar(0, 0);
        rac03LunesCubierto = true;
        return;
      }
    }

    // ── Determinar en qué días ya tiene clases este semestre para esta materia ─
    const diasConMateria = new Set();
    for (let d = 0; d < DAYS; d++) {
      for (let p = 0; p < PMAX; p++) {
        if (horario[sem][d][p]?.id === mat.id) diasConMateria.add(d);
      }
    }

    // Preferir días donde la materia aún no tiene clases (distribución S1)
    let diasOrden = [0, 1, 2, 3, 4];
    if (restricciones.distribucion) {
      diasOrden = diasOrden.sort((a, b) =>
        (diasConMateria.has(a) ? 1 : 0) - (diasConMateria.has(b) ? 1 : 0)
      );
    } else {
      diasOrden = diasOrden.sort(() => Math.random() - 0.5);
    }

    // Preferir periodos al inicio (para que materias críticas queden temprano S4)
    // y que formen bloques continuos (S2): índices 0,3,6 son inicios de bloque natural
    const periodosOrden = restricciones.huecos
      ? [0, 3, 6, 1, 4, 2, 5].filter(p => p + tam <= PMAX)
      : Array.from({ length: PMAX - tam + 1 }, (_, i) => i).sort(() => Math.random() - 0.5);

    // Intentar colocar
    let asignado = false;
    for (const dia of diasOrden) {
      if (asignado) break;
      for (const pInicio of periodosOrden) {
        if (puedeColocar(dia, pInicio, null)) {
          colocar(dia, pInicio);
          asignado = true;
          break;
        }
      }
    }
    // Si no se pudo respetar restricciones, intentar sin restricción de disponibilidad
    if (!asignado) {
      for (const dia of diasOrden) {
        if (asignado) break;
        for (let pInicio = 0; pInicio + tam <= PMAX; pInicio++) {
          if (horario[sem][dia][pInicio] === null) {
            let libre = true;
            for (let p = pInicio; p < pInicio + tam; p++) {
              if (horario[sem][dia][p] !== null) { libre = false; break; }
            }
            if (libre) {
              colocar(dia, pInicio);
              asignado = true;
              break;
            }
          }
        }
      }
    }
  });

  return { horario, horasDoc };
}

// ── Función de Fitness ────────────────────────────────────────────────────────
/**
 * Evalúa la calidad de un horario.
 * Penalizaciones negativas por restricciones violadas.
 * Bonificaciones positivas por buenas prácticas.
 * Objetivo: maximizar score (idealmente ≥ 0).
 */
function calcularFitness(horario, materias, docentes, aulas, restricciones) {
  const w = SCHEDULE_GENERATION_CONFIG.qualityWeights;
  let score = 0;

  // Mapas para detectar conflictos globales (entre semestres)
  const docBusy  = {}; // `${docenteId}-${dia}-${periodo}` → true
  const aulaBusy = {}; // `${aulaId}-${dia}-${periodo}` → true

  // Métricas para el reporte
  let crucesDocente   = 0;
  let crucesAula      = 0;
  let crucesGrupo     = 0;
  let violDisp        = 0;
  let violTipoAula    = 0;
  let violMaxHoras    = 0;
  let continuidad     = 0;
  let fragmentacion   = 0;
  let huecos          = 0;
  let periodosAsign   = 0;
  let criticasTemprano = 0;
  let rac03Ok         = false;

  // Carga real de cada docente en este horario
  const cargaReal = {};
  docentes.forEach(d => { cargaReal[d.id] = 0; });

  SEMS.forEach(sem => {
    const grid = horario[sem];
    if (!grid) return;

    // Verificar RAC-03: lunes periodo 0 debe tener clase
    if (restricciones.rac03 && grid[0][0] !== null) rac03Ok = true;

    for (let d = 0; d < DAYS; d++) {
      let ultimoConClase = -1; // último periodo con clase en este día/semestre

      for (let p = 0; p < PMAX; p++) {
        const cell = grid[d][p];
        if (!cell) continue;

        periodosAsign++;
        if (cell.docenteId && cargaReal[cell.docenteId] !== undefined) {
          cargaReal[cell.docenteId]++;
        }

        // H1: Cruce de docente
        if (cell.docenteId) {
          const dKey = `${cell.docenteId}-${d}-${p}`;
          if (docBusy[dKey]) {
            crucesDocente++;
            score -= w.cruceDependente;
          }
          docBusy[dKey] = true;
        }

        // H2: Cruce de aula
        if (cell.aulaId) {
          const aKey = `${cell.aulaId}-${d}-${p}`;
          if (aulaBusy[aKey]) {
            crucesAula++;
            score -= w.cruceAula;
          }
          aulaBusy[aKey] = true;
        }

        // H3: Cruce de grupo (ya está implícito porque cada celda del semestre es única)
        // Pero verificamos si por mutación hay duplicados
        // (el grid garantiza un valor por celda, no hay cruce de grupo real en el grid)

        // H4: Disponibilidad docente
        if (restricciones.disponibilidad && cell.docenteId) {
          const doc = docentes.find(x => x.id === cell.docenteId);
          if (doc?.disponibilidad) {
            const disp = Array.isArray(doc.disponibilidad)
              ? doc.disponibilidad
              : (typeof doc.disponibilidad === 'object' ? Object.values(doc.disponibilidad).flat() : []);
            if (disp.length > 0 && !disp.includes(d)) {
              violDisp++;
              score -= w.disponibilidad;
            }
          }
        }

        // H5: Tipo de aula
        if (restricciones.aulas && cell.aulaId && cell.tipoAula && cell.tipoAula !== 'Aula') {
          const aulaObj = aulas.find(a => a.id === cell.aulaId);
          if (aulaObj && aulaObj.tipo !== cell.tipoAula) {
            violTipoAula++;
            score -= w.tipoAula;
          }
        }

        // S2: Continuidad de bloques
        if (p > 0) {
          const prev = grid[d][p - 1];
          if (prev?.id === cell.id) {
            continuidad++;
            score += w.continuidad; // bonificación por bloque continuo
          } else if (prev !== null) {
            fragmentacion++;
            score -= w.fragmentacion; // penalización por fragmentación
          }
        }

        // S3: Huecos (periodo vacío entre clases del mismo semestre)
        if (p > 0 && grid[d][p - 1] === null && ultimoConClase >= 0) {
          huecos++;
          score -= w.hueco;
        }

        // S4: Materias críticas en periodos tempranos (0-2)
        if (cell.critica && p <= 2) {
          criticasTemprano++;
          score += w.criticaTemprana;
        }

        // Bonificación base por periodo asignado
        score += 10;

        ultimoConClase = p;
      }
    }
  });

  // H6: Verificar max horas por docente (RAC-03)
  if (restricciones.cargaHoras) {
    docentes.forEach(doc => {
      const max = doc.max_horas || doc.maxHoras || 25;
      if (cargaReal[doc.id] > max) {
        violMaxHoras++;
        score -= w.maxHoras * (cargaReal[doc.id] - max);
      }
    });
  }

  // S5: Penalizar periodos sin asignar
  const periodosReq = materias.reduce((s, m) => {
    const doc = docentes.find(d => d.id === m.docenteId);
    return doc ? s + Number(m.periodos || 0) : s;
  }, 0);
  const faltantes = Math.max(0, periodosReq - periodosAsign);
  score -= faltantes * w.periodoFaltante;

  // S1: Desbalance de carga horaria
  if (restricciones.distribucion) {
    const cargas = Object.values(cargaReal).filter(c => c > 0);
    if (cargas.length > 1) {
      const avg = cargas.reduce((a, b) => a + b, 0) / cargas.length;
      const desbalance = cargas.reduce((s, c) => s + Math.abs(c - avg), 0);
      score -= desbalance * w.desbalanceCarga;
    }
  }

  // S6: RAC-03 Lunes
  if (restricciones.rac03) {
    if (rac03Ok) score += w.rac03Lunes;
    else          score -= w.rac03Lunes;
  }

  const equilibrio = Math.max(0, Math.round(
    100 - ((faltantes / Math.max(periodosReq, 1)) * 60)
        - ((crucesDocente + crucesAula) * 5)
  ));

  return {
    score,
    metricas: {
      periodosAsign,
      periodosReq,
      faltantes,
      crucesDocente,
      crucesAula,
      crucesGrupo,
      violDisp,
      violTipoAula,
      violMaxHoras,
      continuidad,
      fragmentacion,
      huecos,
      criticasTemprano,
      rac03Ok,
      equilibrio,
    },
  };
}

// ── Operadores Genéticos ──────────────────────────────────────────────────────

/**
 * Cruce de dos individuos por semestres:
 * Cada semestre del hijo se hereda del padre o de la madre.
 */
function cruce(padre, madre) {
  const hijoHorario  = {};
  const hijoHorasDoc = {};

  SEMS.forEach(sem => {
    const fuente = Math.random() < 0.5 ? padre : madre;
    // Copia profunda del semestre elegido
    hijoHorario[sem] = fuente.horario[sem].map(dia => dia.map(cell => cell ? { ...cell } : null));
  });

  // Recalcular horas de docentes en el hijo
  Object.keys(padre.horasDoc).forEach(id => { hijoHorasDoc[id] = 0; });
  SEMS.forEach(sem => {
    hijoHorario[sem]?.forEach(dia => {
      dia.forEach(cell => {
        if (cell?.docenteId) hijoHorasDoc[cell.docenteId] = (hijoHorasDoc[cell.docenteId] || 0) + 1;
      });
    });
  });

  return { horario: hijoHorario, horasDoc: hijoHorasDoc };
}

/**
 * Mutación: intercambia dos celdas aleatorias dentro de un semestre.
 * Puede intercambiar entre días distintos (diversidad).
 */
function mutar(individuo) {
  const mutado = {
    horario: {},
    horasDoc: { ...individuo.horasDoc },
  };

  // Copia profunda del horario
  SEMS.forEach(sem => {
    mutado.horario[sem] = individuo.horario[sem].map(dia => dia.map(cell => cell ? { ...cell } : null));
  });

  // Elegir semestre aleatorio
  const sem   = SEMS[rng(0, SEMS.length - 1)];
  const grid  = mutado.horario[sem];
  const tipo  = rng(0, 2); // 0=swap celdas, 1=mover bloque, 2=swap días

  if (tipo === 0) {
    // Intercambio de dos celdas aleatorias
    const d1 = rng(0, DAYS - 1), p1 = rng(0, PMAX - 1);
    const d2 = rng(0, DAYS - 1), p2 = rng(0, PMAX - 1);
    const tmp = grid[d1][p1];
    grid[d1][p1] = grid[d2][p2];
    grid[d2][p2] = tmp;
  } else if (tipo === 1) {
    // Mover un bloque a un periodo libre
    const d1  = rng(0, DAYS - 1);
    const p1  = rng(0, PMAX - 1);
    const cell = grid[d1][p1];
    if (cell) {
      // Encontrar posición alternativa libre
      const d2 = rng(0, DAYS - 1);
      for (let p2 = 0; p2 < PMAX; p2++) {
        if (grid[d2][p2] === null) {
          grid[d2][p2] = cell;
          grid[d1][p1] = null;
          break;
        }
      }
    }
  } else {
    // Intercambiar dos días completos
    const d1 = rng(0, DAYS - 1);
    const d2 = rng(0, DAYS - 1);
    const tmp = grid[d1];
    grid[d1] = grid[d2];
    grid[d2] = tmp;
  }

  return mutado;
}

/**
 * Selección por torneo: elige el mejor de k individuos aleatorios.
 */
function seleccionTorneo(poblacion, fitnesses, k = 5) {
  let mejorIdx   = null;
  let mejorScore = -Infinity;
  for (let i = 0; i < k; i++) {
    const idx = rng(0, poblacion.length - 1);
    if (fitnesses[idx].score > mejorScore) {
      mejorScore = fitnesses[idx].score;
      mejorIdx   = idx;
    }
  }
  return poblacion[mejorIdx];
}

// ── Algoritmo Genético Principal ──────────────────────────────────────────────
/**
 * Genera el mejor horario posible usando el AG.
 * @param {Array} materias   - Lista de materias de la BD
 * @param {Array} docentes   - Lista de docentes de la BD
 * @param {Array} aulas      - Lista de aulas de la BD
 * @param {Object} restricciones - Flags de restricciones activas
 * @returns {{ horario, horasDocentes, metricas }}
 */
export const generarHorarios = (materias, docentes, aulas, restricciones = {}) => {
  // Mezclar restricciones con defaults (todas activas por defecto)
  const restr = {
    disponibilidad: true,
    huecos:         true,
    criticas:       true,
    recesos:        true,
    distribucion:   true,
    bloques:        true,
    rac03:          true,
    aulas:          true,
    grupos:         true,
    cargaHoras:     true,
    ...restricciones,
  };

  const cfg = SCHEDULE_GENERATION_CONFIG;

  // Filtrar materias sin docente asignado (no pueden programarse)
  const materiasConDocente   = materias.filter(m => m.docenteId && docentes.find(d => d.id === m.docenteId));
  const materiasSinDocente   = materias.filter(m => !m.docenteId || !docentes.find(d => d.id === m.docenteId));

  if (materiasSinDocente.length > 0) {
    console.warn(`[SAGH-AG] ${materiasSinDocente.length} materias sin docente asignado no serán programadas:`,
      materiasSinDocente.map(m => m.nombre));
  }

  // ── 1. Población inicial ───────────────────────────────────────────────────
  let poblacion = Array.from(
    { length: cfg.populationSize },
    () => crearCromosoma(materiasConDocente, docentes, aulas, restr)
  );

  let mejorIndividuo = null;
  let mejorFitness   = { score: -Infinity, metricas: {} };

  // ── 2. Evolución ───────────────────────────────────────────────────────────
  for (let gen = 0; gen < cfg.generations; gen++) {

    // Evaluar fitness de toda la población
    const fitnesses = poblacion.map(ind =>
      calcularFitness(ind.horario, materiasConDocente, docentes, aulas, restr)
    );

    // Actualizar el mejor global
    fitnesses.forEach((f, i) => {
      if (f.score > mejorFitness.score) {
        mejorFitness   = f;
        mejorIndividuo = poblacion[i];
      }
    });

    // Convergencia temprana: sin conflictos duros y todos los periodos asignados
    const { crucesDocente, crucesAula, faltantes, violDisp } = mejorFitness.metricas;
    if (
      crucesDocente  === 0 &&
      crucesAula     === 0 &&
      faltantes      === 0 &&
      violDisp       === 0
    ) {
      console.log(`[SAGH-AG] Convergencia en generación ${gen}`);
      break;
    }

    // Elitismo: los mejores `eliteCount` pasan directamente a la siguiente generación
    const ordenados = fitnesses
      .map((f, i) => ({ f, i }))
      .sort((a, b) => b.f.score - a.f.score);
    const elite = ordenados.slice(0, cfg.eliteCount).map(e => poblacion[e.i]);

    // Generar nueva población
    const nuevaPoblacion = [...elite];
    while (nuevaPoblacion.length < cfg.populationSize) {
      const padre = seleccionTorneo(poblacion, fitnesses, cfg.tournamentSize);
      const madre = seleccionTorneo(poblacion, fitnesses, cfg.tournamentSize);

      let hijo = Math.random() < cfg.crossoverRate
        ? cruce(padre, madre)
        : { horario: padre.horario, horasDoc: { ...padre.horasDoc } };

      if (Math.random() < cfg.mutationRate) {
        hijo = mutar(hijo);
      }

      nuevaPoblacion.push(hijo);
    }

    poblacion = nuevaPoblacion;
  }

  // Si no se encontró ningún individuo (no debería pasar), usar el primero
  if (!mejorIndividuo && poblacion.length > 0) {
    mejorIndividuo = poblacion[0];
    mejorFitness   = calcularFitness(mejorIndividuo.horario, materiasConDocente, docentes, aulas, restr);
  }

  // ── 3. Calcular horas finales por docente ──────────────────────────────────
  const horasDocentes = {};
  docentes.forEach(d => { horasDocentes[d.id] = 0; });
  if (mejorIndividuo) {
    SEMS.forEach(sem => {
      mejorIndividuo.horario[sem]?.forEach(dia => {
        dia.forEach(cell => {
          if (cell?.docenteId) horasDocentes[cell.docenteId] = (horasDocentes[cell.docenteId] || 0) + 1;
        });
      });
    });
  }

  console.log('[SAGH-AG] Resultado final:', {
    score:    mejorFitness.score,
    metricas: mejorFitness.metricas,
    periodosAsignados: mejorFitness.metricas.periodosAsign,
    periodosRequeridos: mejorFitness.metricas.periodosReq,
  });

  return {
    horario:       mejorIndividuo?.horario || crearHorarioVacio(),
    horasDocentes,
    metricas:      mejorFitness.metricas,
  };
};

// ── Funciones auxiliares exportadas ──────────────────────────────────────────

export function evaluateScheduleQuality({ horario, materias = [], docentes = [], aulas = [] }) {
  const restr = { disponibilidad:true, huecos:true, criticas:true, recesos:true, distribucion:true, bloques:true, rac03:true, aulas:true, grupos:true, cargaHoras:true };
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