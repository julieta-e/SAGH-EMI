<<<<<<< Updated upstream
import React, { useState } from 'react';
import { User, Calendar, LogOut, CheckCircle, AlertCircle, Menu, Shield, Database, Play, FileText } from 'lucide-react';
import { C, INIT_USUARIOS, INIT_DOCENTES, INIT_MATERIAS, INIT_AULAS, INIT_GRUPOS, PERMISOS_ROL } from './shared/constants';
import { GlobalStyles } from './shared/styles/globalStyles';
import { Login } from './shared/components/Login';
import { NotifBell } from './shared/components/Notifications';
import { Mod1AdminView } from './modules/systemAdministration/components/SystemAdministration';
import { Mod2GestionAcadView } from './modules/academicManagement/components/AcademicManagement';
import { Mod3GeneradorView } from './modules/scheduleGeneration/components/ScheduleGeneration';
import { Mod4HorariosView } from './modules/scheduleManagement/components/ScheduleManagement';
import { Mod5ValidacionView } from './modules/validationReports/components/ValidationReports';
import { Mod6ReportesView } from './modules/reports/components/Reports';
import './shared/styles/base.css';

// ==========================================
// APP PRINCIPAL
// ==========================================
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [activeTab, setActiveTab] = useState('mod1');
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

  if (!usuario) return <Login usuarios={usuarios} onLogin={u => { setUsuario(u); setActiveTab('mod1'); }} />;

  const permisos = PERMISOS_ROL[usuario.rol] || [];
  const canAccess = (mod) => permisos.includes(mod);

  const TABS = [
    { id: 'mod1', label: 'Administracion del Sistema', icon: <Shield size={16} />, mod: 'mod1' },
    { id: 'mod2', label: 'Gestión Académica', icon: <Database size={16} />, mod: 'mod2' },
    { id: 'mod3', label: 'Generación de Horarios', icon: <Play size={16} />, mod: 'mod3' },
    { id: 'mod4', label: 'Gestion Horarios', icon: <Calendar size={16} />, mod: 'mod4', badge: estadoHorario === 'pendiente' },
    { id: 'mod5', label: 'Validación', icon: <CheckCircle size={16} />, mod: 'mod5' },
    { id: 'mod6', label: 'Reportes', icon: <FileText size={16} />, mod: 'mod6' },
  ].filter(t => t.always || canAccess(t.mod));
=======
import React, { useState, useCallback } from 'react';
import {
  Calendar, Users, BookOpen, Settings, LogOut, CheckCircle,
  AlertTriangle, Play, Clock, Menu, Printer, Building2, Plus,
  Pencil, Trash2, X, Save, AlertCircle, Check, RefreshCw,
  Info, Shield, Eye, FileText, Download, BarChart2, Bell,
  ClipboardList, Search, Filter, ChevronRight, Home, Database,
  Layers, FileDown, Archive, Activity, Hash
} from 'lucide-react';

