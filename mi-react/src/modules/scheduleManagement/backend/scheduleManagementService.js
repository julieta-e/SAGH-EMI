export function updateScheduleCell(horario, semestre, dia, periodo, patch) {
  const next = structuredClone(horario);
  next[semestre][dia][periodo] = next[semestre][dia][periodo]
    ? { ...next[semestre][dia][periodo], ...patch }
    : patch;
  return next;
}

export function clearScheduleCell(horario, semestre, dia, periodo) {
  const next = structuredClone(horario);
  next[semestre][dia][periodo] = null;
  return next;
}

export const SCHEDULE_MANAGEMENT_POSTGRES_NOTES = {
  tables: ['horarios', 'horario_celdas', 'horario_versiones'],
  statuses: ['pendiente', 'aprobado', 'observado'],
};
