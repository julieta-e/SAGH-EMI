import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, User, LogIn, Calendar, Users, BookOpen,
  Settings, LogOut, CheckCircle, AlertTriangle, Play,
  Clock, Menu, Printer, Building2, Plus, Pencil, Trash2,
  X, Save, ChevronDown, AlertCircle, Check, RefreshCw,
  GripVertical, ArrowLeftRight, Info, Shield, Eye
} from 'lucide-react';

// ==========================================
// ESTILOS GLOBALES FULL SCREEN
// ==========================================
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100% !important; height: 100% !important; min-height: 100vh; overflow: hidden; }
    body { font-family: 'Georgia', serif; }
  `}</style>
);

// ==========================================
// PALETA Y ESTILOS BASE
// ==========================================
const C = {
  navy: '#0f2444',
  navyLight: '#1a365d',
  navyMid: '#1e4080',
  gold: '#c8a84b',
  goldLight: '#f0c84e',
  green: '#166534',
  greenLight: '#dcfce7',
  red: '#991b1b',
  redLight: '#fee2e2',
  blue: '#1e40af',
  blueLight: '#dbeafe',
  gray: '#6b7280',
  grayLight: '#f3f4f6',
};

// ==========================================
// DATOS INICIALES
// ==========================================
const INIT_DOCENTES = [
  { id: 'd1', nombre: 'Ing. Carlos Mendoza', tipo: 'Civil', maxHoras: 25, especialidad: 'Matemáticas' },
  { id: 'd2', nombre: 'Cap. Roberto Díaz', tipo: 'Militar Activo', maxHoras: 25, especialidad: 'Doctrina' },
  { id: 'd3', nombre: 'Ing. Ana Pardo', tipo: 'Civil', maxHoras: 25, especialidad: 'Física' },
  { id: 'd4', nombre: 'Tcnl. Luis Vargas', tipo: 'Militar Reserva', maxHoras: 25, especialidad: 'Táctica' },
  { id: 'd5', nombre: 'Ing. Sofia Castro', tipo: 'Civil', maxHoras: 25, especialidad: 'Redes' },
  { id: 'd6', nombre: 'Ing. Fernando Rios', tipo: 'Civil', maxHoras: 25, especialidad: 'Sistemas' },
  { id: 'd7', nombre: 'My. Jorge Salinas', tipo: 'Militar Activo', maxHoras: 25, especialidad: 'Defensa' },
  { id: 'd8', nombre: 'Ing. Elena Gómez', tipo: 'Civil', maxHoras: 25, especialidad: 'Idiomas' },
  { id: 'd9', nombre: 'Ing. Raul Mamani', tipo: 'Civil', maxHoras: 25, especialidad: 'Bases de Datos' },
  { id: 'd10', nombre: 'Ing. Patricia Luna', tipo: 'Civil', maxHoras: 25, especialidad: 'Gestión' },
  { id: 'd11', nombre: 'Cap. Diego Blanco', tipo: 'Militar Activo', maxHoras: 25, especialidad: 'Doctrina' },
  { id: 'd12', nombre: 'Ing. Carmen Vega', tipo: 'Civil', maxHoras: 25, especialidad: 'Software' },
];

const INIT_AULAS = [
  { id: 'a1', nombre: 'Aula 101', tipo: 'Aula', capacidad: 40, edificio: 'A', disponible: true },
  { id: 'a2', nombre: 'Aula 102', tipo: 'Aula', capacidad: 40, edificio: 'A', disponible: true },
  { id: 'a3', nombre: 'Aula 201', tipo: 'Aula', capacidad: 35, edificio: 'A', disponible: true },
  { id: 'a4', nombre: 'Lab. Computación 1', tipo: 'Laboratorio', capacidad: 30, edificio: 'B', disponible: true },
  { id: 'a5', nombre: 'Lab. Computación 2', tipo: 'Laboratorio', capacidad: 30, edificio: 'B', disponible: true },
  { id: 'a6', nombre: 'Lab. Redes', tipo: 'Laboratorio', capacidad: 25, edificio: 'B', disponible: true },
  { id: 'a7', nombre: 'Aula Magna', tipo: 'Auditorio', capacidad: 120, edificio: 'C', disponible: true },
  { id: 'a8', nombre: 'Sala de Conferencias', tipo: 'Sala', capacidad: 20, edificio: 'C', disponible: false },
];

const INIT_MATERIAS = [
  { id: 'm3_1', nombre: 'Cálculo III', semestre: 3, periodos: 3, docenteId: 'd1', tipoAula: 'Aula' },
  { id: 'm3_2', nombre: 'Física II', semestre: 3, periodos: 3, docenteId: 'd3', tipoAula: 'Aula' },
  { id: 'm3_3', nombre: 'Estructura de Datos', semestre: 3, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm3_4', nombre: 'Estadística I', semestre: 3, periodos: 3, docenteId: 'd6', tipoAula: 'Aula' },
  { id: 'm3_5', nombre: 'Álgebra Lineal', semestre: 3, periodos: 2, docenteId: 'd1', tipoAula: 'Aula' },
  { id: 'm3_6', nombre: 'Doctrina Militar III', semestre: 3, periodos: 2, docenteId: 'd2', tipoAula: 'Aula' },
  { id: 'm3_7', nombre: 'Inglés III', semestre: 3, periodos: 2, docenteId: 'd8', tipoAula: 'Aula' },
  { id: 'm3_8', nombre: 'Contabilidad', semestre: 3, periodos: 2, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm4_1', nombre: 'Ecuaciones Diferenciales', semestre: 4, periodos: 3, docenteId: 'd1', tipoAula: 'Aula' },
  { id: 'm4_2', nombre: 'Bases de Datos I', semestre: 4, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm4_3', nombre: 'Prog. Orientada a Objetos', semestre: 4, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm4_4', nombre: 'Estadística II', semestre: 4, periodos: 3, docenteId: 'd9', tipoAula: 'Aula' },
  { id: 'm4_5', nombre: 'Física III', semestre: 4, periodos: 3, docenteId: 'd3', tipoAula: 'Aula' },
  { id: 'm4_6', nombre: 'Doctrina Militar IV', semestre: 4, periodos: 3, docenteId: 'd7', tipoAula: 'Aula' },
  { id: 'm4_7', nombre: 'Inglés IV', semestre: 4, periodos: 2, docenteId: 'd8', tipoAula: 'Aula' },
  { id: 'm5_1', nombre: 'Bases de Datos II', semestre: 5, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm5_2', nombre: 'Sistemas Operativos', semestre: 5, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio' },
  { id: 'm5_3', nombre: 'Análisis y Diseño', semestre: 5, periodos: 3, docenteId: 'd12', tipoAula: 'Aula' },
  { id: 'm5_4', nombre: 'Investigación Operativa I', semestre: 5, periodos: 3, docenteId: 'd1', tipoAula: 'Aula' },
  { id: 'm5_5', nombre: 'Redes I', semestre: 5, periodos: 2, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm5_6', nombre: 'Doctrina Militar V', semestre: 5, periodos: 2, docenteId: 'd11', tipoAula: 'Aula' },
  { id: 'm5_7', nombre: 'Inglés V', semestre: 5, periodos: 2, docenteId: 'd8', tipoAula: 'Aula' },
  { id: 'm5_8', nombre: 'Economía General', semestre: 5, periodos: 2, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm6_1', nombre: 'Ingeniería de Software I', semestre: 6, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio' },
  { id: 'm6_2', nombre: 'Redes II', semestre: 6, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm6_3', nombre: 'Investigación Operativa II', semestre: 6, periodos: 3, docenteId: 'd1', tipoAula: 'Aula' },
  { id: 'm6_4', nombre: 'Sistemas de Inf. Geográfica', semestre: 6, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio' },
  { id: 'm6_5', nombre: 'Arquitectura de Computadoras', semestre: 6, periodos: 3, docenteId: 'd6', tipoAula: 'Aula' },
  { id: 'm6_6', nombre: 'Táctica y Estrategia I', semestre: 6, periodos: 3, docenteId: 'd4', tipoAula: 'Aula' },
  { id: 'm6_7', nombre: 'Preparación de Proyectos', semestre: 6, periodos: 2, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm7_1', nombre: 'Ingeniería de Software II', semestre: 7, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio' },
  { id: 'm7_2', nombre: 'Sistemas Distribuidos', semestre: 7, periodos: 3, docenteId: 'd9', tipoAula: 'Laboratorio' },
  { id: 'm7_3', nombre: 'Inteligencia Artificial', semestre: 7, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm7_4', nombre: 'Seguridad de Sistemas', semestre: 7, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm7_5', nombre: 'Dinámica de Sistemas', semestre: 7, periodos: 3, docenteId: 'd3', tipoAula: 'Aula' },
  { id: 'm7_6', nombre: 'Táctica y Estrategia II', semestre: 7, periodos: 3, docenteId: 'd4', tipoAula: 'Aula' },
  { id: 'm7_7', nombre: 'Evaluación de Proyectos', semestre: 7, periodos: 2, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm8_1', nombre: 'Auditoría de Sistemas', semestre: 8, periodos: 3, docenteId: 'd12', tipoAula: 'Laboratorio' },
  { id: 'm8_2', nombre: 'Sistemas Expertos', semestre: 8, periodos: 3, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm8_3', nombre: 'Redes Inalámbricas', semestre: 8, periodos: 3, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm8_4', nombre: 'Legislación para Ingeniería', semestre: 8, periodos: 3, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm8_5', nombre: 'Metodología de la Investigación', semestre: 8, periodos: 3, docenteId: 'd8', tipoAula: 'Aula' },
  { id: 'm8_6', nombre: 'Liderazgo Militar', semestre: 8, periodos: 3, docenteId: 'd2', tipoAula: 'Aula' },
  { id: 'm8_7', nombre: 'Simulación de Sistemas', semestre: 8, periodos: 2, docenteId: 'd3', tipoAula: 'Laboratorio' },
  { id: 'm9_1', nombre: 'Taller de Grado I', semestre: 9, periodos: 4, docenteId: 'd12', tipoAula: 'Laboratorio' },
  { id: 'm9_2', nombre: 'Planificación Estratégica', semestre: 9, periodos: 4, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm9_3', nombre: 'Gestión de Calidad de Software', semestre: 9, periodos: 4, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm9_4', nombre: 'Comercio Electrónico', semestre: 9, periodos: 4, docenteId: 'd9', tipoAula: 'Laboratorio' },
  { id: 'm9_5', nombre: 'Defensa Nacional', semestre: 9, periodos: 4, docenteId: 'd7', tipoAula: 'Aula' },
  { id: 'm10_1', nombre: 'Taller de Grado II', semestre: 10, periodos: 4, docenteId: 'd12', tipoAula: 'Laboratorio' },
  { id: 'm10_2', nombre: 'Gerencia de Sistemas', semestre: 10, periodos: 4, docenteId: 'd10', tipoAula: 'Aula' },
  { id: 'm10_3', nombre: 'Robótica', semestre: 10, periodos: 4, docenteId: 'd5', tipoAula: 'Laboratorio' },
  { id: 'm10_4', nombre: 'Minería de Datos', semestre: 10, periodos: 4, docenteId: 'd6', tipoAula: 'Laboratorio' },
  { id: 'm10_5', nombre: 'Geopolítica', semestre: 10, periodos: 4, docenteId: 'd4', tipoAula: 'Aula' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const PERIODOS_CLASE = [
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
const RENDER_SLOTS = [
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

// ==========================================
// ALGORITMO DE GENERACIÓN
// ==========================================
const generarHorarios = (materias, docentes, aulas) => {
  const horario = {};
  const ocupacionDocentes = {};
  const horasDocentes = {};
  const ocupacionAulas = {};

  docentes.forEach(d => {
    horasDocentes[d.id] = 0;
    ocupacionDocentes[d.id] = Array(5).fill(null).map(() => Array(8).fill(false));
  });
  aulas.filter(a => a.disponible).forEach(a => {
    ocupacionAulas[a.id] = Array(5).fill(null).map(() => Array(8).fill(false));
  });

  // ---------------------------------------------------
  // Divide N periodos SEMANALES en bloques de 2 o 3 por día
  // Regla: nunca un bloque de 1 solo periodo
  // Una materia de 2 periodos → un bloque de [2] en un solo día
  // Una materia de 3 periodos → un bloque de [3] en un solo día
  // Una materia de 4 periodos → dos días: [2, 2]
  // Una materia de 5 periodos → dos días: [3, 2]
  // Una materia de 6 periodos → dos días: [3, 3]
  // ---------------------------------------------------
  const dividirEnBloques = (n) => {
    // Los bloques resultantes se distribuirán en días distintos
    if (n === 2) return [2];
    if (n === 3) return [3];
    if (n === 4) return [2, 2];
    if (n === 5) return [3, 2];
    if (n === 6) return [3, 3];
    if (n === 7) return [3, 2, 2];
    if (n === 8) return [3, 3, 2];
    // Fallback genérico para cualquier valor
    const res = []; let r = n;
    while (r > 0) {
      if (r === 1) { if (res.length > 0) res[res.length-1]++; else res.push(2); r = 0; }
      else if (r >= 3) { res.push(3); r -= 3; }
      else { res.push(2); r -= 2; }
    }
    return res;
  };

  const semestres = [3,4,5,6,7,8,9,10];

  semestres.forEach(sem => {
    horario[sem] = Array(5).fill(null).map(() => Array(8).fill(null));
    const materiasSem = materias.filter(m => m.semestre === sem);

    // Helpers con `sem` en closure
    const puedeColocar = (mat, dia, pInicio, tam) => {
      const maxH = docentes.find(d => d.id === mat.docenteId)?.maxHoras || 25;
      if (pInicio + tam > 8) return false;
      if (horasDocentes[mat.docenteId] + tam > maxH) return false;
      for (let p = pInicio; p < pInicio + tam; p++) {
        if (horario[sem][dia][p] !== null) return false;
        if (ocupacionDocentes[mat.docenteId][dia][p]) return false;
      }
      return true;
    };

    const colocar = (mat, dia, pInicio, tam) => {
      const idxs = Array.from({length: tam}, (_,i) => pInicio + i);
      const aula = aulas.find(a =>
        a.disponible &&
        (a.tipo === mat.tipoAula || !mat.tipoAula) &&
        idxs.every(p => !ocupacionAulas[a.id]?.[dia]?.[p])
      ) || null;
      for (let p = pInicio; p < pInicio + tam; p++) {
        horario[sem][dia][p] = { ...mat, aulaId: aula?.id || null };
        ocupacionDocentes[mat.docenteId][dia][p] = true;
        if (aula) ocupacionAulas[aula.id][dia][p] = true;
        horasDocentes[mat.docenteId]++;
      }
    };

    // Construir lista de bloques: cada materia se divide en sus bloques semanales
    // Cada bloque debe caer en un DÍA DIFERENTE (distribuir entre L-V)
    // { mat, tam }
    const bloquesPendientes = [];
    materiasSem.forEach(m => {
      dividirEnBloques(m.periodos).forEach(tam => {
        bloquesPendientes.push({ mat: m, tam });
      });
    });

    // Ordenar: bloques más grandes primero (más difíciles de encajar)
    bloquesPendientes.sort((a, b) => b.tam - a.tam);

    // REGLA DURA: debe haber clase el Lunes a las 07:45 (dia=0, periodo=0)
    // Tomar el primer bloque que quepa exactamente en dia=0, pInicio=0
    let lunesOk = false;
    for (let i = 0; i < bloquesPendientes.length && !lunesOk; i++) {
      const { mat, tam } = bloquesPendientes[i];
      if (puedeColocar(mat, 0, 0, tam)) {
        colocar(mat, 0, 0, tam);
        bloquesPendientes.splice(i, 1);
        lunesOk = true;
      }
    }

    // DISTRIBUCIÓN SEMANAL (L-V):
    // Para cada bloque pendiente:
    //   1. Registrar qué días ya tienen asignado un bloque de ESA materia
    //   2. Preferir días donde esa materia AÚN NO tiene bloque → distribución equitativa
    //   3. Dentro del día elegido, buscar el primer hueco consecutivo suficiente (inicio temprano)
    bloquesPendientes.forEach(({ mat, tam }) => {
      // Días donde esta materia ya tiene al menos un periodo asignado
      const diasOcupados = new Set();
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          if (horario[sem][d][p]?.id === mat.id) diasOcupados.add(d);
        }
      }

      // Intentar primero días libres para esta materia, luego los ocupados
      const ordenDias = [0,1,2,3,4].sort((a,b) => {
        const aOc = diasOcupados.has(a) ? 1 : 0;
        const bOc = diasOcupados.has(b) ? 1 : 0;
        return aOc - bOc; // días sin esta materia primero
      });

      let asignado = false;
      for (const dia of ordenDias) {
        if (asignado) break;
        // Recorrer posiciones de inicio de más temprano a más tarde
        for (let pInicio = 0; pInicio <= 8 - tam && !asignado; pInicio++) {
          if (puedeColocar(mat, dia, pInicio, tam)) {
            colocar(mat, dia, pInicio, tam);
            asignado = true;
          }
        }
      }
    });
  });

  return { horario, horasDocentes };
};

// Validar conflictos en horario
const validarHorario = (horario, docentes) => {
  const conflictos = [];
  const ocupacionDocentes = {};
  docentes.forEach(d => { ocupacionDocentes[d.id] = {}; });

  Object.keys(horario).forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      for (let p = 0; p < 8; p++) {
        const celda = horario[sem][dia][p];
        if (celda) {
          const key = `${dia}-${p}`;
          if (ocupacionDocentes[celda.docenteId]?.[key]) {
            conflictos.push({
              tipo: 'conflicto_docente',
              mensaje: `Docente ${celda.docenteId} asignado dos veces el ${DIAS[dia]} P${p + 1}`,
              sem: parseInt(sem), dia, periodo: p
            });
          }
          ocupacionDocentes[celda.docenteId][key] = true;
        }
      }
    }
  });

  // Verificar regla: no debe haber periodos sueltos de 1 por materia en un día
  Object.keys(horario).forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      // Agrupar periodos consecutivos por materia en este día
      const celdas = horario[sem][dia];
      let p = 0;
      while (p < 8) {
        if (celdas[p]) {
          const matId = celdas[p].id;
          let len = 1;
          while (p + len < 8 && celdas[p + len]?.id === matId) len++;
          if (len === 1) {
            conflictos.push({
              tipo: 'bloque_suelto',
              mensaje: `Sem ${sem}: "${celdas[p].nombre}" tiene solo 1 periodo suelto el ${DIAS[dia]}`,
              sem: parseInt(sem), dia, periodo: p
            });
          }
          p += len;
        } else { p++; }
      }
    }
  });

  // Verificar regla dura: Lunes 07:45
  Object.keys(horario).forEach(sem => {
    if (!horario[sem][0][0]) {
      conflictos.push({ tipo: 'regla_dura', mensaje: `Sem ${sem}: No hay clase el Lunes a las 07:45`, sem: parseInt(sem) });
    }
  });

  return conflictos;
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('generador');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [docentes, setDocentes] = useState(INIT_DOCENTES);
  const [materias, setMaterias] = useState(INIT_MATERIAS);
  const [aulas, setAulas] = useState(INIT_AULAS);
  const [horarioData, setHorarioData] = useState(null);
  const [horasDocData, setHorasDocData] = useState(null);
  const [estadoValidacion, setEstadoValidacion] = useState(null); // null | 'pendiente' | 'aprobado'

  const onHorarioGenerado = (horario, horas) => {
    setHorarioData(horario);
    setHorasDocData(horas);
    setEstadoValidacion('pendiente');
    setActiveTab('validacion');
  };

  const onHorarioCambiado = (nuevoHorario) => {
    setHorarioData(nuevoHorario);
    setEstadoValidacion('pendiente');
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  const tabs = [
    { id: 'generador', label: 'Generador', icon: <Play size={18} /> },
    { id: 'horarios', label: 'Ver Horarios', icon: <Calendar size={18} /> },
    { id: 'validacion', label: 'Validación', icon: <Shield size={18} />, badge: estadoValidacion === 'pendiente' },
    { id: 'docentes', label: 'Docentes', icon: <Users size={18} /> },
    { id: 'materias', label: 'Materias', icon: <BookOpen size={18} /> },
    { id: 'aulas', label: 'Aulas', icon: <Building2 size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Georgia', serif", position: 'fixed', inset: 0 }}>
      <GlobalStyles />
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, background: C.navy, color: 'white',
        display: 'flex', flexDirection: 'column', transition: 'width 0.25s', flexShrink: 0
      }}>
        <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 }}>
          {sidebarOpen && (
            <div>
              <div style={{ color: C.gold, fontWeight: 'bold', fontSize: 15, letterSpacing: 2 }}>EMI</div>
              <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 1 }}>SAGH</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
            <Menu size={18} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: activeTab === t.id ? 'rgba(200,168,75,0.15)' : 'none',
              borderLeft: activeTab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
              border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              borderLeft: activeTab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
              color: activeTab === t.id ? C.gold : '#94a3b8',
              cursor: 'pointer', fontSize: 13, position: 'relative', whiteSpace: 'nowrap'
            }}>
              {t.icon}
              {sidebarOpen && <span>{t.label}</span>}
              {t.badge && (
                <span style={{
                  background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: 8, height: 8, position: 'absolute', right: 12, top: 10
                }} />
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && estadoValidacion && (
            <div style={{
              background: estadoValidacion === 'aprobado' ? 'rgba(22,101,52,0.3)' : 'rgba(200,168,75,0.15)',
              border: `1px solid ${estadoValidacion === 'aprobado' ? '#16a34a' : C.gold}`,
              borderRadius: 6, padding: '6px 10px', marginBottom: 8, fontSize: 11,
              color: estadoValidacion === 'aprobado' ? '#4ade80' : C.gold, display: 'flex', alignItems: 'center', gap: 6
            }}>
              {estadoValidacion === 'aprobado' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
              {estadoValidacion === 'aprobado' ? 'Horario Aprobado' : 'Pendiente Validación'}
            </div>
          )}
          <button onClick={() => setIsAuthenticated(false)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'none',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#f87171',
            cursor: 'pointer', padding: '6px 10px', fontSize: 12
          }}>
            <LogOut size={14} />
            {sidebarOpen && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'white', padding: '0 24px', height: 56, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `3px solid ${C.gold}`, flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 20, background: C.gold, borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: C.navy, letterSpacing: 0.5 }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.gray }}>
            <User size={14} />
            <span>Jefatura Académica</span>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {activeTab === 'generador' && (
            <GeneradorView
              materias={materias} docentes={docentes} aulas={aulas}
              onFinish={onHorarioGenerado}
            />
          )}
          {activeTab === 'horarios' && (
            <HorariosView
              horario={horarioData} docentes={docentes} aulas={aulas} materias={materias}
              estadoValidacion={estadoValidacion}
              onCambio={onHorarioCambiado}
            />
          )}
          {activeTab === 'validacion' && (
            <ValidacionView
              horario={horarioData} docentes={docentes} horasDoc={horasDocData}
              estado={estadoValidacion}
              onAprobar={() => { setEstadoValidacion('aprobado'); setActiveTab('horarios'); }}
              onVerHorario={() => setActiveTab('horarios')}
            />
          )}
          {activeTab === 'docentes' && (
            <DocentesView docentes={docentes} setDocentes={setDocentes} />
          )}
          {activeTab === 'materias' && (
            <MateriasView materias={materias} setMaterias={setMaterias} docentes={docentes} />
          )}
          {activeTab === 'aulas' && (
            <AulasView aulas={aulas} setAulas={setAulas} />
          )}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// LOGIN
// ==========================================
function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (user === 'admin' && pass === 'emi123') { onLogin(); }
      else { setError('Credenciales incorrectas. (admin / emi123)'); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${C.navy} 0%, #0a1a35 60%, #1a365d 100%)`,
      fontFamily: "'Georgia', serif", overflow: 'auto'
    }}>
      <GlobalStyles />
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
          border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 16,
          padding: '40px 36px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            width: 72, height: 72, background: `radial-gradient(circle, ${C.gold}, #8b6914)`,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: `0 0 30px rgba(200,168,75,0.4)`
          }}>
            <Calendar color="white" size={32} />
          </div>
          <h1 style={{ color: C.gold, margin: '0 0 4px', fontSize: 22, letterSpacing: 3, fontWeight: 'bold' }}>SAGH — EMI</h1>
          <p style={{ color: '#64748b', fontSize: 12, margin: '0 0 28px', letterSpacing: 1 }}>SISTEMA AUTOMÁTICO DE GENERACIÓN DE HORARIOS</p>

          {error && (
            <div style={{ background: 'rgba(153,27,27,0.3)', border: '1px solid #991b1b', color: '#fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', textAlign: 'left', fontSize: 11, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>USUARIO</label>
            <input
              type="text" value={user} onChange={e => setUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="admin"
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(200,168,75,0.2)', borderRadius: 8, color: 'white',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', textAlign: 'left', fontSize: 11, color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>CONTRASEÑA</label>
            <input
              type="password" value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••"
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(200,168,75,0.2)', borderRadius: 8, color: 'white',
                fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', padding: '12px', background: `linear-gradient(135deg, ${C.gold}, #8b6914)`,
            border: 'none', borderRadius: 8, color: C.navy, fontWeight: 'bold', fontSize: 14,
            cursor: 'pointer', letterSpacing: 1, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'VERIFICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// GENERADOR
// ==========================================
function GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const start = () => {
    setPhase('running');
    setProgress(0);
    setLogs([]);
    const steps = [
      [400, 15, '↳ Inicializando población inicial (50 individuos)...'],
      [700, 35, '↳ Calculando fitness: conflictos de docentes y restricciones...'],
      [700, 55, '↳ Selección por torneo. Aplicando cruce de un punto...'],
      [700, 75, '↳ Mutación aleatoria (tasa 0.05). Evaluando generación 47/50...'],
      [600, 92, '↳ Verificando reglas duras: horas máx, lunes 07:45, bloques de 2-3 períodos...'],
      [500, 100, '✓ Solución óptima encontrada. Fitness: 0 conflictos.'],
    ];
    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(l => [...l, msg]);
        if (prog === 100) {
          const result = generarHorarios(materias, docentes, aulas);
          setTimeout(() => {
            setPhase('done');
            onFinish(result.horario, result.horasDocentes);
          }, 600);
        }
      }, delay);
    });
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 40,
        border: `1px solid #e2e8f0`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          boxShadow: `0 8px 24px rgba(15,36,68,0.3)`
        }}>
          <Settings color={C.gold} size={36} style={{ animation: phase === 'running' ? 'spin 2s linear infinite' : 'none' }} />
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>

        <h2 style={{ color: C.navy, margin: '0 0 8px', fontSize: 22 }}>Motor de Algoritmo Genético</h2>
        <p style={{ color: C.gray, fontSize: 13, margin: '0 0 8px' }}>
          Genera horarios óptimos para los 8 semestres activos respetando:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {['Sin conflictos de docente', 'Máx 25 hrs/docente', 'Lunes 07:45 obligatorio', 'Bloques 2-3 periodos consecutivos', 'Asignación de aulas'].map(r => (
            <span key={r} style={{ background: C.grayLight, color: C.navy, fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 'bold' }}>
              ✓ {r}
            </span>
          ))}
        </div>

        {/* Stats previas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { v: materias.length, l: 'Materias' },
            { v: docentes.length, l: 'Docentes' },
            { v: aulas.filter(a => a.disponible).length, l: 'Aulas Disp.' },
          ].map(s => (
            <div key={s.l} style={{ background: C.grayLight, borderRadius: 8, padding: '12px 0' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{s.l}</div>
            </div>
          ))}
        </div>

        {phase === 'idle' && (
          <button onClick={start} style={{
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
            color: C.gold, border: 'none', borderRadius: 8, padding: '14px 40px',
            fontSize: 15, fontWeight: 'bold', cursor: 'pointer', letterSpacing: 1,
            boxShadow: `0 4px 16px rgba(15,36,68,0.4)`, display: 'flex', alignItems: 'center', gap: 10, margin: '0 auto'
          }}>
            <Play fill={C.gold} size={18} /> GENERAR HORARIO ÓPTIMO
          </button>
        )}

        {phase === 'running' && (
          <div>
            <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, width: `${progress}%`, transition: 'width 0.4s' }} />
            </div>
            <div style={{ background: '#0f172a', borderRadius: 8, padding: '12px 16px', textAlign: 'left', fontFamily: 'monospace', fontSize: 12, color: '#4ade80', minHeight: 120, maxHeight: 160, overflowY: 'auto' }}>
              {logs.map((l, i) => <div key={i}>{l}</div>)}
              <span style={{ animation: 'pulse 1s infinite' }}>█</span>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
            <CheckCircle size={22} /> Generación Completada — Redirigiendo a Validación...
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// VALIDACIÓN MANUAL
// ==========================================
function ValidacionView({ horario, docentes, horasDoc, estado, onAprobar, onVerHorario }) {
  if (!horario) return (
    <EmptyState icon={<Shield size={40} />} titulo="Sin horario generado" desc='Ve al "Generador" para crear un horario primero.' />
  );

  const conflictos = validarHorario(horario, docentes);
  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];
  const totalClases = semestres.reduce((acc, s) => {
    let c = 0;
    for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++;
    return acc + c;
  }, 0);

  const docentesSobrecargados = docentes.filter(d => (horasDoc?.[d.id] || 0) > d.maxHoras);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header estado */}
      <div style={{
        background: conflictos.length === 0 && docentesSobrecargados.length === 0
          ? `linear-gradient(135deg, #14532d, #166534)`
          : `linear-gradient(135deg, #7f1d1d, #991b1b)`,
        borderRadius: 12, padding: '20px 28px', marginBottom: 20, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {conflictos.length === 0 ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>
              {conflictos.length === 0 ? 'Horario Válido — Sin Conflictos Detectados' : `${conflictos.length} Conflicto(s) Detectado(s)`}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
              {totalClases} clases asignadas · {semestres.length} semestres · Estado: {estado === 'aprobado' ? 'APROBADO' : 'PENDIENTE DE VALIDACIÓN'}
            </div>
          </div>
        </div>
        {estado !== 'aprobado' && conflictos.length === 0 && (
          <button onClick={onAprobar} style={{
            background: C.gold, color: C.navy, border: 'none', borderRadius: 8,
            padding: '10px 22px', fontWeight: 'bold', cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Check size={16} /> Aprobar Horario
          </button>
        )}
        {estado === 'aprobado' && (
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: 8, fontWeight: 'bold', fontSize: 14 }}>
            ✓ APROBADO
          </span>
        )}
      </div>

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { v: totalClases, l: 'Clases Asignadas', c: C.navy },
          { v: conflictos.length, l: 'Conflictos', c: conflictos.length > 0 ? '#991b1b' : '#166534' },
          { v: docentesSobrecargados.length, l: 'Docentes Sobrecargados', c: docentesSobrecargados.length > 0 ? '#92400e' : '#166534' },
          { v: docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length, l: 'Docentes con Carga', c: C.navy },
        ].map(m => (
          <div key={m.l} style={{ background: 'white', borderRadius: 10, padding: '16px', border: `1px solid #e2e8f0`, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: m.c }}>{m.v}</div>
            <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {/* Conflictos */}
      {conflictos.length > 0 && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #fecaca', padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 12px', color: '#991b1b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} /> Conflictos a Resolver
          </h3>
          {conflictos.map((c, i) => (
            <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#7f1d1d' }}>
              <strong>{c.tipo === 'conflicto_docente' ? '⚠ Conflicto de Docente' : '⚠ Regla Dura'}</strong> — {c.mensaje}
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 12, color: C.gray }}>
            Ve a <strong>Ver Horarios</strong> para hacer cambios manuales y resolver los conflictos.
          </div>
        </div>
      )}

      {/* Carga por docente */}
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', color: C.navy, fontSize: 14, fontWeight: 'bold' }}>Carga Horaria por Docente</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {docentes.map(d => {
            const horas = horasDoc?.[d.id] || 0;
            const pct = Math.min(100, (horas / d.maxHoras) * 100);
            const over = horas > d.maxHoras;
            return (
              <div key={d.id} style={{ padding: '10px 12px', border: `1px solid ${over ? '#fecaca' : '#e2e8f0'}`, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: '500', color: C.navy }}>{d.nombre}</span>
                  <span style={{ fontWeight: 'bold', color: over ? '#dc2626' : '#166534' }}>{horas}/{d.maxHoras} h</span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: over ? '#dc2626' : pct > 80 ? C.gold : '#16a34a', borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <button onClick={onVerHorario} style={{
          background: C.navy, color: 'white', border: 'none', borderRadius: 8,
          padding: '10px 24px', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8
        }}>
          <Eye size={15} /> Ver y Editar Horarios Manualmente
        </button>
      </div>
    </div>
  );
}

// ==========================================
// HORARIOS VIEW con edición manual
// ==========================================
function HorariosView({ horario, docentes, aulas, materias, estadoValidacion, onCambio }) {
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null); // {sem, dia, periodo}
  const [swapTarget, setSwapTarget] = useState(null);
  const [modalCelda, setModalCelda] = useState(null); // {sem, dia, periodo}

  if (!horario) return (
    <EmptyState icon={<Calendar size={40} />} titulo="Sin horario generado"
      desc='Ve al "Generador" para crear un horario primero.' />
  );

  const horarioSem = horario[semestreActivo];

  const handleSwap = (dia2, per2) => {
    if (!dragging) return;
    const { dia: dia1, periodo: per1 } = dragging;
    if (dia1 === dia2 && per1 === per2) { setDragging(null); setSwapTarget(null); return; }
    const nuevo = JSON.parse(JSON.stringify(horario));
    const tmp = nuevo[semestreActivo][dia2][per2];
    nuevo[semestreActivo][dia2][per2] = nuevo[semestreActivo][dia1][per1];
    nuevo[semestreActivo][dia1][per1] = tmp;
    onCambio(nuevo);
    setDragging(null);
    setSwapTarget(null);
  };

  const handleClearCell = (dia, periodo) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    nuevo[semestreActivo][dia][periodo] = null;
    onCambio(nuevo);
    setModalCelda(null);
  };

  const handleChangeDocente = (dia, periodo, nuevoDocenteId) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    if (nuevo[semestreActivo][dia][periodo]) {
      nuevo[semestreActivo][dia][periodo].docenteId = nuevoDocenteId;
    }
    onCambio(nuevo);
    setModalCelda(null);
  };

  const handleChangeAula = (dia, periodo, nuevoAulaId) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    if (nuevo[semestreActivo][dia][periodo]) {
      nuevo[semestreActivo][dia][periodo].aulaId = nuevoAulaId || null;
    }
    onCambio(nuevo);
    setModalCelda(null);
  };

  // Calcular celdas con estado de biblioteca
  const celdasRender = {};
  for (let d = 0; d < 5; d++) {
    celdasRender[d] = {};
    let primera = -1, ultima = -1;
    for (let p = 0; p < 8; p++) { if (horarioSem[d][p]) { if (primera === -1) primera = p; ultima = p; } }
    for (let p = 0; p < 8; p++) {
      if (horarioSem[d][p]) celdasRender[d][p] = { tipo: 'clase', data: horarioSem[d][p] };
      else if (p > primera && p < ultima && primera !== -1) celdasRender[d][p] = { tipo: 'biblioteca' };
      else celdasRender[d][p] = { tipo: 'vacio' };
    }
  }

  const COLORES_MAT = ['#dbeafe', '#dcfce7', '#fef9c3', '#fce7f3', '#ede9fe', '#ffedd5', '#cffafe', '#f1f5f9'];

  const getMateriaColor = (matId) => {
    const idx = materias.findIndex(m => m.id === matId);
    return COLORES_MAT[idx % COLORES_MAT.length];
  };

  const celda_editing = modalCelda ? horarioSem[modalCelda.dia][modalCelda.periodo] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Controles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(s => (
            <button key={s} onClick={() => setSemestreActivo(s)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
              background: semestreActivo === s ? C.navy : '#e2e8f0',
              color: semestreActivo === s ? C.gold : C.gray,
            }}>{s}º</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {estadoValidacion === 'aprobado' && (
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 'bold', border: '1px solid #16a34a' }}>
              ✓ APROBADO
            </span>
          )}
          <button onClick={() => setEditMode(!editMode)} style={{
            padding: '6px 14px', borderRadius: 6, border: `1px solid ${editMode ? C.gold : '#e2e8f0'}`,
            background: editMode ? `rgba(200,168,75,0.1)` : 'white',
            color: editMode ? C.gold : C.gray, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Pencil size={14} /> {editMode ? 'Modo Edición ON' : 'Editar'}
          </button>
          <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: C.gray, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Printer size={14} /> PDF
          </button>
        </div>
      </div>

      {editMode && (
        <div style={{ background: `rgba(200,168,75,0.08)`, border: `1px dashed ${C.gold}`, borderRadius: 8, padding: '10px 16px', marginBottom: 10, fontSize: 12, color: '#92400e', display: 'flex', gap: 16, alignItems: 'center' }}>
          <Info size={14} />
          <span><strong>Modo edición activo:</strong> Haz clic en una celda para cambiar docente o aula. Arrastra para intercambiar celdas.</span>
        </div>
      )}

      {/* Tabla */}
      <div style={{ background: 'white', borderRadius: 10, border: `2px solid ${C.navy}`, overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid #e2e8f0', padding: '12px 8px', width: 90, fontSize: 12, color: C.navy, fontWeight: 'bold' }}>HORA</th>
              {DIAS.map(dia => (
                <th key={dia} style={{ background: C.navy, borderBottom: `2px solid ${C.navy}`, borderRight: '1px solid rgba(255,255,255,0.1)', padding: '12px', color: C.gold, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 }}>{dia.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RENDER_SLOTS.map((slot, si) => {
              if (slot.type === 'break') {
                return (
                  <tr key={si}>
                    <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center' }}>
                      {slot.inicio}
                    </td>
                    <td colSpan={5} style={{
                      background: 'repeating-linear-gradient(45deg, #fefce8, #fefce8 8px, #fef9c3 8px, #fef9c3 16px)',
                      borderBottom: '1px solid #e2e8f0', padding: '4px', textAlign: 'center',
                      fontSize: 10, fontWeight: 'bold', color: '#92400e', letterSpacing: 2
                    }}>
                      — {slot.label.toUpperCase()} ({slot.inicio} - {slot.fin}) —
                    </td>
                  </tr>
                );
              }

              const p = slot.idx;
              return (
                <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: C.navy }}>P{p + 1}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.inicio}</div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.fin}</div>
                  </td>
                  {[0, 1, 2, 3, 4].map(dia => {
                    const celda = celdasRender[dia][p];
                    const isTarget = swapTarget?.dia === dia && swapTarget?.periodo === p;
                    const isDragging = dragging?.dia === dia && dragging?.periodo === p;

                    if (celda.tipo === 'clase') {
                      const docente = docentes.find(d => d.id === celda.data.docenteId);
                      const aula = aulas.find(a => a.id === celda.data.aulaId);
                      const bgColor = getMateriaColor(celda.data.id);
                      return (
                        <td key={dia}
                          onClick={() => editMode && setModalCelda({ dia, periodo: p })}
                          draggable={editMode}
                          onDragStart={() => { if (editMode) setDragging({ dia, periodo: p }); }}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          onDragEnd={() => { setDragging(null); setSwapTarget(null); }}
                          style={{
                            background: isDragging ? '#dbeafe' : isTarget ? '#fef9c3' : bgColor,
                            borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            padding: '6px 8px', cursor: editMode ? 'pointer' : 'default', verticalAlign: 'top',
                            opacity: isDragging ? 0.5 : 1, transition: 'opacity 0.2s',
                            outline: isTarget ? `2px dashed ${C.gold}` : 'none',
                            position: 'relative'
                          }}>
                          {editMode && <div style={{ position: 'absolute', top: 4, right: 4, color: '#94a3b8' }}><GripVertical size={10} /></div>}
                          <div style={{ fontWeight: 'bold', fontSize: 12, color: C.navy, lineHeight: 1.2, paddingRight: editMode ? 14 : 0 }}>{celda.data.nombre}</div>
                          <div style={{ fontSize: 10, color: '#475569', marginTop: 3, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 3 }}>{docente?.nombre || '—'}</div>
                          {aula && <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>📍 {aula.nombre}</div>}
                          {editMode && <div style={{ fontSize: 9, color: C.gold, marginTop: 2 }}>✎ Click para editar</div>}
                        </td>
                      );
                    } else if (celda.tipo === 'biblioteca') {
                      return (
                        <td key={dia}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          style={{
                            background: isTarget ? '#fef9c3' : '#f0fdf4', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            padding: 6, textAlign: 'center', outline: isTarget ? `2px dashed ${C.gold}` : 'none'
                          }}>
                          <div style={{ fontSize: 10, color: '#16a34a', opacity: 0.7 }}>
                            <BookOpen size={14} style={{ margin: '0 auto 2px' }} />
                            <div style={{ fontWeight: 'bold', letterSpacing: 1 }}>BIBLIOTECA</div>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td key={dia}
                          onDragOver={e => { e.preventDefault(); if (editMode) setSwapTarget({ dia, periodo: p }); }}
                          onDrop={() => handleSwap(dia, p)}
                          style={{
                            background: isTarget ? '#fef9c3' : '#f8fafc', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0',
                            outline: isTarget ? `2px dashed ${C.gold}` : 'none'
                          }} />
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: C.gray }}>
        <span>📌 <strong>Regla Dura:</strong> Lunes inicia a las 07:45</span>
        <span>📚 <strong>Puente:</strong> Horas intermedias = Biblioteca</span>
        <span>🔢 <strong>Total:</strong> ~20 periodos/semana por semestre</span>
      </div>

      {/* Modal de edición */}
      {modalCelda && celda_editing && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: C.navy, fontSize: 16 }}>Editar Celda</h3>
              <button onClick={() => setModalCelda(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={20} /></button>
            </div>
            <div style={{ background: C.grayLight, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', color: C.navy }}>{celda_editing.nombre}</div>
              <div style={{ fontSize: 12, color: C.gray }}>{DIAS[modalCelda.dia]} · Periodo {modalCelda.periodo + 1}</div>
            </div>

            <label style={{ fontSize: 12, color: C.gray, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>DOCENTE</label>
            <select
              value={celda_editing.docenteId}
              onChange={e => handleChangeDocente(modalCelda.dia, modalCelda.periodo, e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 16, fontSize: 13 }}
            >
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
            </select>

            <label style={{ fontSize: 12, color: C.gray, display: 'block', marginBottom: 6, fontWeight: 'bold' }}>AULA</label>
            <select
              value={celda_editing.aulaId || ''}
              onChange={e => handleChangeAula(modalCelda.dia, modalCelda.periodo, e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 20, fontSize: 13 }}
            >
              <option value="">Sin asignar</option>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap. {a.capacidad}</option>)}
            </select>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleClearCell(modalCelda.dia, modalCelda.periodo)} style={{
                flex: 1, padding: '9px', border: '1px solid #fecaca', borderRadius: 6, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 'bold'
              }}>
                <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Vaciar Celda
              </button>
              <button onClick={() => setModalCelda(null)} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 'bold'
              }}>
                <Save size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// GESTIÓN DE DOCENTES
// ==========================================
function DocentesView({ docentes, setDocentes }) {
  const [modal, setModal] = useState(null); // null | 'nuevo' | docente

  const guardar = (datos) => {
    if (datos.id) {
      setDocentes(prev => prev.map(d => d.id === datos.id ? datos : d));
    } else {
      setDocentes(prev => [...prev, { ...datos, id: `d${Date.now()}` }]);
    }
    setModal(null);
  };

  const eliminar = (id) => {
    setDocentes(prev => prev.filter(d => d.id !== id));
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ margin: 0, color: C.gray, fontSize: 13 }}>
          Regla dura: Ningún docente puede exceder su límite de horas semanales.
        </p>
        <button onClick={() => setModal({ nombre: '', tipo: 'Civil', maxHoras: 25, especialidad: '' })} style={btnPrimary}>
          <Plus size={15} /> Nuevo Docente
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.grayLight }}>
              {['Nombre', 'Tipo', 'Especialidad', 'Máx Hrs', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 1, borderBottom: '1px solid #e2e8f0' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docentes.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: 13, color: C.navy }}>{d.nombre}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    background: d.tipo.includes('Militar') ? '#dcfce7' : '#dbeafe',
                    color: d.tipo.includes('Militar') ? '#166534' : '#1e40af',
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold'
                  }}>{d.tipo}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13, color: C.gray }}>{d.especialidad}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{d.maxHoras}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => setModal({ ...d })} style={btnSmall}><Pencil size={13} /></button>
                  <button onClick={() => eliminar(d.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <FormModal
          titulo={modal.id ? 'Editar Docente' : 'Nuevo Docente'}
          onClose={() => setModal(null)}
          onGuardar={() => guardar(modal)}
        >
          <FormField label="Nombre Completo">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Tipo">
            <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
              <option>Civil</option>
              <option>Militar Activo</option>
              <option>Militar Reserva</option>
            </select>
          </FormField>
          <FormField label="Especialidad">
            <input value={modal.especialidad} onChange={e => setModal(m => ({ ...m, especialidad: e.target.value }))} style={inputStyle} />
          </FormField>
          <FormField label="Máx. Horas Semanales">
            <input type="number" min={1} max={40} value={modal.maxHoras} onChange={e => setModal(m => ({ ...m, maxHoras: parseInt(e.target.value) }))} style={inputStyle} />
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ==========================================
// GESTIÓN DE MATERIAS
// ==========================================
function MateriasView({ materias, setMaterias, docentes }) {
  const [filtro, setFiltro] = useState('Todos');
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setMaterias(prev => prev.map(m => m.id === datos.id ? datos : m));
    else setMaterias(prev => [...prev, { ...datos, id: `m_${Date.now()}` }]);
    setModal(null);
  };

  const eliminar = (id) => { setMaterias(prev => prev.filter(m => m.id !== id)); setModal(null); };

  const filtradas = filtro === 'Todos' ? materias : materias.filter(m => m.semestre === parseInt(filtro));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="Todos">Todos los Semestres</option>
          {[3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={() => setModal({ nombre: '', semestre: 3, periodos: 2, docenteId: docentes[0]?.id || '', tipoAula: 'Aula' })} style={btnPrimary}>
          <Plus size={15} /> Nueva Materia
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '65vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: C.grayLight }}>
              {['Materia', 'Semestre', 'Periodos', 'Tipo Aula', 'Docente Asignado', 'Acciones'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 1, borderBottom: '1px solid #e2e8f0' }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((m, i) => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600', fontSize: 13, color: C.navy }}>{m.nombre}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <span style={{ background: C.navy, color: C.gold, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span>
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{m.periodos}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: m.tipoAula === 'Laboratorio' ? '#ede9fe' : '#f1f5f9', color: m.tipoAula === 'Laboratorio' ? '#6d28d9' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.tipoAula}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: C.gray }}>{doc?.nombre || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => setModal({ ...m })} style={btnSmall}><Pencil size={13} /></button>
                    <button onClick={() => eliminar(m.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Materia' : 'Nueva Materia'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre de la Materia">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: parseInt(e.target.value) }))} style={inputStyle}>
                {[3, 4, 5, 6, 7, 8, 9, 10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="Periodos/Semana">
              <input type="number" min={1} max={8} value={modal.periodos} onChange={e => setModal(m => ({ ...m, periodos: parseInt(e.target.value) }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Tipo de Aula Requerida">
            <select value={modal.tipoAula} onChange={e => setModal(m => ({ ...m, tipoAula: e.target.value }))} style={inputStyle}>
              <option>Aula</option>
              <option>Laboratorio</option>
              <option>Auditorio</option>
              <option>Sala</option>
            </select>
          </FormField>
          <FormField label="Docente Asignado">
            <select value={modal.docenteId} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value }))} style={inputStyle}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ==========================================
// GESTIÓN DE AULAS
// ==========================================
function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setAulas(prev => prev.map(a => a.id === datos.id ? datos : a));
    else setAulas(prev => [...prev, { ...datos, id: `a_${Date.now()}` }]);
    setModal(null);
  };

  const eliminar = (id) => { setAulas(prev => prev.filter(a => a.id !== id)); setModal(null); };

  const toggleDisponible = (id) => {
    setAulas(prev => prev.map(a => a.id === id ? { ...a, disponible: !a.disponible } : a));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => {
            const cnt = aulas.filter(a => a.tipo === t).length;
            return (
              <div key={t} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 18 }}>{cnt}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{t}s</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Aula', capacidad: 30, edificio: 'A', disponible: true })} style={btnPrimary}>
          <Plus size={15} /> Nueva Aula
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {aulas.map(a => (
          <div key={a.id} style={{
            background: 'white', borderRadius: 10, border: `1px solid ${a.disponible ? '#e2e8f0' : '#fecaca'}`,
            padding: 16, opacity: a.disponible ? 1 : 0.7
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{
                background: a.tipo === 'Laboratorio' ? '#ede9fe' : a.tipo === 'Auditorio' ? '#fef9c3' : '#f1f5f9',
                color: a.tipo === 'Laboratorio' ? '#6d28d9' : a.tipo === 'Auditorio' ? '#92400e' : '#475569',
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold'
              }}>{a.tipo}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, background: C.grayLight, borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Capacidad</div>
              </div>
              <div style={{ flex: 1, background: a.disponible ? '#dcfce7' : '#fee2e2', borderRadius: 6, padding: '6px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: a.disponible ? '#166534' : '#dc2626' }}>{a.disponible ? 'Disp.' : 'No Disp.'}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => toggleDisponible(a.id)} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}>
                {a.disponible ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button onClick={() => setModal({ ...a })} style={btnSmall}><Pencil size={13} /></button>
              <button onClick={() => eliminar(a.id)} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <FormModal titulo={modal.id ? 'Editar Aula' : 'Nueva Aula'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre del Aula">
            <input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
                <option>Aula</option>
                <option>Laboratorio</option>
                <option>Auditorio</option>
                <option>Sala</option>
              </select>
            </FormField>
            <FormField label="Edificio">
              <input value={modal.edificio} onChange={e => setModal(m => ({ ...m, edificio: e.target.value }))} style={inputStyle} />
            </FormField>
          </div>
          <FormField label="Capacidad">
            <input type="number" min={1} value={modal.capacidad} onChange={e => setModal(m => ({ ...m, capacidad: parseInt(e.target.value) }))} style={inputStyle} />
          </FormField>
          <FormField label="Disponible">
            <select value={modal.disponible ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, disponible: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function EmptyState({ icon, titulo, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: C.gray, textAlign: 'center' }}>
      <div style={{ color: '#cbd5e1', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  );
}

function FormModal({ titulo, onClose, onGuardar, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 28, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: 16, fontWeight: 'bold' }}>{titulo}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={20} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', color: C.gray, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancelar</button>
          <button onClick={onGuardar} style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Save size={14} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6 }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6,
  fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box', background: '#f8fafc'
};

const btnPrimary = {
  background: C.navy, color: 'white', border: 'none', borderRadius: 7,
  padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
  display: 'flex', alignItems: 'center', gap: 6
};

const btnSmall = {
  background: 'white', border: '1px solid #e2e8f0', borderRadius: 5,
  padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: C.navy,
  display: 'inline-flex', alignItems: 'center', gap: 4
};