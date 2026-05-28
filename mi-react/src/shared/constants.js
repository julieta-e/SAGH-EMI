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

// Roles del sistema
export const ROLES = ['DDE', 'Jefe de Carrera', 'Docente'];

// Permisos por rol
export const PERMISOS_ROL = {
  'DDE':             ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'Jefe de Carrera': ['mod2', 'mod4', 'mod5', 'mod6'],
  'Docente':         ['mod4', 'mod6'],
};

// Grupos — se mantienen estáticos por ahora (no hay tabla en BD aún)
export const INIT_GRUPOS = [
  { id: 'g3',  nombre: 'Sistemas 3°',  semestre: 3,  numEstudiantes: 35, aulaFijaId: null },
  { id: 'g4',  nombre: 'Sistemas 4°',  semestre: 4,  numEstudiantes: 32, aulaFijaId: null },
  { id: 'g5',  nombre: 'Sistemas 5°',  semestre: 5,  numEstudiantes: 28, aulaFijaId: null },
  { id: 'g6',  nombre: 'Sistemas 6°',  semestre: 6,  numEstudiantes: 30, aulaFijaId: null },
  { id: 'g7',  nombre: 'Sistemas 7°',  semestre: 7,  numEstudiantes: 26, aulaFijaId: null },
  { id: 'g8',  nombre: 'Sistemas 8°',  semestre: 8,  numEstudiantes: 24, aulaFijaId: null },
  { id: 'g9',  nombre: 'Sistemas 9°',  semestre: 9,  numEstudiantes: 20, aulaFijaId: null },
  { id: 'g10', nombre: 'Sistemas 10°', semestre: 10, numEstudiantes: 18, aulaFijaId: null },
];

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const RENDER_SLOTS = [
  { type: 'class', idx: 0, inicio: '07:45', fin: '08:30' },
  { type: 'class', idx: 1, inicio: '08:30', fin: '09:15' },
  { type: 'class', idx: 2, inicio: '09:15', fin: '10:00' },
  { type: 'break', label: 'Receso', inicio: '10:00', fin: '10:15' },
  { type: 'class', idx: 3, inicio: '10:15', fin: '11:00' },
  { type: 'class', idx: 4, inicio: '11:00', fin: '11:45' },
  { type: 'break', label: 'Receso', inicio: '11:45', fin: '12:00' },
  { type: 'class', idx: 5, inicio: '12:00', fin: '12:45' },
  { type: 'class', idx: 6, inicio: '12:45', fin: '13:30' },
  { type: 'class', idx: 7, inicio: '13:30', fin: '14:15' },
];