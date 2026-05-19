import { DIAS } from '../../../shared/constants';

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
          if (!ocupacionDocentes[celda.docenteId]) {
            conflictos.push({ tipo: 'docente_inexistente', mensaje: `Sem ${sem}: "${celda.nombre}" no tiene docente valido`, sem: parseInt(sem), dia, periodo: p });
            continue;
          }
          if (ocupacionDocentes[celda.docenteId]?.[key]) {
            conflictos.push({ tipo: 'cruce_docente', mensaje: `Docente en conflicto el ${DIAS[dia]} P${p+1}`, sem: parseInt(sem), dia, periodo: p });
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
          while (p + len < 8 && celdas[p+len]?.id === matId) len++;
          if (len === 1) {
            conflictos.push({ tipo: 'bloque_suelto', mensaje: `Sem ${sem}: "${celdas[p].nombre}" bloque suelto el ${DIAS[dia]}`, sem: parseInt(sem), dia, periodo: p });
          }
          p += len;
        } else { p++; }
      }
    }
  });

  Object.keys(horario).forEach(sem => {
    if (!horario[sem][0][0]) {
      conflictos.push({ tipo: 'regla_dura', mensaje: `Sem ${sem}: Sin clase el Lunes 07:45`, sem: parseInt(sem) });
    }
  });

  return conflictos;
};

