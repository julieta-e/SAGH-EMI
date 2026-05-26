import { DIAS } from '../../../shared/constants';

/**
 * Motor de Validación Avanzada - MOD-5 (Restricciones RAC-03 EMI)
 * Sincroniza códigos de error en minúsculas y calcula dinámicamente descansos y franjas.
 */
export const validarHorario = (horario, docentes) => {
  const conflictos = [];
  const ocupacionDocentes = {};
  const ocupacionAulas = {};

  docentes.forEach(d => { if (d && d.id) ocupacionDocentes[d.id] = {}; });

  const semestres = Object.keys(horario).filter(s => !isNaN(s)).map(Number).sort();

  semestres.forEach(sem => {
    if (!horario[sem]) return;

    for (let dia = 0; dia < 5; dia++) {
      let cargaDelDia = 0;
      for (let p = 0; p < 8; p++) {
        if (horario[sem][dia]?.[p]) cargaDelDia++;
      }

      for (let p = 0; p < 8; p++) {
        const celda = horario[sem][dia]?.[p];
        if (celda) {
          const key = `${dia}-${p}`;
          const docenteId = celda.docenteId || celda.docente_id;

          // 1. Cruce de docente
          if (docenteId && ocupacionDocentes[docenteId]?.[key]) {
            const semConflicto = ocupacionDocentes[docenteId][key];
            conflictos.push({
              tipo: 'cruce_docente',
              sev: 'error',
              mensaje: `Cruce de Docente: "${celda.nombre || '?'}" ya tiene clase en Semestre ${semConflicto}°, ${DIAS[dia]} P${p+1}.`,
              sem: parseInt(sem),
              dia,
              periodo: p
            });
          } else if (docenteId && ocupacionDocentes[docenteId]) {
            ocupacionDocentes[docenteId][key] = sem;
          }

          // 2. Cruce de aula
          if (celda.aulaId) {
            const keyAula = `${celda.aulaId}-${dia}-${p}`;
            if (ocupacionAulas[keyAula]) {
              conflictos.push({
                tipo: 'cruce_docente',
                sev: 'error',
                mensaje: `Cruce de Aula: "${celda.aulaId}" ya ocupada por Semestre ${ocupacionAulas[keyAula]}°, ${DIAS[dia]} P${p+1}.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            } else {
              ocupacionAulas[keyAula] = sem;
            }
          }

          // 3. Franja horaria (Lunes a Viernes, 07:45 - 15:00)
          if (dia > 4 || p > 7) {
            conflictos.push({
              tipo: 'franja_horaria',
              sev: 'error',
              mensaje: `Infracción de Franja Estricta: Asignación fuera de Lunes a Viernes (máx. 15:00).`,
              sem: parseInt(sem),
              dia,
              periodo: p
            });
          }
        }
      }

      // 4. Recesos dinámicos
      for (let p = 0; p < 7; p++) {
        const actual = horario[sem][dia]?.[p];
        const siguiente = horario[sem][dia]?.[p+1];
        if (actual && siguiente && (actual.id === siguiente.id || actual.materiaId === siguiente.materiaId)) {
          if (cargaDelDia > 5) {
            if (p === 1 || p === 3 || p === 5) {
              conflictos.push({
                tipo: 'recesos',
                sev: 'warning',
                mensaje: `Infracción de Receso: "${actual.nombre}" (alta carga: ${cargaDelDia} períodos) rompe pausa obligatoria cada 2 períodos.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            }
          } else {
            if (p === 2 || p === 5) {
              conflictos.push({
                tipo: 'recesos',
                sev: 'warning',
                mensaje: `Infracción de Receso: "${actual.nombre}" interrumpe receso cada 3 períodos en día de carga moderada.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            }
          }
        }
      }

      // 5. Bloques sueltos (1 período)
      let pIdx = 0;
      const celdasDia = horario[sem][dia] || [];
      while (pIdx < 8) {
        if (celdasDia[pIdx]) {
          const materiaId = celdasDia[pIdx].id || celdasDia[pIdx].materiaId;
          let long = 1;
          while (pIdx + long < 8 && celdasDia[pIdx+long] && (celdasDia[pIdx+long].id === materiaId || celdasDia[pIdx+long].materiaId === materiaId)) long++;
          if (long === 1) {
            conflictos.push({
              tipo: 'bloque_suelto',
              sev: 'warning',
              mensaje: `Bloque Suelto: "${celdasDia[pIdx].nombre}" tiene solo 1 período. Mínimo 2 períodos continuos.`,
              sem: parseInt(sem),
              dia,
              periodo: pIdx
            });
          }
          pIdx += long;
        } else {
          pIdx++;
        }
      }
    }

    // Lunes primera hora
    if (!horario[sem]?.[0]?.[0]) {
      conflictos.push({
        tipo: 'franja_horaria',
        sev: 'warning',
        mensaje: `Aviso: Semestre ${sem}° no tiene clase el Lunes a las 07:45 (franja preferencial).`,
        sem: parseInt(sem),
        dia: 0,
        periodo: 0
      });
    }
  });

  return conflictos;
};