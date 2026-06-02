export const C = {
  navy: '#0f2444', navyLight: '#1a365d', navyMid: '#1e4080',
  gold: '#c8a84b', goldLight: '#f0c84e',
  green: '#166534', greenLight: '#dcfce7',
  red: '#991b1b', redLight: '#fee2e2',
  blue: '#1e40af', blueLight: '#dbeafe',
  gray: '#6b7280', grayLight: '#f3f4f6',
  purple: '#6d28d9', purpleLight: '#ede9fe',
  orange: '#92400e', orangeLight: '#fef3c7',
};

// ==========================================
// DATOS INICIALES
// ==========================================
export const INIT_USUARIOS = [
  { id: 'u1', nombre: 'Administrador SAGH', usuario: 'admin', password: 'emi123', rol: 'Administrador', email: 'admin@emi.edu.bo', activo: true, docenteId: null },
  { id: 'u2', nombre: 'Cap. Frank Silvestre', usuario: 'jefe.carrera', password: 'jefe123', rol: 'Jefe de Carrera', email: 'fsilvestre@emi.edu.bo', activo: true, docenteId: null },
  { id: 'u3', nombre: 'Secretaría DDE', usuario: 'dde', password: 'dde123', rol: 'DDE', email: 'dde@emi.edu.bo', activo: true, docenteId: null },
  // ✅ NUEVO USUARIO DOCENTE – vinculado al docente con id 'd1' (Ing. Carlos Mendoza)
  { id: 'u4', nombre: 'Ing. Carlos Mendoza', usuario: 'docente', password: 'docente123', rol: 'Docente', email: 'cmendoza@emi.edu.bo', activo: true, docenteId: 'd1' },
];

export const ROLES = ['Administrador', 'Jefe de Carrera', 'DDE', 'Docente'];

