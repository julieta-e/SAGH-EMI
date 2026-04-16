import { DIAS } from '../constants/schedule';

// ==========================================
// ALGORITMO DE GENERACIÓN
// ==========================================
export const generarHorarios = (materias, docentes, aulas) => {
  const horario = {};
  const ocupacionDocentes = {};
  const horasDocentes = {};
  const ocupacionAulas = {};

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

  const semestres = [3,4,5,6,7,8,9,10];

  semestres.forEach(sem => {
    horario[sem] = Array(5).fill(null).map(() => Array(8).fill(null));
    const materiasSem = materias.filter(m => m.semestre === sem);

    const puedeColocar = (mat, dia, pInicio, tam) => {
      const maxH = docentes.find(d => d.id === mat.docenteId)?.maxHoras || 25;
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
        ocupacionDocentes[mat.docenteId][dia][p] = true;
        if (aula) ocupacionAulas[aula.id][dia][p] = true;
        horasDocentes[mat.docenteId]++;
      }
    };

    const bloquesPendientes = [];
    materiasSem.forEach(m => {
      dividirEnBloques(m.periodos).forEach(tam => {
        bloquesPendientes.push({ mat: m, tam });
      });
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
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          if (horario[sem][d][p]?.id === mat.id) diasOcupados.add(d);
        }
      }

      const ordenDias = [0,1,2,3,4].sort((a,b) => {
        const aOc = diasOcupados.has(a) ? 1 : 0;
        const bOc = diasOcupados.has(b) ? 1 : 0;
        return aOc - bOc;
      });

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

// ==========================================
// VALIDACIÓN DE HORARIOS
// ==========================================
export const validarHorario = (horario, docentes) => {
  const conflictos = [];
  const ocupacionDocentes = {};
  docentes.forEach(d => { ocupacionDocentes[d.id] = {}; });

  Object.keys(horario).forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      for (let p = 0; p < 8; p++) {
        const celda = horario[sem][dia][p];
        if (celda) {
          const key = `${dia}-${p}`;
          if (ocupacionDocentes[celda.docenteId]?.[key]) {
            conflictos.push({
              tipo: 'conflicto_docente',
              mensaje: `Docente ${celda.docenteId} asignado dos veces el ${DIAS[dia]} P${p + 1}`,
              sem: parseInt(sem), dia, periodo: p
            });
          }
          ocupacionDocentes[celda.docenteId][key] = true;
        }
      }
    }
  });

  Object.keys(horario).forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      const celdas = horario[sem][dia];
      let p = 0;
      while (p < 8) {
        if (celdas[p]) {
          const matId = celdas[p].id;
          let len = 1;
          while (p + len < 8 && celdas[p + len]?.id === matId) len++;
          if (len === 1) {
            conflictos.push({
              tipo: 'bloque_suelto',
              mensaje: `Sem ${sem}: "${celdas[p].nombre}" tiene solo 1 periodo suelto el ${DIAS[dia]}`,
              sem: parseInt(sem), dia, periodo: p
            });
          }
          p += len;
        } else { p++; }
      }
    }
  });

  Object.keys(horario).forEach(sem => {
    if (!horario[sem][0][0]) {
      conflictos.push({ tipo: 'regla_dura', mensaje: `Sem ${sem}: No hay clase el Lunes a las 07:45`, sem: parseInt(sem) });
    }
  });

  return conflictos;
};
