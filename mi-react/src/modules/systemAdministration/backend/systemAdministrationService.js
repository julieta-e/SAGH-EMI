import { PERMISOS_ROL } from '../../../shared/constants';

// Valores propios a confirmar: dominio institucional, regla de nombre de usuario,
// longitud de credencial temporal, politicas de bloqueo e historial de auditoria.
export const SYSTEM_ADMIN_CONFIG = {
  institutionalEmailDomain: 'emi.edu.bo',
  defaultTeacherRole: 'Docente',
  temporaryPasswordLength: 10,
  maxFailedLoginAttempts: 5,
};

const normalize = (value = '') =>
  value.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const createId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

const rolePrefix = (rol = '') =>
  normalize(rol)
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 4) || 'usr';

export function generateUserCredentials({ nombre, rol }) {
  if (!nombre || !rol) {
    throw new Error('HU-01/HU-05: nombre y rol son obligatorios para generar credenciales.');
  }
  const parts = normalize(nombre).split(/\s+/).filter(Boolean);
  const baseName = parts.length > 1 ? `${parts[0]}.${parts.at(-1)}` : parts[0];
  const username = `${rolePrefix(rol)}.${baseName}`;
  const password = `${rolePrefix(rol)}-${Math.random().toString(36).slice(2, 8)}`;

  return { usuario: username, password };
}

export function registerUser(usuarios, payload) {
  if (!payload.nombre || !payload.rol) {
    throw new Error('HU-01: nombre y rol son obligatorios.');
  }
  const credentials = payload.usuario && payload.password
    ? { usuario: payload.usuario, password: payload.password }
    : generateUserCredentials(payload);
  const nextUser = { id: createId('u'), activo: true, docenteId: null, ...payload, ...credentials };

  if (usuarios.some((u) => normalize(u.usuario) === normalize(payload.usuario))) {
    throw new Error('HU-01: el nombre de usuario ya existe.');
  }
  if (usuarios.some((u) => normalize(u.usuario) === normalize(nextUser.usuario))) {
    throw new Error('HU-01: el nombre de usuario generado ya existe.');
  }
  return [...usuarios, nextUser];
}

export function authenticateUser({ usuarios, usuario, password }) {
  return usuarios.find(
    (u) => normalize(u.usuario) === normalize(usuario) && u.password === password && u.activo
  ) || null;
}

export function closeUserSession() {
  return { usuario: null, closedAt: new Date().toISOString() };
}

export function updateUser(usuarios, userId, patch) {
  return usuarios.map((u) => (u.id === userId ? { ...u, ...patch, id: userId } : u));
}

export function deleteUser(usuarios, userId) {
  return usuarios.filter((u) => u.id !== userId);
}

export function toggleUserStatus(usuarios, userId) {
  return usuarios.map((u) => (u.id === userId ? { ...u, activo: !u.activo } : u));
}

export function manageRoles(roles = PERMISOS_ROL, rol, permisos) {
  return { ...roles, [rol]: permisos };
}

export function assignRoleToUser(usuarios, userId, rol) {
  return updateUser(usuarios, userId, { rol });
}

export function canAccessModule(usuario, moduleId, permisos = PERMISOS_ROL) {
  return Boolean(usuario && permisos[usuario.rol]?.includes(moduleId));
}

export function generateTeacherCredentials({ docente, rol = SYSTEM_ADMIN_CONFIG.defaultTeacherRole }) {
  if (!docente?.nombre || !docente?.email) {
    throw new Error('HU-07/HU-08: docente con nombre y email es obligatorio.');
  }
  const { usuario, password } = generateUserCredentials({ nombre: docente.nombre, rol });

  return {
    nombre: docente.nombre,
    usuario,
    password,
    rol,
    email: docente.email,
    activo: true,
    docenteId: docente.id,
    mustChangePassword: true,
  };
}

export function associateUserWithTeacher(usuarios, userId, docenteId) {
  return updateUser(usuarios, userId, { docenteId });
}

export const SYSTEM_ADMIN_POSTGRES_NOTES = {
  tables: ['usuarios', 'roles', 'permisos', 'usuario_roles', 'docentes'],
  readyToMapFields: {
    usuarios: ['id', 'nombre', 'usuario', 'password_hash', 'email', 'activo', 'docente_id'],
    roles: ['id', 'nombre'],
    permisos: ['id', 'codigo_modulo', 'accion'],
  },
};
