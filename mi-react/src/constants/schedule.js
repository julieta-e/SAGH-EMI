// Días de la semana
export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Periodos de clase
export const PERIODOS_CLASE = [
  { id: 0, idx: 0, inicio: '07:45', fin: '08:30' },
  { id: 1, idx: 1, inicio: '08:30', fin: '09:15' },
  { id: 2, idx: 2, inicio: '09:15', fin: '10:00' },
  { id: 3, idx: 3, inicio: '10:15', fin: '11:00' },
  { id: 4, idx: 4, inicio: '11:00', fin: '11:45' },
  { id: 5, idx: 5, inicio: '12:00', fin: '12:45' },
  { id: 6, idx: 6, inicio: '12:45', fin: '13:30' },
  { id: 7, idx: 7, inicio: '13:30', fin: '14:15' },
];

// Render time slots with breaks interleaved
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
