import React, { useState, useEffect } from 'react';
import {
  Lock, User, LogIn, Calendar, Users, BookOpen,
  Settings, LogOut, CheckCircle, AlertTriangle, Play,
  Clock, Menu, Printer, Building2, Plus, Pencil, Trash2,
  X, Save, ChevronDown, AlertCircle, Check, RefreshCw,
  GripVertical, Info, Shield, Eye, FileText, Download,
  BarChart2, Bell, UserCheck, Key, ClipboardList, Search,
  Filter, ChevronRight, Home, Database, Layers, FileDown,
  BookMarked, Archive, Activity, TrendingUp, Hash
} from 'lucide-react';

const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100% !important; height: 100% !important; min-height: 100vh; overflow: hidden; }
    body { font-family: 'Georgia', serif; }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .fade-in { animation: fadeIn 0.3s ease; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  `}</style>
);

const C = {
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
const INIT_USUARIOS = [
  { id: 'u1', nombre: 'Administrador SAGH', usuario: 'admin', password: 'emi123', rol: 'Administrador', email: 'admin@emi.edu.bo', activo: true, docenteId: null },
  { id: 'u2', nombre: 'Cap. Frank Silvestre', usuario: 'jefe.carrera', password: 'jefe123', rol: 'Jefe de Carrera', email: 'fsilvestre@emi.edu.bo', activo: true, docenteId: null },
  { id: 'u3', nombre: 'Secretaría DDE', usuario: 'dde', password: 'dde123', rol: 'DDE', email: 'dde@emi.edu.bo', activo: true, docenteId: null },
];

const ROLES = ['Administrador', 'Jefe de Carrera', 'DDE', 'Docente'];

const PERMISOS_ROL = {
  'Administrador': ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'Jefe de Carrera': ['mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'DDE': ['mod2', 'mod3', 'mod4', 'mod5', 'mod6'],
  'Docente': ['mod4', 'mod6'],
};

const INIT_DOCENTES = [
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

const INIT_GRUPOS = [
  { id: 'g3', nombre: 'Sistemas 3°', semestre: 3, numEstudiantes: 35, aulaFijaId: null },
  { id: 'g4', nombre: 'Sistemas 4°', semestre: 4, numEstudiantes: 32, aulaFijaId: null },
  { id: 'g5', nombre: 'Sistemas 5°', semestre: 5, numEstudiantes: 28, aulaFijaId: null },
  { id: 'g6', nombre: 'Sistemas 6°', semestre: 6, numEstudiantes: 30, aulaFijaId: null },
  { id: 'g7', nombre: 'Sistemas 7°', semestre: 7, numEstudiantes: 26, aulaFijaId: null },
  { id: 'g8', nombre: 'Sistemas 8°', semestre: 8, numEstudiantes: 24, aulaFijaId: null },
  { id: 'g9', nombre: 'Sistemas 9°', semestre: 9, numEstudiantes: 20, aulaFijaId: null },
  { id: 'g10', nombre: 'Sistemas 10°', semestre: 10, numEstudiantes: 18, aulaFijaId: null },
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

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
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
// ALGORITMO GENÉTICO
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

  const dividirEnBloques = (n) => {
    if (n === 2) return [2];
    if (n === 3) return [3];
    if (n === 4) return [2, 2];
    if (n === 5) return [3, 2];
    if (n === 6) return [3, 3];
    if (n === 7) return [3, 2, 2];
    if (n === 8) return [3, 3, 2];
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

    const bloquesPendientes = [];
    // Preclasificación: materias críticas primero (HU-41)
    const materiasOrdenadas = [...materiasSem].sort((a, b) => (b.critica ? 1 : 0) - (a.critica ? 1 : 0));
    materiasOrdenadas.forEach(m => {
      dividirEnBloques(m.periodos).forEach(tam => bloquesPendientes.push({ mat: m, tam }));
    });
    bloquesPendientes.sort((a, b) => b.tam - a.tam);

    let lunesOk = false;
    for (let i = 0; i < bloquesPendientes.length && !lunesOk; i++) {
      const { mat, tam } = bloquesPendientes[i];
      if (puedeColocar(mat, 0, 0, tam)) {
        colocar(mat, 0, 0, tam);
        bloquesPendientes.splice(i, 1);
        lunesOk = true;
      }
    }

    bloquesPendientes.forEach(({ mat, tam }) => {
      const diasOcupados = new Set();
      for (let d = 0; d < 5; d++)
        for (let p = 0; p < 8; p++)
          if (horario[sem][d][p]?.id === mat.id) diasOcupados.add(d);

      const ordenDias = [0,1,2,3,4].sort((a,b) => (diasOcupados.has(a)?1:0) - (diasOcupados.has(b)?1:0));
      let asignado = false;
      for (const dia of ordenDias) {
        if (asignado) break;
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
            conflictos.push({ tipo: 'cruce_docente', mensaje: `Docente en conflicto el ${DIAS[dia]} P${p+1}`, sem: parseInt(sem), dia, periodo: p });
          }
          ocupacionDocentes[celda.docenteId][key] = true;
        }
      }
    }
  });

  Object.keys(horario).forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      const celdas = horario[sem][dia];
      let p = 0;
      while (p < 8) {
        if (celdas[p]) {
          const matId = celdas[p].id;
          let len = 1;
          while (p + len < 8 && celdas[p+len]?.id === matId) len++;
          if (len === 1) {
            conflictos.push({ tipo: 'bloque_suelto', mensaje: `Sem ${sem}: "${celdas[p].nombre}" bloque suelto el ${DIAS[dia]}`, sem: parseInt(sem), dia, periodo: p });
          }
          p += len;
        } else { p++; }
      }
    }
  });

  Object.keys(horario).forEach(sem => {
    if (!horario[sem][0][0]) {
      conflictos.push({ tipo: 'regla_dura', mensaje: `Sem ${sem}: Sin clase el Lunes 07:45`, sem: parseInt(sem) });
    }
  });

  return conflictos;
};

// ==========================================
// APP PRINCIPAL
// ==========================================
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado global
  const [usuarios, setUsuarios] = useState(INIT_USUARIOS);
  const [docentes, setDocentes] = useState(INIT_DOCENTES);
  const [materias, setMaterias] = useState(INIT_MATERIAS);
  const [aulas, setAulas] = useState(INIT_AULAS);
  const [grupos, setGrupos] = useState(INIT_GRUPOS);
  const [horarioData, setHorarioData] = useState(null);
  const [horasDocData, setHorasDocData] = useState(null);
  const [estadoHorario, setEstadoHorario] = useState(null); // null | 'pendiente' | 'aprobado'
  const [historial, setHistorial] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const addNotif = (msg, tipo = 'info') => {
    const n = { id: Date.now(), msg, tipo, fecha: new Date().toLocaleString() };
    setNotificaciones(prev => [n, ...prev].slice(0, 20));
  };

  const onHorarioGenerado = (horario, horas) => {
    setHorarioData(horario);
    setHorasDocData(horas);
    setEstadoHorario('pendiente');
    const entry = { id: Date.now(), accion: 'Horario generado', usuario: usuario?.nombre, fecha: new Date().toLocaleString(), estado: 'pendiente' };
    setHistorial(prev => [entry, ...prev]);
    addNotif('Horario generado — pendiente de validación', 'warning');
    setActiveTab('mod4');
  };

  const onHorarioCambiado = (nuevoHorario) => {
    setHorarioData(nuevoHorario);
    setEstadoHorario('pendiente');
    addNotif('Horario modificado manualmente', 'info');
  };

  const onAprobar = () => {
    setEstadoHorario('aprobado');
    const entry = { id: Date.now(), accion: 'Horario aprobado', usuario: usuario?.nombre, fecha: new Date().toLocaleString(), estado: 'aprobado' };
    setHistorial(prev => [entry, ...prev]);
    addNotif('Horario aprobado formalmente', 'success');
    setActiveTab('mod4');
  };

  if (!usuario) return <Login usuarios={usuarios} onLogin={u => { setUsuario(u); setActiveTab('dashboard'); }} />;

  const permisos = PERMISOS_ROL[usuario.rol] || [];
  const canAccess = (mod) => permisos.includes(mod);

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} />, always: true },
    { id: 'mod1', label: 'Administracion del Sistema', icon: <Shield size={16} />, mod: 'mod1' },
    { id: 'mod2', label: 'Gestión Académica', icon: <Database size={16} />, mod: 'mod2' },
    { id: 'mod3', label: 'Generación de Horarios', icon: <Play size={16} />, mod: 'mod3' },
    { id: 'mod4', label: 'Gestion Horarios', icon: <Calendar size={16} />, mod: 'mod4', badge: estadoHorario === 'pendiente' },
    { id: 'mod5', label: 'Validación', icon: <CheckCircle size={16} />, mod: 'mod5' },
    { id: 'mod6', label: 'Reportes', icon: <FileText size={16} />, mod: 'mod6' },
  ].filter(t => t.always || canAccess(t.mod));

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Georgia', serif", position: 'fixed', inset: 0 }}>
      <GlobalStyles />

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 230 : 56, background: C.navy, color: 'white', display: 'flex', flexDirection: 'column', transition: 'width 0.25s', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 58 }}>
          {sidebarOpen && (
            <div>
              <div style={{ color: C.gold, fontWeight: 'bold', fontSize: 14, letterSpacing: 2 }}>EMI — SAGH</div>
              <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1 }}>Sistema Acad. de Horarios</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <Menu size={16} />
          </button>
        </div>

        {sidebarOpen && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: 11 }}>
            <div style={{ color: '#94a3b8' }}>Sesión activa</div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 12, marginTop: 2 }}>{usuario.nombre}</div>
            <span style={{ background: 'rgba(200,168,75,0.2)', color: C.gold, fontSize: 10, padding: '1px 8px', borderRadius: 10 }}>{usuario.rol}</span>
          </div>
        )}

        <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: sidebarOpen ? '9px 14px' : '9px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              background: activeTab === t.id ? 'rgba(200,168,75,0.15)' : 'none',
              borderLeft: activeTab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
              border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              color: activeTab === t.id ? C.gold : '#94a3b8',
              cursor: 'pointer', fontSize: 12, position: 'relative', whiteSpace: 'nowrap'
            }}>
              {t.icon}
              {sidebarOpen && <span>{t.label}</span>}
              {t.badge && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 7, height: 7, position: 'absolute', right: 10, top: 8 }} />}
            </button>
          ))}
        </nav>

        <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && estadoHorario && (
            <div style={{ background: estadoHorario === 'aprobado' ? 'rgba(22,101,52,0.3)' : 'rgba(200,168,75,0.15)', border: `1px solid ${estadoHorario === 'aprobado' ? '#16a34a' : C.gold}`, borderRadius: 6, padding: '5px 8px', marginBottom: 8, fontSize: 10, color: estadoHorario === 'aprobado' ? '#4ade80' : C.gold, display: 'flex', alignItems: 'center', gap: 5 }}>
              {estadoHorario === 'aprobado' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
              {estadoHorario === 'aprobado' ? 'Horario Aprobado' : 'Pendiente Validación'}
            </div>
          )}
          <button onClick={() => setUsuario(null)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, justifyContent: sidebarOpen ? 'flex-start' : 'center', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#f87171', cursor: 'pointer', padding: '6px 8px', fontSize: 11 }}>
            <LogOut size={13} />
            {sidebarOpen && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ background: 'white', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `3px solid ${C.gold}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 18, background: C.gold, borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 'bold', color: C.navy }}>
              {TABS.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NotifBell notificaciones={notificaciones} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.gray }}>
              <User size={13} /> <span>{usuario.nombre}</span>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="fade-in">
          {activeTab === 'dashboard' && <DashboardView docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horarioData={horarioData} estadoHorario={estadoHorario} historial={historial} notificaciones={notificaciones} onNavigate={setActiveTab} />}
          {activeTab === 'mod1' && <Mod1AdminView usuarios={usuarios} setUsuarios={setUsuarios} docentes={docentes} addNotif={addNotif} />}
          {activeTab === 'mod2' && <Mod2GestionAcadView docentes={docentes} setDocentes={setDocentes} materias={materias} setMaterias={setMaterias} aulas={aulas} setAulas={setAulas} grupos={grupos} setGrupos={setGrupos} />}
          {activeTab === 'mod3' && <Mod3GeneradorView materias={materias} docentes={docentes} aulas={aulas} onFinish={onHorarioGenerado} />}
          {activeTab === 'mod4' && <Mod4HorariosView horario={horarioData} docentes={docentes} aulas={aulas} materias={materias} estadoHorario={estadoHorario} onCambio={onHorarioCambiado} usuario={usuario}  />}
          {activeTab === 'mod5' && <Mod5ValidacionView horario={horarioData} docentes={docentes} horasDoc={horasDocData} estado={estadoHorario} onAprobar={onAprobar} onVerHorario={() => setActiveTab('mod4')} historial={historial} addNotif={addNotif} usuario={usuario}/>}
          {activeTab === 'mod6' && <Mod6ReportesView horario={horarioData} docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horasDoc={horasDocData} estadoHorario={estadoHorario} />}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// NOTIFICACIONES
