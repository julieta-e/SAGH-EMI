import { INIT_AULAS, INIT_DOCENTES, INIT_GRUPOS, INIT_MATERIAS, INIT_USUARIOS } from '../constants';
import { apiRequest, API_BASE_URL } from './databaseClient';

// Mientras VITE_SAGH_API_URL no exista, la app usa datos genericos.
// Para borrar los genericos: configura VITE_SAGH_API_URL y reemplaza/expande
// estos endpoints segun tu API conectada a PostgreSQL.
export async function loadInitialSaghData() {
  if (!API_BASE_URL) {
    return {
      usuarios: INIT_USUARIOS,
      docentes: INIT_DOCENTES,
      materias: INIT_MATERIAS,
      aulas: INIT_AULAS,
      grupos: INIT_GRUPOS,
    };
  }

  return {
    usuarios: await apiRequest('/usuarios'),
    docentes: await apiRequest('/docentes'),
    materias: await apiRequest('/materias'),
    aulas: await apiRequest('/aulas'),
    grupos: await apiRequest('/grupos'),
  };
}