export const PERMISOS_ROL = {
  'Administrador': ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'Jefe de Carrera': ['mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'DDE': ['mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'Docente': ['mod4', 'mod6'],
};

export const INIT_DOCENTES = [
  { id: 'd1', nombre: 'Ing. Carlos Mendoza', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Matemáticas', email: 'cmendoza@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd2', nombre: 'Cap. Roberto Díaz', tipo: 'Militar Activo', maxHoras: 25, minHoras: 10, especialidad: 'Doctrina', email: 'rdiaz@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd3', nombre: 'Ing. Ana Pardo', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Física', email: 'apardo@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd4', nombre: 'Tcnl. Luis Vargas', tipo: 'Militar Reserva', maxHoras: 25, minHoras: 10, especialidad: 'Táctica', email: 'lvargas@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd5', nombre: 'Ing. Sofia Castro', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Redes', email: 'scastro@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd6', nombre: 'Ing. Fernando Rios', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Sistemas', email: 'frios@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd7', nombre: 'My. Jorge Salinas', tipo: 'Militar Activo', maxHoras: 25, minHoras: 10, especialidad: 'Defensa', email: 'jsalinas@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd8', nombre: 'Ing. Elena Gómez', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Idiomas', email: 'egomez@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd9', nombre: 'Ing. Raul Mamani', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Bases de Datos', email: 'rmamani@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd10', nombre: 'Ing. Patricia Luna', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Gestión', email: 'pluna@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd11', nombre: 'Cap. Diego Blanco', tipo: 'Militar Activo', maxHoras: 25, minHoras: 10, especialidad: 'Doctrina', email: 'dblanco@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
  { id: 'd12', nombre: 'Ing. Carmen Vega', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: 'Software', email: 'cvega@emi.edu.bo', disponibilidad: [0,1,2,3,4] },
];

export const INIT_GRUPOS = [
  { id: 'g3', nombre: 'Sistemas 3°', semestre: 3, numEstudiantes: 35, aulaFijaId: null },
  { id: 'g4', nombre: 'Sistemas 4°', semestre: 4, numEstudiantes: 32, aulaFijaId: null },
  { id: 'g5', nombre: 'Sistemas 5°', semestre: 5, numEstudiantes: 28, aulaFijaId: null },
  { id: 'g6', nombre: 'Sistemas 6°', semestre: 6, numEstudiantes: 30, aulaFijaId: null },
  { id: 'g7', nombre: 'Sistemas 7°', semestre: 7, numEstudiantes: 26, aulaFijaId: null },
  { id: 'g8', nombre: 'Sistemas 8°', semestre: 8, numEstudiantes: 24, aulaFijaId: null },
  { id: 'g9', nombre: 'Sistemas 9°', semestre: 9, numEstudiantes: 20, aulaFijaId: null },
  { id: 'g10', nombre: 'Sistemas 10°', semestre: 10, numEstudiantes: 18, aulaFijaId: null },
];

export const INIT_AULAS = [
  { id: 'a1', nombre: 'Aula 101', tipo: 'Aula', capacidad: 40, edificio: 'A', disponible: true },
  { id: 'a2', nombre: 'Aula 102', tipo: 'Aula', capacidad: 40, edificio: 'A', disponible: true },
  { id: 'a3', nombre: 'Aula 201', tipo: 'Aula', capacidad: 35, edificio: 'A', disponible: true },
  { id: 'a4', nombre: 'Lab. Computación 1', tipo: 'Laboratorio', capacidad: 30, edificio: 'B', disponible: true },
  { id: 'a5', nombre: 'Lab. Computación 2', tipo: 'Laboratorio', capacidad: 30, edificio: 'B', disponible: true },
  { id: 'a6', nombre: 'Lab. Redes', tipo: 'Laboratorio', capacidad: 25, edificio: 'B', disponible: true },
  { id: 'a7', nombre: 'Aula Magna', tipo: 'Auditorio', capacidad: 120, edificio: 'C', disponible: true },
  { id: 'a8', nombre: 'Sala de Conferencias', tipo: 'Sala', capacidad: 20, edificio: 'C', disponible: false },
];

export const INIT_MATERIAS = [
  { id: 'm3_1', nombre: 'Cálculo III', semestre: 3, periodos: 3, docenteId: 'd1', tipoAula: 'Aula', critica: true },
  { id: 'm3_2', nombre: 'Física II', semestre: 3, periodos: 3, docenteId: 'd3', tipoAula: 'Aula', critica: false },
  { id: 'm3_3', nombre: 'Estructura de Datos', semestre: 3, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio', critica: true },
  { id: 'm3_4', nombre: 'Estadística I', semestre: 3, periodos: 3, docenteId: 'd6', tipoAula: 'Aula', critica: false },
  { id: 'm3_5', nombre: 'Álgebra Lineal', semestre: 3, periodos: 2, docenteId: 'd1', tipoAula: 'Aula', critica: false },
  { id: 'm3_6', nombre: 'Doctrina Militar III', semestre: 3, periodos: 2, docenteId: 'd2', tipoAula: 'Aula', critica: false },
  { id: 'm3_7', nombre: 'Inglés III', semestre: 3, periodos: 2, docenteId: 'd8', tipoAula: 'Aula', critica: false },
  { id: 'm3_8', nombre: 'Contabilidad', semestre: 3, periodos: 2, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm4_1', nombre: 'Ecuaciones Diferenciales', semestre: 4, periodos: 3, docenteId: 'd1', tipoAula: 'Aula', critica: true },
  { id: 'm4_2', nombre: 'Bases de Datos I', semestre: 4, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio', critica: true },
  { id: 'm4_3', nombre: 'Prog. Orientada a Objetos', semestre: 4, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio', critica: true },
  { id: 'm4_4', nombre: 'Estadística II', semestre: 4, periodos: 3, docenteId: 'd9', tipoAula: 'Aula', critica: false },
  { id: 'm4_5', nombre: 'Física III', semestre: 4, periodos: 3, docenteId: 'd3', tipoAula: 'Aula', critica: false },
  { id: 'm4_6', nombre: 'Doctrina Militar IV', semestre: 4, periodos: 3, docenteId: 'd7', tipoAula: 'Aula', critica: false },
  { id: 'm4_7', nombre: 'Inglés IV', semestre: 4, periodos: 2, docenteId: 'd8', tipoAula: 'Aula', critica: false },
  { id: 'm5_1', nombre: 'Bases de Datos II', semestre: 5, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio', critica: true },
  { id: 'm5_2', nombre: 'Sistemas Operativos', semestre: 5, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio', critica: true },
  { id: 'm5_3', nombre: 'Análisis y Diseño', semestre: 5, periodos: 3, docenteId: 'd12', tipoAula: 'Aula', critica: false },
  { id: 'm5_4', nombre: 'Investigación Operativa I', semestre: 5, periodos: 3, docenteId: 'd1', tipoAula: 'Aula', critica: false },
  { id: 'm5_5', nombre: 'Redes I', semestre: 5, periodos: 2, docenteId: 'd5', tipoAula: 'Laboratorio', critica: false },
  { id: 'm5_6', nombre: 'Doctrina Militar V', semestre: 5, periodos: 2, docenteId: 'd11', tipoAula: 'Aula', critica: false },
  { id: 'm5_7', nombre: 'Inglés V', semestre: 5, periodos: 2, docenteId: 'd8', tipoAula: 'Aula', critica: false },
  { id: 'm5_8', nombre: 'Economía General', semestre: 5, periodos: 2, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm6_1', nombre: 'Ingeniería de Software I', semestre: 6, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio', critica: true },
  { id: 'm6_2', nombre: 'Redes II', semestre: 6, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio', critica: false },
  { id: 'm6_3', nombre: 'Investigación Operativa II', semestre: 6, periodos: 3, docenteId: 'd1', tipoAula: 'Aula', critica: false },
  { id: 'm6_4', nombre: 'Sistemas de Inf. Geográfica', semestre: 6, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio', critica: false },
  { id: 'm6_5', nombre: 'Arquitectura de Computadoras', semestre: 6, periodos: 3, docenteId: 'd6', tipoAula: 'Aula', critica: false },
  { id: 'm6_6', nombre: 'Táctica y Estrategia I', semestre: 6, periodos: 3, docenteId: 'd4', tipoAula: 'Aula', critica: false },
  { id: 'm6_7', nombre: 'Preparación de Proyectos', semestre: 6, periodos: 2, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm7_1', nombre: 'Ingeniería de Software II', semestre: 7, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio', critica: true },
  { id: 'm7_2', nombre: 'Sistemas Distribuidos', semestre: 7, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio', critica: false },
  { id: 'm7_3', nombre: 'Inteligencia Artificial', semestre: 7, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio', critica: true },
  { id: 'm7_4', nombre: 'Seguridad de Sistemas', semestre: 7, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio', critica: false },
  { id: 'm7_5', nombre: 'Dinámica de Sistemas', semestre: 7, periodos: 3, docenteId: 'd3', tipoAula: 'Aula', critica: false },
  { id: 'm7_6', nombre: 'Táctica y Estrategia II', semestre: 7, periodos: 3, docenteId: 'd4', tipoAula: 'Aula', critica: false },
  { id: 'm7_7', nombre: 'Evaluación de Proyectos', semestre: 7, periodos: 2, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm8_1', nombre: 'Auditoría de Sistemas', semestre: 8, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio', critica: true },
  { id: 'm8_2', nombre: 'Sistemas Expertos', semestre: 8, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio', critica: false },
  { id: 'm8_3', nombre: 'Redes Inalámbricas', semestre: 8, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio', critica: false },
  { id: 'm8_4', nombre: 'Legislación para Ingeniería', semestre: 8, periodos: 3, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm8_5', nombre: 'Metodología de la Investigación', semestre: 8, periodos: 3, docenteId: 'd8', tipoAula: 'Aula', critica: false },
  { id: 'm8_6', nombre: 'Liderazgo Militar', semestre: 8, periodos: 3, docenteId: 'd2', tipoAula: 'Aula', critica: false },
  { id: 'm8_7', nombre: 'Simulación de Sistemas', semestre: 8, periodos: 2, docenteId: 'd3', tipoAula: 'Laboratorio', critica: false },
  { id: 'm9_1', nombre: 'Taller de Grado I', semestre: 9, periodos: 4, docenteId: 'd12', tipoAula: 'Laboratorio', critica: true },
  { id: 'm9_2', nombre: 'Planificación Estratégica', semestre: 9, periodos: 4, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm9_3', nombre: 'Gestión de Calidad de Software', semestre: 9, periodos: 4, docenteId: 'd6', tipoAula: 'Laboratorio', critica: false },
  { id: 'm9_4', nombre: 'Comercio Electrónico', semestre: 9, periodos: 4, docenteId: 'd9', tipoAula: 'Laboratorio', critica: false },
  { id: 'm9_5', nombre: 'Defensa Nacional', semestre: 9, periodos: 4, docenteId: 'd7', tipoAula: 'Aula', critica: false },
  { id: 'm10_1', nombre: 'Taller de Grado II', semestre: 10, periodos: 4, docenteId: 'd12', tipoAula: 'Laboratorio', critica: true },
  { id: 'm10_2', nombre: 'Gerencia de Sistemas', semestre: 10, periodos: 4, docenteId: 'd10', tipoAula: 'Aula', critica: false },
  { id: 'm10_3', nombre: 'Robótica', semestre: 10, periodos: 4, docenteId: 'd5', tipoAula: 'Laboratorio', critica: false },
  { id: 'm10_4', nombre: 'Minería de Datos', semestre: 10, periodos: 4, docenteId: 'd6', tipoAula: 'Laboratorio', critica: false },
  { id: 'm10_5', nombre: 'Geopolítica', semestre: 10, periodos: 4, docenteId: 'd4', tipoAula: 'Aula', critica: false },
];

// ==========================================
// CONSTANTES PARA EL MÓDULO DE HORARIOS (ScheduleManagement)
// ==========================================

// Semestres disponibles (de 3ro a 10mo)
export const SEMESTRES_DEFAULT = [3,4,5,6,7,8,9,10];
export const DIAS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
export const RENDER_SLOTS = [
  { idx:0, inicio:'07:45', fin:'09:15', type:'class' },
  { idx:1, inicio:'09:15', fin:'10:45', type:'class' },
  { idx:2, inicio:'10:45', fin:'11:15', type:'break', label:'RECESO' },
  { idx:3, inicio:'11:15', fin:'12:45', type:'class' },
  { idx:4, inicio:'12:45', fin:'14:15', type:'break', label:'RECESO' },
  { idx:5, inicio:'14:15', fin:'15:45', type:'class' },
  { idx:6, inicio:'15:45', fin:'17:15', type:'class' },
  { idx:7, inicio:'17:15', fin:'18:00', type:'break', label:'RECESO' },
  { idx:8, inicio:'18:00', fin:'19:30', type:'class' },
  { idx:9, inicio:'19:30', fin:'21:00', type:'class' },
];