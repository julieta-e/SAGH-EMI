// Backend base para Gestion Academica. Estas funciones son adaptadores puros
// listos para reemplazarse por consultas a Postgres cuando existan las tablas.

const createId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

export const ACADEMIC_CONFIG = {
  career: 'Ingenieria de Sistemas',
  activeSemesters: [3, 4, 5, 6, 7, 8, 9, 10], // Valor propio a confirmar.
};

export function upsertEntity(list, entity, prefix) {
  if (entity.id) return list.map((item) => (item.id === entity.id ? entity : item));
  return [...list, { ...entity, id: createId(prefix) }];
}

export function removeEntity(list, id) {
  return list.filter((item) => item.id !== id);
}

export const ACADEMIC_POSTGRES_NOTES = {
  tables: ['docentes', 'materias', 'aulas', 'grupos', 'docente_disponibilidad'],
  relations: ['materias.docente_id -> docentes.id', 'grupos.aula_fija_id -> aulas.id'],
};