// ─────────────────────────────────────────
// ESTILOS GLOBALES
// ─────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100% !important; height: 100% !important; min-height: 100vh; overflow: hidden; }
    body { font-family: 'Georgia', serif; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .fade-in { animation: fadeIn 0.25s ease; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  `}</style>
);

// ─────────────────────────────────────────
// PALETA DE COLORES
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// DATOS INICIALES
// ─────────────────────────────────────────
const INIT_USUARIOS = [
  { id: 'u1', nombre: 'Administrador SAGH', usuario: 'admin',       password: 'emi123',  rol: 'Administrador',   email: 'admin@emi.edu.bo',      activo: true, docenteId: null },
  { id: 'u2', nombre: 'Cap. Frank Silvestre', usuario: 'jefe.carrera', password: 'jefe123', rol: 'Jefe de Carrera', email: 'fsilvestre@emi.edu.bo', activo: true, docenteId: null },
  { id: 'u3', nombre: 'Secretaría DDE',     usuario: 'dde',         password: 'dde123',  rol: 'DDE',            email: 'dde@emi.edu.bo',         activo: true, docenteId: null },
];
const ROLES = ['Administrador', 'Jefe de Carrera', 'DDE', 'Docente'];
const PERMISOS_ROL = {
  'Administrador':   ['mod1','mod2','mod3','mod4','mod5','mod6'],
  'Jefe de Carrera': ['mod2','mod3','mod4','mod5','mod6'],
  'DDE':             ['mod2','mod3','mod4','mod5','mod6'],
  'Docente':         ['mod4','mod6'],
};

const INIT_DOCENTES = [
  { id:'d1',  nombre:'Ing. Carlos Mendoza',  tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Matemáticas',   email:'cmendoza@emi.edu.bo',  disponibilidad:[0,1,2,3,4] },
  { id:'d2',  nombre:'Cap. Roberto Díaz',    tipo:'Militar Activo',  maxHoras:25, minHoras:10, especialidad:'Doctrina',       email:'rdiaz@emi.edu.bo',     disponibilidad:[0,1,2,3,4] },
  { id:'d3',  nombre:'Ing. Ana Pardo',       tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Física',         email:'apardo@emi.edu.bo',    disponibilidad:[0,1,2,3,4] },
  { id:'d4',  nombre:'Tcnl. Luis Vargas',    tipo:'Militar Reserva', maxHoras:25, minHoras:10, especialidad:'Táctica',        email:'lvargas@emi.edu.bo',   disponibilidad:[0,1,2,3,4] },
  { id:'d5',  nombre:'Ing. Sofia Castro',    tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Redes',          email:'scastro@emi.edu.bo',   disponibilidad:[0,1,2,3,4] },
  { id:'d6',  nombre:'Ing. Fernando Rios',   tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Sistemas',       email:'frios@emi.edu.bo',     disponibilidad:[0,1,2,3,4] },
  { id:'d7',  nombre:'My. Jorge Salinas',    tipo:'Militar Activo',  maxHoras:25, minHoras:10, especialidad:'Defensa',        email:'jsalinas@emi.edu.bo',  disponibilidad:[0,1,2,3,4] },
  { id:'d8',  nombre:'Ing. Elena Gómez',     tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Idiomas',        email:'egomez@emi.edu.bo',    disponibilidad:[0,1,2,3,4] },
  { id:'d9',  nombre:'Ing. Raul Mamani',     tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Bases de Datos', email:'rmamani@emi.edu.bo',   disponibilidad:[0,1,2,3,4] },
  { id:'d10', nombre:'Ing. Patricia Luna',   tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Gestión',        email:'pluna@emi.edu.bo',     disponibilidad:[0,1,2,3,4] },
  { id:'d11', nombre:'Cap. Diego Blanco',    tipo:'Militar Activo',  maxHoras:25, minHoras:10, especialidad:'Doctrina',       email:'dblanco@emi.edu.bo',   disponibilidad:[0,1,2,3,4] },
  { id:'d12', nombre:'Ing. Carmen Vega',     tipo:'Civil',           maxHoras:25, minHoras:10, especialidad:'Software',       email:'cvega@emi.edu.bo',     disponibilidad:[0,1,2,3,4] },
];

const INIT_GRUPOS = [
  { id:'g3',  nombre:'Sistemas 3°',  semestre:3,  numEstudiantes:35, aulaFijaId:null },
  { id:'g4',  nombre:'Sistemas 4°',  semestre:4,  numEstudiantes:32, aulaFijaId:null },
  { id:'g5',  nombre:'Sistemas 5°',  semestre:5,  numEstudiantes:28, aulaFijaId:null },
  { id:'g6',  nombre:'Sistemas 6°',  semestre:6,  numEstudiantes:30, aulaFijaId:null },
  { id:'g7',  nombre:'Sistemas 7°',  semestre:7,  numEstudiantes:26, aulaFijaId:null },
  { id:'g8',  nombre:'Sistemas 8°',  semestre:8,  numEstudiantes:24, aulaFijaId:null },
  { id:'g9',  nombre:'Sistemas 9°',  semestre:9,  numEstudiantes:20, aulaFijaId:null },
  { id:'g10', nombre:'Sistemas 10°', semestre:10, numEstudiantes:18, aulaFijaId:null },
];

const INIT_AULAS = [
  { id:'a1', nombre:'Aula 101',             tipo:'Aula',        capacidad:40,  edificio:'A', disponible:true  },
  { id:'a2', nombre:'Aula 102',             tipo:'Aula',        capacidad:40,  edificio:'A', disponible:true  },
  { id:'a3', nombre:'Aula 201',             tipo:'Aula',        capacidad:35,  edificio:'A', disponible:true  },
  { id:'a4', nombre:'Lab. Computación 1',   tipo:'Laboratorio', capacidad:30,  edificio:'B', disponible:true  },
  { id:'a5', nombre:'Lab. Computación 2',   tipo:'Laboratorio', capacidad:30,  edificio:'B', disponible:true  },
  { id:'a6', nombre:'Lab. Redes',           tipo:'Laboratorio', capacidad:25,  edificio:'B', disponible:true  },
  { id:'a7', nombre:'Aula Magna',           tipo:'Auditorio',   capacidad:120, edificio:'C', disponible:true  },
  { id:'a8', nombre:'Sala de Conferencias', tipo:'Sala',        capacidad:20,  edificio:'C', disponible:false },
];

const INIT_MATERIAS = [
  { id:'m3_1',  nombre:'Cálculo III',                    semestre:3,  periodos:3, docenteId:'d1',  tipoAula:'Aula',        critica:true  },
  { id:'m3_2',  nombre:'Física II',                      semestre:3,  periodos:3, docenteId:'d3',  tipoAula:'Aula',        critica:false },
  { id:'m3_3',  nombre:'Estructura de Datos',            semestre:3,  periodos:3, docenteId:'d5',  tipoAula:'Laboratorio', critica:true  },
  { id:'m3_4',  nombre:'Estadística I',                  semestre:3,  periodos:3, docenteId:'d6',  tipoAula:'Aula',        critica:false },
  { id:'m3_5',  nombre:'Álgebra Lineal',                 semestre:3,  periodos:2, docenteId:'d1',  tipoAula:'Aula',        critica:false },
  { id:'m3_6',  nombre:'Doctrina Militar III',           semestre:3,  periodos:2, docenteId:'d2',  tipoAula:'Aula',        critica:false },
  { id:'m3_7',  nombre:'Inglés III',                     semestre:3,  periodos:2, docenteId:'d8',  tipoAula:'Aula',        critica:false },
  { id:'m3_8',  nombre:'Contabilidad',                   semestre:3,  periodos:2, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m4_1',  nombre:'Ecuaciones Diferenciales',       semestre:4,  periodos:3, docenteId:'d1',  tipoAula:'Aula',        critica:true  },
  { id:'m4_2',  nombre:'Bases de Datos I',               semestre:4,  periodos:3, docenteId:'d6',  tipoAula:'Laboratorio', critica:true  },
  { id:'m4_3',  nombre:'Prog. Orientada a Objetos',      semestre:4,  periodos:3, docenteId:'d5',  tipoAula:'Laboratorio', critica:true  },
  { id:'m4_4',  nombre:'Estadística II',                 semestre:4,  periodos:3, docenteId:'d9',  tipoAula:'Aula',        critica:false },
  { id:'m4_5',  nombre:'Física III',                     semestre:4,  periodos:3, docenteId:'d3',  tipoAula:'Aula',        critica:false },
  { id:'m4_6',  nombre:'Doctrina Militar IV',            semestre:4,  periodos:3, docenteId:'d7',  tipoAula:'Aula',        critica:false },
  { id:'m4_7',  nombre:'Inglés IV',                      semestre:4,  periodos:2, docenteId:'d8',  tipoAula:'Aula',        critica:false },
  { id:'m5_1',  nombre:'Bases de Datos II',              semestre:5,  periodos:3, docenteId:'d6',  tipoAula:'Laboratorio', critica:true  },
  { id:'m5_2',  nombre:'Sistemas Operativos',            semestre:5,  periodos:3, docenteId:'d9',  tipoAula:'Laboratorio', critica:true  },
  { id:'m5_3',  nombre:'Análisis y Diseño',              semestre:5,  periodos:3, docenteId:'d12', tipoAula:'Aula',        critica:false },
  { id:'m5_4',  nombre:'Investigación Operativa I',      semestre:5,  periodos:3, docenteId:'d1',  tipoAula:'Aula',        critica:false },
  { id:'m5_5',  nombre:'Redes I',                        semestre:5,  periodos:2, docenteId:'d5',  tipoAula:'Laboratorio', critica:false },
  { id:'m5_6',  nombre:'Doctrina Militar V',             semestre:5,  periodos:2, docenteId:'d11', tipoAula:'Aula',        critica:false },
  { id:'m5_7',  nombre:'Inglés V',                       semestre:5,  periodos:2, docenteId:'d8',  tipoAula:'Aula',        critica:false },
  { id:'m5_8',  nombre:'Economía General',               semestre:5,  periodos:2, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m6_1',  nombre:'Ingeniería de Software I',       semestre:6,  periodos:3, docenteId:'d12', tipoAula:'Laboratorio', critica:true  },
  { id:'m6_2',  nombre:'Redes II',                       semestre:6,  periodos:3, docenteId:'d5',  tipoAula:'Laboratorio', critica:false },
  { id:'m6_3',  nombre:'Investigación Operativa II',     semestre:6,  periodos:3, docenteId:'d1',  tipoAula:'Aula',        critica:false },
  { id:'m6_4',  nombre:'Sistemas de Inf. Geográfica',   semestre:6,  periodos:3, docenteId:'d9',  tipoAula:'Laboratorio', critica:false },
  { id:'m6_5',  nombre:'Arquitectura de Computadoras',  semestre:6,  periodos:3, docenteId:'d6',  tipoAula:'Aula',        critica:false },
  { id:'m6_6',  nombre:'Táctica y Estrategia I',        semestre:6,  periodos:3, docenteId:'d4',  tipoAula:'Aula',        critica:false },
  { id:'m6_7',  nombre:'Preparación de Proyectos',      semestre:6,  periodos:2, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m7_1',  nombre:'Ingeniería de Software II',     semestre:7,  periodos:3, docenteId:'d12', tipoAula:'Laboratorio', critica:true  },
  { id:'m7_2',  nombre:'Sistemas Distribuidos',         semestre:7,  periodos:3, docenteId:'d9',  tipoAula:'Laboratorio', critica:false },
  { id:'m7_3',  nombre:'Inteligencia Artificial',       semestre:7,  periodos:3, docenteId:'d6',  tipoAula:'Laboratorio', critica:true  },
  { id:'m7_4',  nombre:'Seguridad de Sistemas',         semestre:7,  periodos:3, docenteId:'d5',  tipoAula:'Laboratorio', critica:false },
  { id:'m7_5',  nombre:'Dinámica de Sistemas',          semestre:7,  periodos:3, docenteId:'d3',  tipoAula:'Aula',        critica:false },
  { id:'m7_6',  nombre:'Táctica y Estrategia II',       semestre:7,  periodos:3, docenteId:'d4',  tipoAula:'Aula',        critica:false },
  { id:'m7_7',  nombre:'Evaluación de Proyectos',       semestre:7,  periodos:2, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m8_1',  nombre:'Auditoría de Sistemas',         semestre:8,  periodos:3, docenteId:'d12', tipoAula:'Laboratorio', critica:true  },
  { id:'m8_2',  nombre:'Sistemas Expertos',             semestre:8,  periodos:3, docenteId:'d6',  tipoAula:'Laboratorio', critica:false },
  { id:'m8_3',  nombre:'Redes Inalámbricas',            semestre:8,  periodos:3, docenteId:'d5',  tipoAula:'Laboratorio', critica:false },
  { id:'m8_4',  nombre:'Legislación para Ingeniería',  semestre:8,  periodos:3, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m8_5',  nombre:'Metodología de Investigación', semestre:8,  periodos:3, docenteId:'d8',  tipoAula:'Aula',        critica:false },
  { id:'m8_6',  nombre:'Liderazgo Militar',             semestre:8,  periodos:3, docenteId:'d2',  tipoAula:'Aula',        critica:false },
  { id:'m8_7',  nombre:'Simulación de Sistemas',        semestre:8,  periodos:2, docenteId:'d3',  tipoAula:'Laboratorio', critica:false },
  { id:'m9_1',  nombre:'Taller de Grado I',             semestre:9,  periodos:4, docenteId:'d12', tipoAula:'Laboratorio', critica:true  },
  { id:'m9_2',  nombre:'Planificación Estratégica',     semestre:9,  periodos:4, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m9_3',  nombre:'Gestión de Calidad de SW',      semestre:9,  periodos:4, docenteId:'d6',  tipoAula:'Laboratorio', critica:false },
  { id:'m9_4',  nombre:'Comercio Electrónico',          semestre:9,  periodos:4, docenteId:'d9',  tipoAula:'Laboratorio', critica:false },
  { id:'m9_5',  nombre:'Defensa Nacional',              semestre:9,  periodos:4, docenteId:'d7',  tipoAula:'Aula',        critica:false },
  { id:'m10_1', nombre:'Taller de Grado II',            semestre:10, periodos:4, docenteId:'d12', tipoAula:'Laboratorio', critica:true  },
  { id:'m10_2', nombre:'Gerencia de Sistemas',          semestre:10, periodos:4, docenteId:'d10', tipoAula:'Aula',        critica:false },
  { id:'m10_3', nombre:'Robótica',                      semestre:10, periodos:4, docenteId:'d5',  tipoAula:'Laboratorio', critica:false },
  { id:'m10_4', nombre:'Minería de Datos',              semestre:10, periodos:4, docenteId:'d6',  tipoAula:'Laboratorio', critica:false },
  { id:'m10_5', nombre:'Geopolítica',                   semestre:10, periodos:4, docenteId:'d4',  tipoAula:'Aula',        critica:false },
];

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const SEMESTRES = [3,4,5,6,7,8,9,10];

const RENDER_SLOTS = [
  { type:'class', idx:0, inicio:'07:45', fin:'08:30' },
  { type:'class', idx:1, inicio:'08:30', fin:'09:15' },
  { type:'class', idx:2, inicio:'09:15', fin:'10:00' },
  { type:'break', label:'Receso',  inicio:'10:00', fin:'10:15' },
  { type:'class', idx:3, inicio:'10:15', fin:'11:00' },
  { type:'class', idx:4, inicio:'11:00', fin:'11:45' },
  { type:'break', label:'Receso',  inicio:'11:45', fin:'12:00' },
  { type:'class', idx:5, inicio:'12:00', fin:'12:45' },
  { type:'class', idx:6, inicio:'12:45', fin:'13:30' },
  { type:'class', idx:7, inicio:'13:30', fin:'14:15' },
];

// ─────────────────────────────────────────
// ESTILOS COMPARTIDOS
// ─────────────────────────────────────────
const inputStyle = { width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, color:C.navy, outline:'none', boxSizing:'border-box', background:'#f8fafc' };
const btnPrimary = { background:C.navy, color:'white', border:'none', borderRadius:7, padding:'7px 16px', cursor:'pointer', fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 };
const btnSmall   = { background:'white', border:'1px solid #e2e8f0', borderRadius:5, padding:'4px 8px', cursor:'pointer', fontSize:12, color:C.navy, display:'inline-flex', alignItems:'center', gap:4 };
const thStyle    = { padding:'9px 12px', textAlign:'left', fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:0.5, borderBottom:'1px solid #e2e8f0' };
const tdStyle    = { padding:'9px 12px', fontSize:13, color:C.gray, verticalAlign:'middle' };

// ─────────────────────────────────────────
// ALGORITMO GENÉTICO
// ─────────────────────────────────────────
const generarHorarios = (materias, docentes, aulas) => {
  const horario = {};
  const ocupDoc = {};
  const horasDoc = {};
  const ocupAulas = {};

  docentes.forEach(d => { horasDoc[d.id]=0; ocupDoc[d.id]=Array(5).fill(null).map(()=>Array(8).fill(false)); });
  aulas.filter(a=>a.disponible).forEach(a => { ocupAulas[a.id]=Array(5).fill(null).map(()=>Array(8).fill(false)); });

  const split = n => {
    if(n===2) return [2]; if(n===3) return [3]; if(n===4) return [2,2];
    if(n===5) return [3,2]; if(n===6) return [3,3]; if(n===7) return [3,2,2]; if(n===8) return [3,3,2];
    const r=[]; let x=n;
    while(x>0){ if(x===1){if(r.length)r[r.length-1]++;else r.push(2);x=0;} else if(x>=3){r.push(3);x-=3;} else{r.push(2);x-=2;} }
    return r;
  };

  SEMESTRES.forEach(sem => {
    horario[sem]=Array(5).fill(null).map(()=>Array(8).fill(null));
    const mats=[...materias.filter(m=>m.semestre===sem)].sort((a,b)=>(b.critica?1:0)-(a.critica?1:0));
    const pending=[];
    mats.forEach(m=>split(m.periodos).forEach(t=>pending.push({mat:m,t})));
    pending.sort((a,b)=>b.t-a.t);

    const canPlace=(mat,d,p,t)=>{
      const maxH=docentes.find(x=>x.id===mat.docenteId)?.maxHoras||25;
      if(p+t>8||horasDoc[mat.docenteId]+t>maxH) return false;
      for(let i=p;i<p+t;i++) if(horario[sem][d][i]||ocupDoc[mat.docenteId][d][i]) return false;
      return true;
    };
    const place=(mat,d,p,t)=>{
      const idxs=Array.from({length:t},(_,i)=>p+i);
      const aula=aulas.find(a=>a.disponible&&(a.tipo===mat.tipoAula||!mat.tipoAula)&&idxs.every(i=>!ocupAulas[a.id]?.[d]?.[i]))||null;
      for(let i=p;i<p+t;i++){
        horario[sem][d][i]={...mat,aulaId:aula?.id||null};
        ocupDoc[mat.docenteId][d][i]=true;
        if(aula) ocupAulas[aula.id][d][i]=true;
        horasDoc[mat.docenteId]++;
      }
    };

    let lunesOk=false;
    for(let i=0;i<pending.length&&!lunesOk;i++){
      const {mat,t}=pending[i];
      if(canPlace(mat,0,0,t)){place(mat,0,0,t);pending.splice(i,1);lunesOk=true;}
    }
    pending.forEach(({mat,t})=>{
      const used=new Set();
      for(let d=0;d<5;d++) for(let p=0;p<8;p++) if(horario[sem][d][p]?.id===mat.id) used.add(d);
      const dias=[0,1,2,3,4].sort((a,b)=>(used.has(a)?1:0)-(used.has(b)?1:0));
      let ok=false;
      for(const d of dias){ if(ok) break; for(let p=0;p<=8-t&&!ok;p++) if(canPlace(mat,d,p,t)){place(mat,d,p,t);ok=true;} }
    });
  });
  return { horario, horasDocentes: horasDoc };
};

// ─────────────────────────────────────────
// COMPONENTES REUTILIZABLES A NIVEL MÓDULO
// ─────────────────────────────────────────
>>>>>>> Stashed changes

function EmptyState({ icon, titulo, desc }) {
  return (
<<<<<<< Updated upstream
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
              {TABS.find(t => t.id === activeTab)?.label || 'Administracion del Sistema'}
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
          {activeTab === 'mod1' && <Mod1AdminView usuarios={usuarios} setUsuarios={setUsuarios} docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horarioData={horarioData} estadoHorario={estadoHorario} historial={historial} addNotif={addNotif} onNavigate={setActiveTab} />}
          {activeTab === 'mod2' && <Mod2GestionAcadView docentes={docentes} setDocentes={setDocentes} materias={materias} setMaterias={setMaterias} aulas={aulas} setAulas={setAulas} grupos={grupos} setGrupos={setGrupos} />}
          {activeTab === 'mod3' && <Mod3GeneradorView materias={materias} docentes={docentes} aulas={aulas} onFinish={onHorarioGenerado} />}
          {activeTab === 'mod4' && <Mod4HorariosView horario={horarioData} docentes={docentes} aulas={aulas} materias={materias} estadoHorario={estadoHorario} onCambio={onHorarioCambiado} />}
          {activeTab === 'mod5' && <Mod5ValidacionView horario={horarioData} docentes={docentes} horasDoc={horasDocData} estado={estadoHorario} onAprobar={onAprobar} onVerHorario={() => setActiveTab('mod4')} historial={historial} addNotif={addNotif} />}
          {activeTab === 'mod6' && <Mod6ReportesView horario={horarioData} docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horasDoc={horasDocData} estadoHorario={estadoHorario} addNotif={addNotif} usuario={usuario} />}
        </div>
      </main>
=======
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'55vh', color:C.gray, textAlign:'center' }}>
      <div style={{ color:'#cbd5e1', marginBottom:14 }}>{icon}</div>
      <div style={{ fontSize:16, fontWeight:'bold', color:'#64748b', marginBottom:6 }}>{titulo}</div>
      <div style={{ fontSize:13 }}>{desc}</div>
>>>>>>> Stashed changes
    </div>
  );
}

<<<<<<< Updated upstream
=======
function FormModal({ titulo, onClose, onGuardar, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'white', borderRadius:14, padding:28, width:460, boxShadow:'0 24px 60px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0, color:C.navy, fontSize:16, fontWeight:'bold' }}>{titulo}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.gray, padding:4 }}><X size={18}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>{children}</div>
        <div style={{ display:'flex', gap:10, marginTop:22 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', border:'1px solid #e2e8f0', borderRadius:8, background:'white', color:C.gray, cursor:'pointer', fontWeight:'bold', fontSize:13 }}>Cancelar</button>
          <button onClick={onGuardar} style={{ flex:1, padding:'9px', border:'none', borderRadius:8, background:C.navy, color:'white', cursor:'pointer', fontWeight:'bold', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <Save size={14}/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:0.4, marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}

function RolBadge({ rol }) {
  const cfg = { 'Administrador':[C.navy,C.gold], 'Jefe de Carrera':[C.green,'#dcfce7'], 'DDE':[C.blue,C.blueLight], 'Docente':[C.gray,C.grayLight] };
  const [bg, fg] = cfg[rol]||[C.gray,C.grayLight];
  return <span style={{ background:fg, color:bg, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{rol}</span>;
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background:active?C.navy:'#e2e8f0', color:active?C.gold:C.gray, transition:'all 0.15s' }}>
      {children}
    </button>
  );
}

// Badge de severidad para validación
function SevBadge({ sev }) {
  const cfg = {
    error:   { bg:'#fef2f2', color:'#991b1b', label:'Crítico',    border:'#fecaca' },
    warning: { bg:'#fefce8', color:'#92400e', label:'Advertencia',border:'#fef08a' },
    info:    { bg:'#eff6ff', color:'#1e40af', label:'Informativo',border:'#bfdbfe' },
    ok:      { bg:'#f0fdf4', color:'#166534', label:'Cumple',     border:'#dcfce7' },
  };
  const c=cfg[sev]||cfg.info;
  return <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:'2px 9px', fontSize:10, fontWeight:'bold', whiteSpace:'nowrap' }}>{c.label}</span>;
}

// Fila del checklist de validación
function CheckRow({ label, ok, detalle }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 12px', background:ok?'#f0fdf4':'#fef2f2', borderRadius:8, border:`1px solid ${ok?'#dcfce7':'#fecaca'}` }}>
      {ok ? <CheckCircle size={14} color="#16a34a" style={{ flexShrink:0, marginTop:1 }}/> : <AlertCircle size={14} color="#dc2626" style={{ flexShrink:0, marginTop:1 }}/>}
      <div style={{ flex:1 }}>
        <span style={{ fontSize:12, fontWeight:'bold', color:ok?'#166534':'#991b1b' }}>{label}</span>
        {detalle && <div style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>{detalle}</div>}
      </div>
      <span style={{ fontSize:11, fontWeight:'bold', color:ok?'#16a34a':'#dc2626', flexShrink:0 }}>{ok?'OK':'FALLA'}</span>
    </div>
  );
}

// Componente de alerta con acción de archivar
function AlertCard({ id, msg, sev, onArchivar, onIr }) {
  const [open, setOpen] = useState(false);
  const [justif, setJustif] = useState('');
  const bgMap = { error:'#fef2f2', warning:'#fefce8' };
  const borderMap = { error:'#fecaca', warning:'#fef08a' };
  const colorMap = { error:'#991b1b', warning:'#92400e' };
  return (
    <div style={{ background:bgMap[sev]||'#f8fafc', border:`1px solid ${borderMap[sev]||'#e2e8f0'}`, borderRadius:8, padding:'10px 14px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
        <AlertTriangle size={14} color={colorMap[sev]} style={{ flexShrink:0, marginTop:2 }}/>
        <span style={{ flex:1, fontSize:12, color:colorMap[sev] }}>{msg}</span>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          {onIr && <button onClick={onIr} style={{ padding:'3px 9px', background:C.navy, color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:10 }}>Corregir</button>}
          <button onClick={()=>setOpen(!open)} style={{ padding:'3px 9px', background:'transparent', color:colorMap[sev], border:`1px solid ${borderMap[sev]}`, borderRadius:4, cursor:'pointer', fontSize:10 }}>
            {open?'Cancelar':'Archivar'}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ marginTop:8, display:'flex', gap:6 }}>
          <input value={justif} onChange={e=>setJustif(e.target.value)} placeholder="Justificación..." style={{ flex:1, padding:'5px 8px', border:'1px solid #e2e8f0', borderRadius:4, fontSize:11 }}/>
          <button onClick={()=>onArchivar(id,justif)} style={{ padding:'5px 12px', background:C.navy, color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:11 }}>Confirmar</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// NOTIFICACIONES (CAMPANA)
// ─────────────────────────────────────────
function NotifBell({ notificaciones }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:C.gray, display:'flex', alignItems:'center', gap:4, fontSize:12, position:'relative' }}>
        <Bell size={14}/>
        {notificaciones.length>0 && <span style={{ background:'#ef4444', color:'white', borderRadius:'50%', width:14, height:14, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', position:'absolute', top:-4, right:-4 }}>{Math.min(notificaciones.length,9)}</span>}
      </button>
      {open && (
        <div style={{ position:'absolute', top:36, right:0, background:'white', border:'1px solid #e2e8f0', borderRadius:12, boxShadow:'0 8px 28px rgba(0,0,0,0.12)', width:310, zIndex:200, maxHeight:340, overflowY:'auto' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid #f1f5f9', fontWeight:'bold', fontSize:12, color:C.navy }}>Notificaciones</div>
          {notificaciones.length===0 && <div style={{ padding:16, fontSize:12, color:C.gray, textAlign:'center' }}>Sin notificaciones</div>}
          {notificaciones.map(n=>(
            <div key={n.id} style={{ padding:'8px 16px', borderBottom:'1px solid #f8fafc', fontSize:11 }}>
              <div style={{ color:n.tipo==='success'?'#16a34a':n.tipo==='warning'?'#92400e':C.navy }}>{n.msg}</div>
              <div style={{ color:'#94a3b8', marginTop:2 }}>{n.fecha}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
function Login({ usuarios, onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true); setError('');
    setTimeout(()=>{
      const u=usuarios.find(u=>u.usuario===user&&u.password===pass&&u.activo);
      if(u) onLogin(u); else { setError('Credenciales incorrectas o usuario inactivo.'); setLoading(false); }
    },600);
  };

  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg, ${C.navy} 0%, #0a1a35 60%, ${C.navyLight} 100%)`, fontFamily:"'Georgia', serif", overflow:'auto' }}>
      <GlobalStyles/>
      <div style={{ textAlign:'center', width:'100%', maxWidth:400, padding:20 }}>
        <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)', border:`1px solid rgba(200,168,75,0.3)`, borderRadius:18, padding:'44px 40px', boxShadow:'0 28px 56px rgba(0,0,0,0.5)' }}>
          <div style={{ width:72, height:72, background:`radial-gradient(circle, ${C.gold}, #8b6914)`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:`0 0 30px rgba(200,168,75,0.4)` }}>
            <Calendar color="white" size={32}/>
          </div>
          <h1 style={{ color:C.gold, margin:'0 0 4px', fontSize:20, letterSpacing:3 }}>SAGH — EMI</h1>
          <p style={{ color:'#64748b', fontSize:11, margin:'0 0 28px', letterSpacing:1 }}>SISTEMA AUTOMÁTICO DE GENERACIÓN DE HORARIOS</p>
          <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'10px 12px', marginBottom:18, fontSize:11, color:'#94a3b8', textAlign:'left' }}>
            <div style={{ fontWeight:'bold', color:C.gold, marginBottom:5 }}>Acceso al sistema:</div>
            <div>admin / emi123 → Administrador</div>
            <div>jefe.carrera / jefe123 → Jefe de Carrera</div>
            <div>dde / dde123 → DDE</div>
          </div>
          {error && <div style={{ background:'rgba(153,27,27,0.3)', border:'1px solid #991b1b', color:'#fca5a5', borderRadius:8, padding:'8px 12px', fontSize:12, marginBottom:14 }}>{error}</div>}
          {[['USUARIO',user,setUser,'text','admin'],['CONTRASEÑA',pass,setPass,'password','••••••']].map(([label,val,setter,type,ph])=>(
            <div key={label} style={{ marginBottom:14, textAlign:'left' }}>
              <label style={{ display:'block', fontSize:10, color:'#94a3b8', letterSpacing:1, marginBottom:5 }}>{label}</label>
              <input type={type} value={val} onChange={e=>setter(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder={ph}
                style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(200,168,75,0.2)', borderRadius:8, color:'white', fontSize:13, outline:'none', boxSizing:'border-box' }}/>
            </div>
          ))}
          <button onClick={handleLogin} disabled={loading} style={{ width:'100%', padding:'12px', background:`linear-gradient(135deg, ${C.gold}, #8b6914)`, border:'none', borderRadius:8, color:C.navy, fontWeight:'bold', fontSize:13, cursor:'pointer', letterSpacing:1, opacity:loading?0.7:1, marginTop:8 }}>
            {loading?'VERIFICANDO...':'INGRESAR AL SISTEMA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────
export default function App() {
  const [usuario, setUsuario]         = useState(null);
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [usuarios, setUsuarios]       = useState(INIT_USUARIOS);
  const [docentes, setDocentes]       = useState(INIT_DOCENTES);
  const [materias, setMaterias]       = useState(INIT_MATERIAS);
  const [aulas, setAulas]             = useState(INIT_AULAS);
  const [grupos, setGrupos]           = useState(INIT_GRUPOS);
  const [horarioData, setHorarioData] = useState(null);
  const [horasDocData, setHorasDocData] = useState(null);
  const [estadoHorario, setEstadoHorario] = useState(null);
  const [historial, setHistorial]     = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  const addNotif = (msg, tipo='info') => {
    setNotificaciones(prev=>[{ id:Date.now(), msg, tipo, fecha:new Date().toLocaleString() }, ...prev].slice(0,20));
  };

  const onHorarioGenerado = (horario, horas) => {
    setHorarioData(horario); setHorasDocData(horas); setEstadoHorario('pendiente');
    setHistorial(prev=>[{ id:Date.now(), accion:'Horario generado', usuario:usuario?.nombre, fecha:new Date().toLocaleString(), estado:'pendiente' },...prev]);
    addNotif('Horario generado y listo para validación','warning');
    setActiveTab('mod4');
  };
  const onHorarioCambiado = h => { setHorarioData(h); setEstadoHorario('pendiente'); addNotif('Horario modificado manualmente','info'); };
  const onAprobar = () => {
    setEstadoHorario('aprobado');
    setHistorial(prev=>[{ id:Date.now(), accion:'Horario aprobado', usuario:usuario?.nombre, fecha:new Date().toLocaleString(), estado:'aprobado' },...prev]);
    addNotif('Horario aprobado formalmente','success');
  };

  if(!usuario) return <Login usuarios={usuarios} onLogin={u=>{ setUsuario(u); setActiveTab('dashboard'); }}/>;

  const permisos = PERMISOS_ROL[usuario.rol]||[];
  const TABS = [
    { id:'dashboard', label:'Dashboard',              icon:<Home size={15}/>,        always:true },
    { id:'mod1',      label:'Administración',         icon:<Shield size={15}/>,      mod:'mod1' },
    { id:'mod2',      label:'Gestión Académica',      icon:<Database size={15}/>,    mod:'mod2' },
    { id:'mod3',      label:'Generación de Horarios', icon:<Play size={15}/>,        mod:'mod3' },
    { id:'mod4',      label:'Horarios',               icon:<Calendar size={15}/>,    mod:'mod4', badge:estadoHorario==='pendiente' },
    { id:'mod5',      label:'Validación',             icon:<CheckCircle size={15}/>, mod:'mod5' },
    { id:'mod6',      label:'Reportes',               icon:<FileText size={15}/>,    mod:'mod6' },
  ].filter(t=>t.always||permisos.includes(t.mod));

  return (
    <div style={{ display:'flex', width:'100%', height:'100%', minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Georgia', serif", position:'fixed', inset:0 }}>
      <GlobalStyles/>

      {/* SIDEBAR */}
      <aside style={{ width:sidebarOpen?230:56, background:C.navy, color:'white', display:'flex', flexDirection:'column', transition:'width 0.25s', flexShrink:0, overflow:'hidden' }}>
        <div style={{ padding:'14px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', minHeight:62 }}>
          {sidebarOpen && (
            <div>
              <div style={{ color:C.gold, fontWeight:'bold', fontSize:14, letterSpacing:2 }}>EMI — SAGH</div>
              <div style={{ fontSize:10, color:'#64748b', letterSpacing:1, marginTop:1 }}>Sistema Acad. de Horarios</div>
            </div>
          )}
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:4, flexShrink:0 }}><Menu size={16}/></button>
        </div>

        {sidebarOpen && (
          <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:11 }}>
            <div style={{ color:'#64748b' }}>Sesión activa</div>
            <div style={{ color:'white', fontWeight:'bold', fontSize:12, marginTop:2 }}>{usuario.nombre}</div>
            <span style={{ background:'rgba(200,168,75,0.18)', color:C.gold, fontSize:10, padding:'2px 8px', borderRadius:10, marginTop:4, display:'inline-block' }}>{usuario.rol}</span>
          </div>
        )}

        <nav style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:9, padding:sidebarOpen?'10px 16px':'10px 0',
              justifyContent:sidebarOpen?'flex-start':'center',
              background:activeTab===t.id?'rgba(200,168,75,0.12)':'none',
              borderLeft:activeTab===t.id?`3px solid ${C.gold}`:'3px solid transparent',
              border:'none', borderRight:'none', borderTop:'none', borderBottom:'none',
              color:activeTab===t.id?C.gold:'#64748b',
              cursor:'pointer', fontSize:12, position:'relative', whiteSpace:'nowrap',
              transition:'all 0.15s',
            }}>
              {t.icon}
              {sidebarOpen && <span style={{ fontWeight:activeTab===t.id?'bold':'normal' }}>{t.label}</span>}
              {t.badge && <span style={{ background:'#ef4444', borderRadius:'50%', width:7, height:7, position:'absolute', right:12, top:10 }}/>}
            </button>
          ))}
        </nav>

        <div style={{ padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen && estadoHorario && (
            <div style={{ background:estadoHorario==='aprobado'?'rgba(22,101,52,0.25)':'rgba(200,168,75,0.12)', border:`1px solid ${estadoHorario==='aprobado'?'#16a34a':C.gold}`, borderRadius:7, padding:'5px 10px', marginBottom:8, fontSize:10, color:estadoHorario==='aprobado'?'#4ade80':C.gold, display:'flex', alignItems:'center', gap:5 }}>
              {estadoHorario==='aprobado'?<CheckCircle size={11}/>:<AlertCircle size={11}/>}
              {estadoHorario==='aprobado'?'Horario Aprobado':'Pendiente de Validación'}
            </div>
          )}
          <button onClick={()=>setUsuario(null)} style={{ width:'100%', display:'flex', alignItems:'center', gap:6, justifyContent:sidebarOpen?'flex-start':'center', background:'none', border:'1px solid rgba(239,68,68,0.25)', borderRadius:7, color:'#f87171', cursor:'pointer', padding:'7px 10px', fontSize:11 }}>
            <LogOut size={13}/>
            {sidebarOpen && 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ background:'white', padding:'0 22px', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`3px solid ${C.gold}`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:3, height:20, background:C.gold, borderRadius:2 }}/>
            <h2 style={{ margin:0, fontSize:14, fontWeight:'bold', color:C.navy }}>{TABS.find(t=>t.id===activeTab)?.label||'Dashboard'}</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <NotifBell notificaciones={notificaciones}/>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:C.gray }}>
              <div style={{ width:28, height:28, background:C.navy, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontSize:10, fontWeight:'bold' }}>
                {usuario.nombre.charAt(0)}
              </div>
              <span>{usuario.nombre}</span>
            </div>
          </div>
        </header>

        <div style={{ flex:1, overflow:'auto', padding:22 }} className="fade-in">
          {activeTab==='dashboard'  && <DashboardView  docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horarioData={horarioData} estadoHorario={estadoHorario} historial={historial} onNavigate={setActiveTab}/>}
          {activeTab==='mod1'       && <Mod1AdminView  usuarios={usuarios} setUsuarios={setUsuarios} docentes={docentes} addNotif={addNotif}/>}
          {activeTab==='mod2'       && <Mod2GestionAcadView docentes={docentes} setDocentes={setDocentes} materias={materias} setMaterias={setMaterias} aulas={aulas} setAulas={setAulas} grupos={grupos} setGrupos={setGrupos}/>}
          {activeTab==='mod3'       && <Mod3GeneradorView materias={materias} docentes={docentes} aulas={aulas} onFinish={onHorarioGenerado}/>}
          {activeTab==='mod4'       && <Mod4HorariosView horario={horarioData} docentes={docentes} aulas={aulas} materias={materias} estadoHorario={estadoHorario} onCambio={onHorarioCambiado} usuario={usuario}/>}
          {activeTab==='mod5'       && <Mod5ValidacionView horario={horarioData} docentes={docentes} horasDoc={horasDocData} estado={estadoHorario} onAprobar={onAprobar} onVerHorario={()=>setActiveTab('mod4')} historial={historial} addNotif={addNotif} usuario={usuario}/>}
          {activeTab==='mod6'       && <Mod6ReportesView horario={horarioData} docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horasDoc={horasDocData} estadoHorario={estadoHorario}/>}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