// ==========================================
function NotifBell({ notificaciones }) {
  const [open, setOpen] = useState(false);
  const nLeidas = notificaciones.length;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: C.gray, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, position: 'relative' }}>
        <Bell size={14} />
        {nLeidas > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: -4, right: -4 }}>{Math.min(nLeidas, 9)}</span>}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 34, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 300, zIndex: 200, maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', fontSize: 12, color: C.navy }}>Notificaciones</div>
          {notificaciones.length === 0 && <div style={{ padding: 16, fontSize: 12, color: C.gray, textAlign: 'center' }}>Sin notificaciones</div>}
          {notificaciones.map(n => (
            <div key={n.id} style={{ padding: '8px 14px', borderBottom: '1px solid #f8fafc', fontSize: 11 }}>
              <div style={{ color: n.tipo === 'success' ? '#16a34a' : n.tipo === 'warning' ? '#92400e' : C.navy }}>{n.msg}</div>
              <div style={{ color: '#94a3b8', marginTop: 2 }}>{n.fecha}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// LOGIN
// ==========================================
function Login({ usuarios, onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true); setError('');
    setTimeout(() => {
      const u = usuarios.find(u => u.usuario === user && u.password === pass && u.activo);
      if (u) onLogin(u);
      else { setError('Credenciales incorrectas o usuario inactivo.'); setLoading(false); }
    }, 600);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C.navy} 0%, #0a1a35 60%, ${C.navyLight} 100%)`, fontFamily: "'Georgia', serif", overflow: 'auto' }}>
      <GlobalStyles />
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 400, padding: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: `1px solid rgba(200,168,75,0.3)`, borderRadius: 16, padding: '40px 36px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 70, height: 70, background: `radial-gradient(circle, ${C.gold}, #8b6914)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: `0 0 28px rgba(200,168,75,0.4)` }}>
            <Calendar color="white" size={30} />
          </div>
          <h1 style={{ color: C.gold, margin: '0 0 4px', fontSize: 20, letterSpacing: 3 }}>SAGH — EMI</h1>
          <p style={{ color: '#64748b', fontSize: 11, margin: '0 0 24px', letterSpacing: 1 }}>SISTEMA AUTOMÁTICO DE GENERACIÓN DE HORARIOS</p>

          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px', marginBottom: 16, fontSize: 11, color: '#94a3b8', textAlign: 'left' }}>
            <div style={{ fontWeight: 'bold', color: C.gold, marginBottom: 4 }}>Usuarios de prueba:</div>
            <div>admin / emi123 → Administrador</div>
            <div>jefe.carrera / jefe123 → Jefe de Carrera</div>
            <div>dde / dde123 → DDE</div>
          </div>

          {error && <div style={{ background: 'rgba(153,27,27,0.3)', border: '1px solid #991b1b', color: '#fca5a5', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>{error}</div>}

          {[['USUARIO', user, setUser, 'text', 'admin'], ['CONTRASEÑA', pass, setPass, 'password', '••••••']].map(([label, val, setter, type, ph]) => (
            <div key={label} style={{ marginBottom: 12, textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 10, color: '#94a3b8', letterSpacing: 1, marginBottom: 5 }}>{label}</label>
              <input type={type} value={val} onChange={e => setter(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder={ph}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,168,75,0.2)', borderRadius: 8, color: 'white', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '11px', background: `linear-gradient(135deg, ${C.gold}, #8b6914)`, border: 'none', borderRadius: 8, color: C.navy, fontWeight: 'bold', fontSize: 13, cursor: 'pointer', letterSpacing: 1, opacity: loading ? 0.7 : 1, marginTop: 8 }}>
            {loading ? 'VERIFICANDO...' : 'INGRESAR AL SISTEMA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD
// ==========================================
function DashboardView({ docentes, materias, aulas, grupos, horarioData, estadoHorario, historial, notificaciones, onNavigate }) {
  const stats = [
    { v: docentes.length, l: 'Docentes', icon: <Users size={20} />, color: C.navy, mod: 'mod2' },
    { v: materias.length, l: 'Materias', icon: <BookOpen size={20} />, color: C.blue, mod: 'mod2' },
    { v: aulas.filter(a => a.disponible).length, l: 'Aulas Disp.', icon: <Building2 size={20} />, color: C.green, mod: 'mod2' },
    { v: grupos.length, l: 'Grupos', icon: <Layers size={20} />, color: C.purple, mod: 'mod2' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', color: C.navy, fontSize: 18 }}>Bienvenido al SAGH</h2>
        <p style={{ color: C.gray, fontSize: 13, margin: 0 }}>Escuela Militar de Ingeniería · Carrera de Ingeniería de Sistemas · Gestión I/2026</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <button key={s.l} onClick={() => onNavigate(s.mod)} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}>
            <div style={{ background: s.color, color: 'white', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: C.navy }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{s.l}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Estado del horario */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={15} /> Estado del Sistema
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Horario Generado', ok: !!horarioData },
              { label: 'Validación Completada', ok: estadoHorario === 'aprobado' },
              { label: 'Restricciones Configuradas', ok: true },
              { label: 'Docentes Cargados', ok: docentes.length > 0 },
              { label: 'Materias Cargadas', ok: materias.length > 0 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: C.gray }}>{item.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: item.ok ? '#16a34a' : '#94a3b8', fontWeight: 'bold' }}>
                  {item.ok ? <CheckCircle size={13} /> : <Clock size={13} />}
                  {item.ok ? 'OK' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos rápidos */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={15} /> Acceso Rápido a Módulos
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'mod3', label: 'Generar Horario', desc: 'Algoritmo Genético', icon: <Play size={14} />, color: C.navy },
              { id: 'mod5', label: 'Validar Horario', desc: 'Verificar restricciones', icon: <CheckCircle size={14} />, color: '#16a34a' },
              { id: 'mod6', label: 'Ver Reportes', desc: 'Exportar PDF / Excel', icon: <FileText size={14} />, color: C.blue },
            ].map(m => (
              <button key={m.id} onClick={() => onNavigate(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ color: m.color, flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: C.navy }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>{m.desc}</div>
                </div>
                <ChevronRight size={13} style={{ marginLeft: 'auto', color: C.gray }} />
              </button>
            ))}
          </div>
        </div>

        {/* Historial */}
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClipboardList size={15} /> Historial de Cambios (HU-63)
          </h3>
          {historial.length === 0 ? (
            <div style={{ fontSize: 12, color: C.gray, textAlign: 'center', padding: '16px 0' }}>Sin actividad registrada aún</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {historial.slice(0, 5).map(h => (
                <div key={h.id} style={{ display: 'flex', gap: 10, fontSize: 12, padding: '6px 10px', background: '#f8fafc', borderRadius: 6 }}>
                  <span style={{ color: C.gold }}>{h.fecha}</span>
                  <span style={{ color: C.navy, fontWeight: 'bold' }}>{h.accion}</span>
                  <span style={{ color: C.gray }}>— {h.usuario}</span>
                  <span style={{ marginLeft: 'auto', color: h.estado === 'aprobado' ? '#16a34a' : '#92400e', fontWeight: 'bold', fontSize: 11 }}>{h.estado?.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// : ADMINISTRACIÓN DEL SISTEMA
// ==========================================
function Mod1AdminView({ usuarios, setUsuarios, docentes, addNotif }) {
  const [subTab, setSubTab] = useState('usuarios');
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const guardarUsuario = (datos) => {
    if (datos.id) setUsuarios(prev => prev.map(u => u.id === datos.id ? datos : u));
    else setUsuarios(prev => [...prev, { ...datos, id: `u${Date.now()}` }]);
    addNotif(datos.id ? 'Usuario actualizado' : 'Usuario creado', 'success');
    setModal(null);
  };

  const eliminarUsuario = (id) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    addNotif('Usuario eliminado', 'info');
    setModal(null);
  };

  const toggleActivo = (id) => {
    setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  };

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.usuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['usuarios', 'Usuarios', <Users size={14}/>], ['roles', 'Roles y Permisos', <Shield size={14}/>], ['configuracion', 'Configuración', <Settings size={14}/>]].map(([id, label, icon]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === id ? C.navy : '#e2e8f0', color: subTab === id ? C.gold : C.gray }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {subTab === 'usuarios' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: C.gray }} />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar usuario..." style={{ ...inputStyle, paddingLeft: 30 }} />
            </div>
            <button onClick={() => setModal({ nombre: '', usuario: '', password: '', rol: 'DDE', email: '', activo: true, docenteId: null })} style={btnPrimary}>
              <Plus size={14} /> Nuevo Usuario
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.grayLight }}>
                  {['Nombre', 'Usuario', 'Rol', 'Email', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={thStyle}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy }}>{u.nombre}</span></td>
                    <td style={tdStyle}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{u.usuario}</code></td>
                    <td style={tdStyle}><RolBadge rol={u.rol} /></td>
                    <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{u.email}</span></td>
                    <td style={tdStyle}>
                      <button onClick={() => toggleActivo(u.id)} style={{ background: u.activo ? '#dcfce7' : '#fee2e2', color: u.activo ? '#16a34a' : '#dc2626', border: 'none', borderRadius: 12, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 'bold' }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button onClick={() => setModal({ ...u })} style={btnSmall}><Pencil size={12} /></button>
                      <button onClick={() => eliminarUsuario(u.id)} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'roles' && (
        <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.grayLight }}>
                <th style={thStyle}>ROL</th>
                {['MOD-1 Admin', 'MOD-2 Acad.', 'MOD-3 Generación', 'MOD-4 Horarios', 'MOD-5 Valid.', 'MOD-6 Reportes'].map(m => (
                  <th key={m} style={thStyle}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((rol, i) => {
                const perms = PERMISOS_ROL[rol] || [];
                return (
                  <tr key={rol} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={tdStyle}><RolBadge rol={rol} /></td>
                    {['mod1','mod2','mod3','mod4','mod5','mod6'].map(m => (
                      <td key={m} style={{ ...tdStyle, textAlign: 'center' }}>
                        {perms.includes(m) ? <CheckCircle size={15} color="#16a34a" /> : <X size={15} color="#cbd5e1" />}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'configuracion' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Gestión Activa', valor: 'I/2026', desc: 'Periodo académico actual' },
            { label: 'Carrera', valor: 'Ing. de Sistemas', desc: 'Unidad académica' },
            { label: 'Semestres Activos', valor: '3°, 4°, 5°, 6°, 7°, 8°, 9°, 10°', desc: 'Semestres en el sistema' },
            { label: 'Horario', valor: '07:45 – 14:15', desc: 'Rango de clases diario' },
            { label: 'Periodos por día', valor: '8 periodos + 2 recesos', desc: 'Estructura de la jornada' },
            { label: 'Reglamento', valor: 'RAC-03', desc: 'Normativa aplicada' },
          ].map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 18px' }}>
              <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>{c.desc}</div>
              <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{c.label}</div>
              <div style={{ color: C.gold, fontWeight: 'bold', marginTop: 4 }}>{c.valor}</div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <FormModal titulo={modal.id ? 'Editar Usuario' : 'Nuevo Usuario'} onClose={() => setModal(null)} onGuardar={() => guardarUsuario(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Usuario"><input value={modal.usuario} onChange={e => setModal(m => ({ ...m, usuario: e.target.value }))} style={inputStyle} /></FormField>
            <FormField label="Contraseña"><input type="password" value={modal.password} onChange={e => setModal(m => ({ ...m, password: e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Rol">
            <select value={modal.rol} onChange={e => setModal(m => ({ ...m, rol: e.target.value }))} style={inputStyle}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Email Institucional"><input value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Estado">
            <select value={modal.activo ? 'activo' : 'inactivo'} onChange={e => setModal(m => ({ ...m, activo: e.target.value === 'activo' }))} style={inputStyle}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function RolBadge({ rol }) {
  const colors = { 'Administrador': [C.navy, C.gold], 'Jefe de Carrera': [C.green, '#dcfce7'], 'DDE': [C.blue, C.blueLight], 'Docente': [C.gray, C.grayLight] };
  const [bg, fg] = colors[rol] || [C.gray, C.grayLight];
  return <span style={{ background: fg, color: bg, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{rol}</span>;
}

// ==========================================
// MOD-2: GESTIÓN ACADÉMICA
// ==========================================
function Mod2GestionAcadView({ docentes, setDocentes, materias, setMaterias, aulas, setAulas, grupos, setGrupos }) {
  const [subTab, setSubTab] = useState('docentes');

  const subTabs = [
    { id: 'docentes', label: 'Docentes', icon: <Users size={14}/> },
    { id: 'materias', label: 'Materias', icon: <BookOpen size={14}/> },
    { id: 'aulas', label: 'Aulas', icon: <Building2 size={14}/> },
    { id: 'grupos', label: 'Grupos', icon: <Layers size={14}/> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {subTab === 'docentes' && <DocentesView docentes={docentes} setDocentes={setDocentes} />}
      {subTab === 'materias' && <MateriasView materias={materias} setMaterias={setMaterias} docentes={docentes} />}
      {subTab === 'aulas' && <AulasView aulas={aulas} setAulas={setAulas} />}
      {subTab === 'grupos' && <GruposView grupos={grupos} setGrupos={setGrupos} aulas={aulas} />}
    </div>
  );
}

function DocentesView({ docentes, setDocentes }) {
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const guardar = (datos) => {
    if (datos.id) setDocentes(prev => prev.map(d => d.id === datos.id ? datos : d));
    else setDocentes(prev => [...prev, { ...datos, id: `d${Date.now()}` }]);
    setModal(null);
  };

  const filtrados = docentes.filter(d => d.nombre.toLowerCase().includes(busqueda.toLowerCase()) || d.especialidad.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 260 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: 9, color: C.gray }} />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar docente..." style={{ ...inputStyle, paddingLeft: 30 }} />
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Civil', maxHoras: 25, minHoras: 10, especialidad: '', email: '', disponibilidad: [0,1,2,3,4] })} style={btnPrimary}>
          <Plus size={14} /> Nuevo Docente
        </button>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: C.grayLight }}>
              {['Nombre', 'Tipo', 'Especialidad', 'Email', 'Hrs Mín/Máx', 'Acciones'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{d.nombre}</span></td>
                <td style={tdStyle}><span style={{ background: d.tipo.includes('Militar') ? '#dcfce7' : '#dbeafe', color: d.tipo.includes('Militar') ? '#166534' : '#1e40af', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{d.tipo}</span></td>
                <td style={tdStyle}><span style={{ fontSize: 13, color: C.gray }}>{d.especialidad}</span></td>
                <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{d.email}</span></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ fontWeight: 'bold', color: C.navy }}>{d.minHoras}–{d.maxHoras} h</span></td>
                <td style={tdStyle}>
                  <button onClick={() => setModal({ ...d })} style={btnSmall}><Pencil size={12} /></button>
                  <button onClick={() => setDocentes(prev => prev.filter(x => x.id !== d.id))} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal !== null && (
        <FormModal titulo={modal.id ? 'Editar Docente' : 'Nuevo Docente'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Tipo">
            <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
              {['Civil', 'Militar Activo', 'Militar Reserva'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Especialidad"><input value={modal.especialidad} onChange={e => setModal(m => ({ ...m, especialidad: e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Email Institucional"><input value={modal.email} onChange={e => setModal(m => ({ ...m, email: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Mín. Horas/Semana"><input type="number" min={1} max={40} value={modal.minHoras} onChange={e => setModal(m => ({ ...m, minHoras: +e.target.value }))} style={inputStyle} /></FormField>
            <FormField label="Máx. Horas/Semana"><input type="number" min={1} max={40} value={modal.maxHoras} onChange={e => setModal(m => ({ ...m, maxHoras: +e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Disponibilidad (días)">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DIAS.map((dia, idx) => (
                <button key={dia} type="button" onClick={() => setModal(m => ({ ...m, disponibilidad: m.disponibilidad.includes(idx) ? m.disponibilidad.filter(d => d !== idx) : [...m.disponibilidad, idx] }))}
                  style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${modal.disponibilidad.includes(idx) ? C.navy : '#e2e8f0'}`, background: modal.disponibilidad.includes(idx) ? C.navy : 'white', color: modal.disponibilidad.includes(idx) ? 'white' : C.gray, fontSize: 12, cursor: 'pointer' }}>
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function MateriasView({ materias, setMaterias, docentes }) {
  const [filtro, setFiltro] = useState('Todos');
  const [modal, setModal] = useState(null);

  const guardar = (datos) => {
    if (datos.id) setMaterias(prev => prev.map(m => m.id === datos.id ? datos : m));
    else setMaterias(prev => [...prev, { ...datos, id: `m_${Date.now()}` }]);
    setModal(null);
  };

  const filtradas = filtro === 'Todos' ? materias : materias.filter(m => m.semestre === parseInt(filtro));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="Todos">Todos los Semestres</option>
          {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={() => setModal({ nombre: '', semestre: 3, periodos: 2, docenteId: docentes[0]?.id || '', tipoAula: 'Aula', critica: false })} style={btnPrimary}>
          <Plus size={14} /> Nueva Materia
        </button>
      </div>
      <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden', maxHeight: '60vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr style={{ background: C.grayLight }}>
              {['Materia', 'Sem.', 'Periodos', 'Tipo Aula', 'Crítica', 'Docente Asignado', 'Acciones'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((m, i) => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={tdStyle}><span style={{ fontWeight: 'bold', fontSize: 13, color: C.navy }}>{m.nombre}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 'bold', color: C.navy }}>{m.periodos}</td>
                  <td style={tdStyle}><span style={{ background: m.tipoAula === 'Laboratorio' ? '#ede9fe' : '#f1f5f9', color: m.tipoAula === 'Laboratorio' ? '#6d28d9' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{m.tipoAula}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{m.critica ? <span style={{ color: '#dc2626', fontWeight: 'bold', fontSize: 12 }}>★</span> : <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                  <td style={tdStyle}><span style={{ fontSize: 12, color: C.gray }}>{doc?.nombre || '—'}</span></td>
                  <td style={tdStyle}>
                    <button onClick={() => setModal({ ...m })} style={btnSmall}><Pencil size={12} /></button>
                    <button onClick={() => setMaterias(prev => prev.filter(x => x.id !== m.id))} style={{ ...btnSmall, marginLeft: 6, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Materia' : 'Nueva Materia'} onClose={() => setModal(null)} onGuardar={() => guardar(modal)}>
          <FormField label="Nombre de la Materia"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="Periodos/Semana"><input type="number" min={1} max={8} value={modal.periodos} onChange={e => setModal(m => ({ ...m, periodos: +e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Tipo de Aula">
            <select value={modal.tipoAula} onChange={e => setModal(m => ({ ...m, tipoAula: e.target.value }))} style={inputStyle}>
              {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => <option key={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Docente Asignado">
            <select value={modal.docenteId} onChange={e => setModal(m => ({ ...m, docenteId: e.target.value }))} style={inputStyle}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </FormField>
          <FormField label="Materia Crítica (HU-41)">
            <select value={modal.critica ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, critica: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí — prioridad alta en el AG</option>
              <option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => {
            const cnt = aulas.filter(a => a.tipo === t).length;
            return (
              <div key={t} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{cnt}</div>
                <div style={{ fontSize: 11, color: C.gray }}>{t}s</div>
              </div>
            );
          })}
        </div>
        <button onClick={() => setModal({ nombre: '', tipo: 'Aula', capacidad: 30, edificio: 'A', disponible: true })} style={btnPrimary}>
          <Plus size={14} /> Nueva Aula
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {aulas.map(a => (
          <div key={a.id} style={{ background: 'white', borderRadius: 10, border: `1px solid ${a.disponible ? '#e2e8f0' : '#fecaca'}`, padding: 14, opacity: a.disponible ? 1 : 0.75 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 14 }}>{a.nombre}</div>
                <div style={{ fontSize: 11, color: C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{ background: a.tipo === 'Laboratorio' ? '#ede9fe' : a.tipo === 'Auditorio' ? '#fef9c3' : '#f1f5f9', color: a.tipo === 'Laboratorio' ? '#6d28d9' : a.tipo === 'Auditorio' ? '#92400e' : '#475569', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{a.tipo}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, background: C.grayLight, borderRadius: 6, padding: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Capacidad</div>
              </div>
              <div style={{ flex: 1, background: a.disponible ? '#dcfce7' : '#fee2e2', borderRadius: 6, padding: 6, textAlign: 'center' }}>
                <div style={{ fontWeight: 'bold', color: a.disponible ? '#166534' : '#dc2626' }}>{a.disponible ? 'Disponible' : 'No Disp.'}</div>
                <div style={{ fontSize: 10, color: C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setAulas(prev => prev.map(x => x.id === a.id ? { ...x, disponible: !x.disponible } : x))} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}>
                {a.disponible ? 'Deshabilitar' : 'Habilitar'}
              </button>
              <button onClick={() => setModal({ ...a })} style={btnSmall}><Pencil size={12} /></button>
              <button onClick={() => setAulas(prev => prev.filter(x => x.id !== a.id))} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Aula' : 'Nueva Aula'} onClose={() => setModal(null)} onGuardar={() => {
          if (modal.id) setAulas(prev => prev.map(a => a.id === modal.id ? modal : a));
          else setAulas(prev => [...prev, { ...modal, id: `a_${Date.now()}` }]);
          setModal(null);
        }}>
          <FormField label="Nombre del Aula"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Tipo">
              <select value={modal.tipo} onChange={e => setModal(m => ({ ...m, tipo: e.target.value }))} style={inputStyle}>
                {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Edificio"><input value={modal.edificio} onChange={e => setModal(m => ({ ...m, edificio: e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Capacidad"><input type="number" min={1} value={modal.capacidad} onChange={e => setModal(m => ({ ...m, capacidad: +e.target.value }))} style={inputStyle} /></FormField>
          <FormField label="Disponible">
            <select value={modal.disponible ? 'si' : 'no'} onChange={e => setModal(m => ({ ...m, disponible: e.target.value === 'si' }))} style={inputStyle}>
              <option value="si">Sí</option><option value="no">No</option>
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

function GruposView({ grupos, setGrupos, aulas }) {
  const [modal, setModal] = useState(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={() => setModal({ nombre: '', semestre: 3, numEstudiantes: 30, aulaFijaId: null })} style={btnPrimary}>
          <Plus size={14} /> Nuevo Grupo
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {grupos.map(g => {
          const aulaFija = aulas.find(a => a.id === g.aulaFijaId);
          return (
            <div key={g.id} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: C.navy }}>{g.nombre}</div>
                  <div style={{ fontSize: 11, color: C.gray }}>{g.numEstudiantes} estudiantes</div>
                </div>
                <span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{g.semestre}°</span>
              </div>
              {aulaFija && <div style={{ fontSize: 11, color: C.blue, background: C.blueLight, padding: '3px 8px', borderRadius: 6, marginBottom: 8 }}>📍 Aula fija: {aulaFija.nombre}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setModal({ ...g })} style={{ ...btnSmall, flex: 1, justifyContent: 'center' }}><Pencil size={12} /> Editar</button>
                <button onClick={() => setGrupos(prev => prev.filter(x => x.id !== g.id))} style={{ ...btnSmall, color: '#dc2626', borderColor: '#fecaca' }}><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <FormModal titulo={modal.id ? 'Editar Grupo' : 'Nuevo Grupo'} onClose={() => setModal(null)} onGuardar={() => {
          if (modal.id) setGrupos(prev => prev.map(g => g.id === modal.id ? modal : g));
          else setGrupos(prev => [...prev, { ...modal, id: `g${Date.now()}` }]);
          setModal(null);
        }}>
          <FormField label="Nombre del Grupo"><input value={modal.nombre} onChange={e => setModal(m => ({ ...m, nombre: e.target.value }))} style={inputStyle} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Semestre">
              <select value={modal.semestre} onChange={e => setModal(m => ({ ...m, semestre: +e.target.value }))} style={inputStyle}>
                {[3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="N° Estudiantes"><input type="number" min={1} value={modal.numEstudiantes} onChange={e => setModal(m => ({ ...m, numEstudiantes: +e.target.value }))} style={inputStyle} /></FormField>
          </div>
          <FormField label="Aula Fija (HU-27)">
            <select value={modal.aulaFijaId || ''} onChange={e => setModal(m => ({ ...m, aulaFijaId: e.target.value || null }))} style={inputStyle}>
              <option value="">Sin aula fija</option>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} — Cap. {a.capacidad}</option>)}
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ==========================================
// MOD-3: GENERACIÓN DE HORARIOS
// ==========================================
function Mod3GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [periodoAcademico, setPeriodoAcademico] = useState('2026-I');
  const [carrera, setCarrera] = useState('Ingeniería de Sistemas');
  const [restricciones, setRestricciones] = useState({
    disponibilidad: true,
    huecos: true,
    criticas: true,
    recesos: true,
    distribucion: true,
    bloques: true,
  });

  const BLOQUES = [
    { tipo: 'clase', label: 'Periodo 1: 07:45 - 08:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 2: 08:30 - 09:15', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 3: 09:15 - 10:00', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 10:00 - 10:15', dur: '15 minutos (automático cada 3 periodos)' },
    { tipo: 'clase', label: 'Periodo 4: 10:15 - 11:00', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 5: 11:00 - 11:45', dur: '45 minutos' },
    { tipo: 'receso', label: 'Receso: 11:45 - 12:00', dur: '15 minutos (automático cada 3 periodos)' },
    { tipo: 'clase', label: 'Periodo 6: 12:00 - 12:45', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 7: 12:45 - 13:30', dur: '45 minutos' },
    { tipo: 'clase', label: 'Periodo 8: 13:30 - 14:15', dur: '45 minutos' },
  ];

  const RESTRICCIONES_LABELS = [
    { key: 'disponibilidad', label: 'Respetar disponibilidad de docentes' },
    { key: 'huecos', label: 'Evitar huecos en horarios de docentes' },
    { key: 'criticas', label: 'Priorizar materias críticas' },
    { key: 'recesos', label: 'Recesos automáticos cada 3 periodos' },
    { key: 'distribucion', label: 'Distribución equitativa de carga' },
    { key: 'bloques', label: 'Bloques continuos de 2-3 periodos' },
  ];

  const start = () => {
    setPhase('running'); setProgress(0); setLogs([]);
    const steps = [
      [350, 8,  '↳ Inicializando población (50 individuos)...'],
      [400, 18, '↳ Preclasificando materias críticas (HU-41)...'],
      [600, 32, '↳ Calculando fitness: conflictos docentes, aulas y grupos...'],
      [600, 50, '↳ Selección por torneo. Cruce con probabilidad 0.8...'],
      [600, 65, '↳ Mutación (tasa 0.05). Evaluando generaciones...'],
      [500, 80, '↳ Verificando reglas duras: RAC-03, lunes 07:45, bloques 2-3...'],
      [500, 90, '↳ Verificando continuidad de bloques y recesos automáticos...'],
      [400, 100,'✓ Solución óptima encontrada. Fitness: 0 conflictos.'],
    ];
    let delay = 0;
    steps.forEach(([wait, prog, msg]) => {
      delay += wait;
      setTimeout(() => {
        setProgress(prog);
        setLogs(l => [...l, msg]);
        if (prog === 100) {
          const result = generarHorarios(materias, docentes, aulas);
          setTimeout(() => { setPhase('done'); onFinish(result.horario, result.horasDocentes); }, 500);
        }
      }, delay);
    });
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 'bold', color: C.navy }}>
          Generación de Horarios
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: C.gray }}>Periodo Académico 2026-I</p>
      </div>

      {/* Banner azul */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,
        borderRadius: 12, padding: '22px 28px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16
      }}>
        <div style={{ color: C.gold, fontSize: 28 }}>⚡</div>
        <div>
          <div style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>
            Módulo 3: Generación de Horarios
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 3 }}>
            Algoritmo genético para generación automática óptima
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* COLUMNA IZQUIERDA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Configuración del Periodo */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Settings size={18} color={C.gray} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
                Configuración del Periodo
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.gray, marginBottom: 8 }}>
                  Periodo Académico
                </label>
                <select
                  value={periodoAcademico}
                  onChange={e => setPeriodoAcademico(e.target.value)}
                  style={{ ...inputStyle, fontSize: 14 }}
                >
                  {['2026-I', '2026-II', '2025-I', '2025-II'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: C.gray, marginBottom: 8 }}>
                  Carrera
                </label>
                <select
                  value={carrera}
                  onChange={e => setCarrera(e.target.value)}
                  style={{ ...inputStyle, fontSize: 14 }}
                >
                  {['Ingeniería de Sistemas', 'Ingeniería Civil', 'Ingeniería Electrónica'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bloques Horarios */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Clock size={18} color={C.gold} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
                Bloques Horarios
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {BLOQUES.map((b, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: `1px solid ${b.tipo === 'receso' ? '#fef08a' : '#e2e8f0'}`,
                  background: b.tipo === 'receso' ? '#fefce8' : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: '600',
                      color: b.tipo === 'receso' ? '#92400e' : C.navy
                    }}>
                      {b.label}
                    </div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{b.dur}</div>
                  </div>
                  {b.tipo === 'receso' ? (
                    <Clock size={16} color={C.gold} />
                  ) : (
                    <span style={{
                      background: '#dcfce7', color: '#16a34a',
                      fontSize: 11, fontWeight: 'bold',
                      padding: '3px 12px', borderRadius: 20
                    }}>
                      Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Restricciones del Algoritmo */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 'bold', color: C.navy }}>
              Restricciones del Algoritmo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {RESTRICCIONES_LABELS.map(r => (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{r.label}</span>
                  {/* Toggle switch */}
                  <div
                    onClick={() => setRestricciones(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: restricciones[r.key] ? '#22c55e' : '#cbd5e1',
                      cursor: 'pointer', position: 'relative',
                      transition: 'background 0.2s', flexShrink: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: restricciones[r.key] ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Generador */}
          <div style={{
            background: 'white', borderRadius: 12,
            border: `2px solid ${C.gold}`, padding: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ color: C.gold, fontSize: 16 }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>Generador</h3>
            </div>

            {phase === 'idle' && (
              <button onClick={start} style={{
                width: '100%', padding: '14px',
                background: C.navy, color: 'white',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                letterSpacing: 0.5
              }}>
                <Play fill="white" size={17} /> Generar Horario
              </button>
            )}

            {phase === 'running' && (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.gray, marginBottom: 6 }}>
                    <span>Generando...</span><span>{progress}%</span>
                  </div>
                  <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, width: `${progress}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
                <div style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 10, color: '#4ade80', minHeight: 100, maxHeight: 140, overflowY: 'auto' }}>
                  {logs.map((l, i) => <div key={i}>{l}</div>)}
                  <span style={{ animation: 'pulse 1s infinite' }}>█</span>
                </div>
              </div>
            )}

            {phase === 'done' && (
              <div style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <CheckCircle size={18} /> ¡Completado! Redirigiendo...
              </div>
            )}
          </div>

          {/* Información */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 'bold', color: C.navy }}>
              Información
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                `${docentes.length} Docentes activos`,
                `${materias.length} Materias configuradas`,
                `8 Grupos (3° a 10°)`,
                `${aulas.filter(a => a.disponible).length} Aulas disponibles`,
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                  <span style={{ color: C.navy, fontWeight: 'bold' }}>•</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// MOD-4: GESTIÓN DE HORARIOS
// ==========================================
// ============================================================
// INSTRUCCIONES DE INSTALACIÓN
// ============================================================
// 1. Abre tu archivo: mi-react/src/SAGH.jsx
// 2. Busca la línea que dice:
//    function Mod4HorariosView({
// 3. Selecciona desde esa línea hasta el final de la función
//    Mod5ValidacionView (su llave de cierre })
//    que está justo ANTES del comentario:
//    // ==========================================
//    // MOD-6: REPORTES
// 4. Reemplaza TODO ese bloque con este archivo completo
// 5. En App(), busca la línea con <Mod4HorariosView y
//    agrégale el prop:  usuario={usuario}
// ============================================================

// ==========================================
// MOD-4: GESTIÓN DE HORARIOS
// HU-47,48,49,50,51,52,53,54
// REQ-46 al REQ-54, REQ-67
// ==========================================
function Mod4HorariosView({ horario, docentes, aulas, materias, estadoHorario, onCambio, usuario }) {

  // ── Estado de vistas ──
  const [vistaActiva, setVistaActiva] = useState('general');
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [filtroDia, setFiltroDia] = useState('Todos');

  // ── Filtros HU-48,49,50,51 ──
  const [filtroDocente, setFiltroDocente] = useState(docentes[0]?.id || '');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const [filtroAula, setFiltroAula] = useState('');
  const [filtroTipoAula, setFiltroTipoAula] = useState('Todos');

  // ── Edición HU-52,53,54 ──
  const [editMode, setEditMode] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [swapTarget, setSwapTarget] = useState(null);
  const [modalCelda, setModalCelda] = useState(null);
  const [cambiosPendientes, setCambiosPendientes] = useState([]);
  const [conflictosActivos, setConflictosActivos] = useState([]);
  const [historialManual, setHistorialManual] = useState([]);
  const [panelConflictos, setPanelConflictos] = useState(false);

  // ── Inicializar filtroAula ──
  useState(() => {
    const primera = aulas.find(a => a.disponible);
    if (primera) setFiltroAula(primera.id);
  });

  // ── Control de acceso HU-52 ──
  const puedeEditar = ['DDE','Administrador','Jefe de Carrera'].includes(usuario?.rol);

  const SEMESTRES = [3,4,5,6,7,8,9,10];

  if (!horario) return (
    <EmptyState
      icon={<Calendar size={40}/>}
      titulo="Sin horario generado"
      desc='Ve al "MOD-3 Generación" para crear un horario primero.'
    />
  );

  // ── Colores por materia ──
  const COLORES = ['#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe',
                   '#ffedd5','#cffafe','#f1f5f9','#fef2f2','#f0fdf4',
                   '#e0f2fe','#fef3c7','#d1fae5','#fde8ff','#fff7ed'];
  const getColor = (matId) => {
    const idx = materias.findIndex(m => m.id === matId);
    return COLORES[Math.abs(idx) % COLORES.length];
  };

  // ── Detección de conflictos HU-54 ──
  const detectarConflictos = (h) => {
    const lista = [];
    const ocupDoc = {};
    const ocupAula = {};
    SEMESTRES.forEach(sem => {
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          const c = h[sem]?.[d]?.[p];
          if (!c) continue;
          const kd = `${c.docenteId}-${d}-${p}`;
          if (ocupDoc[kd]) lista.push({ tipo:'cruce_docente', sem, dia:d, periodo:p, msg:`Docente duplicado: ${DIAS[d]} P${p+1} — Sem ${sem}°` });
          ocupDoc[kd] = true;
          if (c.aulaId) {
            const ka = `${c.aulaId}-${d}-${p}`;
            if (ocupAula[ka]) lista.push({ tipo:'cruce_aula', sem, dia:d, periodo:p, msg:`Aula duplicada: ${DIAS[d]} P${p+1} — Sem ${sem}°` });
            ocupAula[ka] = true;
          }
        }
      }
    });
    return lista;
  };

  const tienConflicto = (sem, dia, periodo) =>
    conflictosActivos.some(c => c.sem===sem && c.dia===dia && c.periodo===periodo);

  // ── Verificar disponibilidad HU-53 ──
  const verificarDisp = (docenteId, aulaId, dia, periodo, semIgnorar) => {
    const docOcup = SEMESTRES.some(s =>
      s !== semIgnorar && horario[s]?.[dia]?.[periodo]?.docenteId === docenteId
    );
    const aulaOcup = aulaId && SEMESTRES.some(s =>
      s !== semIgnorar && horario[s]?.[dia]?.[periodo]?.aulaId === aulaId
    );
    return { docOcup, aulaOcup };
  };

  // ── Swap drag & drop ──
  const handleSwap = (dia2, per2, sem2) => {
    if (!dragging || !editMode || !puedeEditar) return;
    const { dia:dia1, periodo:per1, semestre:sem1 } = dragging;
    if (dia1===dia2 && per1===per2 && sem1===sem2) { setDragging(null); setSwapTarget(null); return; }
    const nuevo = JSON.parse(JSON.stringify(horario));
    const tmp = nuevo[sem1][dia1][per1];
    nuevo[sem1][dia1][per1] = nuevo[sem2][dia2][per2];
    nuevo[sem2][dia2][per2] = tmp;
    const conflictos = detectarConflictos(nuevo);
    setConflictosActivos(conflictos);
    const entrada = { id:Date.now(), accion:`Swap ${DIAS[dia1]} P${per1+1} ↔ ${DIAS[dia2]} P${per2+1} (Sem ${sem1}°)`, fecha:new Date().toLocaleString(), usuario:usuario?.nombre, tipo:'swap', conflictos:conflictos.length };
    setHistorialManual(p=>[entrada,...p].slice(0,50));
    setCambiosPendientes(p=>[...p, entrada]);
    onCambio(nuevo);
    setDragging(null); setSwapTarget(null);
  };

  // ── Guardar reasignación HU-53 ──
  const guardarReasig = (dia, periodo, sem, newDocId, newAulaId) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    if (!nuevo[sem][dia][periodo]) { setModalCelda(null); return; }
    const ant = nuevo[sem][dia][periodo];
    nuevo[sem][dia][periodo] = { ...ant, docenteId:newDocId, aulaId:newAulaId||null };
    const conflictos = detectarConflictos(nuevo);
    setConflictosActivos(conflictos);
    const docNuevo = docentes.find(d=>d.id===newDocId)?.nombre || '—';
    const aulaNueva = aulas.find(a=>a.id===newAulaId)?.nombre || 'Sin aula';
    const entrada = { id:Date.now(), accion:`Reasig. "${ant.nombre}": Doc→${docNuevo}, Aula→${aulaNueva}`, fecha:new Date().toLocaleString(), usuario:usuario?.nombre, tipo:'reasignacion', conflictos:conflictos.length };
    setHistorialManual(p=>[entrada,...p].slice(0,50));
    setCambiosPendientes(p=>[...p, entrada]);
    onCambio(nuevo);
    setModalCelda(null);
  };

  // ── Vaciar celda ──
  const vaciarCelda = (dia, periodo, sem) => {
    const nuevo = JSON.parse(JSON.stringify(horario));
    const ant = nuevo[sem][dia][periodo];
    nuevo[sem][dia][periodo] = null;
    const entrada = { id:Date.now(), accion:`Vaciado: "${ant?.nombre}" — ${DIAS[dia]} P${periodo+1} Sem ${sem}°`, fecha:new Date().toLocaleString(), usuario:usuario?.nombre, tipo:'vaciado', conflictos:0 };
    setHistorialManual(p=>[entrada,...p].slice(0,50));
    setCambiosPendientes(p=>[...p, entrada]);
    onCambio(nuevo);
    setModalCelda(null);
  };

  // ════════════════════════════════════
  // COMPONENTE: Celda individual
  // ════════════════════════════════════
  const Celda = ({ celda, dia, periodo, sem, compacto=false }) => {
    if (!celda) return null;
    const doc = docentes.find(d=>d.id===celda.docenteId);
    const aula = aulas.find(a=>a.id===celda.aulaId);
    const confl = tienConflicto(sem, dia, periodo);
    const isDrag = dragging?.dia===dia && dragging?.periodo===periodo && dragging?.semestre===sem;
    const isTarget = swapTarget?.dia===dia && swapTarget?.periodo===periodo;
    return (
      <div
        onClick={()=> editMode && puedeEditar && setModalCelda({dia,periodo,sem})}
        draggable={editMode && puedeEditar}
        onDragStart={()=> editMode && puedeEditar && setDragging({dia,periodo,semestre:sem})}
        onDragOver={e=>{ e.preventDefault(); editMode && puedeEditar && setSwapTarget({dia,periodo}); }}
        onDrop={()=> handleSwap(dia,periodo,sem)}
        onDragEnd={()=>{ setDragging(null); setSwapTarget(null); }}
        style={{
          background: confl?'#fef2f2': isDrag?'#dbeafe': isTarget?'#fef9c3': getColor(celda.id),
          border: confl?'2px solid #dc2626': isTarget?`2px dashed ${C.gold}`:'1px solid rgba(0,0,0,0.06)',
          borderRadius:4, padding: compacto?'3px 5px':'5px 7px',
          cursor: editMode&&puedeEditar?'pointer':'default',
          opacity: isDrag?0.5:1, position:'relative',
          minHeight: compacto?44:56, height:'100%'
        }}
        title={`${celda.nombre} | ${doc?.nombre||'—'} | ${aula?.nombre||'Sin aula'}`}
      >
        {celda.critica && <span style={{position:'absolute',top:2,right:4,color:'#dc2626',fontSize:9,fontWeight:'bold'}}>★</span>}
        {confl && <span style={{position:'absolute',top:2,left:4,color:'#dc2626',fontSize:9}}>⚠</span>}
        <div style={{fontWeight:'bold',fontSize:compacto?10:11,color:C.navy,lineHeight:1.2}}>
          {compacto && celda.nombre.length>20 ? celda.nombre.slice(0,20)+'…' : celda.nombre}
        </div>
        <div style={{fontSize:compacto?9:10,color:'#475569',marginTop:2}}>{doc?.nombre||'—'}</div>
        {aula && <div style={{fontSize:9,color:'#64748b',marginTop:1}}>📍{aula.nombre}</div>}
      </div>
    );
  };

  // ════════════════════════════════════
  // COMPONENTE: Tabla de horario
  // ════════════════════════════════════
  const TablaHorario = ({ sem, diasFiltro='Todos', semFijo=null }) => {
    const semUsar = semFijo || sem;
    const hSem = horario[semUsar];
    const diasMostrar = diasFiltro==='Todos' ? [0,1,2,3,4] : [DIAS.indexOf(diasFiltro)].filter(x=>x>=0);
    const celdasRender = {};
    for (let d=0;d<5;d++) {
      celdasRender[d]={};
      let primera=-1,ultima=-1;
      for (let p=0;p<8;p++) { if(hSem[d][p]){ if(primera===-1)primera=p; ultima=p; } }
      for (let p=0;p<8;p++) {
        if (hSem[d][p]) celdasRender[d][p]={tipo:'clase',data:hSem[d][p]};
        else if (p>primera&&p<ultima&&primera!==-1) celdasRender[d][p]={tipo:'biblioteca'};
        else celdasRender[d][p]={tipo:'vacio'};
      }
    }
    return (
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
        <thead>
          <tr>
            <th style={{background:'#f8fafc',borderBottom:`2px solid ${C.navy}`,borderRight:'1px solid #e2e8f0',padding:'8px 6px',width:68,fontSize:10,color:C.navy,fontWeight:'bold'}}>HORA</th>
            {diasMostrar.map(dia=>(
              <th key={dia} style={{background:C.navy,borderBottom:`2px solid ${C.navy}`,borderRight:'1px solid rgba(255,255,255,0.1)',padding:'8px',color:C.gold,fontSize:11,fontWeight:'bold',letterSpacing:1}}>
                {DIAS[dia].toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RENDER_SLOTS.map((slot,si)=>{
            if(slot.type==='break') return (
              <tr key={si}>
                <td style={{background:'#f8fafc',borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:'2px 6px',fontSize:9,fontFamily:'monospace',color:'#94a3b8',textAlign:'center'}}>{slot.inicio}</td>
                <td colSpan={diasMostrar.length} style={{background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)',borderBottom:'1px solid #e2e8f0',padding:'2px',textAlign:'center',fontSize:9,fontWeight:'bold',color:'#92400e',letterSpacing:2}}>
                  — RECESO ({slot.inicio} - {slot.fin}) —
                </td>
              </tr>
            );
            const p=slot.idx;
            return (
              <tr key={si} style={{borderBottom:'1px solid #e2e8f0'}}>
                <td style={{background:'#f8fafc',borderRight:'1px solid #e2e8f0',padding:'5px',textAlign:'center',verticalAlign:'middle'}}>
                  <div style={{fontSize:10,fontWeight:'bold',color:C.navy}}>P{p+1}</div>
                  <div style={{fontSize:8,fontFamily:'monospace',color:'#94a3b8'}}>{slot.inicio}</div>
                </td>
                {diasMostrar.map(dia=>{
                  const celda=celdasRender[dia][p];
                  const isT=swapTarget?.dia===dia&&swapTarget?.periodo===p;
                  if(celda.tipo==='clase') return (
                    <td key={dia}
                      onDragOver={e=>{e.preventDefault();editMode&&puedeEditar&&setSwapTarget({dia,periodo:p});}}
                      onDrop={()=>handleSwap(dia,p,semUsar)}
                      style={{borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:3,verticalAlign:'top',outline:isT?`2px dashed ${C.gold}`:'none'}}>
                      <Celda celda={celda.data} dia={dia} periodo={p} sem={semUsar}/>
                    </td>
                  );
                  if(celda.tipo==='biblioteca') return (
                    <td key={dia}
                      onDragOver={e=>{e.preventDefault();editMode&&puedeEditar&&setSwapTarget({dia,periodo:p});}}
                      onDrop={()=>handleSwap(dia,p,semUsar)}
                      style={{background:isT?'#fef9c3':'#f0fdf4',borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:5,textAlign:'center',outline:isT?`2px dashed ${C.gold}`:'none'}}>
                      <div style={{fontSize:9,color:'#16a34a',opacity:0.7}}>
                        <BookOpen size={10} style={{margin:'0 auto 1px'}}/>
                        <div style={{fontSize:8,fontWeight:'bold',letterSpacing:1}}>LIBRE</div>
                      </div>
                    </td>
                  );
                  return (
                    <td key={dia}
                      onDragOver={e=>{e.preventDefault();editMode&&puedeEditar&&setSwapTarget({dia,periodo:p});}}
                      onDrop={()=>handleSwap(dia,p,semUsar)}
                      style={{background:isT?'#fef9c3':'#f8fafc',borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',outline:isT?`2px dashed ${C.gold}`:'none'}}/>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // ════════════════════════════════════
  // HU-47: Vista General — REQ-47, REQ-67
  // ════════════════════════════════════
  const VistaGeneral = () => (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:11,color:C.gray,fontWeight:'bold'}}>SEM:</span>
        {SEMESTRES.map(s=>(
          <button key={s} onClick={()=>setSemestreActivo(s)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:'bold',background:semestreActivo===s?C.navy:'#e2e8f0',color:semestreActivo===s?C.gold:C.gray}}>{s}°</button>
        ))}
        <span style={{fontSize:11,color:C.gray,fontWeight:'bold',marginLeft:8}}>DÍA:</span>
        {['Todos',...DIAS].map(d=>(
          <button key={d} onClick={()=>setFiltroDia(d)} style={{padding:'4px 9px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:'bold',background:filtroDia===d?C.gold:'#e2e8f0',color:filtroDia===d?C.navy:C.gray}}>
            {d==='Todos'?'Todos':d.slice(0,3)}
          </button>
        ))}
      </div>
      <div style={{background:'white',borderRadius:10,border:`2px solid ${C.navy}`,overflow:'auto'}}>
        <TablaHorario sem={semestreActivo} diasFiltro={filtroDia}/>
      </div>
    </div>
  );

  // ════════════════════════════════════
  // HU-48: Vista por Docente — REQ-48
  // ════════════════════════════════════
  const VistaDocente = () => {
    const doc = docentes.find(d=>d.id===filtroDocente);
    const mapaDoc = Array(5).fill(null).map(()=>Array(8).fill(null));
    SEMESTRES.forEach(sem=>{
      for(let d=0;d<5;d++) for(let p=0;p<8;p++){
        const c=horario[sem]?.[d]?.[p];
        if(c?.docenteId===filtroDocente) mapaDoc[d][p]={...c,semestre:sem};
      }
    });
    const totalH = mapaDoc.flat().filter(Boolean).length;
    const sobre = doc && totalH > doc.maxHoras;
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <label style={{fontSize:12,color:C.gray,fontWeight:'bold'}}>DOCENTE:</label>
          <select value={filtroDocente} onChange={e=>setFiltroDocente(e.target.value)} style={{...inputStyle,width:'auto',minWidth:280}}>
            {docentes.map(d=><option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
          </select>
          {doc && <>
            <span style={{background:'#dbeafe',color:'#1e40af',fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:'bold'}}>{doc.especialidad}</span>
            <span style={{background:sobre?'#fee2e2':'#dcfce7',color:sobre?'#dc2626':'#166534',fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:'bold'}}>
              {totalH}/{doc.maxHoras} h — {sobre?'⚠ SOBRECARGA':'✓ OK'}
            </span>
          </>}
        </div>
        <div style={{background:'white',borderRadius:10,border:`2px solid ${C.navy}`,overflow:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
            <thead>
              <tr>
                <th style={{background:'#f8fafc',borderBottom:`2px solid ${C.navy}`,borderRight:'1px solid #e2e8f0',padding:'8px',width:68,fontSize:10,color:C.navy}}>HORA</th>
                {DIAS.map(dia=><th key={dia} style={{background:C.navy,borderBottom:`2px solid ${C.navy}`,padding:'8px',color:C.gold,fontSize:11,fontWeight:'bold',letterSpacing:1}}>{dia.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {RENDER_SLOTS.map((slot,si)=>{
                if(slot.type==='break') return (
                  <tr key={si}>
                    <td style={{background:'#f8fafc',padding:'2px',fontSize:9,textAlign:'center',color:'#94a3b8'}}>{slot.inicio}</td>
                    <td colSpan={5} style={{background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)',padding:'2px',textAlign:'center',fontSize:9,fontWeight:'bold',color:'#92400e'}}>— RECESO —</td>
                  </tr>
                );
                const p=slot.idx;
                return (
                  <tr key={si} style={{borderBottom:'1px solid #e2e8f0'}}>
                    <td style={{background:'#f8fafc',borderRight:'1px solid #e2e8f0',padding:'5px',textAlign:'center'}}>
                      <div style={{fontSize:10,fontWeight:'bold',color:C.navy}}>P{p+1}</div>
                      <div style={{fontSize:8,fontFamily:'monospace',color:'#94a3b8'}}>{slot.inicio}</div>
                    </td>
                    {[0,1,2,3,4].map(dia=>{
                      const c=mapaDoc[dia][p];
                      if(!c) return <td key={dia} style={{background:'#f8fafc',borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0'}}/>;
                      const aula=aulas.find(a=>a.id===c.aulaId);
                      return (
                        <td key={dia} style={{background:getColor(c.id),borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:4,verticalAlign:'top'}}>
                          <div style={{fontWeight:'bold',fontSize:11,color:C.navy}}>{c.nombre}</div>
                          <div style={{fontSize:10,color:C.gray}}>Sem {c.semestre}°</div>
                          {aula&&<div style={{fontSize:9,color:'#64748b'}}>📍{aula.nombre}</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Tabla detalle */}
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <div style={{padding:'8px 14px',background:C.grayLight,fontSize:11,fontWeight:'bold',color:C.navy}}>
            DETALLE DE ASIGNACIONES — {doc?.nombre}
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc'}}>{['Materia','Sem.','Día','Per.','Aula','Tipo Aula'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {mapaDoc.flatMap((dArr,dIdx)=>
                dArr.map((c,pIdx)=>c?{...c,dia:dIdx,periodo:pIdx}:null).filter(Boolean)
              ).map((c,i)=>{
                const aula=aulas.find(a=>a.id===c.aulaId);
                return (
                  <tr key={i} style={{borderBottom:'1px solid #f1f5f9',background:i%2===0?'white':'#f8fafc'}}>
                    <td style={tdStyle}><span style={{fontWeight:'bold',color:C.navy}}>{c.nombre}</span></td>
                    <td style={{...tdStyle,textAlign:'center'}}><span style={{background:C.navy,color:C.gold,padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:'bold'}}>{c.semestre}°</span></td>
                    <td style={tdStyle}>{DIAS[c.dia]}</td>
                    <td style={{...tdStyle,textAlign:'center'}}>P{c.periodo+1}</td>
                    <td style={tdStyle}>{aula?.nombre||'—'}</td>
                    <td style={tdStyle}><span style={{background:c.tipoAula==='Laboratorio'?'#ede9fe':'#f1f5f9',color:c.tipoAula==='Laboratorio'?'#6d28d9':'#475569',padding:'2px 8px',borderRadius:20,fontSize:10}}>{c.tipoAula}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════
  // HU-49: Vista por Grupo — REQ-49
  // ════════════════════════════════════
  const VistaGrupo = () => {
    const conflGrupo = conflictosActivos.filter(c=>c.sem===filtroGrupo);
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
          <label style={{fontSize:12,color:C.gray,fontWeight:'bold'}}>SEMESTRE:</label>
          {SEMESTRES.map(s=>(
            <button key={s} onClick={()=>setFiltroGrupo(s)} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:'bold',background:filtroGrupo===s?C.navy:'#e2e8f0',color:filtroGrupo===s?C.gold:C.gray}}>{s}°</button>
          ))}
        </div>
        {conflGrupo.length>0 ? (
          <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 14px',display:'flex',gap:8,alignItems:'center',fontSize:12,color:'#7f1d1d'}}>
            <AlertTriangle size={14}/> <strong>{conflGrupo.length} conflicto(s)</strong> detectado(s) en Semestre {filtroGrupo}°
          </div>
        ) : (
          <div style={{background:'#dcfce7',border:'1px solid #16a34a',borderRadius:8,padding:'6px 14px',display:'flex',gap:8,alignItems:'center',fontSize:12,color:'#166534'}}>
            <CheckCircle size={13}/> Sin cruces — Horario válido para Semestre {filtroGrupo}°
          </div>
        )}
        <div style={{background:'white',borderRadius:10,border:`2px solid ${C.navy}`,overflow:'auto'}}>
          <TablaHorario sem={filtroGrupo} diasFiltro="Todos"/>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════
  // HU-50: Vista por Aula — REQ-50
  // ════════════════════════════════════
  const VistaAula = () => {
    const aulaObj = aulas.find(a=>a.id===filtroAula);
    const ocupacion = Array(5).fill(null).map(()=>Array(8).fill(null));
    SEMESTRES.forEach(sem=>{
      for(let d=0;d<5;d++) for(let p=0;p<8;p++){
        const c=horario[sem]?.[d]?.[p];
        if(c?.aulaId===filtroAula) ocupacion[d][p]={...c,semestre:sem};
      }
    });
    const totalOcup = ocupacion.flat().filter(Boolean).length;
    const totalSlots = 8*5;
    const pct = Math.round((totalOcup/totalSlots)*100);
    const aulasFiltradas = filtroTipoAula==='Todos' ? aulas.filter(a=>a.disponible) : aulas.filter(a=>a.disponible&&a.tipo===filtroTipoAula);
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{fontSize:11,color:C.gray,fontWeight:'bold'}}>TIPO:</span>
          {['Todos','Aula','Laboratorio','Auditorio','Sala'].map(t=>(
            <button key={t} onClick={()=>setFiltroTipoAula(t)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:'bold',background:filtroTipoAula===t?C.gold:'#e2e8f0',color:filtroTipoAula===t?C.navy:C.gray}}>{t}</button>
          ))}
          <label style={{fontSize:12,color:C.gray,fontWeight:'bold',marginLeft:8}}>AULA:</label>
          <select value={filtroAula} onChange={e=>setFiltroAula(e.target.value)} style={{...inputStyle,width:'auto',minWidth:240}}>
            {aulasFiltradas.map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap.{a.capacidad}</option>)}
          </select>
        </div>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {[
            {v:`${totalOcup}/${totalSlots}`,l:'Periodos Ocupados',c:pct>80?'#dc2626':C.navy},
            {v:`${pct}%`,l:'Tasa de Ocupación',c:pct>80?'#92400e':'#166534'},
            {v:aulaObj?.capacidad||'—',l:'Capacidad',c:C.navy},
            {v:aulaObj?.tipo||'—',l:'Tipo',c:C.blue},
          ].map(m=>(
            <div key={m.l} style={{background:'white',border:'1px solid #e2e8f0',borderRadius:10,padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:20,fontWeight:'bold',color:m.c}}>{m.v}</div>
              <div style={{fontSize:10,color:C.gray,marginTop:2}}>{m.l}</div>
            </div>
          ))}
        </div>
        {/* Tabla con libre/ocupado destacado HU-50 */}
        <div style={{background:'white',borderRadius:10,border:`2px solid ${C.navy}`,overflow:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:600}}>
            <thead>
              <tr>
                <th style={{background:'#f8fafc',borderBottom:`2px solid ${C.navy}`,borderRight:'1px solid #e2e8f0',padding:'8px',width:68,fontSize:10,color:C.navy}}>HORA</th>
                {DIAS.map(dia=><th key={dia} style={{background:C.navy,borderBottom:`2px solid ${C.navy}`,padding:'8px',color:C.gold,fontSize:11,fontWeight:'bold',letterSpacing:1}}>{dia.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {RENDER_SLOTS.map((slot,si)=>{
                if(slot.type==='break') return (
                  <tr key={si}>
                    <td style={{background:'#f8fafc',padding:'2px',fontSize:9,textAlign:'center',color:'#94a3b8'}}>{slot.inicio}</td>
                    <td colSpan={5} style={{background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)',padding:'2px',textAlign:'center',fontSize:9,fontWeight:'bold',color:'#92400e'}}>— RECESO —</td>
                  </tr>
                );
                const p=slot.idx;
                return (
                  <tr key={si} style={{borderBottom:'1px solid #e2e8f0'}}>
                    <td style={{background:'#f8fafc',borderRight:'1px solid #e2e8f0',padding:'5px',textAlign:'center'}}>
                      <div style={{fontSize:10,fontWeight:'bold',color:C.navy}}>P{p+1}</div>
                      <div style={{fontSize:8,fontFamily:'monospace',color:'#94a3b8'}}>{slot.inicio}</div>
                    </td>
                    {[0,1,2,3,4].map(dia=>{
                      const c=ocupacion[dia][p];
                      if(!c) return (
                        <td key={dia} style={{background:'#f0fdf4',border:'1px solid #dcfce7',padding:4,textAlign:'center'}}>
                          <div style={{fontSize:10,color:'#16a34a',fontWeight:'bold'}}>LIBRE</div>
                        </td>
                      );
                      const doc=docentes.find(d=>d.id===c.docenteId);
                      return (
                        <td key={dia} style={{background:getColor(c.id),borderRight:'1px solid #e2e8f0',borderBottom:'1px solid #e2e8f0',padding:4,verticalAlign:'top'}}>
                          <div style={{fontWeight:'bold',fontSize:10,color:C.navy}}>{c.nombre}</div>
                          <div style={{fontSize:9,color:C.gray}}>{doc?.nombre||'—'}</div>
                          <div style={{fontSize:9,color:C.blue}}>Sem {c.semestre}°</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════
  // HU-51: Filtros Combinados — REQ-51
  // ════════════════════════════════════
  const VistaFiltros = () => {
    const [fDoc,setFDoc]=useState('');
    const [fSem,setFSem]=useState('Todos');
    const [fDia,setFDia]=useState('Todos');
    const [fTipo,setFTipo]=useState('Todos');
    const [fCritica,setFCritica]=useState('Todos');
    const resultados=[];
    SEMESTRES.forEach(sem=>{
      if(fSem!=='Todos'&&parseInt(fSem)!==sem) return;
      for(let d=0;d<5;d++){
        if(fDia!=='Todos'&&DIAS[d]!==fDia) continue;
        for(let p=0;p<8;p++){
          const c=horario[sem]?.[d]?.[p];
          if(!c) continue;
          if(fDoc&&c.docenteId!==fDoc) continue;
          if(fTipo!=='Todos'&&c.tipoAula!==fTipo) continue;
          if(fCritica==='Si'&&!c.critica) continue;
          if(fCritica==='No'&&c.critica) continue;
          const aula=aulas.find(a=>a.id===c.aulaId);
          const doc=docentes.find(d=>d.id===c.docenteId);
          resultados.push({...c,sem,dia:d,periodo:p,aulaNombre:aula?.nombre||'—',docNombre:doc?.nombre||'—'});
        }
      }
    });
    return (
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:10,padding:'14px 18px'}}>
          <div style={{fontWeight:'bold',color:C.navy,fontSize:12,marginBottom:10}}>⚙ FILTROS COMBINADOS — HU-51 / REQ-51</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:10}}>
            <FormField label="DOCENTE">
              <select value={fDoc} onChange={e=>setFDoc(e.target.value)} style={inputStyle}>
                <option value="">Todos</option>
                {docentes.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </FormField>
            <FormField label="SEMESTRE">
              <select value={fSem} onChange={e=>setFSem(e.target.value)} style={inputStyle}>
                <option value="Todos">Todos</option>
                {SEMESTRES.map(s=><option key={s} value={s}>{s}°</option>)}
              </select>
            </FormField>
            <FormField label="DÍA">
              <select value={fDia} onChange={e=>setFDia(e.target.value)} style={inputStyle}>
                <option value="Todos">Todos</option>
                {DIAS.map(d=><option key={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="TIPO DE AULA">
              <select value={fTipo} onChange={e=>setFTipo(e.target.value)} style={inputStyle}>
                <option value="Todos">Todos</option>
                {['Aula','Laboratorio','Auditorio','Sala'].map(t=><option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="MATERIA CRÍTICA">
              <select value={fCritica} onChange={e=>setFCritica(e.target.value)} style={inputStyle}>
                <option value="Todos">Todas</option>
                <option value="Si">Solo críticas ★</option>
                <option value="No">No críticas</option>
              </select>
            </FormField>
            <div style={{display:'flex',alignItems:'flex-end'}}>
              <div style={{background:C.grayLight,borderRadius:8,padding:'8px 12px',width:'100%',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:'bold',color:C.navy}}>{resultados.length}</div>
                <div style={{fontSize:10,color:C.gray}}>resultados</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden',maxHeight:'52vh',overflowY:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead style={{position:'sticky',top:0,zIndex:1}}>
              <tr style={{background:C.grayLight}}>
                {['Materia','Sem.','Día','Per.','Docente','Aula','Tipo','★'].map(h=><th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {resultados.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:24,color:C.gray,fontSize:13}}>Sin resultados para los filtros seleccionados</td></tr>}
              {resultados.map((r,i)=>(
                <tr key={i} style={{borderBottom:'1px solid #f1f5f9',background:i%2===0?'white':'#f8fafc'}}>
                  <td style={tdStyle}><span style={{fontWeight:'bold',color:C.navy}}>{r.nombre}</span></td>
                  <td style={{...tdStyle,textAlign:'center'}}><span style={{background:C.navy,color:C.gold,padding:'2px 6px',borderRadius:20,fontSize:10,fontWeight:'bold'}}>{r.sem}°</span></td>
                  <td style={tdStyle}>{DIAS[r.dia]}</td>
                  <td style={{...tdStyle,textAlign:'center'}}>P{r.periodo+1}</td>
                  <td style={tdStyle}><span style={{fontSize:12}}>{r.docNombre}</span></td>
                  <td style={tdStyle}><span style={{fontSize:12}}>{r.aulaNombre}</span></td>
                  <td style={tdStyle}><span style={{background:r.tipoAula==='Laboratorio'?'#ede9fe':'#f1f5f9',color:r.tipoAula==='Laboratorio'?'#6d28d9':'#475569',padding:'2px 8px',borderRadius:20,fontSize:10}}>{r.tipoAula}</span></td>
                  <td style={{...tdStyle,textAlign:'center'}}>{r.critica?<span style={{color:'#dc2626',fontWeight:'bold'}}>★</span>:<span style={{color:'#cbd5e1'}}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════
  // MODAL REASIGNACIÓN HU-52/53 — REQ-52,53
  // ════════════════════════════════════
  const ModalReasig = () => {
    if(!modalCelda) return null;
    const {dia,periodo,sem}=modalCelda;
    const celda=horario[sem]?.[dia]?.[periodo];
    if(!celda) return null;
    const [newDoc,setNewDoc]=useState(celda.docenteId);
    const [newAula,setNewAula]=useState(celda.aulaId||'');
    const disp=verificarDisp(newDoc,newAula||null,dia,periodo,sem);
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
        <div style={{background:'white',borderRadius:12,padding:26,width:460,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',maxHeight:'90vh',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0,color:C.navy,fontSize:15}}>Reasignación — HU-52/53</h3>
            <button onClick={()=>setModalCelda(null)} style={{background:'none',border:'none',cursor:'pointer',color:C.gray}}><X size={18}/></button>
          </div>
          <div style={{background:C.grayLight,borderRadius:8,padding:'8px 12px',marginBottom:14}}>
            <div style={{fontWeight:'bold',color:C.navy}}>{celda.nombre}</div>
            <div style={{fontSize:12,color:C.gray}}>{DIAS[dia]} · P{periodo+1} · Sem {sem}°</div>
            {celda.critica&&<span style={{background:'#fee2e2',color:'#dc2626',fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:'bold'}}>★ Crítica</span>}
          </div>
          {/* Alertas disponibilidad REQ-53 */}
          {disp.docOcup&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'6px 10px',marginBottom:8,fontSize:11,color:'#7f1d1d',display:'flex',gap:6,alignItems:'center'}}><AlertCircle size={13}/>Docente ya ocupado en este bloque en otro semestre</div>}
          {disp.aulaOcup&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'6px 10px',marginBottom:8,fontSize:11,color:'#7f1d1d',display:'flex',gap:6,alignItems:'center'}}><AlertCircle size={13}/>Aula ya ocupada en este bloque en otro semestre</div>}
          {!disp.docOcup&&!disp.aulaOcup&&newDoc!==celda.docenteId&&<div style={{background:'#dcfce7',border:'1px solid #16a34a',borderRadius:6,padding:'6px 10px',marginBottom:8,fontSize:11,color:'#166534',display:'flex',gap:6,alignItems:'center'}}><CheckCircle size={13}/>Disponibilidad verificada — sin conflictos</div>}
          <FormField label="DOCENTE">
            <select value={newDoc} onChange={e=>setNewDoc(e.target.value)} style={inputStyle}>
              {docentes.map(d=><option key={d.id} value={d.id}>{d.nombre} ({d.tipo}) — {d.especialidad}</option>)}
            </select>
          </FormField>
          <div style={{marginTop:12}}/>
          <FormField label="AULA">
            <select value={newAula} onChange={e=>setNewAula(e.target.value)} style={inputStyle}>
              <option value="">Sin asignar</option>
              {aulas.filter(a=>a.disponible).map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap.{a.capacidad}</option>)}
            </select>
          </FormField>
          <div style={{display:'flex',gap:8,marginTop:18}}>
            <button onClick={()=>vaciarCelda(dia,periodo,sem)} style={{flex:1,padding:'8px',border:'1px solid #fecaca',borderRadius:6,background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:12,fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
              <Trash2 size={13}/>Vaciar
            </button>
            <button onClick={()=>guardarReasig(dia,periodo,sem,newDoc,newAula||null)} style={{flex:1,padding:'8px',border:'none',borderRadius:6,background:(disp.docOcup||disp.aulaOcup)?'#92400e':C.navy,color:'white',cursor:'pointer',fontSize:12,fontWeight:'bold',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
              <Save size={13}/>{(disp.docOcup||disp.aulaOcup)?'Forzar Cambio ⚠':'Guardar'}
            </button>
          </div>
          {(disp.docOcup||disp.aulaOcup)&&<div style={{marginTop:6,fontSize:10,color:'#92400e',textAlign:'center'}}>Forzar guarda el cambio y registra el conflicto para resolución en MOD-5</div>}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════
  // PANEL CONFLICTOS HU-54 — REQ-54
  // ════════════════════════════════════
  const PanelConflictos = () => (
    <div style={{position:'fixed',top:52,right:0,width:330,height:'calc(100vh - 52px)',background:'white',borderLeft:'3px solid #dc2626',boxShadow:'-4px 0 20px rgba(0,0,0,0.15)',zIndex:500,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'12px 16px',background:'#fef2f2',borderBottom:'1px solid #fecaca',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:'bold',color:'#991b1b',fontSize:14}}>⚠ Conflictos — HU-54</div>
          <div style={{fontSize:11,color:'#7f1d1d'}}>{conflictosActivos.length} detectado(s)</div>
        </div>
        <button onClick={()=>setPanelConflictos(false)} style={{background:'none',border:'none',cursor:'pointer',color:'#991b1b'}}><X size={16}/></button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
        {conflictosActivos.length===0&&(
          <div style={{textAlign:'center',padding:20,color:'#16a34a'}}>
            <CheckCircle size={24} style={{margin:'0 auto 8px',display:'block'}}/>
            Sin conflictos activos
          </div>
        )}
        {conflictosActivos.map((c,i)=>(
          <div key={i} style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px',fontSize:11}}>
            <div style={{fontWeight:'bold',color:'#991b1b',marginBottom:2}}>
              {c.tipo==='cruce_docente'?'👨‍🏫 Cruce Docente':'🏫 Cruce Aula'}
            </div>
            <div style={{color:'#7f1d1d'}}>{c.msg}</div>
            <button onClick={()=>{setSemestreActivo(c.sem);setVistaActiva('general');setPanelConflictos(false);}} style={{marginTop:6,fontSize:10,background:'#991b1b',color:'white',border:'none',borderRadius:4,padding:'3px 8px',cursor:'pointer'}}>
              Ir a Sem {c.sem}° →
            </button>
          </div>
        ))}
        {historialManual.length>0&&(
          <div style={{marginTop:8}}>
            <div style={{fontWeight:'bold',color:C.navy,fontSize:11,marginBottom:6,borderTop:'1px solid #e2e8f0',paddingTop:8}}>
              HISTORIAL DE INTERVENCIONES
            </div>
            {historialManual.map(h=>(
              <div key={h.id} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:6,padding:'6px 10px',marginBottom:6,fontSize:10}}>
                <div style={{color:C.navy,fontWeight:'bold'}}>{h.accion}</div>
                <div style={{color:C.gray,marginTop:2}}>{h.fecha}</div>
                {h.conflictos>0&&<div style={{color:'#dc2626',marginTop:2}}>⚠ {h.conflictos} conflicto(s)</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ════════════════════════════════════
  // RENDER PRINCIPAL MOD-4
  // ════════════════════════════════════
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      {/* ── Barra de vistas ── */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
          {[
            {id:'general',label:'Vista General',icon:<Calendar size={12}/>,hu:'HU-47'},
            {id:'docente',label:'Por Docente',icon:<Users size={12}/>,hu:'HU-48'},
            {id:'grupo',label:'Por Grupo',icon:<Layers size={12}/>,hu:'HU-49'},
            {id:'aula',label:'Por Aula',icon:<Building2 size={12}/>,hu:'HU-50'},
            {id:'filtros',label:'Filtros',icon:<Filter size={12}/>,hu:'HU-51'},
          ].map(v=>(
            <button key={v.id} onClick={()=>setVistaActiva(v.id)} style={{display:'flex',alignItems:'center',gap:4,padding:'6px 11px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:'bold',background:vistaActiva===v.id?C.navy:'#e2e8f0',color:vistaActiva===v.id?C.gold:C.gray}}>
              {v.icon}{v.label}<span style={{fontSize:9,opacity:0.6}}>{v.hu}</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {estadoHorario==='aprobado'&&<span style={{background:'#dcfce7',color:'#166534',fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:'bold',border:'1px solid #16a34a'}}>✓ APROBADO</span>}
          {cambiosPendientes.length>0&&(
            <span style={{background:'#fef9c3',color:'#92400e',fontSize:11,padding:'3px 10px',borderRadius:20,fontWeight:'bold',border:'1px solid #f59e0b',display:'flex',alignItems:'center',gap:4}}>
              <Clock size={11}/>{cambiosPendientes.length} cambio(s) pendiente(s)
            </span>
          )}
          {conflictosActivos.length>0&&(
            <button onClick={()=>setPanelConflictos(!panelConflictos)} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:6,border:'1px solid #fecaca',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:11,fontWeight:'bold'}}>
              <AlertTriangle size={13}/>{conflictosActivos.length} Conflicto(s)
            </button>
          )}
          {puedeEditar?(
            <button onClick={()=>setEditMode(!editMode)} style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${editMode?C.gold:'#e2e8f0'}`,background:editMode?`rgba(200,168,75,0.1)`:'white',color:editMode?C.gold:C.gray,cursor:'pointer',fontSize:11,fontWeight:'bold',display:'flex',alignItems:'center',gap:5}}>
              <Pencil size={13}/>{editMode?'✏ Edición ON':'Editar'}
            </button>
          ):(
            <span style={{fontSize:11,color:C.gray,display:'flex',alignItems:'center',gap:4}}><Eye size={13}/>Solo lectura</span>
          )}
          <button onClick={()=>window.print()} style={{padding:'5px 10px',borderRadius:6,border:'1px solid #e2e8f0',background:'white',color:C.gray,cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:5}}>
            <Printer size={13}/>Imprimir
          </button>
        </div>
      </div>
      {/* Banners modo edición */}
      {editMode&&puedeEditar&&(
        <div style={{background:`rgba(200,168,75,0.08)`,border:`1px dashed ${C.gold}`,borderRadius:8,padding:'7px 14px',marginBottom:8,fontSize:11,color:'#92400e',display:'flex',gap:10,alignItems:'center'}}>
          <Info size={13}/>
          <span><strong>Modo edición ({usuario?.rol}):</strong> Clic en celda para reasignar · Arrastra para intercambiar · Cambios quedan <em>pendientes</em> hasta validación en MOD-5</span>
        </div>
      )}
      {!puedeEditar&&(
        <div style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,padding:'6px 14px',marginBottom:8,fontSize:11,color:C.gray,display:'flex',gap:8,alignItems:'center'}}>
          <Shield size={13}/>Solo <strong>DDE</strong> o <strong>Administrador</strong> pueden editar. Modo lectura activo.
        </div>
      )}
      {/* Contenido */}
      <div style={{flex:1,overflow:'auto'}}>
        {vistaActiva==='general'&&<VistaGeneral/>}
        {vistaActiva==='docente'&&<VistaDocente/>}
        {vistaActiva==='grupo'&&<VistaGrupo/>}
        {vistaActiva==='aula'&&<VistaAula/>}
        {vistaActiva==='filtros'&&<VistaFiltros/>}
      </div>
      {/* Leyenda */}
      <div style={{display:'flex',gap:14,marginTop:8,fontSize:10,color:C.gray,flexWrap:'wrap'}}>
        <span>★ Materia crítica</span>
        <span>🟩 Verde = Libre/Biblioteca</span>
        <span>⚠ Rojo = Conflicto</span>
        <span>📌 Lunes 07:45 obligatorio (RAC-03)</span>
        {cambiosPendientes.length>0&&<span style={{color:'#92400e',fontWeight:'bold'}}>🕐 {cambiosPendientes.length} cambio(s) sin aprobar</span>}
      </div>
      <ModalReasig/>
      {panelConflictos&&<PanelConflictos/>}
    </div>
  );
}

// ==========================================
// MOD-5: VALIDACIÓN COMPLETA
// REQ-55 al REQ-63, REQ-69, REQ-70, REQ-71
// ==========================================
function Mod5ValidacionView({ horario, docentes, horasDoc, estado, onAprobar, onVerHorario, historial, addNotif, usuario }) {

  const [obsTexto, setObsTexto] = useState('');
  const [obsDestinatario, setObsDestinatario] = useState('DDE');
  const [observaciones, setObservaciones] = useState([]);
  const [tabActiva, setTabActiva] = useState('resumen');
  const [notifEnviadas, setNotifEnviadas] = useState([]);

  if (!horario) return (
    <EmptyState icon={<Shield size={40}/>} titulo="Sin horario generado" desc='Ve al MOD-3 para crear un horario primero.'/>
  );

  const SEMESTRES = [3,4,5,6,7,8,9,10];

  // ── REQ-55: Validar restricciones RAC-03 ──
  const conflictos = validarHorario(horario, docentes);

  // ── REQ-56: Verificar recesos ──
  const verificarRecesos = () => {
    const resultados = [];
    SEMESTRES.forEach(sem => {
      // Verificar que P3 (idx 2, 09:15-10:00) y P4 (idx 3, 10:15-11:00) no se solapen
      for (let d = 0; d < 5; d++) {
        const p2 = horario[sem]?.[d]?.[2];
        const p3 = horario[sem]?.[d]?.[3];
        if (p2 && p3 && p2.id === p3.id) {
          resultados.push({ ok: false, msg: `Sem ${sem}° — ${DIAS[d]}: bloque cruza receso 10:00-10:15` });
        }
        const p4 = horario[sem]?.[d]?.[4];
        const p5 = horario[sem]?.[d]?.[5];
        if (p4 && p5 && p4.id === p5.id) {
          resultados.push({ ok: false, msg: `Sem ${sem}° — ${DIAS[d]}: bloque cruza receso 11:45-12:00` });
        }
      }
    });
    return resultados;
  };

  // ── REQ-57: Detectar inconsistencias ──
  const detectarInconsistencias = () => {
    const lista = [];
    SEMESTRES.forEach(sem => {
      // Bloques sueltos (1 solo periodo)
      for (let d = 0; d < 5; d++) {
        let p = 0;
        while (p < 8) {
          if (horario[sem][d][p]) {
            const matId = horario[sem][d][p].id;
            let len = 1;
            while (p + len < 8 && horario[sem][d][p+len]?.id === matId) len++;
            if (len === 1) lista.push({ tipo:'bloque_suelto', sem, dia:d, periodo:p, msg:`Sem ${sem}° — "${horario[sem][d][p].nombre}" bloque suelto (${DIAS[d]})` });
            p += len;
          } else p++;
        }
      }
      // Sin clase lunes 07:45
      if (!horario[sem][0][0]) lista.push({ tipo:'sin_lunes', sem, msg:`Sem ${sem}° — Sin clase el Lunes 07:45 (viola RAC-03)` });
      // Materia sin aula
      for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
        const c = horario[sem]?.[d]?.[p];
        if (c && !c.aulaId) lista.push({ tipo:'sin_aula', sem, dia:d, periodo:p, msg:`Sem ${sem}° — "${c.nombre}" sin aula asignada (${DIAS[d]} P${p+1})` });
      }
    });
    return lista;
  };

  const inconsistencias = detectarInconsistencias();
  const problemasRecesos = verificarRecesos();
  const docentesSobre = docentes.filter(d => (horasDoc?.[d.id]||0) > d.maxHoras);
  const docentesBajo = docentes.filter(d => (horasDoc?.[d.id]||0) < d.minHoras && (horasDoc?.[d.id]||0) > 0);
  const totalClases = SEMESTRES.reduce((acc,s)=>{
    let c=0; for(let d=0;d<5;d++) for(let p=0;p<8;p++) if(horario[s]?.[d]?.[p]) c++;
    return acc+c;
  },0);
  const totalProblemas = conflictos.length + inconsistencias.length + problemasRecesos.length + docentesSobre.length;
  const ok = totalProblemas === 0;

  // ── REQ-59/69: Registrar observaciones ──
  const agregarObs = () => {
    if (!obsTexto.trim()) return;
    const obs = { id:Date.now(), texto:obsTexto, destinatario:obsDestinatario, fecha:new Date().toLocaleString(), autor:usuario?.nombre||'Sistema', leida:false };
    setObservaciones(prev=>[obs,...prev]);
    addNotif(`Obs. registrada → ${obsDestinatario}: "${obsTexto.slice(0,40)}…"`, 'info');
    // REQ-70: Notificar al DDE si el destinatario es DDE
    if (obsDestinatario === 'DDE') {
      const notif = { id:Date.now(), tipo:'obs_dde', msg:`Nueva observación del docente para DDE: "${obsTexto.slice(0,50)}…"`, fecha:new Date().toLocaleString() };
      setNotifEnviadas(prev=>[notif,...prev]);
      addNotif('🔔 DDE notificado sobre nueva observación (REQ-70)', 'warning');
    }
    setObsTexto('');
  };

  // ── REQ-58/71: Generar alerta de estado ──
  const generarAlerta = (msg, tipo) => {
    addNotif(msg, tipo);
    const notif = { id:Date.now(), tipo, msg, fecha:new Date().toLocaleString() };
    setNotifEnviadas(prev=>[notif,...prev]);
  };

  // ── REQ-62: Aprobar formalmente ──
  const handleAprobar = () => {
    onAprobar();
    // REQ-71: Notificar cambio de estado
    generarAlerta('✅ Horario APROBADO formalmente — notificado a todos los responsables (REQ-71)', 'success');
  };

  // ── REQ-60: Estados del horario ──
  const ESTADOS = {
    null: { label:'No generado', color:'#94a3b8', bg:'#f1f5f9' },
    pendiente: { label:'Pendiente de Validación', color:'#92400e', bg:'#fef9c3' },
    aprobado: { label:'Aprobado Formalmente', color:'#166534', bg:'#dcfce7' },
  };
  const estadoInfo = ESTADOS[estado] || ESTADOS[null];

  return (
    <div style={{maxWidth:960,margin:'0 auto'}}>

      {/* ── Header estado REQ-60 ── */}
      <div style={{background:ok?`linear-gradient(135deg,#14532d,#166534)`:`linear-gradient(135deg,#7f1d1d,#991b1b)`,borderRadius:12,padding:'18px 24px',marginBottom:16,color:'white',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {ok?<CheckCircle size={28}/>:<AlertTriangle size={28}/>}
          <div>
            <div style={{fontWeight:'bold',fontSize:16}}>{ok?'✓ Horario Válido — Sin problemas detectados':`${totalProblemas} Problema(s) detectado(s) — REQ-55,57`}</div>
            <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{totalClases} clases · {SEMESTRES.length} semestres · Estado: <strong>{estadoInfo.label}</strong></div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {estado!=='aprobado'&&ok&&(
            <button onClick={handleAprobar} style={{background:C.gold,color:C.navy,border:'none',borderRadius:8,padding:'8px 18px',fontWeight:'bold',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}>
              <Check size={14}/>Aprobar Horario — REQ-62
            </button>
          )}
          {estado!=='aprobado'&&!ok&&(
            <button onClick={()=>generarAlerta(`⚠ Hay ${totalProblemas} problema(s) pendiente(s). Resolver antes de aprobar. (REQ-58)`, 'warning')} style={{background:'rgba(255,255,255,0.15)',color:'white',border:'1px solid rgba(255,255,255,0.3)',borderRadius:8,padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
              <Bell size={13}/>Generar Alerta — REQ-58
            </button>
          )}
          {estado==='aprobado'&&<span style={{background:'rgba(255,255,255,0.2)',padding:'6px 14px',borderRadius:8,fontWeight:'bold',fontSize:13}}>✓ APROBADO FORMALMENTE</span>}
        </div>
      </div>

      {/* ── Tabs de validación ── */}
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {[
          {id:'resumen',label:'Resumen',icon:<BarChart2 size={13}/>},
          {id:'restricciones',label:'Restricciones REQ-55',icon:<Shield size={13}/>},
          {id:'recesos',label:'Recesos REQ-56',icon:<Clock size={13}/>},
          {id:'inconsistencias',label:'Inconsistencias REQ-57',icon:<AlertCircle size={13}/>},
          {id:'carga',label:'Carga Docente',icon:<Users size={13}/>},
          {id:'observaciones',label:'Observaciones REQ-59/69',icon:<ClipboardList size={13}/>},
          {id:'historial',label:'Historial REQ-63',icon:<Archive size={13}/>},
          {id:'notificaciones',label:'Notificaciones REQ-61/71',icon:<Bell size={13}/>},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTabActiva(t.id)} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:'bold',background:tabActiva===t.id?C.navy:'#e2e8f0',color:tabActiva===t.id?C.gold:C.gray}}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tabActiva==='resumen'&&(
        <div>
          {/* KPIs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            {[
              {v:totalClases,l:'Clases Asignadas',c:C.navy},
              {v:conflictos.length,l:'Cruces Docente/Aula',c:conflictos.length>0?'#991b1b':'#166534'},
              {v:inconsistencias.length,l:'Inconsistencias',c:inconsistencias.length>0?'#92400e':'#166534'},
              {v:docentesSobre.length,l:'Docentes Sobrecargados',c:docentesSobre.length>0?'#dc2626':'#166634'},
            ].map(m=>(
              <div key={m.l} style={{background:'white',borderRadius:10,padding:'14px',border:'1px solid #e2e8f0',textAlign:'center'}}>
                <div style={{fontSize:26,fontWeight:'bold',color:m.c}}>{m.v}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:2}}>{m.l}</div>
              </div>
            ))}
          </div>
          {/* Estado del horario REQ-60 */}
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18,marginBottom:14}}>
            <h3 style={{margin:'0 0 12px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
              <Activity size={14}/>Estado del Horario — REQ-60
            </h3>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {Object.entries(ESTADOS).map(([key,info])=>(
                <div key={key} style={{flex:1,minWidth:160,background:info.bg,border:`2px solid ${estado===key?info.color:'transparent'}`,borderRadius:10,padding:'12px',textAlign:'center'}}>
                  <div style={{fontWeight:'bold',color:info.color,fontSize:13}}>{info.label}</div>
                  {estado===key&&<div style={{fontSize:11,color:info.color,marginTop:4}}>← Estado actual</div>}
                </div>
              ))}
            </div>
          </div>
          {/* Checklist rápido */}
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
            <h3 style={{margin:'0 0 12px',color:C.navy,fontSize:13,fontWeight:'bold'}}>Checklist de Validación</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'Sin cruces de docente',ok:conflictos.filter(c=>c.tipo==='cruce_docente').length===0},
                {label:'Sin cruces de aula',ok:conflictos.filter(c=>c.tipo==='cruce_aula').length===0},
                {label:'Lunes 07:45 cumplido (RAC-03)',ok:inconsistencias.filter(i=>i.tipo==='sin_lunes').length===0},
                {label:'Sin bloques sueltos',ok:inconsistencias.filter(i=>i.tipo==='bloque_suelto').length===0},
                {label:'Recesos correctos (REQ-56)',ok:problemasRecesos.length===0},
                {label:'Sin docentes sobrecargados',ok:docentesSobre.length===0},
                {label:'Sin docentes bajo mínimo',ok:docentesBajo.length===0},
                {label:'Todas las clases con aula',ok:inconsistencias.filter(i=>i.tipo==='sin_aula').length===0},
              ].map(item=>(
                <div key={item.label} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'6px 10px',background:item.ok?'#f0fdf4':'#fef2f2',borderRadius:6}}>
                  {item.ok?<CheckCircle size={14} color="#16a34a"/>:<AlertCircle size={14} color="#dc2626"/>}
                  <span style={{color:item.ok?'#166534':'#991b1b'}}>{item.label}</span>
                  <span style={{marginLeft:'auto',fontWeight:'bold',fontSize:11,color:item.ok?'#16a34a':'#dc2626'}}>{item.ok?'OK':'FALLA'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REQ-55: RESTRICCIONES ── */}
      {tabActiva==='restricciones'&&(
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
          <h3 style={{margin:'0 0 14px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
            <Shield size={14}/>Validación de Restricciones RAC-03 — REQ-55
          </h3>
          {conflictos.length===0?(
            <div style={{background:'#dcfce7',border:'1px solid #16a34a',borderRadius:8,padding:'12px 16px',display:'flex',gap:8,alignItems:'center',color:'#166534',fontWeight:'bold'}}>
              <CheckCircle size={16}/>Todas las restricciones cumplidas — Horario válido
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {conflictos.map((c,i)=>(
                <div key={i} style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',display:'flex',alignItems:'flex-start',gap:10}}>
                  <AlertTriangle size={16} color="#dc2626" style={{flexShrink:0,marginTop:1}}/>
                  <div>
                    <div style={{fontWeight:'bold',color:'#991b1b',fontSize:12}}>{c.tipo.replace('_',' ').toUpperCase()}</div>
                    <div style={{color:'#7f1d1d',fontSize:12,marginTop:2}}>{c.mensaje}</div>
                  </div>
                  <button onClick={onVerHorario} style={{marginLeft:'auto',flexShrink:0,padding:'4px 10px',background:C.navy,color:'white',border:'none',borderRadius:5,cursor:'pointer',fontSize:11}}>Ver →</button>
                </div>
              ))}
              <button onClick={onVerHorario} style={{padding:'8px 16px',background:C.navy,color:'white',border:'none',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:'bold',display:'flex',alignItems:'center',gap:6,width:'fit-content'}}>
                <Pencil size={13}/>Ir a Editar Horario (MOD-4)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── REQ-56: RECESOS ── */}
      {tabActiva==='recesos'&&(
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
          <h3 style={{margin:'0 0 14px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
            <Clock size={14}/>Verificación de Recesos — REQ-56
          </h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[
              {r:'Receso 1: 10:00–10:15 (entre P3 y P4)',ok:problemasRecesos.filter(p=>p.msg.includes('10:00')).length===0},
              {r:'Receso 2: 11:45–12:00 (entre P5 y P6)',ok:problemasRecesos.filter(p=>p.msg.includes('11:45')).length===0},
              {r:'Horario inicio: 07:45 (P1)',ok:true},
              {r:'Horario fin: 14:15 (P8)',ok:true},
              {r:'8 periodos por día (sin contar recesos)',ok:true},
              {r:'2 recesos diarios obligatorios',ok:problemasRecesos.length===0},
            ].map(item=>(
              <div key={item.r} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,padding:'8px 12px',background:item.ok?'#f0fdf4':'#fef2f2',borderRadius:8,border:`1px solid ${item.ok?'#dcfce7':'#fecaca'}`}}>
                {item.ok?<CheckCircle size={14} color="#16a34a"/>:<AlertCircle size={14} color="#dc2626"/>}
                <span style={{color:item.ok?'#166534':'#991b1b'}}>{item.r}</span>
              </div>
            ))}
          </div>
          {problemasRecesos.length>0&&(
            <div>
              <div style={{fontWeight:'bold',color:'#991b1b',fontSize:12,marginBottom:8}}>Problemas detectados:</div>
              {problemasRecesos.map((p,i)=>(
                <div key={i} style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'7px 12px',marginBottom:6,fontSize:12,color:'#7f1d1d'}}>⚠ {p.msg}</div>
              ))}
            </div>
          )}
          <div style={{background:C.grayLight,borderRadius:8,padding:'10px 14px',marginTop:12}}>
            <div style={{fontSize:11,fontWeight:'bold',color:C.navy,marginBottom:6}}>Estructura de jornada (RAC-03):</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {RENDER_SLOTS.map((s,i)=>(
                <span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:20,background:s.type==='break'?'#fef9c3':'#dbeafe',color:s.type==='break'?'#92400e':'#1e40af',fontWeight:'bold'}}>
                  {s.type==='break'?`⏸ ${s.label}`:`P${s.idx+1} ${s.inicio}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── REQ-57: INCONSISTENCIAS ── */}
      {tabActiva==='inconsistencias'&&(
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
          <h3 style={{margin:'0 0 14px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
            <AlertTriangle size={14}/>Detección de Inconsistencias — REQ-57
          </h3>
          {inconsistencias.length===0?(
            <div style={{background:'#dcfce7',border:'1px solid #16a34a',borderRadius:8,padding:'12px 16px',display:'flex',gap:8,alignItems:'center',color:'#166534',fontWeight:'bold'}}>
              <CheckCircle size={16}/>Sin inconsistencias detectadas
            </div>
          ):(
            <div>
              {/* Agrupar por tipo */}
              {['sin_lunes','bloque_suelto','sin_aula'].map(tipo=>{
                const grupo = inconsistencias.filter(i=>i.tipo===tipo);
                if(grupo.length===0) return null;
                const labels = {sin_lunes:'Sin clase Lunes 07:45',bloque_suelto:'Bloques sueltos (1 periodo)',sin_aula:'Materias sin aula'};
                return (
                  <div key={tipo} style={{marginBottom:14}}>
                    <div style={{fontWeight:'bold',color:'#991b1b',fontSize:12,marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                      <AlertCircle size={13}/>{labels[tipo]} ({grupo.length})
                    </div>
                    {grupo.map((inc,i)=>(
                      <div key={i} style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:6,padding:'7px 12px',marginBottom:4,fontSize:12,color:'#7f1d1d',display:'flex',alignItems:'center',gap:8}}>
                        ⚠ {inc.msg}
                        <button onClick={onVerHorario} style={{marginLeft:'auto',padding:'3px 8px',background:C.navy,color:'white',border:'none',borderRadius:4,cursor:'pointer',fontSize:10}}>Editar →</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── CARGA DOCENTE ── */}
      {tabActiva==='carga'&&(
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
          <h3 style={{margin:'0 0 14px',color:C.navy,fontSize:13,fontWeight:'bold'}}>Carga Horaria por Docente (RAC-03)</h3>
          {docentesSobre.length>0&&(
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 14px',marginBottom:12,fontSize:12,color:'#7f1d1d',display:'flex',gap:8,alignItems:'center'}}>
              <AlertTriangle size={14}/><strong>{docentesSobre.length} docente(s) sobrecargado(s)</strong> — requieren ajuste
            </div>
          )}
          {docentesBajo.length>0&&(
            <div style={{background:'#fef9c3',border:'1px solid #f59e0b',borderRadius:8,padding:'8px 14px',marginBottom:12,fontSize:12,color:'#92400e',display:'flex',gap:8,alignItems:'center'}}>
              <AlertTriangle size={14}/><strong>{docentesBajo.length} docente(s) bajo mínimo</strong> de horas
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
            {docentes.map(d=>{
              const horas=horasDoc?.[d.id]||0;
              const pct=Math.min(100,(horas/d.maxHoras)*100);
              const sobre=horas>d.maxHoras;
              const bajo=horas<d.minHoras&&horas>0;
              return (
                <div key={d.id} style={{padding:'10px 14px',border:`1px solid ${sobre?'#fecaca':bajo?'#fef08a':'#e2e8f0'}`,borderRadius:8,background:sobre?'#fef2f2':bajo?'#fefce8':'white'}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:'bold',color:C.navy}}>{d.nombre}</span>
                      <span style={{fontSize:10,color:C.gray,marginLeft:6}}>{d.tipo}</span>
                    </div>
                    <span style={{fontWeight:'bold',color:sobre?'#dc2626':bajo?'#92400e':'#166534'}}>{horas}/{d.maxHoras}h {sobre?'⚠':bajo?'↓':'✓'}</span>
                  </div>
                  <div style={{background:'#e2e8f0',borderRadius:99,height:5,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pct}%`,background:sobre?'#dc2626':pct>80?C.gold:'#16a34a',borderRadius:99,transition:'width 0.3s'}}/>
                  </div>
                  <div style={{fontSize:10,color:C.gray,marginTop:3}}>Mín:{d.minHoras}h · Máx:{d.maxHoras}h · Especialidad:{d.especialidad}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── REQ-59/69: OBSERVACIONES ── */}
      {tabActiva==='observaciones'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
            <h3 style={{margin:'0 0 12px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
              <ClipboardList size={14}/>Registrar Observaciones — REQ-59/69
            </h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,alignItems:'end'}}>
              <FormField label="OBSERVACIÓN">
                <input value={obsTexto} onChange={e=>setObsTexto(e.target.value)} onKeyDown={e=>e.key==='Enter'&&agregarObs()} placeholder="Escribir observación sobre el horario..." style={inputStyle}/>
              </FormField>
              <FormField label="DIRIGIDA A — REQ-70">
                <select value={obsDestinatario} onChange={e=>setObsDestinatario(e.target.value)} style={{...inputStyle,minWidth:130}}>
                  <option>DDE</option>
                  <option>Jefe de Carrera</option>
                  <option>Administrador</option>
                  <option>General</option>
                </select>
              </FormField>
              <button onClick={agregarObs} style={{...btnPrimary,height:36,whiteSpace:'nowrap'}}><Plus size={14}/>Agregar</button>
            </div>
            <div style={{fontSize:11,color:C.gray,marginTop:6}}>
              💡 Si el destinatario es <strong>DDE</strong>, se enviará notificación automática (REQ-70)
            </div>
          </div>
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
            <div style={{fontSize:12,fontWeight:'bold',color:C.navy,marginBottom:10}}>
              Observaciones registradas ({observaciones.length})
            </div>
            {observaciones.length===0&&<div style={{fontSize:12,color:C.gray,textAlign:'center',padding:'16px 0'}}>Sin observaciones aún</div>}
            {observaciones.map(obs=>(
              <div key={obs.id} style={{background:'#fefce8',border:'1px solid #fef08a',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{background:C.navy,color:C.gold,fontSize:10,padding:'2px 8px',borderRadius:20,fontWeight:'bold'}}>→ {obs.destinatario}</span>
                    <span style={{fontSize:11,color:C.gray}}>por {obs.autor}</span>
                  </div>
                  <span style={{fontSize:10,color:'#94a3b8'}}>{obs.fecha}</span>
                </div>
                <div style={{fontSize:12,color:C.navy}}>{obs.texto}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REQ-63: HISTORIAL ── */}
      {tabActiva==='historial'&&(
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
          <h3 style={{margin:'0 0 14px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
            <Archive size={14}/>Historial de Cambios — REQ-63
          </h3>
          {historial.length===0&&<div style={{fontSize:12,color:C.gray,textAlign:'center',padding:'20px 0'}}>Sin actividad registrada</div>}
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {historial.map(h=>(
              <div key={h.id} style={{display:'flex',gap:10,fontSize:12,padding:'8px 12px',background:'#f8fafc',borderRadius:8,border:'1px solid #e2e8f0',alignItems:'center'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:h.estado==='aprobado'?'#16a34a':C.gold,flexShrink:0}}/>
                <span style={{color:C.gold,fontSize:11,minWidth:130}}>{h.fecha}</span>
                <span style={{color:C.navy,fontWeight:'bold'}}>{h.accion}</span>
                <span style={{color:C.gray}}>— {h.usuario}</span>
                <span style={{marginLeft:'auto',color:h.estado==='aprobado'?'#16a34a':'#92400e',fontWeight:'bold',fontSize:11,border:`1px solid ${h.estado==='aprobado'?'#16a34a':'#f59e0b'}`,borderRadius:20,padding:'1px 8px'}}>
                  {h.estado?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REQ-61/70/71: NOTIFICACIONES ── */}
      {tabActiva==='notificaciones'&&(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:18}}>
            <h3 style={{margin:'0 0 12px',color:C.navy,fontSize:13,fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}>
              <Bell size={14}/>Centro de Notificaciones — REQ-61/70/71
            </h3>
            <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
              <button onClick={()=>generarAlerta('📋 Horario listo para revisión — Jefe de Carrera notificado (REQ-61)','info')} style={{...btnPrimary,background:C.blue,fontSize:11}}>
                <Bell size={13}/>Notificar a Jefe de Carrera
              </button>
              <button onClick={()=>generarAlerta('📢 Cambios en el horario — DDE notificado (REQ-71)','warning')} style={{...btnPrimary,background:'#92400e',fontSize:11}}>
                <Bell size={13}/>Notificar al DDE
              </button>
              <button onClick={()=>generarAlerta('✅ Horario publicado — Todos los docentes notificados (REQ-61)','success')} style={{...btnPrimary,background:'#166534',fontSize:11}}>
                <Bell size={13}/>Notificar a Docentes
              </button>
            </div>
            {notifEnviadas.length===0&&<div style={{fontSize:12,color:C.gray,textAlign:'center',padding:'12px 0'}}>Sin notificaciones enviadas aún</div>}
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {notifEnviadas.map(n=>(
                <div key={n.id} style={{padding:'8px 12px',background:n.tipo==='success'?'#f0fdf4':n.tipo==='warning'?'#fefce8':'#eff6ff',border:`1px solid ${n.tipo==='success'?'#dcfce7':n.tipo==='warning'?'#fef08a':'#bfdbfe'}`,borderRadius:8,fontSize:12}}>
                  <div style={{color:C.navy}}>{n.msg}</div>
                  <div style={{color:'#94a3b8',fontSize:10,marginTop:2}}>{n.fecha}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// MOD-6: REPORTES
// ==========================================
function Mod6ReportesView({ horario, docentes, materias, aulas, grupos, horasDoc, estadoHorario }) {
  const [subTab, setSubTab] = useState('resumen');
  const [filtroDoc, setFiltroDoc] = useState(docentes[0]?.id || '');
  const [filtroAula, setFiltroAula] = useState(aulas[0]?.id || '');
  const [filtroGrupo, setFiltroGrupo] = useState(3);

  const semestres = [3,4,5,6,7,8,9,10];

  const totalClases = horario ? semestres.reduce((acc, s) => {
    let c = 0; for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) c++; return acc + c;
  }, 0) : 0;

  const NotGenerated = () => <EmptyState icon={<FileText size={36} />} titulo="Sin horario generado" desc="Ve al MOD-3 para generar un horario primero." />;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { id: 'resumen', label: 'Resumen General', icon: <BarChart2 size={13}/> },
          { id: 'docente', label: 'Por Docente (HU-48)', icon: <Users size={13}/> },
          { id: 'grupo', label: 'Por Grupo (HU-49)', icon: <Layers size={13}/> },
          { id: 'aula', label: 'Por Aula (HU-50)', icon: <Building2 size={13}/> },
          { id: 'exportar', label: 'Exportar (HU-64/65/66)', icon: <Download size={13}/> },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: subTab === t.id ? C.navy : '#e2e8f0', color: subTab === t.id ? C.gold : C.gray }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {subTab === 'resumen' && (
        !horario ? <NotGenerated /> :
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { v: totalClases, l: 'Total Clases', sub: 'asignadas', icon: <Hash size={18} />, c: C.navy },
              { v: docentes.filter(d => (horasDoc?.[d.id] || 0) > 0).length, l: 'Docentes Activos', sub: `de ${docentes.length} totales`, icon: <Users size={18} />, c: C.blue },
              { v: materias.length, l: 'Materias', sub: 'en el sistema', icon: <BookOpen size={18} />, c: C.green },
              { v: estadoHorario === 'aprobado' ? '✓ APROBADO' : 'Pendiente', l: 'Estado', sub: 'del horario', icon: <Shield size={18} />, c: estadoHorario === 'aprobado' ? '#166534' : '#92400e' },
            ].map(m => (
              <div key={m.l} style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ background: m.c, color: 'white', width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                  <div style={{ fontSize: 11, color: C.navy, fontWeight: 'bold' }}>{m.l}</div>
                  <div style={{ fontSize: 10, color: C.gray }}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Clases por semestre */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18, marginBottom: 14 }}>
            <h3 style={{ margin: '0 0 14px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Clases por Semestre (HU-47)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {semestres.map(s => {
                let cnt = 0;
                for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) if (horario[s]?.[d]?.[p]) cnt++;
                const pct = Math.round((cnt / (8 * 5)) * 100);
                return (
                  <div key={s} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: C.navy }}>{s}°</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: C.gold }}>{cnt}</div>
                    <div style={{ fontSize: 10, color: C.gray }}>periodos</div>
                    <div style={{ background: '#e2e8f0', borderRadius: 99, height: 4, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: C.navy, borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribución de aulas */}
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 13, fontWeight: 'bold' }}>Distribución de Aulas (HU-50)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {['Aula', 'Laboratorio', 'Auditorio', 'Sala'].map(tipo => {
                const cnt = aulas.filter(a => a.tipo === tipo).length;
                const disp = aulas.filter(a => a.tipo === tipo && a.disponible).length;
                return (
                  <div key={tipo} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 18 }}>{disp}/{cnt}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{tipo}s disponibles</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subTab === 'docente' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Docente:</label>
            <select value={filtroDoc} onChange={e => setFiltroDoc(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          {filtroDoc && (() => {
            const doc = docentes.find(d => d.id === filtroDoc);
            const horas = horasDoc?.[filtroDoc] || 0;
            const materiasDoc = [];
            semestres.forEach(s => {
              for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
                const c = horario[s][d][p];
                if (c?.docenteId === filtroDoc && !materiasDoc.find(m => m.id === c.id && m.dia === d && m.periodo === p))
                  materiasDoc.push({ ...c, semestre: s, dia: d, periodo: p });
              }
            });
            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ v: horas, l: `Horas asignadas (máx ${doc.maxHoras})`, c: horas > doc.maxHoras ? '#dc2626' : '#166534' }, { v: doc.tipo, l: 'Tipo de Docente', c: C.navy }, { v: doc.especialidad, l: 'Especialidad', c: C.blue }].map(m => (
                    <div key={m.l} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.grayLight }}>{['Materia', 'Semestre', 'Día', 'Periodo', 'Aula'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {materiasDoc.map((m, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{m.nombre}</span></td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{m.semestre}°</span></td>
                          <td style={tdStyle}>{DIAS[m.dia]}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>P{m.periodo + 1}</td>
                          <td style={tdStyle}>{aulas.find(a => a.id === m.aulaId)?.nombre || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {subTab === 'grupo' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Semestre:</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {semestres.map(s => (
                <button key={s} onClick={() => setFiltroGrupo(s)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 'bold', background: filtroGrupo === s ? C.navy : '#e2e8f0', color: filtroGrupo === s ? C.gold : C.gray }}>{s}°</button>
              ))}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.grayLight }}><th style={thStyle}>HORA</th>{DIAS.map(d => <th key={d} style={thStyle}>{d.toUpperCase()}</th>)}</tr>
              </thead>
              <tbody>
                {RENDER_SLOTS.map((slot, si) => {
                  if (slot.type === 'break') return (
                    <tr key={si}>
                      <td style={{ ...tdStyle, textAlign: 'center', fontSize: 10, color: '#94a3b8', background: '#f8fafc' }}>{slot.inicio}</td>
                      <td colSpan={5} style={{ background: '#fefce8', textAlign: 'center', fontSize: 10, color: '#92400e', padding: 3, fontWeight: 'bold' }}>RECESO</td>
                    </tr>
                  );
                  const p = slot.idx;
                  return (
                    <tr key={si} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, background: '#f8fafc', fontSize: 11, textAlign: 'center' }}>P{p+1}<br /><span style={{ fontSize: 9, color: '#94a3b8' }}>{slot.inicio}</span></td>
                      {[0,1,2,3,4].map(dia => {
                        const celda = horario[filtroGrupo][dia][p];
                        if (!celda) return <td key={dia} style={{ ...tdStyle, background: '#f8fafc' }} />;
                        const doc = docentes.find(d => d.id === celda.docenteId);
                        const aula = aulas.find(a => a.id === celda.aulaId);
                        return (
                          <td key={dia} style={{ ...tdStyle, background: '#eff6ff', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 11, color: C.navy }}>{celda.nombre}</div>
                            <div style={{ fontSize: 10, color: C.gray }}>{doc?.nombre}</div>
                            {aula && <div style={{ fontSize: 9, color: C.blue }}>📍 {aula.nombre}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'aula' && (
        !horario ? <NotGenerated /> :
        <div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.gray, marginBottom: 5, display: 'block' }}>Seleccionar Aula:</label>
            <select value={filtroAula} onChange={e => setFiltroAula(e.target.value)} style={{ ...inputStyle, maxWidth: 320 }}>
              {aulas.filter(a => a.disponible).map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo})</option>)}
            </select>
          </div>
          {filtroAula && (() => {
            const aula = aulas.find(a => a.id === filtroAula);
            const usos = [];
            semestres.forEach(s => {
              for (let d = 0; d < 5; d++) for (let p = 0; p < 8; p++) {
                const c = horario[s][d][p];
                if (c?.aulaId === filtroAula) usos.push({ ...c, semestre: s, dia: d, periodo: p });
              }
            });
            const tasaOcupacion = Math.round((usos.length / (8 * 5 * 8)) * 100);
            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  {[{ v: usos.length, l: 'Periodos Usados' }, { v: `${tasaOcupacion}%`, l: 'Tasa de Ocupación' }, { v: aula.capacidad, l: 'Capacidad' }].map(m => (
                    <div key={m.l} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 'bold', color: C.navy }}>{m.v}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'white', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: C.grayLight }}>{['Materia', 'Semestre', 'Día', 'Periodo', 'Docente'].map(h => <th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>
                      {usos.map((u, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={tdStyle}><span style={{ fontWeight: 'bold', color: C.navy, fontSize: 13 }}>{u.nombre}</span></td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}><span style={{ background: C.navy, color: C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>{u.semestre}°</span></td>
                          <td style={tdStyle}>{DIAS[u.dia]}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>P{u.periodo + 1}</td>
                          <td style={tdStyle}>{docentes.find(d => d.id === u.docenteId)?.nombre || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {subTab === 'exportar' && (
        <div>
          <p style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>Genera y descarga los horarios en distintos formatos para distribución institucional.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {[
              { icon: <FileDown size={28} />, titulo: 'Exportar PDF (HU-64)', desc: 'Genera horario completo en PDF para impresión y distribución oficial', color: '#dc2626', label: 'Descargar PDF' },
              { icon: <FileText size={28} />, titulo: 'Exportar Excel (HU-65)', desc: 'Exporta en formato .xlsx para edición en Microsoft Excel', color: '#166534', label: 'Descargar Excel' },
              { icon: <Printer size={28} />, titulo: 'Imprimir (HU-66)', desc: 'Envía directamente a impresora el cronograma académico del semestre seleccionado', color: C.navy, label: 'Imprimir Ahora' },
              { icon: <Users size={28} />, titulo: 'Horario por Docente (HU-68)', desc: 'Genera PDF individual con el horario de cada docente para distribución personal', color: C.blue, label: 'Generar PDFs' },
              { icon: <Layers size={28} />, titulo: 'Horario por Grupo', desc: 'Descarga el horario semestral completo para cada grupo académico', color: C.purple, label: 'Descargar' },
              { icon: <Archive size={28} />, titulo: 'Resumen Ejecutivo', desc: 'Informe gerencial con métricas de carga docente, ocupación de aulas y estadísticas', color: '#92400e', label: 'Generar Informe' },
            ].map(r => (
              <div key={r.titulo} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: r.color }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 'bold', color: C.navy, fontSize: 13, marginBottom: 4 }}>{r.titulo}</div>
                  <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.5 }}>{r.desc}</div>
                </div>
                <button onClick={() => alert(`Función "${r.titulo}" lista para implementar con backend. El sistema exportará los datos del horario generado.`)}
                  style={{ marginTop: 'auto', padding: '8px', background: r.color, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: !horario ? 0.4 : 1 }}
                  disabled={!horario}>
                  <Download size={13} /> {r.label}
                </button>
              </div>
            ))}
          </div>
          {!horario && <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>⚠ Genera un horario primero en el MOD-3 para habilitar la exportación.</div>}
        </div>
      )}
    </div>
  );
}

// ==========================================
// AUXILIARES
// ==========================================
function EmptyState({ icon, titulo, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', color: C.gray, textAlign: 'center' }}>
      <div style={{ color: '#cbd5e1', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#64748b', marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 13 }}>{desc}</div>
    </div>
  );
}

function FormModal({ titulo, onClose, onGuardar, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: 26, width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, color: C.navy, fontSize: 15, fontWeight: 'bold' }}>{titulo}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.gray }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', color: C.gray, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 }}>Cancelar</button>
          <button onClick={onGuardar} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, background: C.navy, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Save size={13} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, color: C.gray, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: C.navy, outline: 'none', boxSizing: 'border-box', background: '#f8fafc' };
const btnPrimary = { background: C.navy, color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 };
const btnSmall = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: C.navy, display: 'inline-flex', alignItems: 'center', gap: 4 };
const thStyle = { padding: '9px 12px', textAlign: 'left', fontSize: 11, color: C.gray, fontWeight: 'bold', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' };
const tdStyle = { padding: '9px 12px', fontSize: 13, color: C.gray, verticalAlign: 'middle' };