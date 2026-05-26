/**
 * Modifica de forma segura una celda específica dentro de la matriz multidimensional del horario.
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
 * Remueve la asignación de una celda garantizando la integridad estructural del esquema.
 */
export function clearScheduleCell(horario, semestre, dia, periodo) {
  const next = structuredClone(horario || {});
  if (next[semestre]?.[dia]?.[periodo]) {
    next[semestre][dia][periodo] = null;
  }
  return next;
}

export const SCHEDULE_MANAGEMENT_POSTGRES_NOTES = {
  tables: ['horarios', 'horario_celdas', 'horario_versiones'],
  statuses: ['pendiente', 'aprobado', 'observado'],
};