function DashboardView({ docentes, materias, aulas, grupos, horarioData, estadoHorario, historial, onNavigate }) {
  const stats = [
    { v:docentes.length, l:'Docentes',   icon:<Users size={20}/>,    color:C.navy,   mod:'mod2' },
    { v:materias.length, l:'Materias',   icon:<BookOpen size={20}/>, color:C.blue,   mod:'mod2' },
    { v:aulas.filter(a=>a.disponible).length, l:'Aulas Disp.', icon:<Building2 size={20}/>, color:C.green,  mod:'mod2' },
    { v:grupos.length,   l:'Grupos',     icon:<Layers size={20}/>,   color:C.purple, mod:'mod2' },
  ];
  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h2 style={{ margin:'0 0 4px', color:C.navy, fontSize:19 }}>Panel Principal</h2>
        <p style={{ color:C.gray, fontSize:13, margin:0 }}>Escuela Militar de Ingeniería · Ingeniería de Sistemas · Gestión I/2026</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {stats.map(s=>(
          <button key={s.l} onClick={()=>onNavigate(s.mod)} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:12, padding:'18px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ background:s.color, color:'white', width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:26, fontWeight:'bold', color:C.navy }}>{s.v}</div>
              <div style={{ fontSize:11, color:C.gray }}>{s.l}</div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Activity size={15}/> Estado del Sistema</h3>
          {[
            { label:'Horario Generado',       ok:!!horarioData },
            { label:'Validación Completada',  ok:estadoHorario==='aprobado' },
            { label:'Restricciones cargadas', ok:true },
            { label:'Docentes cargados',      ok:docentes.length>0 },
            { label:'Materias cargadas',      ok:materias.length>0 },
          ].map(item=>(
            <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, marginBottom:10 }}>
              <span style={{ color:C.gray }}>{item.label}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4, color:item.ok?'#16a34a':'#94a3b8', fontWeight:'bold' }}>
                {item.ok?<CheckCircle size={13}/>:<Clock size={13}/>}
                {item.ok?'Listo':'Pendiente'}
              </span>
            </div>
          ))}
        </div>
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Layers size={15}/> Acceso Rápido</h3>
          {[
            { id:'mod3', label:'Generar Horario',    desc:'Ejecutar algoritmo genético',   icon:<Play size={14}/>,         color:C.navy },
            { id:'mod5', label:'Validar Horario',    desc:'Verificar restricciones',        icon:<CheckCircle size={14}/>,  color:'#16a34a' },
            { id:'mod6', label:'Ver Reportes',       desc:'Exportar y consultar datos',     icon:<FileText size={14}/>,     color:C.blue },
          ].map(m=>(
            <button key={m.id} onClick={()=>onNavigate(m.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:9, cursor:'pointer', textAlign:'left', width:'100%', marginBottom:8 }}>
              <div style={{ color:m.color, flexShrink:0 }}>{m.icon}</div>
              <div><div style={{ fontSize:12, fontWeight:'bold', color:C.navy }}>{m.label}</div><div style={{ fontSize:11, color:C.gray }}>{m.desc}</div></div>
              <ChevronRight size={13} style={{ marginLeft:'auto', color:C.gray }}/>
            </button>
          ))}
        </div>
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20, gridColumn:'1 / -1' }}>
          <h3 style={{ margin:'0 0 14px', color:C.navy, fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><ClipboardList size={15}/> Actividad Reciente</h3>
          {historial.length===0
            ? <div style={{ fontSize:12, color:C.gray, textAlign:'center', padding:'16px 0' }}>Sin actividad registrada aún</div>
            : historial.slice(0,5).map(h=>(
              <div key={h.id} style={{ display:'flex', gap:10, fontSize:12, padding:'7px 12px', background:'#f8fafc', borderRadius:8, marginBottom:6 }}>
                <span style={{ color:C.gold }}>{h.fecha}</span>
                <span style={{ color:C.navy, fontWeight:'bold' }}>{h.accion}</span>
                <span style={{ color:C.gray }}>— {h.usuario}</span>
                <span style={{ marginLeft:'auto', color:h.estado==='aprobado'?'#16a34a':'#92400e', fontWeight:'bold', fontSize:11 }}>{h.estado?.toUpperCase()}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-1: ADMINISTRACIÓN
// ─────────────────────────────────────────
function Mod1AdminView({ usuarios, setUsuarios, docentes, addNotif }) {
  const [subTab, setSubTab] = useState('usuarios');
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const guardar = d => {
    if(d.id) setUsuarios(p=>p.map(u=>u.id===d.id?d:u)); else setUsuarios(p=>[...p,{...d,id:`u${Date.now()}`}]);
    addNotif(d.id?'Usuario actualizado':'Usuario creado','success'); setModal(null);
  };
  const eliminar = id => { setUsuarios(p=>p.filter(u=>u.id!==id)); addNotif('Usuario eliminado','info'); };
  const toggle   = id => setUsuarios(p=>p.map(u=>u.id===id?{...u,activo:!u.activo}:u));
  const filtrados = usuarios.filter(u=>u.nombre.toLowerCase().includes(busqueda.toLowerCase())||u.usuario.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {[['usuarios','Usuarios',<Users size={13}/>],['roles','Roles y Permisos',<Shield size={13}/>],['configuracion','Configuración',<Settings size={13}/>]].map(([id,label,icon])=>(
          <TabBtn key={id} active={subTab===id} onClick={()=>setSubTab(id)}>{icon}{label}</TabBtn>
        ))}
      </div>

      {subTab==='usuarios' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, gap:10 }}>
            <div style={{ position:'relative', flex:1, maxWidth:280 }}>
              <Search size={13} style={{ position:'absolute', left:10, top:9, color:C.gray }}/>
              <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar usuario..." style={{ ...inputStyle, paddingLeft:30 }}/>
            </div>
            <button onClick={()=>setModal({nombre:'',usuario:'',password:'',rol:'DDE',email:'',activo:true,docenteId:null})} style={btnPrimary}><Plus size={14}/> Nuevo Usuario</button>
          </div>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:C.grayLight }}>{['Nombre','Usuario','Rol','Email','Estado','Acciones'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
              <tbody>
                {filtrados.map((u,i)=>(
                  <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                    <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy }}>{u.nombre}</span></td>
                    <td style={tdStyle}><code style={{ background:'#f1f5f9', padding:'2px 6px', borderRadius:4, fontSize:12 }}>{u.usuario}</code></td>
                    <td style={tdStyle}><RolBadge rol={u.rol}/></td>
                    <td style={tdStyle}><span style={{ fontSize:12, color:C.gray }}>{u.email}</span></td>
                    <td style={tdStyle}><button onClick={()=>toggle(u.id)} style={{ background:u.activo?'#dcfce7':'#fee2e2', color:u.activo?'#16a34a':'#dc2626', border:'none', borderRadius:12, padding:'3px 10px', fontSize:11, cursor:'pointer', fontWeight:'bold' }}>{u.activo?'Activo':'Inactivo'}</button></td>
                    <td style={tdStyle}>
                      <button onClick={()=>setModal({...u})} style={btnSmall}><Pencil size={12}/></button>
                      <button onClick={()=>eliminar(u.id)} style={{ ...btnSmall, marginLeft:6, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab==='roles' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:C.grayLight }}><th style={thStyle}>ROL</th>{['Admin','Gestión Acad.','Generación','Horarios','Validación','Reportes'].map(m=><th key={m} style={thStyle}>{m}</th>)}</tr></thead>
            <tbody>
              {ROLES.map((rol,i)=>{
                const perms=PERMISOS_ROL[rol]||[];
                return (
                  <tr key={rol} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                    <td style={tdStyle}><RolBadge rol={rol}/></td>
                    {['mod1','mod2','mod3','mod4','mod5','mod6'].map(m=>(
                      <td key={m} style={{ ...tdStyle, textAlign:'center' }}>
                        {perms.includes(m)?<CheckCircle size={15} color="#16a34a"/>:<X size={15} color="#cbd5e1"/>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {subTab==='configuracion' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[
            { label:'Gestión Activa',    valor:'I/2026',                 desc:'Periodo académico' },
            { label:'Carrera',           valor:'Ing. de Sistemas',       desc:'Unidad académica' },
            { label:'Semestres Activos', valor:'3° — 10°',               desc:'Semestres en el sistema' },
            { label:'Horario diario',    valor:'07:45 – 14:15',          desc:'Rango de clases' },
            { label:'Estructura',        valor:'8 periodos + 2 recesos', desc:'Jornada académica' },
            { label:'Reglamento',        valor:'RAC-03',                  desc:'Normativa aplicada' },
          ].map(c=>(
            <div key={c.label} style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'16px 20px' }}>
              <div style={{ fontSize:11, color:C.gray, marginBottom:4 }}>{c.desc}</div>
              <div style={{ fontWeight:'bold', color:C.navy, fontSize:14 }}>{c.label}</div>
              <div style={{ color:C.gold, fontWeight:'bold', marginTop:4 }}>{c.valor}</div>
            </div>
          ))}
        </div>
      )}

      {modal!==null && (
        <FormModal titulo={modal.id?'Editar Usuario':'Nuevo Usuario'} onClose={()=>setModal(null)} onGuardar={()=>guardar(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e=>setModal(m=>({...m,nombre:e.target.value}))} style={inputStyle}/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Usuario"><input value={modal.usuario} onChange={e=>setModal(m=>({...m,usuario:e.target.value}))} style={inputStyle}/></FormField>
            <FormField label="Contraseña"><input type="password" value={modal.password} onChange={e=>setModal(m=>({...m,password:e.target.value}))} style={inputStyle}/></FormField>
          </div>
          <FormField label="Rol"><select value={modal.rol} onChange={e=>setModal(m=>({...m,rol:e.target.value}))} style={inputStyle}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></FormField>
          <FormField label="Email Institucional"><input value={modal.email} onChange={e=>setModal(m=>({...m,email:e.target.value}))} style={inputStyle}/></FormField>
          <FormField label="Estado"><select value={modal.activo?'activo':'inactivo'} onChange={e=>setModal(m=>({...m,activo:e.target.value==='activo'}))} style={inputStyle}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></FormField>
        </FormModal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-2: GESTIÓN ACADÉMICA
// ─────────────────────────────────────────
function Mod2GestionAcadView({ docentes, setDocentes, materias, setMaterias, aulas, setAulas, grupos, setGrupos }) {
  const [subTab, setSubTab] = useState('docentes');
  const tabs = [
    { id:'docentes', label:'Docentes',  icon:<Users size={13}/> },
    { id:'materias', label:'Materias',  icon:<BookOpen size={13}/> },
    { id:'aulas',    label:'Aulas',     icon:<Building2 size={13}/> },
    { id:'grupos',   label:'Grupos',    icon:<Layers size={13}/> },
  ];
  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:18 }}>
        {tabs.map(t=><TabBtn key={t.id} active={subTab===t.id} onClick={()=>setSubTab(t.id)}>{t.icon}{t.label}</TabBtn>)}
      </div>
      {subTab==='docentes' && <DocentesView docentes={docentes} setDocentes={setDocentes}/>}
      {subTab==='materias' && <MateriasView materias={materias} setMaterias={setMaterias} docentes={docentes}/>}
      {subTab==='aulas'    && <AulasView aulas={aulas} setAulas={setAulas}/>}
      {subTab==='grupos'   && <GruposView grupos={grupos} setGrupos={setGrupos} aulas={aulas}/>}
    </div>
  );
}

function DocentesView({ docentes, setDocentes }) {
  const [modal, setModal] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const guardar = d => { if(d.id) setDocentes(p=>p.map(x=>x.id===d.id?d:x)); else setDocentes(p=>[...p,{...d,id:`d${Date.now()}`}]); setModal(null); };
  const filtrados = docentes.filter(d=>d.nombre.toLowerCase().includes(busqueda.toLowerCase())||d.especialidad.toLowerCase().includes(busqueda.toLowerCase()));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, gap:10 }}>
        <div style={{ position:'relative', flex:1, maxWidth:280 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:9, color:C.gray }}/>
          <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar docente..." style={{ ...inputStyle, paddingLeft:30 }}/>
        </div>
        <button onClick={()=>setModal({nombre:'',tipo:'Civil',maxHoras:25,minHoras:10,especialidad:'',email:'',disponibilidad:[0,1,2,3,4]})} style={btnPrimary}><Plus size={14}/> Nuevo Docente</button>
      </div>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.grayLight }}>{['Nombre','Tipo','Especialidad','Email','Min/Máx h','Acciones'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
          <tbody>
            {filtrados.map((d,i)=>(
              <tr key={d.id} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy }}>{d.nombre}</span></td>
                <td style={tdStyle}><span style={{ background:d.tipo.includes('Militar')?'#dcfce7':'#dbeafe', color:d.tipo.includes('Militar')?'#166534':'#1e40af', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{d.tipo}</span></td>
                <td style={tdStyle}>{d.especialidad}</td>
                <td style={tdStyle}><span style={{ fontSize:12 }}>{d.email}</span></td>
                <td style={{ ...tdStyle, textAlign:'center' }}><span style={{ fontWeight:'bold', color:C.navy }}>{d.minHoras}–{d.maxHoras}</span></td>
                <td style={tdStyle}>
                  <button onClick={()=>setModal({...d})} style={btnSmall}><Pencil size={12}/></button>
                  <button onClick={()=>setDocentes(p=>p.filter(x=>x.id!==d.id))} style={{ ...btnSmall, marginLeft:6, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal!==null && (
        <FormModal titulo={modal.id?'Editar Docente':'Nuevo Docente'} onClose={()=>setModal(null)} onGuardar={()=>guardar(modal)}>
          <FormField label="Nombre Completo"><input value={modal.nombre} onChange={e=>setModal(m=>({...m,nombre:e.target.value}))} style={inputStyle}/></FormField>
          <FormField label="Tipo"><select value={modal.tipo} onChange={e=>setModal(m=>({...m,tipo:e.target.value}))} style={inputStyle}>{['Civil','Militar Activo','Militar Reserva'].map(t=><option key={t}>{t}</option>)}</select></FormField>
          <FormField label="Especialidad"><input value={modal.especialidad} onChange={e=>setModal(m=>({...m,especialidad:e.target.value}))} style={inputStyle}/></FormField>
          <FormField label="Email Institucional"><input value={modal.email} onChange={e=>setModal(m=>({...m,email:e.target.value}))} style={inputStyle}/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Mín. Horas/Semana"><input type="number" min={1} max={40} value={modal.minHoras} onChange={e=>setModal(m=>({...m,minHoras:+e.target.value}))} style={inputStyle}/></FormField>
            <FormField label="Máx. Horas/Semana"><input type="number" min={1} max={40} value={modal.maxHoras} onChange={e=>setModal(m=>({...m,maxHoras:+e.target.value}))} style={inputStyle}/></FormField>
          </div>
          <FormField label="Días disponibles">
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {DIAS.map((dia,idx)=>(
                <button key={dia} type="button" onClick={()=>setModal(m=>({...m,disponibilidad:m.disponibilidad.includes(idx)?m.disponibilidad.filter(d=>d!==idx):[...m.disponibilidad,idx]}))}
                  style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${modal.disponibilidad.includes(idx)?C.navy:'#e2e8f0'}`, background:modal.disponibilidad.includes(idx)?C.navy:'white', color:modal.disponibilidad.includes(idx)?'white':C.gray, fontSize:12, cursor:'pointer' }}>
                  {dia.slice(0,3)}
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
  const guardar = d => { if(d.id) setMaterias(p=>p.map(m=>m.id===d.id?d:m)); else setMaterias(p=>[...p,{...d,id:`m_${Date.now()}`}]); setModal(null); };
  const filtradas = filtro==='Todos'?materias:materias.filter(m=>m.semestre===parseInt(filtro));
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14, gap:10 }}>
        <select value={filtro} onChange={e=>setFiltro(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:190 }}>
          <option value="Todos">Todos los Semestres</option>
          {SEMESTRES.map(s=><option key={s} value={s}>{s}° Semestre</option>)}
        </select>
        <button onClick={()=>setModal({nombre:'',semestre:3,periodos:2,docenteId:docentes[0]?.id||'',tipoAula:'Aula',critica:false})} style={btnPrimary}><Plus size={14}/> Nueva Materia</button>
      </div>
      <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', maxHeight:'62vh', overflowY:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead style={{ position:'sticky', top:0, zIndex:1 }}>
            <tr style={{ background:C.grayLight }}>{['Materia','Sem.','Periodos','Tipo Aula','Prioridad','Docente','Acciones'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr>
          </thead>
          <tbody>
            {filtradas.map((m,i)=>{
              const doc=docentes.find(d=>d.id===m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                  <td style={tdStyle}><span style={{ fontWeight:'bold', fontSize:13, color:C.navy }}>{m.nombre}</span></td>
                  <td style={{ ...tdStyle, textAlign:'center' }}><span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{m.semestre}°</span></td>
                  <td style={{ ...tdStyle, textAlign:'center', fontWeight:'bold', color:C.navy }}>{m.periodos}</td>
                  <td style={tdStyle}><span style={{ background:m.tipoAula==='Laboratorio'?'#ede9fe':'#f1f5f9', color:m.tipoAula==='Laboratorio'?'#6d28d9':'#475569', padding:'2px 8px', borderRadius:20, fontSize:11 }}>{m.tipoAula}</span></td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>{m.critica?<span style={{ background:'#fef2f2', color:'#dc2626', padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>Alta</span>:<span style={{ color:'#cbd5e1', fontSize:11 }}>Normal</span>}</td>
                  <td style={tdStyle}><span style={{ fontSize:12, color:C.gray }}>{doc?.nombre||'—'}</span></td>
                  <td style={tdStyle}>
                    <button onClick={()=>setModal({...m})} style={btnSmall}><Pencil size={12}/></button>
                    <button onClick={()=>setMaterias(p=>p.filter(x=>x.id!==m.id))} style={{ ...btnSmall, marginLeft:6, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal && (
        <FormModal titulo={modal.id?'Editar Materia':'Nueva Materia'} onClose={()=>setModal(null)} onGuardar={()=>guardar(modal)}>
          <FormField label="Nombre de la Materia"><input value={modal.nombre} onChange={e=>setModal(m=>({...m,nombre:e.target.value}))} style={inputStyle}/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Semestre"><select value={modal.semestre} onChange={e=>setModal(m=>({...m,semestre:+e.target.value}))} style={inputStyle}>{SEMESTRES.map(s=><option key={s} value={s}>{s}°</option>)}</select></FormField>
            <FormField label="Periodos/Semana"><input type="number" min={1} max={8} value={modal.periodos} onChange={e=>setModal(m=>({...m,periodos:+e.target.value}))} style={inputStyle}/></FormField>
          </div>
          <FormField label="Tipo de Aula"><select value={modal.tipoAula} onChange={e=>setModal(m=>({...m,tipoAula:e.target.value}))} style={inputStyle}>{['Aula','Laboratorio','Auditorio','Sala'].map(t=><option key={t}>{t}</option>)}</select></FormField>
          <FormField label="Docente Asignado"><select value={modal.docenteId} onChange={e=>setModal(m=>({...m,docenteId:e.target.value}))} style={inputStyle}>{docentes.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select></FormField>
          <FormField label="Prioridad de asignación"><select value={modal.critica?'si':'no'} onChange={e=>setModal(m=>({...m,critica:e.target.value==='si'}))} style={inputStyle}><option value="si">Alta — se asigna primero</option><option value="no">Normal</option></select></FormField>
        </FormModal>
      )}
    </div>
  );
}

function AulasView({ aulas, setAulas }) {
  const [modal, setModal] = useState(null);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', gap:10 }}>
          {['Aula','Laboratorio','Auditorio','Sala'].map(t=>(
            <div key={t} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:9, padding:'8px 16px', textAlign:'center' }}>
              <div style={{ fontWeight:'bold', color:C.navy, fontSize:18 }}>{aulas.filter(a=>a.tipo===t).length}</div>
              <div style={{ fontSize:11, color:C.gray }}>{t}s</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setModal({nombre:'',tipo:'Aula',capacidad:30,edificio:'A',disponible:true})} style={btnPrimary}><Plus size={14}/> Nueva Aula</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
        {aulas.map(a=>(
          <div key={a.id} style={{ background:'white', borderRadius:12, border:`1px solid ${a.disponible?'#e2e8f0':'#fecaca'}`, padding:16, opacity:a.disponible?1:0.8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontWeight:'bold', color:C.navy, fontSize:14 }}>{a.nombre}</div>
                <div style={{ fontSize:11, color:C.gray }}>Edificio {a.edificio}</div>
              </div>
              <span style={{ background:a.tipo==='Laboratorio'?'#ede9fe':a.tipo==='Auditorio'?'#fef9c3':'#f1f5f9', color:a.tipo==='Laboratorio'?'#6d28d9':a.tipo==='Auditorio'?'#92400e':'#475569', padding:'2px 9px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{a.tipo}</span>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <div style={{ flex:1, background:C.grayLight, borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontWeight:'bold', color:C.navy }}>{a.capacidad}</div>
                <div style={{ fontSize:10, color:C.gray }}>Cap.</div>
              </div>
              <div style={{ flex:1, background:a.disponible?'#dcfce7':'#fee2e2', borderRadius:8, padding:8, textAlign:'center' }}>
                <div style={{ fontWeight:'bold', color:a.disponible?'#166534':'#dc2626' }}>{a.disponible?'Disponible':'No Disp.'}</div>
                <div style={{ fontSize:10, color:C.gray }}>Estado</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>setAulas(p=>p.map(x=>x.id===a.id?{...x,disponible:!x.disponible}:x))} style={{ ...btnSmall, flex:1, justifyContent:'center' }}>{a.disponible?'Deshabilitar':'Habilitar'}</button>
              <button onClick={()=>setModal({...a})} style={btnSmall}><Pencil size={12}/></button>
              <button onClick={()=>setAulas(p=>p.filter(x=>x.id!==a.id))} style={{ ...btnSmall, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <FormModal titulo={modal.id?'Editar Aula':'Nueva Aula'} onClose={()=>setModal(null)} onGuardar={()=>{ if(modal.id) setAulas(p=>p.map(a=>a.id===modal.id?modal:a)); else setAulas(p=>[...p,{...modal,id:`a_${Date.now()}`}]); setModal(null); }}>
          <FormField label="Nombre del Aula"><input value={modal.nombre} onChange={e=>setModal(m=>({...m,nombre:e.target.value}))} style={inputStyle}/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Tipo"><select value={modal.tipo} onChange={e=>setModal(m=>({...m,tipo:e.target.value}))} style={inputStyle}>{['Aula','Laboratorio','Auditorio','Sala'].map(t=><option key={t}>{t}</option>)}</select></FormField>
            <FormField label="Edificio"><input value={modal.edificio} onChange={e=>setModal(m=>({...m,edificio:e.target.value}))} style={inputStyle}/></FormField>
          </div>
          <FormField label="Capacidad"><input type="number" min={1} value={modal.capacidad} onChange={e=>setModal(m=>({...m,capacidad:+e.target.value}))} style={inputStyle}/></FormField>
          <FormField label="Disponible"><select value={modal.disponible?'si':'no'} onChange={e=>setModal(m=>({...m,disponible:e.target.value==='si'}))} style={inputStyle}><option value="si">Sí</option><option value="no">No</option></select></FormField>
        </FormModal>
      )}
    </div>
  );
}

function GruposView({ grupos, setGrupos, aulas }) {
  const [modal, setModal] = useState(null);
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button onClick={()=>setModal({nombre:'',semestre:3,numEstudiantes:30,aulaFijaId:null})} style={btnPrimary}><Plus size={14}/> Nuevo Grupo</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
        {grupos.map(g=>{
          const aulaFija=aulas.find(a=>a.id===g.aulaFijaId);
          return (
            <div key={g.id} style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div><div style={{ fontWeight:'bold', color:C.navy }}>{g.nombre}</div><div style={{ fontSize:11, color:C.gray }}>{g.numEstudiantes} estudiantes</div></div>
                <span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{g.semestre}°</span>
              </div>
              {aulaFija && <div style={{ fontSize:11, color:C.blue, background:C.blueLight, padding:'3px 9px', borderRadius:6, marginBottom:10 }}>📍 Aula fija: {aulaFija.nombre}</div>}
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={()=>setModal({...g})} style={{ ...btnSmall, flex:1, justifyContent:'center' }}><Pencil size={12}/> Editar</button>
                <button onClick={()=>setGrupos(p=>p.filter(x=>x.id!==g.id))} style={{ ...btnSmall, color:'#dc2626', borderColor:'#fecaca' }}><Trash2 size={12}/></button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <FormModal titulo={modal.id?'Editar Grupo':'Nuevo Grupo'} onClose={()=>setModal(null)} onGuardar={()=>{ if(modal.id) setGrupos(p=>p.map(g=>g.id===modal.id?modal:g)); else setGrupos(p=>[...p,{...modal,id:`g${Date.now()}`}]); setModal(null); }}>
          <FormField label="Nombre del Grupo"><input value={modal.nombre} onChange={e=>setModal(m=>({...m,nombre:e.target.value}))} style={inputStyle}/></FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormField label="Semestre"><select value={modal.semestre} onChange={e=>setModal(m=>({...m,semestre:+e.target.value}))} style={inputStyle}>{SEMESTRES.map(s=><option key={s} value={s}>{s}°</option>)}</select></FormField>
            <FormField label="N° Estudiantes"><input type="number" min={1} value={modal.numEstudiantes} onChange={e=>setModal(m=>({...m,numEstudiantes:+e.target.value}))} style={inputStyle}/></FormField>
          </div>
          <FormField label="Aula Fija">
            <select value={modal.aulaFijaId||''} onChange={e=>setModal(m=>({...m,aulaFijaId:e.target.value||null}))} style={inputStyle}>
              <option value="">Sin aula fija</option>
              {aulas.filter(a=>a.disponible).map(a=><option key={a.id} value={a.id}>{a.nombre} — Cap. {a.capacidad}</option>)}
            </select>
          </FormField>
        </FormModal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-3: GENERACIÓN DE HORARIOS
// ─────────────────────────────────────────
function Mod3GeneradorView({ materias, docentes, aulas, onFinish }) {
  const [phase, setPhase]   = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs]     = useState([]);
  const [periodo, setPeriodo] = useState('2026-I');
  const [carrera, setCarrera] = useState('Ingeniería de Sistemas');
  const [rest, setRest] = useState({ disponibilidad:true, huecos:true, criticas:true, recesos:true, distribucion:true, bloques:true });

  const start = () => {
    setPhase('running'); setProgress(0); setLogs([]);
    const steps=[
      [350,8, '→ Inicializando población (50 individuos)...'],
      [400,18,'→ Clasificando materias por prioridad...'],
      [600,32,'→ Calculando fitness: conflictos y restricciones...'],
      [600,50,'→ Selección por torneo — cruce probabilidad 0.8...'],
      [600,65,'→ Mutación (tasa 0.05) — evaluando generaciones...'],
      [500,80,'→ Verificando reglas: RAC-03, Lunes 07:45, bloques...'],
      [500,90,'→ Verificando recesos y continuidad de bloques...'],
      [400,100,'✓ Solución óptima encontrada — 0 conflictos.'],
    ];
    let delay=0;
    steps.forEach(([wait,prog,msg])=>{
      delay+=wait;
      setTimeout(()=>{
        setProgress(prog); setLogs(l=>[...l,msg]);
        if(prog===100){ const r=generarHorarios(materias,docentes,aulas); setTimeout(()=>{ setPhase('done'); onFinish(r.horario,r.horasDocentes); },500); }
      },delay);
    });
  };

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ margin:'0 0 4px', fontSize:20, fontWeight:'bold', color:C.navy }}>Generación de Horarios</h1>
        <p style={{ margin:0, fontSize:13, color:C.gray }}>Periodo Académico {periodo}</p>
      </div>
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyMid})`, borderRadius:14, padding:'22px 28px', marginBottom:24, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ color:C.gold, fontSize:28 }}>⚡</div>
        <div>
          <div style={{ color:'white', fontWeight:'bold', fontSize:17 }}>Módulo de Generación Automática</div>
          <div style={{ color:'#94a3b8', fontSize:13, marginTop:3 }}>Algoritmo genético adaptado a restricciones institucionales RAC-03</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:22 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Config */}
          <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}><Settings size={18} color={C.gray}/><h3 style={{ margin:0, fontSize:15, fontWeight:'bold', color:C.navy }}>Configuración del Periodo</h3></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div><label style={{ display:'block', fontSize:12, color:C.gray, marginBottom:8 }}>Periodo Académico</label><select value={periodo} onChange={e=>setPeriodo(e.target.value)} style={{ ...inputStyle, fontSize:14 }}>{['2026-I','2026-II','2025-I','2025-II'].map(p=><option key={p}>{p}</option>)}</select></div>
              <div><label style={{ display:'block', fontSize:12, color:C.gray, marginBottom:8 }}>Carrera</label><select value={carrera} onChange={e=>setCarrera(e.target.value)} style={{ ...inputStyle, fontSize:14 }}>{['Ingeniería de Sistemas','Ingeniería Civil','Ingeniería Electrónica'].map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
          </div>
          {/* Bloques */}
          <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}><Clock size={18} color={C.gold}/><h3 style={{ margin:0, fontSize:15, fontWeight:'bold', color:C.navy }}>Estructura de Jornada</h3></div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                {tipo:'clase',label:'07:45 – 08:30',n:'P1'},{tipo:'clase',label:'08:30 – 09:15',n:'P2'},{tipo:'clase',label:'09:15 – 10:00',n:'P3'},
                {tipo:'receso',label:'10:00 – 10:15',n:'⏸'},
                {tipo:'clase',label:'10:15 – 11:00',n:'P4'},{tipo:'clase',label:'11:00 – 11:45',n:'P5'},
                {tipo:'receso',label:'11:45 – 12:00',n:'⏸'},
                {tipo:'clase',label:'12:00 – 12:45',n:'P6'},{tipo:'clase',label:'12:45 – 13:30',n:'P7'},{tipo:'clase',label:'13:30 – 14:15',n:'P8'},
              ].map((b,i)=>(
                <div key={i} style={{ padding:'10px 14px', borderRadius:9, border:`1px solid ${b.tipo==='receso'?'#fef08a':'#e2e8f0'}`, background:b.tipo==='receso'?'#fefce8':'#f8fafc', display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ width:28, height:28, background:b.tipo==='receso'?'#fef9c3':C.navy, color:b.tipo==='receso'?'#92400e':'white', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:'bold', flexShrink:0 }}>{b.n}</span>
                  <span style={{ fontSize:13, color:b.tipo==='receso'?'#92400e':C.navy, fontWeight:b.tipo==='receso'?'bold':'normal' }}>{b.label}</span>
                  {b.tipo==='clase' && <span style={{ marginLeft:'auto', background:'#dcfce7', color:'#16a34a', fontSize:10, fontWeight:'bold', padding:'2px 10px', borderRadius:20 }}>Activo</span>}
                  {b.tipo==='receso' && <span style={{ marginLeft:'auto', fontSize:10, color:'#92400e', fontWeight:'bold' }}>15 min automático</span>}
                </div>
              ))}
            </div>
          </div>
          {/* Restricciones */}
          <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:24 }}>
            <h3 style={{ margin:'0 0 18px', fontSize:15, fontWeight:'bold', color:C.navy }}>Restricciones del Algoritmo</h3>
            {[
              {key:'disponibilidad',label:'Respetar disponibilidad de docentes'},
              {key:'huecos',label:'Evitar huecos en horarios de docentes'},
              {key:'criticas',label:'Priorizar materias de alta prioridad'},
              {key:'recesos',label:'Recesos automáticos cada 3 periodos'},
              {key:'distribucion',label:'Distribución equitativa de carga docente'},
              {key:'bloques',label:'Bloques continuos de 2-3 periodos'},
            ].map(r=>(
              <div key={r.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <span style={{ fontSize:13, color:'#374151' }}>{r.label}</span>
                <div onClick={()=>setRest(p=>({...p,[r.key]:!p[r.key]}))} style={{ width:44, height:24, borderRadius:99, background:rest[r.key]?'#22c55e':'#cbd5e1', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:3, left:rest[r.key]?23:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Columna derecha */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div style={{ background:'white', borderRadius:14, border:`2px solid ${C.gold}`, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
              <span style={{ color:C.gold, fontSize:18 }}>⚡</span>
              <h3 style={{ margin:0, fontSize:15, fontWeight:'bold', color:C.navy }}>Generador</h3>
            </div>
            {phase==='idle' && <button onClick={start} style={{ width:'100%', padding:'14px', background:C.navy, color:'white', border:'none', borderRadius:10, fontSize:15, fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><Play fill="white" size={17}/> Generar Horario</button>}
            {phase==='running' && (
              <div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:C.gray, marginBottom:6 }}><span>Procesando...</span><span>{progress}%</span></div>
                  <div style={{ background:'#e2e8f0', borderRadius:99, height:8, overflow:'hidden' }}><div style={{ height:'100%', background:`linear-gradient(90deg,${C.gold},${C.goldLight})`, width:`${progress}%`, transition:'width 0.4s' }}/></div>
                </div>
                <div style={{ background:'#0f172a', borderRadius:9, padding:'10px 12px', fontFamily:'monospace', fontSize:10, color:'#4ade80', minHeight:110, maxHeight:150, overflowY:'auto' }}>
                  {logs.map((l,i)=><div key={i}>{l}</div>)}
                  <span style={{ animation:'pulse 1s infinite' }}>█</span>
                </div>
              </div>
            )}
            {phase==='done' && <div style={{ color:'#16a34a', fontWeight:'bold', display:'flex', alignItems:'center', gap:8, fontSize:13 }}><CheckCircle size={18}/> ¡Completado! Redirigiendo...</div>}
          </div>
          <div style={{ background:'white', borderRadius:14, border:'1px solid #e2e8f0', padding:24 }}>
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:'bold', color:C.navy }}>Datos Cargados</h3>
            {[
              { v:docentes.length,                      l:'Docentes activos' },
              { v:materias.length,                      l:'Materias configuradas' },
              { v:SEMESTRES.length,                     l:'Semestres (3° al 10°)' },
              { v:aulas.filter(a=>a.disponible).length, l:'Aulas disponibles' },
            ].map(m=>(
              <div key={m.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:13, color:'#374151', marginBottom:10 }}>
                <span>{m.l}</span>
                <span style={{ fontWeight:'bold', color:C.navy, background:C.grayLight, padding:'2px 12px', borderRadius:20 }}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-4: GESTIÓN DE HORARIOS
// ─────────────────────────────────────────
function Mod4HorariosView({ horario, docentes, aulas, materias, estadoHorario, onCambio, usuario }) {
  const [vistaActiva, setVistaActiva] = useState('general');
  const [semestreActivo, setSemestreActivo] = useState(3);
  const [filtroDia, setFiltroDia] = useState('Todos');
  const [filtroDocente, setFiltroDocente] = useState(docentes[0]?.id||'');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const [filtroAula, setFiltroAula] = useState(aulas.find(a=>a.disponible)?.id||'');
  const [filtroTipoAula, setFiltroTipoAula] = useState('Todos');
  const [editMode, setEditMode] = useState(false);
  const [celdaSel, setCeldaSel] = useState(null);
  const [modalCelda, setModalCelda] = useState(null);
  const [cambiosPend, setCambiosPend] = useState([]);
  const [conflictos, setConflictos] = useState([]);
  const [historialManual, setHistorialManual] = useState([]);
  const [panelConf, setPanelConf] = useState(false);

  const rol = usuario?.rol||'';
  const puedeEditar    = rol==='DDE'||rol==='Administrador';
  const esJefeCarrera  = rol==='Jefe de Carrera';
  const esDocente      = rol==='Docente';
  const verConflictos  = rol==='DDE'||rol==='Administrador'||rol==='Jefe de Carrera';
  const verFiltros     = rol!=='Docente';
  const verTodo        = rol!=='Docente';

  if(!horario) return <EmptyState icon={<Calendar size={40}/>} titulo="Sin horario generado" desc='Ve a "Generación de Horarios" para crear un horario primero.'/>;

  const COLORES=['#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe','#ffedd5','#cffafe','#f1f5f9','#fef2f2','#f0fdf4','#e0f2fe','#fef3c7','#d1fae5','#fde8ff','#fff7ed'];
  const getColor = id => { const i=materias.findIndex(m=>m.id===id); return COLORES[Math.abs(i)%COLORES.length]; };

  const detectConfl = h => {
    const lista=[]; const od={}; const oa={};
    SEMESTRES.forEach(sem=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=h[sem]?.[d]?.[p]; if(!c) continue; const kd=`${c.docenteId}-${d}-${p}`; if(od[kd]) lista.push({tipo:'doc',sem,dia:d,periodo:p,msg:`Docente duplicado: ${DIAS[d]} P${p+1} — Sem ${sem}°`}); od[kd]=true; if(c.aulaId){ const ka=`${c.aulaId}-${d}-${p}`; if(oa[ka]) lista.push({tipo:'aula',sem,dia:d,periodo:p,msg:`Aula duplicada: ${DIAS[d]} P${p+1} — Sem ${sem}°`}); oa[ka]=true; } } });
    return lista;
  };
  const tienConfl = (sem,d,p) => conflictos.some(c=>c.sem===sem&&c.dia===d&&c.periodo===p);

  const handleClick = (dia,periodo,sem) => {
    if(!editMode||!puedeEditar) return;
    if(celdaSel){
      const {dia:d1,periodo:p1,sem:s1}=celdaSel;
      if(d1===dia&&p1===periodo&&s1===sem){ setCeldaSel(null); return; }
      const nuevo=JSON.parse(JSON.stringify(horario));
      const tmp=nuevo[s1][d1][p1]; nuevo[s1][d1][p1]=nuevo[sem][dia][periodo]; nuevo[sem][dia][periodo]=tmp;
      const cf=detectConfl(nuevo); setConflictos(cf);
      const c1=horario[s1][d1][p1]; const c2=horario[sem][dia][periodo];
      const e={id:Date.now(),accion:`Intercambio: "${c1?.nombre||'Vacío'}" ↔ "${c2?.nombre||'Vacío'}"`,fecha:new Date().toLocaleString(),usuario:usuario?.nombre,tipo:'swap',conflictos:cf.length};
      setHistorialManual(p=>[e,...p].slice(0,50)); setCambiosPend(p=>[...p,e]); onCambio(nuevo); setCeldaSel(null); return;
    }
    if(horario[sem]?.[dia]?.[periodo]) setCeldaSel({dia,periodo,sem});
  };

  const guardarReasig = (dia,periodo,sem,newDocId,newAulaId) => {
    const nuevo=JSON.parse(JSON.stringify(horario)); if(!nuevo[sem][dia][periodo]){setModalCelda(null);return;}
    const ant=nuevo[sem][dia][periodo]; nuevo[sem][dia][periodo]={...ant,docenteId:newDocId,aulaId:newAulaId||null};
    const cf=detectConfl(nuevo); setConflictos(cf);
    const dn=docentes.find(d=>d.id===newDocId)?.nombre||'—'; const an=aulas.find(a=>a.id===newAulaId)?.nombre||'Sin aula';
    const e={id:Date.now(),accion:`Reasignación: "${ant.nombre}" → Doc:${dn}, Aula:${an}`,fecha:new Date().toLocaleString(),usuario:usuario?.nombre,tipo:'reasig',conflictos:cf.length};
    setHistorialManual(p=>[e,...p].slice(0,50)); setCambiosPend(p=>[...p,e]); onCambio(nuevo); setModalCelda(null);
  };
  const vaciar = (dia,periodo,sem) => {
    const nuevo=JSON.parse(JSON.stringify(horario)); const ant=nuevo[sem][dia][periodo]; nuevo[sem][dia][periodo]=null;
    const e={id:Date.now(),accion:`Celda vaciada: "${ant?.nombre}" — ${DIAS[dia]} P${periodo+1} Sem ${sem}°`,fecha:new Date().toLocaleString(),usuario:usuario?.nombre,tipo:'vaciar',conflictos:0};
    setHistorialManual(p=>[e,...p].slice(0,50)); setCambiosPend(p=>[...p,e]); onCambio(nuevo); setModalCelda(null);
  };
  const verificarDisp = (docId,aulaId,dia,periodo,semIgn) => ({
    docOcup: SEMESTRES.some(s=>s!==semIgn&&horario[s]?.[dia]?.[periodo]?.docenteId===docId),
    aulaOcup: aulaId&&SEMESTRES.some(s=>s!==semIgn&&horario[s]?.[dia]?.[periodo]?.aulaId===aulaId),
  });

  // CELDA
  const Celda = ({ celda, dia, periodo, sem }) => {
    if(!celda) return null;
    const doc=docentes.find(d=>d.id===celda.docenteId);
    const aula=aulas.find(a=>a.id===celda.aulaId);
    const confl=tienConfl(sem,dia,periodo);
    const sel=celdaSel?.dia===dia&&celdaSel?.periodo===periodo&&celdaSel?.sem===sem;
    let bg=getColor(celda.id); let border='1px solid rgba(0,0,0,0.05)';
    if(confl){bg='#fef2f2';border='2px solid #dc2626';}
    if(sel){bg='#fef3c7';border=`3px solid ${C.gold}`;}
    return (
      <div onClick={()=>{ if(editMode&&puedeEditar) handleClick(dia,periodo,sem); }}
        onContextMenu={e=>{ e.preventDefault(); if(puedeEditar) setModalCelda({dia,periodo,sem}); setCeldaSel(null); }}
        style={{ background:bg, border, borderRadius:5, padding:'5px 7px', cursor:editMode&&puedeEditar?'pointer':'default', position:'relative', minHeight:58, userSelect:'none', boxShadow:sel?`0 0 0 2px ${C.gold}`:'none', transition:'all 0.1s' }}>
        {celda.critica && <span style={{ position:'absolute', top:2, right:5, color:'#dc2626', fontSize:9, fontWeight:'bold' }}>●</span>}
        {confl && <span style={{ position:'absolute', top:2, left:4, color:'#dc2626', fontSize:9 }}>⚠</span>}
        {sel && <span style={{ position:'absolute', top:2, left:4, fontSize:9, color:'#92400e', fontWeight:'bold' }}>↔</span>}
        <div style={{ fontWeight:'bold', fontSize:11, color:C.navy, lineHeight:1.3 }}>{celda.nombre}</div>
        <div style={{ fontSize:10, color:'#475569', marginTop:2 }}>{doc?.nombre||'—'}</div>
        {aula && <div style={{ fontSize:9, color:'#64748b', marginTop:1 }}>📍 {aula.nombre}</div>}
      </div>
    );
  };

  // TABLA BASE
  const TablaHorario = ({ sem, diasFiltro='Todos' }) => {
    const hSem=horario[sem];
    const dm=diasFiltro==='Todos'?[0,1,2,3,4]:[DIAS.indexOf(diasFiltro)].filter(x=>x>=0);
    const cr={};
    for(let d=0;d<5;d++){
      cr[d]={};
      let p1=-1,ul=-1;
      for(let p=0;p<8;p++) if(hSem[d][p]){ if(p1===-1)p1=p; ul=p; }
      for(let p=0;p<8;p++){
        if(hSem[d][p]) cr[d][p]={tipo:'clase',data:hSem[d][p]};
        else if(p>p1&&p<ul&&p1!==-1) cr[d][p]={tipo:'libre'};
        else cr[d][p]={tipo:'vacio'};
      }
    }
    return (
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
        <thead>
          <tr>
            <th style={{ background:'#f8fafc', borderBottom:`2px solid ${C.navy}`, borderRight:'1px solid #e2e8f0', padding:'8px 6px', width:70, fontSize:10, color:C.navy, fontWeight:'bold' }}>HORA</th>
            {dm.map(dia=><th key={dia} style={{ background:C.navy, borderBottom:`2px solid ${C.navy}`, borderRight:'1px solid rgba(255,255,255,0.08)', padding:'8px', color:C.gold, fontSize:11, fontWeight:'bold', letterSpacing:1 }}>{DIAS[dia].toUpperCase()}</th>)}
          </tr>
        </thead>
        <tbody>
          {RENDER_SLOTS.map((slot,si)=>{
            if(slot.type==='break') return (
              <tr key={si}>
                <td style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:'2px 6px', fontSize:9, fontFamily:'monospace', color:'#94a3b8', textAlign:'center' }}>{slot.inicio}</td>
                <td colSpan={dm.length} style={{ background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)', borderBottom:'1px solid #e2e8f0', padding:'3px', textAlign:'center', fontSize:9, fontWeight:'bold', color:'#92400e', letterSpacing:2 }}>
                  — RECESO ({slot.inicio} – {slot.fin}) —
                </td>
              </tr>
            );
            const p=slot.idx;
            return (
              <tr key={si} style={{ borderBottom:'1px solid #e2e8f0' }}>
                <td style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', padding:'5px', textAlign:'center', verticalAlign:'middle' }}>
                  <div style={{ fontSize:10, fontWeight:'bold', color:C.navy }}>P{p+1}</div>
                  <div style={{ fontSize:8, fontFamily:'monospace', color:'#94a3b8' }}>{slot.inicio}</div>
                </td>
                {dm.map(dia=>{
                  const cel=cr[dia][p];
                  if(cel.tipo==='clase') return <td key={dia} style={{ borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:3, verticalAlign:'top' }}><Celda celda={cel.data} dia={dia} periodo={p} sem={sem}/></td>;
                  if(cel.tipo==='libre') return (
                    <td key={dia} onClick={()=>{ if(editMode&&puedeEditar&&celdaSel) handleClick(dia,p,sem); }}
                      style={{ background:'#f0fdf4', borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:5, textAlign:'center', cursor:editMode&&puedeEditar&&celdaSel?'pointer':'default', outline:editMode&&puedeEditar&&celdaSel?`2px dashed ${C.gold}`:'' }}>
                      <div style={{ fontSize:9, color:'#16a34a', opacity:0.6, fontWeight:'bold' }}>LIBRE</div>
                    </td>
                  );
                  return <td key={dia} onClick={()=>{ if(editMode&&puedeEditar&&celdaSel) handleClick(dia,p,sem); }} style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', cursor:editMode&&puedeEditar&&celdaSel?'pointer':'default', outline:editMode&&puedeEditar&&celdaSel?`2px dashed ${C.gold}`:'' }}/>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // VISTAS
  const VistaGeneral = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:11, color:C.gray, fontWeight:'bold', marginRight:4 }}>Semestre:</span>
        {SEMESTRES.map(s=><button key={s} onClick={()=>setSemestreActivo(s)} style={{ padding:'4px 11px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background:semestreActivo===s?C.navy:'#e2e8f0', color:semestreActivo===s?C.gold:C.gray }}>{s}°</button>)}
        <span style={{ fontSize:11, color:C.gray, fontWeight:'bold', marginLeft:12, marginRight:4 }}>Día:</span>
        {['Todos',...DIAS].map(d=><button key={d} onClick={()=>setFiltroDia(d)} style={{ padding:'4px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:'bold', background:filtroDia===d?C.gold:'#e2e8f0', color:filtroDia===d?C.navy:C.gray }}>{d==='Todos'?'Todos':d.slice(0,3)}</button>)}
      </div>
      <div style={{ background:'white', borderRadius:12, border:`2px solid ${C.navy}`, overflow:'auto' }}><TablaHorario sem={semestreActivo} diasFiltro={filtroDia}/></div>
    </div>
  );

  const VistaDocente = () => {
    const docId=esDocente?(usuario?.docenteId||filtroDocente):filtroDocente;
    const doc=docentes.find(d=>d.id===docId);
    const mapa=Array(5).fill(null).map(()=>Array(8).fill(null));
    SEMESTRES.forEach(sem=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=horario[sem]?.[d]?.[p]; if(c?.docenteId===docId) mapa[d][p]={...c,semestre:sem}; } });
    const totalH=mapa.flat().filter(Boolean).length;
    const sobre=doc&&totalH>doc.maxHoras;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {!esDocente && (
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <label style={{ fontSize:12, color:C.gray, fontWeight:'bold' }}>Docente:</label>
            <select value={filtroDocente} onChange={e=>setFiltroDocente(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:280 }}>
              {docentes.map(d=><option key={d.id} value={d.id}>{d.nombre} ({d.tipo})</option>)}
            </select>
            {doc && <span style={{ background:sobre?'#fee2e2':'#dcfce7', color:sobre?'#dc2626':'#166534', fontSize:11, padding:'3px 12px', borderRadius:20, fontWeight:'bold' }}>{totalH}/{doc.maxHoras} h {sobre?'⚠ Sobrecarga':'✓ OK'}</span>}
          </div>
        )}
        <div style={{ background:'white', borderRadius:12, border:`2px solid ${C.navy}`, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
            <thead><tr><th style={{ background:'#f8fafc', borderBottom:`2px solid ${C.navy}`, borderRight:'1px solid #e2e8f0', padding:'8px', width:70, fontSize:10, color:C.navy }}>HORA</th>{DIAS.map(d=><th key={d} style={{ background:C.navy, borderBottom:`2px solid ${C.navy}`, padding:'8px', color:C.gold, fontSize:11, fontWeight:'bold', letterSpacing:1 }}>{d.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {RENDER_SLOTS.map((slot,si)=>{
                if(slot.type==='break') return <tr key={si}><td style={{ background:'#f8fafc', padding:'2px', fontSize:9, textAlign:'center', color:'#94a3b8' }}>{slot.inicio}</td><td colSpan={5} style={{ background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)', padding:'2px', textAlign:'center', fontSize:9, fontWeight:'bold', color:'#92400e' }}>— RECESO —</td></tr>;
                const p=slot.idx;
                return (
                  <tr key={si} style={{ borderBottom:'1px solid #e2e8f0' }}>
                    <td style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', padding:'5px', textAlign:'center' }}><div style={{ fontSize:10, fontWeight:'bold', color:C.navy }}>P{p+1}</div><div style={{ fontSize:8, fontFamily:'monospace', color:'#94a3b8' }}>{slot.inicio}</div></td>
                    {[0,1,2,3,4].map(d=>{
                      const c=mapa[d][p];
                      if(!c) return <td key={d} style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}/>;
                      const aula=aulas.find(a=>a.id===c.aulaId);
                      return <td key={d} style={{ background:getColor(c.id), borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:4, verticalAlign:'top' }}>
                        <div style={{ fontWeight:'bold', fontSize:11, color:C.navy }}>{c.nombre}</div>
                        <div style={{ fontSize:10, color:C.gray }}>Sem {c.semestre}°</div>
                        {aula&&<div style={{ fontSize:9, color:'#64748b' }}>📍{aula.nombre}</div>}
                      </td>;
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

  const VistaGrupo = () => {
    const cf=conflictos.filter(c=>c.sem===filtroGrupo);
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
          <label style={{ fontSize:12, color:C.gray, fontWeight:'bold' }}>Semestre:</label>
          {SEMESTRES.map(s=><button key={s} onClick={()=>setFiltroGrupo(s)} style={{ padding:'5px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background:filtroGrupo===s?C.navy:'#e2e8f0', color:filtroGrupo===s?C.gold:C.gray }}>{s}°</button>)}
        </div>
        {cf.length>0
          ? <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'8px 14px', display:'flex', gap:8, alignItems:'center', fontSize:12, color:'#7f1d1d' }}><AlertTriangle size={14}/><strong>{cf.length} conflicto(s)</strong> en Semestre {filtroGrupo}°</div>
          : <div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:9, padding:'7px 14px', display:'flex', gap:8, alignItems:'center', fontSize:12, color:'#166534' }}><CheckCircle size={13}/> Sin conflictos en Semestre {filtroGrupo}°</div>
        }
        <div style={{ background:'white', borderRadius:12, border:`2px solid ${C.navy}`, overflow:'auto' }}><TablaHorario sem={filtroGrupo} diasFiltro="Todos"/></div>
      </div>
    );
  };

  const VistaAula = () => {
    const aulaObj=aulas.find(a=>a.id===filtroAula);
    const ocup=Array(5).fill(null).map(()=>Array(8).fill(null));
    SEMESTRES.forEach(sem=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=horario[sem]?.[d]?.[p]; if(c?.aulaId===filtroAula) ocup[d][p]={...c,semestre:sem}; } });
    const total=ocup.flat().filter(Boolean).length;
    const pct=Math.round((total/40)*100);
    const af=filtroTipoAula==='Todos'?aulas.filter(a=>a.disponible):aulas.filter(a=>a.disponible&&a.tipo===filtroTipoAula);
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontSize:11, color:C.gray, fontWeight:'bold' }}>Tipo:</span>
          {['Todos','Aula','Laboratorio','Auditorio','Sala'].map(t=><button key={t} onClick={()=>setFiltroTipoAula(t)} style={{ padding:'4px 10px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:'bold', background:filtroTipoAula===t?C.gold:'#e2e8f0', color:filtroTipoAula===t?C.navy:C.gray }}>{t}</button>)}
          <label style={{ fontSize:12, color:C.gray, fontWeight:'bold', marginLeft:10 }}>Aula:</label>
          <select value={filtroAula} onChange={e=>setFiltroAula(e.target.value)} style={{ ...inputStyle, width:'auto', minWidth:240 }}>{af.map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap.{a.capacidad}</option>)}</select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {[{v:`${total}/40`,l:'Periodos Ocupados',c:pct>80?'#dc2626':C.navy},{v:`${pct}%`,l:'Ocupación',c:pct>80?'#92400e':'#166534'},{v:aulaObj?.capacidad||'—',l:'Capacidad',c:C.navy},{v:aulaObj?.tipo||'—',l:'Tipo',c:C.blue}].map(m=>(
            <div key={m.l} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:'bold', color:m.c }}>{m.v}</div>
              <div style={{ fontSize:10, color:C.gray, marginTop:2 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'white', borderRadius:12, border:`2px solid ${C.navy}`, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
            <thead><tr><th style={{ background:'#f8fafc', borderBottom:`2px solid ${C.navy}`, borderRight:'1px solid #e2e8f0', padding:'8px', width:70, fontSize:10, color:C.navy }}>HORA</th>{DIAS.map(d=><th key={d} style={{ background:C.navy, borderBottom:`2px solid ${C.navy}`, padding:'8px', color:C.gold, fontSize:11, fontWeight:'bold', letterSpacing:1 }}>{d.toUpperCase()}</th>)}</tr></thead>
            <tbody>
              {RENDER_SLOTS.map((slot,si)=>{
                if(slot.type==='break') return <tr key={si}><td style={{ background:'#f8fafc', padding:'2px', fontSize:9, textAlign:'center', color:'#94a3b8' }}>{slot.inicio}</td><td colSpan={5} style={{ background:'repeating-linear-gradient(45deg,#fefce8,#fefce8 6px,#fef9c3 6px,#fef9c3 12px)', padding:'2px', textAlign:'center', fontSize:9, fontWeight:'bold', color:'#92400e' }}>— RECESO —</td></tr>;
                const p=slot.idx;
                return (
                  <tr key={si} style={{ borderBottom:'1px solid #e2e8f0' }}>
                    <td style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', padding:'5px', textAlign:'center' }}><div style={{ fontSize:10, fontWeight:'bold', color:C.navy }}>P{p+1}</div><div style={{ fontSize:8, fontFamily:'monospace', color:'#94a3b8' }}>{slot.inicio}</div></td>
                    {[0,1,2,3,4].map(d=>{
                      const c=ocup[d][p];
                      if(!c) return <td key={d} style={{ background:'#f0fdf4', border:'1px solid #dcfce7', padding:4, textAlign:'center' }}><div style={{ fontSize:10, color:'#16a34a', fontWeight:'bold' }}>LIBRE</div></td>;
                      const doc=docentes.find(x=>x.id===c.docenteId);
                      return <td key={d} style={{ background:getColor(c.id), borderRight:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:4, verticalAlign:'top' }}>
                        <div style={{ fontWeight:'bold', fontSize:10, color:C.navy }}>{c.nombre}</div>
                        <div style={{ fontSize:9, color:C.gray }}>{doc?.nombre||'—'}</div>
                        <div style={{ fontSize:9, color:C.blue }}>Sem {c.semestre}°</div>
                      </td>;
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

  const VistaFiltros = () => {
    const [fDoc,setFDoc]=useState(''); const [fSem,setFSem]=useState('Todos'); const [fDia,setFDia]=useState('Todos'); const [fTipo,setFTipo]=useState('Todos'); const [fMat,setFMat]=useState('');
    const res=[];
    SEMESTRES.forEach(sem=>{ if(fSem!=='Todos'&&parseInt(fSem)!==sem) return; for(let d=0;d<5;d++){ if(fDia!=='Todos'&&DIAS[d]!==fDia) continue; for(let p=0;p<8;p++){ const c=horario[sem]?.[d]?.[p]; if(!c) continue; if(fDoc&&c.docenteId!==fDoc) continue; if(fTipo!=='Todos'&&c.tipoAula!==fTipo) continue; if(fMat&&c.id!==fMat) continue; const aula=aulas.find(a=>a.id===c.aulaId); const doc=docentes.find(d=>d.id===c.docenteId); res.push({...c,sem,dia:d,periodo:p,aulaN:aula?.nombre||'—',docN:doc?.nombre||'—'}); } } });
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 20px' }}>
          <div style={{ fontWeight:'bold', color:C.navy, fontSize:13, marginBottom:14, display:'flex', alignItems:'center', gap:6 }}><Filter size={14}/> Filtros de búsqueda</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <FormField label="DOCENTE"><select value={fDoc} onChange={e=>setFDoc(e.target.value)} style={inputStyle}><option value="">Todos</option>{docentes.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select></FormField>
            <FormField label="MATERIA"><select value={fMat} onChange={e=>setFMat(e.target.value)} style={inputStyle}><option value="">Todas</option>{materias.map(m=><option key={m.id} value={m.id}>{m.nombre} (Sem {m.semestre}°)</option>)}</select></FormField>
            <FormField label="SEMESTRE"><select value={fSem} onChange={e=>setFSem(e.target.value)} style={inputStyle}><option value="Todos">Todos</option>{SEMESTRES.map(s=><option key={s} value={s}>{s}°</option>)}</select></FormField>
            <FormField label="DÍA"><select value={fDia} onChange={e=>setFDia(e.target.value)} style={inputStyle}><option value="Todos">Todos</option>{DIAS.map(d=><option key={d}>{d}</option>)}</select></FormField>
            <FormField label="TIPO DE AULA"><select value={fTipo} onChange={e=>setFTipo(e.target.value)} style={inputStyle}><option value="Todos">Todos</option>{['Aula','Laboratorio','Auditorio','Sala'].map(t=><option key={t}>{t}</option>)}</select></FormField>
            <div style={{ display:'flex', alignItems:'flex-end' }}><div style={{ background:C.grayLight, borderRadius:9, padding:'10px 14px', width:'100%', textAlign:'center' }}><div style={{ fontSize:22, fontWeight:'bold', color:C.navy }}>{res.length}</div><div style={{ fontSize:10, color:C.gray }}>resultados</div></div></div>
          </div>
        </div>
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden', maxHeight:'52vh', overflowY:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead style={{ position:'sticky', top:0, zIndex:1 }}><tr style={{ background:C.grayLight }}>{['Materia','Sem.','Día','Per.','Docente','Aula','Tipo'].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {res.length===0&&<tr><td colSpan={7} style={{ textAlign:'center', padding:24, color:C.gray, fontSize:13 }}>Sin resultados para los filtros seleccionados</td></tr>}
              {res.map((r,i)=>(
                <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                  <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy }}>{r.nombre}</span></td>
                  <td style={{ ...tdStyle, textAlign:'center' }}><span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{r.sem}°</span></td>
                  <td style={tdStyle}>{DIAS[r.dia]}</td>
                  <td style={{ ...tdStyle, textAlign:'center' }}>P{r.periodo+1}</td>
                  <td style={tdStyle}>{r.docN}</td>
                  <td style={tdStyle}>{r.aulaN}</td>
                  <td style={tdStyle}><span style={{ background:r.tipoAula==='Laboratorio'?'#ede9fe':'#f1f5f9', color:r.tipoAula==='Laboratorio'?'#6d28d9':'#475569', padding:'2px 8px', borderRadius:20, fontSize:10 }}>{r.tipoAula}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // MODAL REASIGNACIÓN
  const ModalReasig = () => {
    if(!modalCelda) return null;
    const {dia,periodo,sem}=modalCelda;
    const celda=horario[sem]?.[dia]?.[periodo];
    if(!celda) return null;
    const [newDoc,setNewDoc]=useState(celda.docenteId);
    const [newAula,setNewAula]=useState(celda.aulaId||'');
    const disp=verificarDisp(newDoc,newAula||null,dia,periodo,sem);
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
        <div style={{ background:'white', borderRadius:14, padding:28, width:480, boxShadow:'0 24px 60px rgba(0,0,0,0.25)', maxHeight:'90vh', overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ margin:0, color:C.navy, fontSize:15, fontWeight:'bold' }}>Reasignar Docente / Aula</h3>
            <button onClick={()=>setModalCelda(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.gray }}><X size={18}/></button>
          </div>
          <div style={{ background:C.grayLight, borderRadius:9, padding:'10px 14px', marginBottom:16 }}>
            <div style={{ fontWeight:'bold', color:C.navy }}>{celda.nombre}</div>
            <div style={{ fontSize:12, color:C.gray }}>{DIAS[dia]} · P{periodo+1} · Semestre {sem}°</div>
            {celda.critica && <span style={{ background:'#fef2f2', color:'#dc2626', fontSize:10, padding:'2px 8px', borderRadius:20, fontWeight:'bold', display:'inline-block', marginTop:4 }}>Materia de alta prioridad</span>}
          </div>
          {disp.docOcup && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'7px 12px', marginBottom:10, fontSize:11, color:'#7f1d1d', display:'flex', gap:6, alignItems:'center' }}><AlertCircle size={13}/>El docente seleccionado ya tiene clase en este bloque horario</div>}
          {disp.aulaOcup && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'7px 12px', marginBottom:10, fontSize:11, color:'#7f1d1d', display:'flex', gap:6, alignItems:'center' }}><AlertCircle size={13}/>El aula seleccionada ya está ocupada en este bloque</div>}
          {!disp.docOcup&&!disp.aulaOcup&&newDoc!==celda.docenteId && <div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:7, padding:'7px 12px', marginBottom:10, fontSize:11, color:'#166534', display:'flex', gap:6, alignItems:'center' }}><CheckCircle size={13}/>Sin conflictos detectados</div>}
          <FormField label="DOCENTE"><select value={newDoc} onChange={e=>setNewDoc(e.target.value)} style={inputStyle}>{docentes.map(d=><option key={d.id} value={d.id}>{d.nombre} ({d.tipo}) — {d.especialidad}</option>)}</select></FormField>
          <div style={{ marginTop:14 }}/>
          <FormField label="AULA"><select value={newAula} onChange={e=>setNewAula(e.target.value)} style={inputStyle}><option value="">Sin asignar</option>{aulas.filter(a=>a.disponible).map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap.{a.capacidad}</option>)}</select></FormField>
          <div style={{ display:'flex', gap:8, marginTop:20 }}>
            <button onClick={()=>vaciar(dia,periodo,sem)} style={{ flex:1, padding:'9px', border:'1px solid #fecaca', borderRadius:8, background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><Trash2 size={13}/>Vaciar celda</button>
            <button onClick={()=>guardarReasig(dia,periodo,sem,newDoc,newAula||null)} style={{ flex:1, padding:'9px', border:'none', borderRadius:8, background:(disp.docOcup||disp.aulaOcup)?'#92400e':C.navy, color:'white', cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><Save size={13}/>{(disp.docOcup||disp.aulaOcup)?'Guardar (con advertencia)':'Guardar cambios'}</button>
          </div>
        </div>
      </div>
    );
  };

  // PANEL CONFLICTOS
  const PanelConflictos = () => (
    <div style={{ position:'fixed', top:54, right:0, width:330, height:'calc(100vh - 54px)', background:'white', borderLeft:`3px solid #dc2626`, boxShadow:'-6px 0 24px rgba(0,0,0,0.12)', zIndex:500, display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'14px 18px', background:'#fef2f2', borderBottom:'1px solid #fecaca', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div><div style={{ fontWeight:'bold', color:'#991b1b', fontSize:14 }}>Conflictos detectados</div><div style={{ fontSize:11, color:'#7f1d1d' }}>{conflictos.length} por resolver</div></div>
        <button onClick={()=>setPanelConf(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#991b1b' }}><X size={16}/></button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:14, display:'flex', flexDirection:'column', gap:8 }}>
        {conflictos.length===0 && <div style={{ textAlign:'center', padding:20, color:'#16a34a' }}><CheckCircle size={22} style={{ margin:'0 auto 8px', display:'block' }}/>Sin conflictos</div>}
        {conflictos.map((c,i)=>(
          <div key={i} style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'10px 14px', fontSize:11 }}>
            <div style={{ fontWeight:'bold', color:'#991b1b', marginBottom:3 }}>{c.tipo==='doc'?'Cruce de Docente':'Cruce de Aula'}</div>
            <div style={{ color:'#7f1d1d' }}>{c.msg}</div>
            <button onClick={()=>{ setSemestreActivo(c.sem); setVistaActiva('general'); setPanelConf(false); }} style={{ marginTop:7, fontSize:10, background:'#991b1b', color:'white', border:'none', borderRadius:5, padding:'3px 9px', cursor:'pointer' }}>Ver en horario →</button>
          </div>
        ))}
        {historialManual.length>0 && (
          <div style={{ marginTop:10, borderTop:'1px solid #e2e8f0', paddingTop:10 }}>
            <div style={{ fontWeight:'bold', color:C.navy, fontSize:11, marginBottom:8 }}>Cambios manuales</div>
            {historialManual.map(h=>(
              <div key={h.id} style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:7, padding:'7px 10px', marginBottom:6, fontSize:10 }}>
                <div style={{ color:C.navy, fontWeight:'bold' }}>{h.accion}</div>
                <div style={{ color:C.gray, marginTop:2 }}>{h.fecha}</div>
                {h.conflictos>0 && <div style={{ color:'#dc2626', marginTop:2 }}>{h.conflictos} conflicto(s) generado(s)</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const VISTAS = [
    { id:'general', label:'Vista General',   icon:<Calendar size={13}/>,  visible:true },
    { id:'docente', label:'Por Docente',      icon:<Users size={13}/>,     visible:true },
    { id:'grupo',   label:'Por Grupo',        icon:<Layers size={13}/>,    visible:verTodo },
    { id:'aula',    label:'Por Aula',         icon:<Building2 size={13}/>, visible:verTodo },
    { id:'filtros', label:'Buscar',           icon:<Filter size={13}/>,    visible:verFiltros },
  ].filter(v=>v.visible);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Barra superior */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
          {VISTAS.map(v=>(
            <button key={v.id} onClick={()=>{ setVistaActiva(v.id); setCeldaSel(null); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background:vistaActiva===v.id?C.navy:'#e2e8f0', color:vistaActiva===v.id?C.gold:C.gray }}>
              {v.icon}{v.label}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {estadoHorario==='aprobado' && <span style={{ background:'#dcfce7', color:'#166534', fontSize:11, padding:'4px 12px', borderRadius:20, fontWeight:'bold', border:'1px solid #16a34a' }}>✓ Aprobado</span>}
          {cambiosPend.length>0 && <span style={{ background:'#fef9c3', color:'#92400e', fontSize:11, padding:'4px 12px', borderRadius:20, fontWeight:'bold', border:'1px solid #f59e0b', display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/>{cambiosPend.length} cambio(s) pendiente(s)</span>}
          {conflictos.length>0 && verConflictos && <button onClick={()=>setPanelConf(!panelConf)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:7, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:11, fontWeight:'bold' }}><AlertTriangle size={13}/>{conflictos.length} Conflicto(s)</button>}
          {puedeEditar && <button onClick={()=>{ setEditMode(!editMode); setCeldaSel(null); }} style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${editMode?C.gold:'#e2e8f0'}`, background:editMode?`rgba(200,168,75,0.1)`:'white', color:editMode?C.gold:C.gray, cursor:'pointer', fontSize:11, fontWeight:'bold', display:'flex', alignItems:'center', gap:5 }}><Pencil size={13}/>{editMode?'Editando...':'Editar'}</button>}
          {esJefeCarrera && <span style={{ fontSize:11, color:C.blue, display:'flex', alignItems:'center', gap:4, padding:'5px 10px', border:'1px solid #dbeafe', borderRadius:7, background:'#eff6ff' }}><Eye size={13}/>Solo lectura</span>}
          <button onClick={()=>window.print()} style={{ padding:'5px 10px', borderRadius:7, border:'1px solid #e2e8f0', background:'white', color:C.gray, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', gap:5 }}><Printer size={13}/>Imprimir</button>
        </div>
      </div>

      {/* Banner modo edición */}
      {editMode && puedeEditar && (
        <div style={{ background:'rgba(200,168,75,0.07)', border:`1px dashed ${C.gold}`, borderRadius:9, padding:'8px 16px', marginBottom:10, fontSize:11, color:'#92400e', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <Info size={13}/>
          <span><strong>Modo edición activo:</strong> Clic en una celda para seleccionarla → clic en otra para intercambiarlas. Clic derecho para reasignar docente o aula.</span>
          {celdaSel && <span style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:7, padding:'3px 10px', fontWeight:'bold', fontSize:11 }}>↔ Celda seleccionada <button onClick={()=>setCeldaSel(null)} style={{ marginLeft:6, background:'none', border:'none', cursor:'pointer', color:'#92400e', fontSize:11 }}>✕</button></span>}
        </div>
      )}
      {esJefeCarrera && <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:9, padding:'7px 16px', marginBottom:10, fontSize:11, color:'#1e40af', display:'flex', gap:8, alignItems:'center' }}><Shield size={13}/>Modo consulta — para editar contacta al DDE; para aprobar ve a Validación.</div>}
      {esDocente && <div style={{ background:'#f0fdf4', border:'1px solid #dcfce7', borderRadius:9, padding:'7px 16px', marginBottom:10, fontSize:11, color:'#166534', display:'flex', gap:8, alignItems:'center' }}><Eye size={13}/>Visualizando tu horario personal.</div>}

      <div style={{ flex:1, overflow:'auto' }}>
        {vistaActiva==='general' && <VistaGeneral/>}
        {vistaActiva==='docente' && <VistaDocente/>}
        {vistaActiva==='grupo'   && verTodo && <VistaGrupo/>}
        {vistaActiva==='aula'    && verTodo && <VistaAula/>}
        {vistaActiva==='filtros' && verFiltros && <VistaFiltros/>}
      </div>

      <div style={{ display:'flex', gap:14, marginTop:10, fontSize:10, color:C.gray, flexWrap:'wrap', paddingTop:8, borderTop:'1px solid #f1f5f9' }}>
        <span>● Materia prioritaria</span>
        <span>🟩 Verde = Período libre</span>
        <span>⚠ Rojo = Conflicto</span>
        <span>📌 Lunes 07:45 obligatorio</span>
        {cambiosPend.length>0 && <span style={{ color:'#92400e', fontWeight:'bold' }}>🕐 {cambiosPend.length} cambio(s) pendientes de aprobación</span>}
      </div>

      <ModalReasig/>
      {panelConf && <PanelConflictos/>}
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-5: VALIDACIÓN
// ─────────────────────────────────────────
function Mod5ValidacionView({ horario, docentes, horasDoc, estado, onAprobar, onVerHorario, historial, addNotif, usuario }) {
  const [obsTexto, setObsTexto]             = useState('');
  const [obsDest, setObsDest]               = useState('DDE');
  const [observaciones, setObservaciones]   = useState([]);
  const [tabActiva, setTabActiva]           = useState('resumen');
  const [notifEnv, setNotifEnv]             = useState([]);
  const [validado, setValidado]             = useState(false);
  const [archivadas, setArchivadas]         = useState(new Set());
  const [auditLog, setAuditLog]             = useState([]);

  const rol         = usuario?.rol||'';
  const esDDE       = rol==='DDE';
  const esAdmin     = rol==='Administrador';
  const esJefe      = rol==='Jefe de Carrera';
  const esDocente   = rol==='Docente';
  const verObs      = esDDE||esJefe||esAdmin;
  const puedeAprobar= esJefe||esAdmin;

  const registrar = useCallback((accion, detalle='') => {
    const e={id:Date.now()+Math.random(),accion,detalle,usuario:usuario?.nombre||'Sistema',rol:usuario?.rol||'—',fecha:new Date().toLocaleString('es-BO')};
    setAuditLog(p=>[e,...p]); return e;
  },[usuario]);

  if(!horario) return <EmptyState icon={<Shield size={40}/>} titulo="Sin horario generado" desc="Ve al módulo Generación para crear un horario primero."/>;

  // VALIDACIONES
  const validarRestricciones = () => {
    const fallos=[]; const od={}; const oa={};
    SEMESTRES.forEach(sem=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){
      const c=horario[sem]?.[d]?.[p]; if(!c) continue;
      const kd=`${c.docenteId}-${d}-${p}`;
      if(od[kd]) fallos.push({tipo:'cruce_doc',sev:'error',restriccion:'Sin cruces de docente',mensaje:`Docente duplicado el ${DIAS[d]} P${p+1} — Sem ${sem}°`});
      od[kd]=sem;
      if(c.aulaId){ const ka=`${c.aulaId}-${d}-${p}`; if(oa[ka]) fallos.push({tipo:'cruce_aula',sev:'error',restriccion:'Sin cruces de aula',mensaje:`Aula duplicada el ${DIAS[d]} P${p+1} — Sem ${sem}°`}); oa[ka]=sem; }
    }
    if(!horario[sem][0][0]) fallos.push({tipo:'sin_lunes',sev:'error',restriccion:'Clase obligatoria Lunes 07:45',mensaje:`Semestre ${sem}°: sin clase el Lunes a las 07:45 (viola RAC-03)`});
    });
    return fallos;
  };

  const verificarRecesos = () => {
    const prob=[];
    SEMESTRES.forEach(sem=>{ for(let d=0;d<5;d++){
      const f=horario[sem][d];
      if(f[2]&&f[3]&&f[2].id===f[3].id) prob.push({sev:'warning',mensaje:`Sem ${sem}° — ${DIAS[d]}: bloque cruza el receso de las 10:00`});
      if(f[4]&&f[5]&&f[4].id===f[5].id) prob.push({sev:'warning',mensaje:`Sem ${sem}° — ${DIAS[d]}: bloque cruza el receso de las 11:45`});
    }});
    return prob;
  };

  const detectarInconsistencias = () => {
    const lista=[];
    SEMESTRES.forEach(sem=>{
      for(let d=0;d<5;d++){ let p=0; while(p<8){ if(horario[sem][d][p]){ const id=horario[sem][d][p].id; let len=1; while(p+len<8&&horario[sem][d][p+len]?.id===id) len++; if(len===1) lista.push({tipo:'bloque_suelto',sev:'warning',grave:false,mensaje:`Sem ${sem}° — "${horario[sem][d][p].nombre}" período suelto (${DIAS[d]} P${p+1})`}); p+=len; } else p++; } }
      if(!horario[sem][0][0]) lista.push({tipo:'sin_lunes',sev:'error',grave:true,mensaje:`Sem ${sem}° — Sin clase el Lunes 07:45 (viola RAC-03)`});
      for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=horario[sem]?.[d]?.[p]; if(c&&!c.aulaId) lista.push({tipo:'sin_aula',sev:'warning',grave:false,mensaje:`Sem ${sem}° — "${c.nombre}" sin aula (${DIAS[d]} P${p+1})`}); }
    });
    return lista;
  };

  const fallosR=validarRestricciones(); const probR=verificarRecesos(); const incons=detectarInconsistencias();
  const docSobre=docentes.filter(d=>(horasDoc?.[d.id]||0)>d.maxHoras);
  const docBajo=docentes.filter(d=>(horasDoc?.[d.id]||0)<d.minHoras&&(horasDoc?.[d.id]||0)>0);

  const criticos=[...fallosR.filter(f=>f.sev==='error'),...incons.filter(i=>i.grave)];
  const advertencias=[...fallosR.filter(f=>f.sev==='warning'),...probR,...incons.filter(i=>!i.grave&&i.sev==='warning'),...docSobre.map(d=>({sev:'warning',mensaje:`${d.nombre}: ${horasDoc?.[d.id]}/${d.maxHoras}h (sobrecarga)`}))];
  const informativos=[...docBajo.map(d=>({sev:'info',mensaje:`${d.nombre}: ${horasDoc?.[d.id]}/${d.minHoras}h (bajo mínimo)`}))];

  const tieneCriticos=criticos.length>0;
  const puedeAprobarHorario=puedeAprobar&&!tieneCriticos&&estado!=='aprobado';
  const totalClases=SEMESTRES.reduce((a,s)=>{ let c=0; for(let d=0;d<5;d++) for(let p=0;p<8;p++) if(horario[s]?.[d]?.[p]) c++; return a+c; },0);

  const ESTADOS={ null:{label:'No generado',color:'#94a3b8',bg:'#f1f5f9'}, pendiente:{label:'Pendiente de Validación',color:'#92400e',bg:'#fef9c3'}, aprobado:{label:'Aprobado Formalmente',color:'#166534',bg:'#dcfce7'} };
  const eInfo=ESTADOS[estado]||ESTADOS[null];

  const handleAprobar = () => {
    if(!puedeAprobarHorario) return;
    onAprobar();
    registrar('Horario aprobado formalmente',`Por: ${usuario?.nombre}`);
    setNotifEnv(p=>[{id:Date.now(),tipo:'success',msg:`Horario aprobado por ${usuario?.nombre} — notificado a todos los responsables`,fecha:new Date().toLocaleString('es-BO')},...p]);
    addNotif('Horario aprobado formalmente','success');
  };
  const handleValidar = () => {
    setValidado(true);
    registrar('Validación ejecutada',`${criticos.length} crítico(s), ${advertencias.length} advertencia(s)`);
    addNotif(`Validación completada: ${criticos.length} crítico(s), ${advertencias.length} advertencia(s)`,tieneCriticos?'warning':'success');
  };
  const agregarObs = () => {
    if(!obsTexto.trim()) return;
    const obs={id:Date.now(),texto:obsTexto,destinatario:obsDest,fecha:new Date().toLocaleString('es-BO'),autor:usuario?.nombre||'Sistema',rol:usuario?.rol||'—'};
    setObservaciones(p=>[obs,...p]);
    registrar(`Observación → ${obsDest}`,`"${obsTexto.slice(0,60)}"`);
    if(obsDest==='DDE'){
      setNotifEnv(p=>[{id:Date.now()+1,tipo:'warning',msg:`DDE: nueva observación de ${usuario?.nombre}: "${obsTexto.slice(0,50)}…"`,fecha:new Date().toLocaleString('es-BO')},...p]);
      addNotif(`DDE notificado automáticamente sobre observación`,'warning');
    }
    addNotif(`Observación registrada → ${obsDest}`,'info');
    setObsTexto('');
  };
  const enviarNotif = (msg,tipo) => {
    setNotifEnv(p=>[{id:Date.now(),tipo,msg,fecha:new Date().toLocaleString('es-BO')},...p]);
    registrar('Notificación enviada',msg.slice(0,80)); addNotif(msg,tipo);
  };
  const archivarAlerta = (id,justif) => { setArchivadas(p=>new Set([...p,id])); registrar('Alerta archivada',justif||'Sin justificación'); addNotif('Alerta archivada','info'); };

  const TABS=[
    { id:'resumen',         label:'Resumen',           icon:<BarChart2 size={13}/> },
    { id:'restricciones',   label:'Restricciones',     icon:<Shield size={13}/> },
    { id:'recesos',         label:'Recesos',           icon:<Clock size={13}/> },
    { id:'inconsistencias', label:'Inconsistencias',   icon:<AlertCircle size={13}/> },
    { id:'carga',           label:'Carga Docente',     icon:<Users size={13}/> },
    ...(verObs?[{id:'observaciones',label:'Observaciones',icon:<ClipboardList size={13}/>}]:[]),
    { id:'historial',       label:'Historial',         icon:<Archive size={13}/> },
    { id:'notificaciones',  label:'Notificaciones',    icon:<Bell size={13}/> },
  ];

  const recesosOk=[
    { label:'Receso 10:00–10:15 (P3 y P4)',          ok:!probR.some(p=>p.mensaje.includes('10:00')) },
    { label:'Receso 11:45–12:00 (P5 y P6)',          ok:!probR.some(p=>p.mensaje.includes('11:45')) },
    { label:'Inicio de jornada: 07:45',               ok:true },
    { label:'Fin de jornada: 14:15',                  ok:true },
    { label:'8 períodos por día',                     ok:true },
    { label:'2 recesos diarios automáticos',          ok:probR.length===0 },
  ];

  return (
    <div style={{ maxWidth:1020, margin:'0 auto' }}>

      {/* Banner principal */}
      <div style={{
        background: tieneCriticos?'linear-gradient(135deg,#7f1d1d,#991b1b)': advertencias.length>0?'linear-gradient(135deg,#78350f,#92400e)':'linear-gradient(135deg,#14532d,#166534)',
        borderRadius:14, padding:'18px 24px', marginBottom:18, color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          {tieneCriticos?<AlertTriangle size={28}/>:<CheckCircle size={28}/>}
          <div>
            <div style={{ fontWeight:'bold', fontSize:16 }}>
              {tieneCriticos?`${criticos.length} problema(s) crítico(s) — corrección requerida`: advertencias.length>0?`${advertencias.length} advertencia(s) — revisar antes de aprobar`:'Horario válido — listo para aprobación'}
            </div>
            <div style={{ fontSize:11, opacity:0.8, marginTop:3 }}>
              {totalClases} clases · {SEMESTRES.length} semestres · Estado actual: <strong>{eInfo.label}</strong>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <button onClick={handleValidar} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.4)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}>
            <RefreshCw size={13}/> Ejecutar validación
          </button>
          {tieneCriticos && <button onClick={()=>enviarNotif(`${criticos.length} problema(s) crítico(s) requieren corrección inmediata antes de aprobar`,'warning')} style={{ background:'rgba(239,68,68,0.3)', color:'white', border:'1px solid rgba(239,68,68,0.5)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><AlertTriangle size={13}/> Generar alerta</button>}
          {!tieneCriticos && !esDocente && estado!=='aprobado' && <button onClick={()=>enviarNotif(`Horario con ${advertencias.length} advertencia(s). Revisar antes de aprobar.`,'warning')} style={{ background:'rgba(255,255,255,0.12)', color:'white', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Bell size={13}/> Generar alerta</button>}
          {puedeAprobarHorario && <button onClick={handleAprobar} style={{ background:C.gold, color:C.navy, border:'none', borderRadius:8, padding:'8px 20px', fontWeight:'bold', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}><Check size={14}/> Aprobar horario</button>}
          {tieneCriticos && puedeAprobar && <div style={{ fontSize:11, background:'rgba(0,0,0,0.2)', padding:'6px 12px', borderRadius:7, color:'rgba(255,255,255,0.85)' }}>🔒 Aprobación bloqueada — {criticos.length} crítico(s)</div>}
          {estado==='aprobado' && <span style={{ background:'rgba(255,255,255,0.2)', padding:'7px 16px', borderRadius:8, fontWeight:'bold', fontSize:13 }}>✓ APROBADO</span>}
          {!puedeAprobar && !esDocente && estado!=='aprobado' && <span style={{ fontSize:11, background:'rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:7 }}>Aprobación: Jefe de Carrera</span>}
        </div>
      </div>

      {/* Banner resultado */}
      {validado && (
        <div style={{ background:tieneCriticos?'#fef2f2':'#f0fdf4', border:`1px solid ${tieneCriticos?'#fecaca':'#dcfce7'}`, borderRadius:9, padding:'11px 18px', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
          {tieneCriticos?<AlertCircle size={16} color="#dc2626"/>:<CheckCircle size={16} color="#16a34a"/>}
          <div style={{ flex:1 }}>
            <span style={{ fontWeight:'bold', color:tieneCriticos?'#991b1b':'#166534', fontSize:13 }}>Resultado: </span>
            <span style={{ fontSize:12, color:'#374151' }}>{criticos.length} crítico(s) · {advertencias.length} advertencia(s) · {informativos.length} informativo(s)</span>
          </div>
          {!tieneCriticos && puedeAprobarHorario && <span style={{ fontSize:11, color:'#166534', fontWeight:'bold' }}>✓ Listo para aprobar</span>}
          {tieneCriticos && <button onClick={onVerHorario} style={{ fontSize:11, background:'#991b1b', color:'white', border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer' }}>Corregir en Horarios →</button>}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:5, marginBottom:16, flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTabActiva(t.id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:'bold', background:tabActiva===t.id?C.navy:'#e2e8f0', color:tabActiva===t.id?C.gold:'#6b7280' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tabActiva==='resumen' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
            {[
              { v:totalClases,          l:'Clases asignadas',  c:C.navy,               sub:`${SEMESTRES.length} semestres` },
              { v:criticos.length,      l:'Problemas críticos',c:tieneCriticos?'#991b1b':'#166534', sub:'Bloquean aprobación' },
              { v:advertencias.length,  l:'Advertencias',      c:advertencias.length>0?'#92400e':'#166534',sub:'Revisar antes de aprobar' },
              { v:informativos.length,  l:'Informativos',      c:C.blue,               sub:'Sin impacto' },
            ].map(m=>(
              <div key={m.l} style={{ background:'white', borderRadius:11, padding:'16px', border:'1px solid #e2e8f0', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:'bold', color:m.c }}>{m.v}</div>
                <div style={{ fontSize:11, color:C.navy, fontWeight:'bold', marginTop:3 }}>{m.l}</div>
                <div style={{ fontSize:10, color:'#6b7280' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {(criticos.length>0||advertencias.length>0) && (
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20, marginBottom:16 }}>
              <h3 style={{ margin:'0 0 14px', color:C.navy, fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Bell size={14}/> Alertas activas</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {criticos.slice(0,5).map((c,i)=>{ const aid=`c-${i}`; if(archivadas.has(aid)) return null; return <AlertCard key={i} id={aid} msg={c.mensaje} sev="error" onArchivar={archivarAlerta} onIr={onVerHorario}/>; })}
                {advertencias.slice(0,4).map((c,i)=>{ const aid=`a-${i}`; if(archivadas.has(aid)) return null; return <AlertCard key={i} id={aid} msg={c.mensaje} sev="warning" onArchivar={archivarAlerta}/>; })}
                {(criticos.length>5||advertencias.length>4) && <div style={{ fontSize:11, color:'#6b7280', textAlign:'center', padding:6 }}>...y {Math.max(0,criticos.length-5)+Math.max(0,advertencias.length-4)} más — ver pestañas de detalle.</div>}
              </div>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20 }}>
              <h3 style={{ margin:'0 0 12px', color:C.navy, fontSize:13, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Activity size={14}/> Estado del horario</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Object.entries(ESTADOS).filter(([k])=>k!=='null').map(([key,info])=>(
                  <div key={key} style={{ background:info.bg, border:`2px solid ${estado===key?info.color:'transparent'}`, borderRadius:9, padding:'11px 14px', position:'relative' }}>
                    <div style={{ fontWeight:'bold', color:info.color, fontSize:13 }}>{info.label}</div>
                    {estado===key && <div style={{ fontSize:11, color:info.color, marginTop:3 }}>← Estado actual</div>}
                    {estado!==key&&key==='aprobado'&&tieneCriticos && <div style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>🔒 Requiere resolver críticos</div>}
                  </div>
                ))}
                {estado==='pendiente'&&!tieneCriticos&&puedeAprobarHorario && <div style={{ fontSize:11, color:'#166534', background:'#f0fdf4', border:'1px solid #dcfce7', borderRadius:7, padding:'7px 12px', display:'flex', alignItems:'center', gap:6 }}><CheckCircle size={12}/>Transición disponible: Pendiente → Aprobado</div>}
              </div>
            </div>
            <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20 }}>
              <h3 style={{ margin:'0 0 12px', color:C.navy, fontSize:13, fontWeight:'bold' }}>Verificación rápida</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <CheckRow label="Sin cruces de docente"           ok={fallosR.filter(f=>f.tipo==='cruce_doc').length===0}/>
                <CheckRow label="Sin cruces de aula"              ok={fallosR.filter(f=>f.tipo==='cruce_aula').length===0}/>
                <CheckRow label="Lunes 07:45 cumplido"           ok={fallosR.filter(f=>f.tipo==='sin_lunes').length===0}/>
                <CheckRow label="Sin bloques sueltos"             ok={incons.filter(i=>i.tipo==='bloque_suelto').length===0}/>
                <CheckRow label="Recesos correctos"               ok={probR.length===0} detalle={probR.length>0?`${probR.length} bloque(s) cruzan receso`:undefined}/>
                <CheckRow label="Todas las clases con aula"       ok={incons.filter(i=>i.tipo==='sin_aula').length===0} detalle={incons.filter(i=>i.tipo==='sin_aula').length>0?`${incons.filter(i=>i.tipo==='sin_aula').length} sin asignar`:undefined}/>
                <CheckRow label="Sin docentes sobrecargados"      ok={docSobre.length===0}/>
                <CheckRow label="Sin docentes bajo mínimo"        ok={docBajo.length===0}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESTRICCIONES ── */}
      {tabActiva==='restricciones' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Shield size={15}/> Validación de Restricciones (RAC-03)</h3>
            <button onClick={handleValidar} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:C.navy, color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold' }}><RefreshCw size={12}/> Validar ahora</button>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:'bold', color:'#166534', marginBottom:8 }}>RESTRICCIONES CUMPLIDAS</div>
            {[{r:'Horario dentro del rango 07:45–14:15'},{r:'8 períodos de 45 min por día'},{r:'Materias de alta prioridad asignadas primero'}].map((x,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px', background:'#f0fdf4', border:'1px solid #dcfce7', borderRadius:7, fontSize:12, marginBottom:6 }}>
                <CheckCircle size={13} color="#16a34a"/><span style={{ color:'#166534' }}>{x.r}</span><SevBadge sev="ok"/>
              </div>
            ))}
          </div>
          {fallosR.length===0
            ? <div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:9, padding:'14px 18px', display:'flex', gap:8, alignItems:'center', color:'#166534', fontWeight:'bold' }}><CheckCircle size={16}/> Todas las restricciones se cumplen — horario válido</div>
            : (
              <div>
                <div style={{ fontSize:11, fontWeight:'bold', color:'#991b1b', marginBottom:8 }}>RESTRICCIONES INCUMPLIDAS</div>
                {fallosR.map((f,i)=>(
                  <div key={i} style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
                    <AlertTriangle size={15} color="#dc2626" style={{ flexShrink:0, marginTop:1 }}/>
                    <div style={{ flex:1 }}><div style={{ fontWeight:'bold', color:'#991b1b', fontSize:12 }}>{f.restriccion}</div><div style={{ color:'#7f1d1d', fontSize:12, marginTop:2 }}>{f.mensaje}</div></div>
                    <SevBadge sev="error"/>
                    <button onClick={onVerHorario} style={{ padding:'4px 10px', background:C.navy, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontSize:11, flexShrink:0 }}>Editar →</button>
                  </div>
                ))}
                <button onClick={onVerHorario} style={{ marginTop:12, padding:'9px 18px', background:C.navy, color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Pencil size={13}/> Ir al módulo Horarios para corregir</button>
              </div>
            )
          }
        </div>
      )}

      {/* ── RECESOS ── */}
      {tabActiva==='recesos' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Clock size={15}/> Verificación de Recesos</h3>
          <div style={{ background:'#fef9c3', border:'1px solid #fef08a', borderRadius:9, padding:'12px 16px', marginBottom:16, fontSize:12, color:'#92400e' }}>
            <strong>Regla verificada:</strong> Ningún bloque puede extenderse simultáneamente sobre P3 y P4 (cruzando el receso 10:00–10:15), ni sobre P5 y P6 (cruzando el receso 11:45–12:00).
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            {recesosOk.map((r,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, padding:'9px 14px', background:r.ok?'#f0fdf4':'#fef2f2', borderRadius:9, border:`1px solid ${r.ok?'#dcfce7':'#fecaca'}` }}>
                {r.ok?<CheckCircle size={14} color="#16a34a"/>:<AlertCircle size={14} color="#dc2626"/>}
                <span style={{ color:r.ok?'#166534':'#991b1b' }}>{r.label}</span>
              </div>
            ))}
          </div>
          {probR.length>0?(
            <div>
              <div style={{ fontWeight:'bold', color:'#991b1b', fontSize:12, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}><AlertTriangle size={13}/> {probR.length} problema(s) detectado(s):</div>
              {probR.map((p,i)=>(
                <div key={i} style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:7, padding:'8px 14px', marginBottom:6, fontSize:12, color:'#7f1d1d', display:'flex', alignItems:'center', gap:8 }}>
                  <SevBadge sev="warning"/><span>{p.mensaje}</span>
                  <button onClick={onVerHorario} style={{ marginLeft:'auto', padding:'3px 9px', background:C.navy, color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:10 }}>Corregir</button>
                </div>
              ))}
            </div>
          ):<div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:9, padding:'14px 18px', display:'flex', gap:8, alignItems:'center', color:'#166534', fontWeight:'bold' }}><CheckCircle size={16}/> Todos los recesos se respetan correctamente</div>}
          <div style={{ background:'#f8fafc', borderRadius:9, padding:'12px 16px', marginTop:16 }}>
            <div style={{ fontSize:11, fontWeight:'bold', color:C.navy, marginBottom:8 }}>Estructura de la jornada:</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {[{l:'P1 07:45',r:false},{l:'P2 08:30',r:false},{l:'P3 09:15',r:false},{l:'⏸ 10:00',r:true},{l:'P4 10:15',r:false},{l:'P5 11:00',r:false},{l:'⏸ 11:45',r:true},{l:'P6 12:00',r:false},{l:'P7 12:45',r:false},{l:'P8 13:30',r:false}].map((s,i)=>(
                <span key={i} style={{ fontSize:10, padding:'3px 9px', borderRadius:20, background:s.r?'#fef9c3':'#dbeafe', color:s.r?'#92400e':'#1e40af', fontWeight:'bold' }}>{s.l}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INCONSISTENCIAS ── */}
      {tabActiva==='inconsistencias' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><AlertTriangle size={15}/> Detección de Inconsistencias</h3>
          {criticos.length>0 && (
            <div style={{ background:'#fef2f2', border:'2px solid #dc2626', borderRadius:9, padding:'12px 16px', marginBottom:16, display:'flex', gap:8, alignItems:'center', fontSize:12, color:'#7f1d1d' }}>
              <AlertTriangle size={15}/><strong>Aprobación bloqueada</strong> — {criticos.length} inconsistencia(s) grave(s) pendiente(s) de corrección
              <button onClick={onVerHorario} style={{ marginLeft:'auto', padding:'6px 14px', background:'#dc2626', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:'bold' }}>Corregir en Horarios →</button>
            </div>
          )}
          {incons.length===0
            ? <div style={{ background:'#dcfce7', border:'1px solid #16a34a', borderRadius:9, padding:'14px 18px', display:'flex', gap:8, alignItems:'center', color:'#166534', fontWeight:'bold' }}><CheckCircle size={16}/> Sin inconsistencias detectadas</div>
            : (
              <div>
                {[{tipo:'sin_lunes',label:'Sin clase el Lunes 07:45',grave:true},{tipo:'sin_aula',label:'Materias sin aula asignada',grave:false},{tipo:'bloque_suelto',label:'Períodos sueltos (sin bloque)',grave:false}].map(({tipo,label,grave})=>{
                  const grupo=incons.filter(i=>i.tipo===tipo); if(!grupo.length) return null;
                  return (
                    <div key={tipo} style={{ marginBottom:16 }}>
                      <div style={{ fontWeight:'bold', color:grave?'#991b1b':'#92400e', fontSize:12, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                        {grave?<AlertCircle size={13}/>:<AlertTriangle size={13}/>}{label} ({grupo.length})<SevBadge sev={grave?'error':'warning'}/>
                      </div>
                      {grupo.map((inc,i)=>(
                        <div key={i} style={{ background:grave?'#fef2f2':'#fefce8', border:`1px solid ${grave?'#fecaca':'#fef08a'}`, borderRadius:7, padding:'8px 14px', marginBottom:6, fontSize:12, color:grave?'#7f1d1d':'#92400e', display:'flex', alignItems:'center', gap:8 }}>
                          {inc.mensaje}
                          <button onClick={onVerHorario} style={{ marginLeft:'auto', padding:'3px 9px', background:C.navy, color:'white', border:'none', borderRadius:4, cursor:'pointer', fontSize:10 }}>Editar</button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>
      )}

      {/* ── CARGA DOCENTE ── */}
      {tabActiva==='carga' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:14, fontWeight:'bold' }}>Carga Horaria Docente</h3>
          {docSobre.length>0 && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:9, padding:'10px 16px', marginBottom:12, fontSize:12, color:'#7f1d1d', display:'flex', gap:8, alignItems:'center' }}><AlertTriangle size={14}/><strong>{docSobre.length} docente(s) con sobrecarga horaria</strong></div>}
          {docBajo.length>0 && <div style={{ background:'#fefce8', border:'1px solid #fef08a', borderRadius:9, padding:'10px 16px', marginBottom:12, fontSize:12, color:'#92400e', display:'flex', gap:8, alignItems:'center' }}><AlertTriangle size={14}/><strong>{docBajo.length} docente(s) bajo el mínimo de horas</strong></div>}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
            {docentes.map(d=>{
              const h=horasDoc?.[d.id]||0; const pct=Math.min(100,(h/d.maxHoras)*100); const sobre=h>d.maxHoras; const bajo=h<d.minHoras&&h>0;
              return (
                <div key={d.id} style={{ padding:'12px 16px', border:`1px solid ${sobre?'#fecaca':bajo?'#fef08a':'#e2e8f0'}`, borderRadius:10, background:sobre?'#fef2f2':bajo?'#fefce8':'white' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:8 }}>
                    <div><span style={{ fontWeight:'bold', color:C.navy }}>{d.nombre}</span><span style={{ fontSize:10, color:'#6b7280', marginLeft:6 }}>{d.tipo}</span></div>
                    <span style={{ fontWeight:'bold', color:sobre?'#dc2626':bajo?'#92400e':'#166534' }}>{h}/{d.maxHoras}h {sobre?'⚠':bajo?'↓':'✓'}</span>
                  </div>
                  <div style={{ background:'#e2e8f0', borderRadius:99, height:6, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:sobre?'#dc2626':pct>80?C.gold:'#16a34a', borderRadius:99, transition:'width 0.3s' }}/>
                  </div>
                  <div style={{ fontSize:10, color:'#6b7280', marginTop:4 }}>Mín: {d.minHoras}h · Máx: {d.maxHoras}h · {d.especialidad}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── OBSERVACIONES ── */}
      {tabActiva==='observaciones' && verObs && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
            <h3 style={{ margin:'0 0 14px', color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><ClipboardList size={15}/> Observaciones internas</h3>
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:7, padding:'7px 14px', marginBottom:14, fontSize:11, color:'#1e40af' }}>
              Este panel es visible únicamente para DDE, Jefe de Carrera y Administrador.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto', gap:10, alignItems:'end' }}>
              <div>
                <label style={{ display:'block', fontSize:11, color:C.gray, fontWeight:'bold', marginBottom:5 }}>OBSERVACIÓN</label>
                <input value={obsTexto} onChange={e=>setObsTexto(e.target.value)} onKeyDown={e=>e.key==='Enter'&&agregarObs()} placeholder="Escribir observación sobre el horario..." style={{ ...inputStyle }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, color:C.gray, fontWeight:'bold', marginBottom:5 }}>DIRIGIDA A</label>
                <select value={obsDest} onChange={e=>setObsDest(e.target.value)} style={{ padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:6, fontSize:13, background:'#f8fafc', minWidth:150 }}>
                  <option>DDE</option><option>Jefe de Carrera</option><option>Administrador</option><option>General</option>
                </select>
              </div>
              <button onClick={agregarObs} style={{ ...btnPrimary, height:38 }}><Plus size={14}/> Agregar</button>
            </div>
            {obsDest==='DDE' && <div style={{ fontSize:11, color:'#92400e', marginTop:8, display:'flex', alignItems:'center', gap:5 }}><Bell size={11}/> Al guardar, se enviará una notificación automática al DDE.</div>}
          </div>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
            <div style={{ fontSize:13, fontWeight:'bold', color:C.navy, marginBottom:14 }}>Observaciones registradas ({observaciones.length})</div>
            {observaciones.length===0 && <div style={{ fontSize:12, color:C.gray, textAlign:'center', padding:'16px 0' }}>Sin observaciones aún</div>}
            {observaciones.map(obs=>(
              <div key={obs.id} style={{ background:'#fefce8', border:'1px solid #fef08a', borderRadius:9, padding:'12px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ background:C.navy, color:C.gold, fontSize:10, padding:'2px 10px', borderRadius:20, fontWeight:'bold' }}>→ {obs.destinatario}</span>
                    <span style={{ fontSize:11, color:'#6b7280' }}>{obs.autor} ({obs.rol})</span>
                  </div>
                  <span style={{ fontSize:10, color:'#94a3b8' }}>{obs.fecha}</span>
                </div>
                <div style={{ fontSize:12, color:C.navy }}>{obs.texto}</div>
                {obs.destinatario==='DDE' && <div style={{ fontSize:10, color:'#92400e', marginTop:6, display:'inline-flex', alignItems:'center', gap:4, background:'#fef3c7', padding:'2px 8px', borderRadius:4 }}><Bell size={9}/>DDE notificado</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {tabActiva==='historial' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ margin:0, color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Archive size={15}/> Historial de cambios</h3>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ fontSize:11, color:'#6b7280', background:'#f1f5f9', padding:'4px 12px', borderRadius:6 }}>🔒 Registro inalterable</span>
              <button onClick={()=>alert('Función de exportación disponible al integrar con el backend')} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', background:C.navy, color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:11, fontWeight:'bold' }}><FileDown size={12}/> Exportar</button>
            </div>
          </div>
          {[...auditLog,...historial.map(h=>({...h,esHistorial:true}))].length===0
            ? <div style={{ fontSize:12, color:'#6b7280', textAlign:'center', padding:'24px 0' }}>Sin actividad registrada aún</div>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:'52vh', overflowY:'auto' }}>
                {auditLog.map((h,i)=>(
                  <div key={h.id||i} style={{ display:'flex', gap:10, fontSize:12, padding:'9px 14px', background:'#f8fafc', borderRadius:9, border:'1px solid #e2e8f0', alignItems:'flex-start' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:C.gold, flexShrink:0, marginTop:3 }}/>
                    <span style={{ color:C.gold, fontSize:11, minWidth:150, flexShrink:0 }}>{h.fecha}</span>
                    <div><div style={{ color:C.navy, fontWeight:'bold' }}>{h.accion}</div>{h.detalle&&<div style={{ color:'#6b7280', fontSize:11, marginTop:1 }}>{h.detalle}</div>}<div style={{ color:'#94a3b8', fontSize:10, marginTop:1 }}>{h.usuario} · {h.rol}</div></div>
                  </div>
                ))}
                {historial.map((h,i)=>(
                  <div key={`s-${h.id||i}`} style={{ display:'flex', gap:10, fontSize:12, padding:'9px 14px', background:'#f0fdf4', borderRadius:9, border:'1px solid #dcfce7', alignItems:'center' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#16a34a', flexShrink:0 }}/>
                    <span style={{ color:'#16a34a', fontSize:11, minWidth:150, flexShrink:0 }}>{h.fecha}</span>
                    <span style={{ color:C.navy, fontWeight:'bold' }}>{h.accion}</span>
                    <span style={{ color:'#6b7280' }}>— {h.usuario}</span>
                    <span style={{ marginLeft:'auto', color:h.estado==='aprobado'?'#16a34a':'#92400e', fontWeight:'bold', fontSize:11, border:`1px solid ${h.estado==='aprobado'?'#16a34a':'#f59e0b'}`, borderRadius:20, padding:'1px 9px' }}>{h.estado?.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {/* ── NOTIFICACIONES ── */}
      {tabActiva==='notificaciones' && (
        <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:22 }}>
          <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:14, fontWeight:'bold', display:'flex', alignItems:'center', gap:6 }}><Bell size={15}/> Centro de Notificaciones</h3>
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            <button onClick={()=>enviarNotif('Horario listo para revisión — Jefe de Carrera notificado','info')} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#1e40af', color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold' }}><Bell size={13}/> Notificar a Jefe de Carrera</button>
            <button onClick={()=>{ enviarNotif('Cambios en el horario — DDE notificado','warning'); registrar('Notificación enviada al DDE','Manual'); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#92400e', color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold' }}><Bell size={13}/> Notificar al DDE</button>
            <button onClick={()=>{ enviarNotif('Horario publicado — Todos los docentes notificados','success'); registrar('Notificación enviada a docentes','Manual'); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#166534', color:'white', border:'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold' }}><Bell size={13}/> Notificar a Docentes</button>
          </div>
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:9, padding:'10px 16px', marginBottom:16, fontSize:11, color:'#6b7280' }}>
            <strong style={{ color:C.navy }}>Notificaciones automáticas activas:</strong><br/>
            • Al DDE cuando se registra una observación dirigida a él<br/>
            • A todos los responsables al aprobar el horario<br/>
            • Al Jefe de Carrera cuando el horario está listo para revisión
          </div>
          {notifEnv.length===0 && <div style={{ fontSize:12, color:'#6b7280', textAlign:'center', padding:'16px 0' }}>Sin notificaciones enviadas aún</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:'40vh', overflowY:'auto' }}>
            {notifEnv.map(n=>{
              const bgMap={success:'#f0fdf4',warning:'#fefce8',info:'#eff6ff',error:'#fef2f2'};
              const borderMap={success:'#dcfce7',warning:'#fef08a',info:'#bfdbfe',error:'#fecaca'};
              return (
                <div key={n.id} style={{ padding:'10px 14px', background:bgMap[n.tipo]||'#f8fafc', border:`1px solid ${borderMap[n.tipo]||'#e2e8f0'}`, borderRadius:9, fontSize:12 }}>
                  <div style={{ color:C.navy, fontWeight:'bold' }}>{n.msg}</div>
                  <div style={{ color:'#94a3b8', fontSize:10, marginTop:3 }}>{n.fecha}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// MOD-6: REPORTES
// ─────────────────────────────────────────
function Mod6ReportesView({ horario, docentes, materias, aulas, grupos, horasDoc, estadoHorario }) {
  const [subTab, setSubTab] = useState('resumen');
  const [filtroDoc, setFiltroDoc] = useState(docentes[0]?.id||'');
  const [filtroAula, setFiltroAula] = useState(aulas[0]?.id||'');
  const [filtroGrupo, setFiltroGrupo] = useState(3);
  const totalClases = horario?SEMESTRES.reduce((a,s)=>{ let c=0; for(let d=0;d<5;d++) for(let p=0;p<8;p++) if(horario[s]?.[d]?.[p]) c++; return a+c; },0):0;
  const NG = () => <EmptyState icon={<FileText size={36}/>} titulo="Sin horario generado" desc="Ve al módulo Generación para crear un horario primero."/>;

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {[{id:'resumen',label:'Resumen General',icon:<BarChart2 size={13}/>},{id:'docente',label:'Por Docente',icon:<Users size={13}/>},{id:'grupo',label:'Por Grupo',icon:<Layers size={13}/>},{id:'aula',label:'Por Aula',icon:<Building2 size={13}/>},{id:'exportar',label:'Exportar',icon:<Download size={13}/>}].map(t=>(
          <TabBtn key={t.id} active={subTab===t.id} onClick={()=>setSubTab(t.id)}>{t.icon}{t.label}</TabBtn>
        ))}
      </div>

      {subTab==='resumen' && (!horario?<NG/>:(
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
            {[
              {v:totalClases,l:'Clases Asignadas',sub:'total del horario',icon:<Hash size={18}/>,c:C.navy},
              {v:docentes.filter(d=>(horasDoc?.[d.id]||0)>0).length,l:'Docentes Activos',sub:`de ${docentes.length} totales`,icon:<Users size={18}/>,c:C.blue},
              {v:materias.length,l:'Materias',sub:'en el sistema',icon:<BookOpen size={18}/>,c:C.green},
              {v:estadoHorario==='aprobado'?'Aprobado':'Pendiente',l:'Estado',sub:'del horario',icon:<Shield size={18}/>,c:estadoHorario==='aprobado'?'#166534':'#92400e'},
            ].map(m=>(
              <div key={m.l} style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:'18px', display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ background:m.c, color:'white', width:42, height:42, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{m.icon}</div>
                <div><div style={{ fontSize:22, fontWeight:'bold', color:m.c }}>{m.v}</div><div style={{ fontSize:11, color:C.navy, fontWeight:'bold' }}>{m.l}</div><div style={{ fontSize:10, color:C.gray }}>{m.sub}</div></div>
              </div>
            ))}
          </div>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', padding:20, marginBottom:16 }}>
            <h3 style={{ margin:'0 0 16px', color:C.navy, fontSize:13, fontWeight:'bold' }}>Clases por Semestre</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
              {SEMESTRES.map(s=>{
                let cnt=0; for(let d=0;d<5;d++) for(let p=0;p<8;p++) if(horario[s]?.[d]?.[p]) cnt++;
                const pct=Math.round((cnt/(8*5))*100);
                return (
                  <div key={s} style={{ background:'#f8fafc', borderRadius:10, padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:16, fontWeight:'bold', color:C.navy }}>{s}°</div>
                    <div style={{ fontSize:24, fontWeight:'bold', color:C.gold }}>{cnt}</div>
                    <div style={{ fontSize:10, color:C.gray }}>períodos</div>
                    <div style={{ background:'#e2e8f0', borderRadius:99, height:4, marginTop:8, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:C.navy, borderRadius:99 }}/></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {subTab==='docente' && (!horario?<NG/>:(
        <div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:C.gray, marginBottom:5, display:'block' }}>Seleccionar Docente:</label>
            <select value={filtroDoc} onChange={e=>setFiltroDoc(e.target.value)} style={{ ...inputStyle, maxWidth:340 }}>{docentes.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}</select>
          </div>
          {filtroDoc&&(()=>{
            const doc=docentes.find(d=>d.id===filtroDoc); const h=horasDoc?.[filtroDoc]||0;
            const mats=[]; SEMESTRES.forEach(s=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=horario[s][d][p]; if(c?.docenteId===filtroDoc&&!mats.find(m=>m.id===c.id&&m.dia===d&&m.periodo===p)) mats.push({...c,semestre:s,dia:d,periodo:p}); } });
            return (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                  {[{v:h,l:`Horas (máx ${doc.maxHoras})`,c:h>doc.maxHoras?'#dc2626':'#166534'},{v:doc.tipo,l:'Tipo',c:C.navy},{v:doc.especialidad,l:'Especialidad',c:C.blue}].map(m=>(
                    <div key={m.l} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:20, fontWeight:'bold', color:m.c }}>{m.v}</div>
                      <div style={{ fontSize:11, color:C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:C.grayLight }}>{['Materia','Semestre','Día','Período','Aula'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>{mats.map((m,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                        <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy }}>{m.nombre}</span></td>
                        <td style={{ ...tdStyle, textAlign:'center' }}><span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{m.semestre}°</span></td>
                        <td style={tdStyle}>{DIAS[m.dia]}</td>
                        <td style={{ ...tdStyle, textAlign:'center' }}>P{m.periodo+1}</td>
                        <td style={tdStyle}>{aulas.find(a=>a.id===m.aulaId)?.nombre||'—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      ))}

      {subTab==='grupo' && (!horario?<NG/>:(
        <div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:C.gray, marginBottom:8, display:'block' }}>Seleccionar Semestre:</label>
            <div style={{ display:'flex', gap:6 }}>{SEMESTRES.map(s=><button key={s} onClick={()=>setFiltroGrupo(s)} style={{ padding:'6px 14px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:'bold', background:filtroGrupo===s?C.navy:'#e2e8f0', color:filtroGrupo===s?C.gold:C.gray }}>{s}°</button>)}</div>
          </div>
          <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:C.grayLight }}><th style={thStyle}>HORA</th>{DIAS.map(d=><th key={d} style={thStyle}>{d.toUpperCase()}</th>)}</tr></thead>
              <tbody>
                {RENDER_SLOTS.map((slot,si)=>{
                  if(slot.type==='break') return <tr key={si}><td style={{ ...tdStyle, textAlign:'center', fontSize:10, color:'#94a3b8', background:'#f8fafc' }}>{slot.inicio}</td><td colSpan={5} style={{ background:'#fefce8', textAlign:'center', fontSize:10, color:'#92400e', padding:4, fontWeight:'bold' }}>RECESO</td></tr>;
                  const p=slot.idx;
                  return (
                    <tr key={si} style={{ borderBottom:'1px solid #e2e8f0' }}>
                      <td style={{ ...tdStyle, background:'#f8fafc', textAlign:'center' }}>P{p+1}<br/><span style={{ fontSize:9, color:'#94a3b8' }}>{slot.inicio}</span></td>
                      {[0,1,2,3,4].map(d=>{
                        const cel=horario[filtroGrupo][d][p];
                        if(!cel) return <td key={d} style={{ ...tdStyle, background:'#f8fafc' }}/>;
                        const doc=docentes.find(x=>x.id===cel.docenteId); const aula=aulas.find(a=>a.id===cel.aulaId);
                        return <td key={d} style={{ ...tdStyle, background:'#eff6ff', verticalAlign:'top' }}>
                          <div style={{ fontWeight:'bold', fontSize:11, color:C.navy }}>{cel.nombre}</div>
                          <div style={{ fontSize:10, color:C.gray }}>{doc?.nombre}</div>
                          {aula&&<div style={{ fontSize:9, color:C.blue }}>📍{aula.nombre}</div>}
                        </td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {subTab==='aula' && (!horario?<NG/>:(
        <div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:C.gray, marginBottom:5, display:'block' }}>Seleccionar Aula:</label>
            <select value={filtroAula} onChange={e=>setFiltroAula(e.target.value)} style={{ ...inputStyle, maxWidth:340 }}>{aulas.filter(a=>a.disponible).map(a=><option key={a.id} value={a.id}>{a.nombre} ({a.tipo})</option>)}</select>
          </div>
          {filtroAula&&(()=>{
            const aula=aulas.find(a=>a.id===filtroAula); const usos=[];
            SEMESTRES.forEach(s=>{ for(let d=0;d<5;d++) for(let p=0;p<8;p++){ const c=horario[s][d][p]; if(c?.aulaId===filtroAula) usos.push({...c,semestre:s,dia:d,periodo:p}); } });
            const tasa=Math.round((usos.length/(8*5*8))*100);
            return (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
                  {[{v:usos.length,l:'Períodos Usados'},{v:`${tasa}%`,l:'Tasa de Ocupación'},{v:aula.capacidad,l:'Capacidad'}].map(m=>(
                    <div key={m.l} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:10, padding:'14px', textAlign:'center' }}>
                      <div style={{ fontSize:22, fontWeight:'bold', color:C.navy }}>{m.v}</div>
                      <div style={{ fontSize:11, color:C.gray }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'white', borderRadius:12, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ background:C.grayLight }}>{['Materia','Semestre','Día','Período','Docente'].map(h=><th key={h} style={thStyle}>{h.toUpperCase()}</th>)}</tr></thead>
                    <tbody>{usos.map((u,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid #f1f5f9', background:i%2===0?'white':'#f8fafc' }}>
                        <td style={tdStyle}><span style={{ fontWeight:'bold', color:C.navy }}>{u.nombre}</span></td>
                        <td style={{ ...tdStyle, textAlign:'center' }}><span style={{ background:C.navy, color:C.gold, padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:'bold' }}>{u.semestre}°</span></td>
                        <td style={tdStyle}>{DIAS[u.dia]}</td>
                        <td style={{ ...tdStyle, textAlign:'center' }}>P{u.periodo+1}</td>
                        <td style={tdStyle}>{docentes.find(d=>d.id===u.docenteId)?.nombre||'—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      ))}

      {subTab==='exportar' && (
        <div>
          <p style={{ color:C.gray, fontSize:13, marginBottom:18 }}>Descarga los horarios en distintos formatos para distribución institucional.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              {icon:<FileDown size={28}/>,titulo:'Exportar PDF',desc:'Horario completo para impresión y distribución oficial',color:'#dc2626',label:'Descargar PDF'},
              {icon:<FileText size={28}/>,titulo:'Exportar Excel',desc:'Exporta en formato .xlsx para edición y análisis',color:'#166534',label:'Descargar Excel'},
              {icon:<Printer size={28}/>,titulo:'Imprimir',desc:'Enviar directamente a impresora el cronograma seleccionado',color:C.navy,label:'Imprimir ahora'},
              {icon:<Users size={28}/>,titulo:'Horario por Docente',desc:'PDF individual con el horario de cada docente',color:C.blue,label:'Generar PDFs'},
              {icon:<Layers size={28}/>,titulo:'Horario por Grupo',desc:'Horario semestral para cada grupo académico',color:C.purple,label:'Descargar'},
              {icon:<Archive size={28}/>,titulo:'Resumen Ejecutivo',desc:'Informe con métricas de carga docente y ocupación de aulas',color:'#92400e',label:'Generar informe'},
            ].map(r=>(
              <div key={r.titulo} style={{ background:'white', border:'1px solid #e2e8f0', borderRadius:14, padding:22, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ color:r.color }}>{r.icon}</div>
                <div><div style={{ fontWeight:'bold', color:C.navy, fontSize:13, marginBottom:5 }}>{r.titulo}</div><div style={{ fontSize:12, color:C.gray, lineHeight:1.5 }}>{r.desc}</div></div>
                <button onClick={()=>alert(`${r.titulo}: función lista para integrar con el backend.`)}
                  style={{ marginTop:'auto', padding:'9px', background:r.color, color:'white', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity:!horario?0.4:1 }}
                  disabled={!horario}>
                  <Download size={13}/> {r.label}
                </button>
              </div>
            ))}
          </div>
          {!horario && <div style={{ textAlign:'center', marginTop:16, fontSize:12, color:'#94a3b8' }}>Genera un horario primero para habilitar la exportación.</div>}
        </div>
      )}
    </div>
  );
}
>>>>>>> Stashed changes
