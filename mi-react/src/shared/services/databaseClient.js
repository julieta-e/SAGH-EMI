// Punto unico para conectar SAGH con PostgreSQL.
//
// Cuando tengas lista tu BD, este archivo es el lugar correcto para poner la
// conexion real. En frontend puro no debes exponer credenciales de Postgres;
// lo recomendado es crear una API backend (Express, Nest, Spring, etc.) y que
// React consuma esa API.
//
// Ejemplo de variables para un backend Node:
// DATABASE_URL=postgres://usuario:password@localhost:5432/sagh
//
// Tablas esperadas por los modulos:
// - docentes
// - materias
// - aulas
// - grupos
// - usuarios
// - roles
// - permisos
// - periodos_academicos
// - bloques_horarios
// - horarios_generados
// - horarios_aprobados
// - observaciones

export const API_BASE_URL = import.meta.env.VITE_SAGH_API_URL || '';

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Configura VITE_SAGH_API_URL para vincular SAGH con tu backend/PostgreSQL.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error API SAGH ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
