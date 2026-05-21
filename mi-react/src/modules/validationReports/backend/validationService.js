import { DIAS } from '../../../shared/constants';

/**
 * Motor de Validación Avanzada - MOD-5 (Restricciones RAC-03 EMI)
 * Sincroniza códigos de error en minúsculas y calcula dinámicamente descansos y franjas.
 */
export const validarHorario = (horario, docentes) => {
  const conflictos = [];
  const ocupacionDocentes = {};
  const ocupacionAulas = {};
  
  // Inicialización del mapa de disponibilidad docente
  docentes.forEach(d => { ocupacionDocentes[d.id] = {}; });

  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];

  semestres.forEach(sem => {
    if (!horario[sem]) return;
    
    for (let dia = 0; dia < 5; dia++) {
      // Calcular carga horaria total del día para este semestre
      let cargaDelDia = 0;
      for (let p = 0; p < 8; p++) {
        if (horario[sem][dia]?.[p]) cargaDelDia++;
      }

      for (let p = 0; p < 8; p++) {
        const celda = horario[sem][dia]?.[p];
        if (celda) {
          const key = `${dia}-${p}`;
          
          // 1. Control Crítico: Cruce de Docente
          if (ocupacionDocentes[celda.docenteId]?.[key]) {
            const semConflicto = ocupacionDocentes[celda.docenteId][key];
            conflictos.push({
              tipo: 'cruce_docente',
              sev: 'error',
              mensaje: `Cruce de Docente: El docente asignado a "${celda.nombre}" ya imparte clases en el Semestre ${semConflicto}° en el período P${p+1} del día ${DIAS[dia]}.`,
              sem: parseInt(sem),
              dia,
              periodo: p
            });
          } else if (ocupacionDocentes[celda.docenteId]) {
            ocupacionDocentes[celda.docenteId][key] = sem;
          }

          // 2. Control Crítico: Cruce de Aula (Registrado bajo el módulo de concurrencia)
          if (celda.aulaId) {
            const keyAula = `${celda.aulaId}-${dia}-${p}`;
            if (ocupacionAulas[keyAula]) {
              const semConflictoAula = ocupacionAulas[keyAula];
              conflictos.push({
                tipo: 'cruce_docente',
                sev: 'error',
                mensaje: `Cruce de Infraestructura: El aula asignada ya se encuentra ocupada por el Semestre ${semConflictoAula}° el día ${DIAS[dia]} en el período P${p+1}.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            } else {
              ocupacionAulas[keyAula] = sem;
            }
          }

          // 3. Garantía de Franja Horaria Semanal Preferencial (Lunes a Viernes, 07:45 a 15:00)
          // El rango de períodos 0-7 cubre exactamente de 07:45 a 14:30/15:00. Cualquier desborde es infracción.
          if (p > 7 || dia > 4) {
            conflictos.push({
              tipo: 'franja_horaria',
              sev: 'error',
              mensaje: `Infracción de Franja Estricta: Asignación inválida fuera de los márgenes de la EMI (Lunes a Viernes, Máximo 15:00 PM).`,
              sem: parseInt(sem),
              dia,
              periodo: p
            });
          }
        }
      }

      // 4. Verificar Cumplimiento de Recesos de 15 Minutos (Estructura Dinámica)
      for (let p = 0; p < 7; p++) {
        const bloqueActual = horario[sem][dia]?.[p];
        const bloqueSiguiente = horario[sem][dia]?.[p+1];
        
        if (bloqueActual && bloqueSiguiente && bloqueActual.id === bloqueSiguiente.id) {
          // ALTA CARGA DIARIA (>5 períodos): Receso mandatorio cada 2 períodos (Límites P2->P3, P4->P5, P6->P7)
          if (cargaDelDia > 5) {
            if (p === 1 || p === 3 || p === 5) {
              conflictos.push({
                tipo: 'recesos',
                sev: 'warning',
                mensaje: `Infracción de Receso: La materia "${bloqueActual.nombre}" rompe la continuidad de descanso de 15 min. Al haber alta carga horaria (${cargaDelDia} períodos asignados), se exige pausa obligatoria.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            }
          } else {
            // CARGA MODERADA (<=5 períodos): Receso extendido reglamentario cada 3 períodos (Límite P3->P4, P5->P6)
            if (p === 2 || p === 5) {
              conflictos.push({
                tipo: 'recesos',
                sev: 'warning',
                mensaje: `Infracción de Receso: Bloque continuo de "${bloqueActual.nombre}" interrumpe el receso técnico programado tras 3 períodos lectivos.`,
                sem: parseInt(sem),
                dia,
                periodo: p
              });
            }
          }
        }
      }

      // 5. Optimización de Bloques Coherentes (Evitar bloque_suelto de 1 solo período)
      let pIdx = 0;
      const celdasDia = horario[sem][dia] || [];
      while (pIdx < 8) {
        if (celdasDia[pIdx]) {
          const materiaId = celdasDia[pIdx].id;
          let longitudBloque = 1;
          while (pIdx + longitudBloque < 8 && celdasDia[pIdx + longitudBloque]?.id === materiaId) {
            longitudBloque++;
          }
          if (longitudBloque === 1) {
            conflictos.push({
              tipo: 'bloque_suelto',
              sev: 'warning',
              mensaje: `Bloque Suelto: "${celdasDia[pIdx].nombre}" se asignó de forma aislada. Requiere un mínimo de 2 períodos continuos para fines didácticos.`,
              sem: parseInt(sem),
              dia,
              periodo: pIdx
            });
          }
          pIdx += longitudBloque;
        } else {
          pIdx++;
        }
      }
    }
    
    // Directiva institucional RAC-03: Inicio preferencial del Lunes a primera hora
    if (!horario[sem]?.[0]?.[0]) {
      conflictos.push({
        tipo: 'franja_horaria',
        sev: 'warning',
        mensaje: `Aviso de Franja Preferencial: El Semestre ${sem}° no cuenta con asignación académica los Lunes a las 07:45 AM.`,
        sem: parseInt(sem),
        dia: 0,
        periodo: 0
      });
    }
  });

  return conflictos;
};
