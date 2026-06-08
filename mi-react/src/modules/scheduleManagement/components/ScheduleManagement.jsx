/**
 * ScheduleManagement.jsx — MOD-4 SAGH · Escuela Militar de Ingeniería
 * Versión funcional con panel flotante de observaciones
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Calendar, Users, Pencil, Trash2, X, Info, Filter, Layers,
  AlertTriangle, UserCircle, Building2, CheckCircle, ArrowLeftRight,
  Eye, RotateCcw, MapPin, MessageSquare, Send, BookOpen, ArrowRightLeft,
} from 'lucide-react';
import { C, DIAS, RENDER_SLOTS } from '../../../shared/constants';
import { EmptyState, FormField } from '../../../shared/components/Forms';
import { inputStyle } from '../../../shared/styles/inlineStyles';
import {
  detectConfl,
  calculateTeacherHours,
  calculateAulaOccupancy,
  swapScheduleCells,
  updateScheduleCellDetails,
  clearScheduleCell,
  reassignAulaToSemestre,
  crearObservacion,
} from '../backend/scheduleManagementService';
import '../styles/scheduleManagement.css';

// Colores y helpers (simplificados)
const COLORES_BG = ['#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe','#ffedd5','#cffafe','#f1f5f9','#fef2f2','#f0fdf4'];
const COLORES_BORDER = ['#93c5fd','#86efac','#fde047','#f9a8d4','#c4b5fd','#fdba74','#67e9f8','#cbd5e1','#fca5a5','#6ee7b7'];
const getColorBg = (mId, materias) => { const i = (materias||[]).findIndex(m=>m.id===mId); return i>=0?COLORES_BG[i%COLORES_BG.length]:'#f1f5f9'; };
const getColorBorder = (mId, materias) => { const i = (materias||[]).findIndex(m=>m.id===mId); return i>=0?COLORES_BORDER[i%COLORES_BORDER.length]:'#cbd5e1'; };

const TIPO_PERIODO_CFG = { 'Teórico': { bg:'#e0f2fe', color:'#075985', border:'#bae6fd', label:'T' }, 'Práctico': { bg:'#fef3c7', color:'#92400e', border:'#fde68a', label:'P' }, 'Laboratorio': { bg:'#ede9fe', color:'#5b21b6', border:'#ddd6fe', label:'L' } };
const CONFLICT_CFG = { doc: { label:'Cruce Docente', color:'#b91c1c', bg:'#fee2e2', icon:'👤' }, aula: { label:'Cruce de Aula', color:'#c2410c', bg:'#ffedd5', icon:'🏛️' }, disponibilidad: { label:'Doc. Indisponible', color:'#a16207', bg:'#fef9c3', icon:'⏰' }, capacidad: { label:'Cap. Insuficiente', color:'#7c3aed', bg:'#ede9fe', icon:'👥' } };

const DEFAULT_SEMESTRES = [3,4,5,6,7,8,9,10];
const SEMNOM = {3:'Tercer',4:'Cuarto',5:'Quinto',6:'Sexto',7:'Séptimo',8:'Octavo',9:'Noveno',10:'Décimo'};

const Badge = ({ tipo }) => { const cfg = TIPO_PERIODO_CFG[tipo]; if (!cfg) return null; return <span style={{ display:'inline-flex', alignItems:'center', padding:'1px 6px', borderRadius:4, fontSize:7, fontWeight:900, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>; };
const ConflictPill = ({ msg, tipo }) => { const cfg = CONFLICT_CFG[tipo] || { color:'#b91c1c', bg:'#fee2e2' }; return <div style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:9999, fontSize:7, fontWeight:900, background:cfg.bg, color:cfg.color }}><AlertTriangle size={8}/> {msg}</div>; };
const StatCard = ({ label, value, detail, icon, bg, color, pulse }) => ( <div className="stat-card" style={{ padding:'20px 22px', display:'flex', alignItems:'center', gap:16, outline:pulse?'2px solid #fca5a5':'none' }}><div style={{ width:48, height:48, borderRadius:16, background:bg, color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>{icon}</div><div><div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.2em', color:'#94a3b8', marginBottom:2 }}>{label}</div><div style={{ fontSize:17, fontWeight:900, color:C.navy, fontFamily:'serif', lineHeight:1.2 }}>{value}</div><div style={{ fontSize:9, fontWeight:700, color:'#94a3b8', marginTop:2 }}>{detail}</div></div></div> );
const SectionTitle = ({ icon, title, subtitle }) => ( <div style={{ display:'flex', alignItems:'center', gap:14 }}><div style={{ width:44, height:44, borderRadius:14, background:C.navy, color:C.gold, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{icon}</div><div><div style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.3em', color:'#94a3b8' }}>{subtitle}</div><div style={{ fontSize:18, fontWeight:900, color:C.navy, fontFamily:'serif' }}>{title}</div></div></div> );
const Sel = ({ value, onChange, children, style={} }) => ( <select value={value} onChange={onChange} style={{ ...inputStyle, width:'100%', padding:'8px 12px', borderRadius:10, border:'1px solid #e2e8f0', background:'white', fontSize:12, fontWeight:700, color:C.navy, cursor:'pointer', ...style }}>{children}</select> );

// Panel flotante de observaciones
const PanelObservacionesFlotante = ({ usuario, vistaActiva, semestreRef, onEnviar }) => {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [enviadas, setEnviadas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const handleEnviar = () => { if (!texto.trim()) return; setEnviando(true); const obs = crearObservacion({ texto, autor: usuario?.nombre || usuario?.email || 'Usuario', rolAutor: usuario?.rol || '', vista: vistaActiva, semestre: semestreRef?.current ?? null }); setTimeout(() => { setEnviadas(prev => [obs, ...prev]); if (onEnviar) onEnviar(obs); setTexto(''); setEnviando(false); setExito(true); setTimeout(() => setExito(false), 2800); }, 600); };
  const rolLabel = (usuario?.rol === 'JefeCarrera' || usuario?.rol === 'Jefe de Carrera') ? 'Jefe de Carrera' : 'Docente';
  const rolColor = (usuario?.rol === 'JefeCarrera' || usuario?.rol === 'Jefe de Carrera') ? '#7c3aed' : '#0369a1';
  const rolBg = (usuario?.rol === 'JefeCarrera' || usuario?.rol === 'Jefe de Carrera') ? '#ede9fe' : '#dbeafe';
  return ( <div className="obs-flotante-wrapper no-print"> {abierto && ( <div className="obs-flotante-panel"> <div style={{ padding:'14px 18px', background:C.navy, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}><div style={{ display:'flex', alignItems:'center', gap:10 }}><MessageSquare size={15} color={C.gold}/><div><div style={{ fontSize:11, fontWeight:900, color:'white', textTransform:'uppercase' }}>Observaciones</div><span style={{ fontSize:9, fontWeight:700, background:rolBg, color:rolColor, padding:'1px 8px', borderRadius:20 }}>{rolLabel}</span></div></div><button onClick={() => setAbierto(false)} style={{ background:'rgba(255,255,255,0.12)', border:'none', borderRadius:8, width:28, height:28, cursor:'pointer', color:'white' }}><X size={14}/></button></div> <div style={{ padding:'10px 16px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', flexShrink:0 }}><div style={{ fontSize:9, fontWeight:700, color:'#94a3b8' }}>Vista actual: <span style={{ color:C.navy, fontWeight:900 }}>{vistaActiva}</span>{semestreRef?.current && <span style={{ color:C.gold, marginLeft:8 }}>· Sem. {semestreRef.current}°</span>}</div></div> <div style={{ padding:'14px 16px', flexShrink:0, borderBottom:'1px solid #f1f5f9' }}><div style={{ fontSize:9, fontWeight:900, color:'#94a3b8', marginBottom:8 }}>Nueva Observación</div><textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escriba aquí su observación..." rows={4} style={{ width:'100%', resize:'vertical', borderRadius:10, padding:'10px 12px', fontSize:12, border:`1px solid ${texto.trim()?'#c4b5fd':'#e2e8f0'}`, background:'#f8fafc' }} />{exito && <div style={{ marginTop:6, padding:'7px 10px', background:'#dcfce7', borderRadius:8 }}><CheckCircle size={13} style={{ color:'#15803d' }}/> <span style={{ fontSize:11, fontWeight:700, color:'#15803d' }}>Enviada ✓</span></div>}<button onClick={handleEnviar} disabled={!texto.trim() || enviando} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:10, border:'none', background:texto.trim()?C.navy:'#e2e8f0', color:texto.trim()?C.gold:'#94a3b8', fontSize:11, fontWeight:900, cursor:texto.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><Send size={12}/> {enviando ? 'Enviando...' : 'Enviar a Validación'}</button></div> <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}><div style={{ fontSize:9, fontWeight:900, color:'#94a3b8', marginBottom:8 }}>Enviadas ({enviadas.length})</div>{enviadas.length === 0 && <div style={{ color:'#cbd5e1', textAlign:'center', padding:'18px 0' }}>Sin observaciones aún</div>}{enviadas.map(o => ( <div key={o.id} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 12px', marginBottom:8, border:'1px solid #f1f5f9' }}><div style={{ fontSize:10, color:C.navy, marginBottom:4 }}>{o.texto}</div><div style={{ fontSize:8, color:'#94a3b8' }}>Vista: {o.vista}</div></div> ))}</div> </div> )} <button className="obs-flotante-trigger" onClick={() => setAbierto(prev => !prev)} title="Observaciones"><MessageSquare size={22}/>{enviadas.length > 0 && <span className="obs-badge">{enviadas.length > 9 ? '9+' : enviadas.length}</span>}</button> </div> );
};

// Componente principal
export function Mod4HorariosView({ horario, docentes = [], aulas = [], materias = [], grupos = [], estadoHorario, onCambio, onObservacion, setGrupos, usuario, SEMESTRES = DEFAULT_SEMESTRES }) {
  const rol = usuario?.rol || '';
  const esDDE = rol === 'DDE' || rol === 'Administrador' || rol === 'admin' || !rol;
  const esJefeCarrera = rol === 'JefeCarrera' || rol === 'Jefe de Carrera';
  const esDocente = rol === 'Docente';
  const puedeEditar = esDDE && estadoHorario !== 'aprobado';
  const puedeObservar = esJefeCarrera || esDocente;

  const TABS_DDE_Y_JEFE = [ { id:'general', label:'Vista General', icon:<Calendar size={13}/> }, { id:'grupo', label:'Por Grupo', icon:<Layers size={13}/> }, { id:'docente', label:'Por Docente', icon:<Users size={13}/> }, { id:'aula', label:'Por Aula', icon:<Building2 size={13}/> }, { id:'buscar', label:'Buscar', icon:<Filter size={13}/> } ];
  const TABS_DOCENTE = [ { id:'docente', label:'Mi Horario', icon:<UserCircle size={13}/> }, { id:'buscar', label:'Buscar', icon:<Filter size={13}/> } ];
  const TABS = esDocente ? TABS_DOCENTE : TABS_DDE_Y_JEFE;

  const [vistaActiva, setVistaActiva] = useState(esDocente ? 'docente' : 'general');
  const [semestreActivo, setSemestreActivo] = useState(SEMESTRES[0]);
  const [filtroDocente, setFiltroDocente] = useState(usuario?.docenteId || docentes[0]?.id || '');
  const [filtroAula, setFiltroAula] = useState(aulas[0]?.id || '');
  const semestreRef = useRef(semestreActivo);
  semestreRef.current = semestreActivo;
  const filtroDocenteEfectivo = esDocente ? (usuario?.docenteId || filtroDocente) : filtroDocente;

  const [searchDocente, setSearchDocente] = useState('Todos');
  const [searchMateria, setSearchMateria] = useState('Todas');
  const [searchSemestre, setSearchSemestre] = useState('Todos');
  const [searchDia, setSearchDia] = useState('Todos');
  const [searchTipoPeriodo, setSearchTipoPeriodo] = useState('Todos');

  const [editModeGeneral, setEditModeGeneral] = useState(false);
  const [editModeDocente, setEditModeDocente] = useState(false);
  const [editModeGrupo, setEditModeGrupo] = useState(false);
  const [editModeAula, setEditModeAula] = useState(false);
  const [celdaSel, setCeldaSel] = useState(null);
  const [modalCelda, setModalCelda] = useState(null);
  const [modalDocNewVal, setModalDocNewVal] = useState('');
  const [modalAulaNewVal, setModalAulaNewVal] = useState('');
  const [modalReasignAula, setModalReasignAula] = useState(null);
  const historial = useRef([]);
  const pushHistory = h => { historial.current = [...historial.current.slice(-19), structuredClone(h)]; };
  const handleUndo = () => { if (historial.current.length) onCambio(historial.current.pop()); };
  const getColor = useCallback(mId => getColorBg(mId, materias), [materias]);
  const getBorderColor = useCallback(mId => getColorBorder(mId, materias), [materias]);
  const editMode = useMemo(() => ({ general:editModeGeneral, docente:editModeDocente, grupo:editModeGrupo, aula:editModeAula }[vistaActiva] ?? false), [vistaActiva, editModeGeneral, editModeDocente, editModeGrupo, editModeAula]);
  const setEditModeCurrent = val => { if (vistaActiva==='general') setEditModeGeneral(val); else if (vistaActiva==='docente') setEditModeDocente(val); else if (vistaActiva==='grupo') setEditModeGrupo(val); else if (vistaActiva==='aula') setEditModeAula(val); if (!val) setCeldaSel(null); };
  const conflictos = useMemo(() => horario ? detectConfl(horario, docentes, aulas, grupos, SEMESTRES) : [], [horario, docentes, aulas, grupos, SEMESTRES]);
  const horasDoc = useMemo(() => calculateTeacherHours(horario, docentes, SEMESTRES), [horario, docentes, SEMESTRES]);
  const ocupancyAula = useMemo(() => calculateAulaOccupancy(horario, aulas, SEMESTRES), [horario, aulas, SEMESTRES]);

  const handleCellSwap = useCallback((dia, periodo, sem) => { if (!editMode || !puedeEditar || !horario) return; if (celdaSel) { if (celdaSel.dia===dia && celdaSel.periodo===periodo && celdaSel.sem===sem) { setCeldaSel(null); return; } pushHistory(horario); onCambio(swapScheduleCells(horario, celdaSel, { sem, dia, periodo })); setCeldaSel(null); } else { if (horario[sem]?.[dia]?.[periodo]) setCeldaSel({ dia, periodo, sem }); } }, [editMode, puedeEditar, horario, celdaSel, onCambio]);
  const handleOpenModal = useCallback((dia, periodo, sem) => { if (!puedeEditar) return; const c = horario?.[sem]?.[dia]?.[periodo]; if (!c) return; setModalCelda({ dia, periodo, sem }); setModalDocNewVal(c.docenteId || ''); setModalAulaNewVal(c.aulaId || ''); }, [puedeEditar, horario]);
  const handleSaveReassign = () => { if (!modalCelda || !horario) return; const { dia, periodo, sem } = modalCelda; pushHistory(horario); onCambio(updateScheduleCellDetails(horario, sem, dia, periodo, modalDocNewVal, modalAulaNewVal || null)); setModalCelda(null); };
  const handleClearCell = () => { if (!modalCelda || !horario) return; const { dia, periodo, sem } = modalCelda; pushHistory(horario); onCambio(clearScheduleCell(horario, sem, dia, periodo)); setModalCelda(null); };
  const handleClearAll = () => { if (!window.confirm('¿Borrar toda la carga académica?')) return; pushHistory(horario); onCambio(SEMESTRES.reduce((acc, s) => { acc[s]={}; return acc; }, {})); };
  const handleReasignarAula = (nuevaAulaId, sem) => { if (!setGrupos) return; setGrupos(reassignAulaToSemestre(grupos, nuevaAulaId, sem)); setModalReasignAula(null); };

  if (!horario || Object.keys(horario).length === 0) return <EmptyState icon={<Calendar size={48}/>} titulo="Sin horario generado" desc='Use el módulo "Generación Algorítmica (MOD-3)" para crear la base horaria.' />;

  const CeldaCom = ({ celda, dia, periodo, sem }) => { if (!celda) { if (editMode && puedeEditar) { const isTarget = !!celdaSel; return ( <div onClick={() => handleCellSwap(dia, periodo, sem)} style={{ minHeight:64, borderRadius:12, border: isTarget ? `2px dashed ${C.gold}` : '2px dashed #e2e8f0', background: isTarget ? 'rgba(200,168,75,0.08)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>{isTarget && <span style={{ fontSize:8, fontWeight:900, color:C.gold, display:'flex', alignItems:'center', gap:4 }}><ArrowLeftRight size={10}/> Mover aquí</span>}</div> ); } return <div style={{ minHeight:50 }} />; } const doc = docentes.find(d => d.id === celda.docenteId); const aulaObj = aulas.find(a => a.id === celda.aulaId); const isSel = celdaSel?.dia===dia && celdaSel?.periodo===periodo && celdaSel?.sem===sem; const cfls = conflictos.filter(c => c.sem===sem && c.dia===dia && c.periodo===periodo); const hasConfl = cfls.length > 0; const bg = hasConfl ? '#fff5f5' : getColor(celda.id || celda.materiaId); const bc = hasConfl ? '#fca5a5' : (isSel ? C.gold : getBorderColor(celda.id || celda.materiaId)); return ( <div onClick={() => editMode && puedeEditar && handleCellSwap(dia, periodo, sem)} onContextMenu={e => { e.preventDefault(); editMode && puedeEditar && handleOpenModal(dia, periodo, sem); }} style={{ position:'relative', padding:'7px 9px', borderRadius:12, minHeight:64, border:`2px solid ${bc}`, background:bg, cursor: (editMode && puedeEditar) ? 'pointer' : 'default' }}><div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6, marginBottom:3 }}><div style={{ fontSize:10, fontWeight:900, color:C.navy, flex:1 }}>{celda.nombre}</div>{celda.tipoPeriodo && <Badge tipo={celda.tipoPeriodo}/>}</div>{doc ? <div style={{ fontSize:9, color:'#475569', display:'flex', alignItems:'center', gap:4 }}><UserCircle size={9}/> {doc.nombre}</div> : <div style={{ fontSize:9, color:'#f87171' }}>Sin docente</div>}{aulaObj && <div style={{ fontSize:8, color:'#64748b', display:'flex', alignItems:'center', gap:3 }}><MapPin size={8}/> {aulaObj.nombre}</div>}{hasConfl && <div style={{ marginTop:5, display:'flex', flexDirection:'column', gap:3 }}>{cfls.map((cf,i) => <ConflictPill key={i} msg={cf.msg} tipo={cf.tipo}/>)}</div>}</div> ); };

  const EMIHeader = ({ sem }) => { const grupoAula = grupos.find(g => g.semestre === sem)?.aulaFijaId; const aulaAsig = aulas.find(a => a.id === grupoAula); return ( <div style={{ background:'white', padding:'20px 32px 12px' }}><div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #f1f5f9', paddingBottom:12, marginBottom:8 }}><div><div style={{ fontSize:10, fontWeight:900, color:C.navy }}>Escuela Militar de Ingeniería</div><div style={{ fontSize:9, color:'#64748b' }}>"Mcal. Antonio José de Sucre" - Unidad Académica La Paz</div></div><div style={{ textAlign:'right' }}><div style={{ display:'flex', gap:8, fontSize:9, marginBottom:1 }}><span style={{ fontWeight:900 }}>Carrera:</span><span>INGENIERÍA DE SISTEMAS</span></div><div style={{ display:'flex', gap:8, fontSize:9, marginBottom:1 }}><span style={{ fontWeight:900 }}>Semestre:</span><span>{sem}°</span></div><div style={{ display:'flex', gap:8, fontSize:9 }}><span style={{ fontWeight:900 }}>Aula Fija:</span><span>{aulaAsig?.nombre || 'No asignada'}</span></div></div></div><div style={{ fontSize:16, letterSpacing:'0.3em', textAlign:'center', fontWeight:900, color:C.navy }}>HORARIO DE CLASES</div></div> ); };

  const EMISummaryTable = ({ sem }) => { const semMaterias = materias.filter(m => m.semestre === sem); return ( <div style={{ padding:'16px 32px 24px', borderTop:'1px solid #f1f5f9' }}><div style={{ fontSize:9, fontWeight:900, color:'#94a3b8', marginBottom:10 }}>Resumen de Componentes Docentes</div><table style={{ width:'100%', borderCollapse:'collapse', fontSize:10 }}><thead><tr style={{ background:'#f8fafc' }}>{['Asignatura','Docente','Teoría','Práctica','Lab.','Total'].map(h => <th key={h} style={{ border:'1px solid #e2e8f0', padding:'6px 8px', textAlign:'left', fontSize:8 }}>{h}</th>)}</tr></thead><tbody>{semMaterias.map(m => { const doc = docentes.find(d => d.id === m.docenteId); return <tr key={m.id}><td style={{ border:'1px solid #e2e8f0', padding:'6px 8px' }}><div style={{ display:'flex', alignItems:'center', gap:8 }}><div style={{ width:8, height:16, borderRadius:4, background:getColor(m.id) }}/><span style={{ fontWeight:700 }}>{m.nombre}</span></div></td><td>{doc?.nombre||'—'}</td><td style={{ textAlign:'center' }}>{m.t||0}</td><td style={{ textAlign:'center' }}>{m.p||0}</td><td style={{ textAlign:'center' }}>{m.l||0}</td><td style={{ textAlign:'center', fontWeight:900, background:C.navy, color:C.gold }}>{m.periodos||((m.t||0)+(m.p||0)+(m.l||0))}</td></tr>; })}</tbody><tfoot><tr style={{ background:C.navy, color:'white' }}><td colSpan={2} style={{ padding:'6px 8px', textAlign:'right' }}>Carga Total:</td><td style={{ textAlign:'center' }}>{semMaterias.reduce((a,m)=>a+(m.t||0),0)}</td><td style={{ textAlign:'center' }}>{semMaterias.reduce((a,m)=>a+(m.p||0),0)}</td><td style={{ textAlign:'center' }}>{semMaterias.reduce((a,m)=>a+(m.l||0),0)}</td><td style={{ textAlign:'center', background:C.gold, color:C.navy }}>{semMaterias.reduce((a,m)=>a+(m.periodos||0),0)} Hrs</td></tr></tfoot></table></div> ); };

  const GridBody = ({ sem, diasFiltro = [0,1,2,3,4] }) => ( <div style={{ overflowX:'auto', borderLeft:'1px solid #f1f5f9', borderRight:'1px solid #f1f5f9' }}><table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}><thead><tr style={{ background:'#f8fafc' }}><th colSpan={2} style={{ padding:'10px 12px', width:80 }}>Hora</th>{diasFiltro.map(d => <th key={d} style={{ padding:'10px 12px', background:C.navy, color:C.gold }}>{DIAS[d]}</th>)}</tr></thead><tbody>{RENDER_SLOTS.map((slot, si) => { if (slot.type === 'break') return <tr key={si} style={{ background:'#fffbeb' }}><td colSpan={2} style={{ padding:'4px 8px', textAlign:'center' }}>{slot.inicio}–{slot.fin}</td><td colSpan={diasFiltro.length} style={{ textAlign:'center', fontStyle:'italic', color:'#92400e' }}>RECESO</td></tr>; return <tr key={si} style={{ borderBottom:'1px solid #f1f5f9' }}><td style={{ background:'#f8fafc', borderRight:'1px solid #e2e8f0', padding:'6px 8px', textAlign:'center' }}><div>P{slot.idx+1}</div><div style={{ fontSize:8 }}>{slot.inicio}</div></td>{diasFiltro.map(d => <td key={d} style={{ padding:5, verticalAlign:'top' }}><CeldaCom celda={horario?.[sem]?.[d]?.[slot.idx] || null} dia={d} periodo={slot.idx} sem={sem}/></td>)}</tr>; })}</tbody></table></div> );

  const ConflictPanel = ({ lista = conflictos, onResolve }) => { if (!lista.length) return null; return ( <div style={{ padding:'18px 20px', border:'2px solid #fecaca', background:'#fff5f5', borderRadius:20 }}><div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}><div style={{ width:44, height:44, borderRadius:14, background:'#dc2626', color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}><AlertTriangle size={22}/></div><div><div style={{ fontSize:14, fontWeight:900, color:'#7f1d1d' }}>{lista.length} Conflicto(s)</div><div style={{ fontSize:10 }}>Requieren corrección para validar.</div></div>{onResolve && puedeEditar && <button onClick={onResolve} style={{ padding:'8px 18px', borderRadius:10, background:C.navy, color:C.gold, border:'none', fontWeight:900 }}>Resolver</button>}</div><div style={{ display:'flex', flexWrap:'wrap', gap:8, maxHeight:160, overflowY:'auto' }}>{lista.map((c,i) => <div key={i} style={{ background:'white', borderRadius:10, padding:'8px 12px', border:'1px solid #fecaca' }}><span style={{ fontSize:8, fontWeight:900 }}>{c.msg}</span><div style={{ fontSize:9 }}>{DIAS[c.dia]}, P{c.periodo+1} ({c.sem}° Sem)</div></div>)}</div></div> ); };

  const ViewGeneral = () => ( <div style={{ display:'flex', flexDirection:'column', gap:24 }}><div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px,1fr))', gap:14 }}><StatCard label="Semestres" value={`${SEMESTRES.length} Grupos`} detail="Carga total" icon={<Layers size={20}/>} bg="#e0f2fe" color="#0369a1"/><StatCard label="Docentes" value={docentes.length} detail="Activos" icon={<Users size={20}/>} bg="#dcfce7" color="#15803d"/><StatCard label="Aulas" value={aulas.length} detail="Infraestructura" icon={<Building2 size={20}/>} bg="#fef9c3" color="#92400e"/><StatCard label="Conflictos" value={conflictos.length===0?'Sin cruces':`${conflictos.length}`} detail={conflictos.length===0?'Horario limpio':'Requieren atención'} icon={conflictos.length?<AlertTriangle size={20}/>:<CheckCircle size={20}/>} bg={conflictos.length?'#fee2e2':'#e0f2fe'} color={conflictos.length?'#dc2626':'#0369a1'} pulse={conflictos.length>0}/></div>{editModeGeneral && puedeEditar && ( <div style={{ background:'#fffbeb', border:'2px dashed #fcd34d', borderRadius:16, padding:'16px 20px' }}><div style={{ display:'flex', justifyContent:'space-between' }}><div><strong>Modo Edición — Vista General</strong><br/>Clic: seleccionar, clic en otra: intercambiar. Clic derecho: reasignar.</div><div style={{ display:'flex', gap:8 }}><button onClick={handleUndo} disabled={!historial.current.length} style={{ padding:'8px 16px', borderRadius:10, border:'1px solid #e2e8f0' }}><RotateCcw size={13}/> Deshacer</button><button onClick={handleClearAll} style={{ padding:'8px 16px', background:'#fef2f2', color:'#dc2626', borderRadius:10 }}><Trash2 size={13}/> Borrar Todo</button><button onClick={()=>{ setEditModeGeneral(false); setCeldaSel(null); }} style={{ background:C.navy, color:C.gold, padding:'8px 20px', borderRadius:10 }}>Finalizar Edición</button></div></div></div> )}<ConflictPanel onResolve={!editModeGeneral && puedeEditar ? ()=>setEditModeGeneral(true) : undefined} />{SEMESTRES.map(s => <div key={s} style={{ background:'white', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden' }}><EMIHeader sem={s}/><GridBody sem={s}/><EMISummaryTable sem={s}/></div>)}</div> );

  const ViewGrupo = () => { const [filtroDia, setFiltroDia] = useState('Todos'); const diasFiltro = filtroDia==='Todos' ? [0,1,2,3,4] : [DIAS.indexOf(filtroDia)]; return ( <div style={{ display:'flex', flexDirection:'column', gap:18 }}><div style={{ background:'white', borderRadius:20, padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}><SectionTitle icon={<Calendar size={22}/>} title={`Grupo ${semestreActivo}° Semestre`} subtitle="Visor por Grupo"/><div style={{ display:'flex', gap:6 }}>{SEMESTRES.map(s => <button key={s} onClick={()=>{ setSemestreActivo(s); semestreRef.current=s; }} style={{ width:44, height:44, borderRadius:12, fontWeight:900, background:semestreActivo===s?C.navy:'#f1f5f9', color:semestreActivo===s?C.gold:'#64748b' }}>{s}°</button>)}</div></div><div style={{ display:'flex', gap:6 }}>{['Todos',...DIAS].map(d => <button key={d} onClick={()=>setFiltroDia(d)} style={{ padding:'7px 16px', borderRadius:10, background:filtroDia===d?C.navy:'white', color:filtroDia===d?C.gold:'#64748b' }}>{d}</button>)}</div>{editModeGrupo && puedeEditar && <div>Modo edición activo</div>}<ConflictPanel lista={conflictos.filter(c=>c.sem===semestreActivo)} onResolve={!editModeGrupo && puedeEditar ? ()=>setEditModeGrupo(true) : undefined} /><div style={{ background:'white', borderRadius:20, overflow:'hidden' }}><EMIHeader sem={semestreActivo}/><GridBody sem={semestreActivo} diasFiltro={diasFiltro}/><EMISummaryTable sem={semestreActivo}/></div></div> ); };

  const ViewDocente = () => { const docId = filtroDocenteEfectivo; const doc = docentes.find(d => d.id === docId); const dConfl = conflictos.filter(c => { const cell = horario?.[c.sem]?.[c.dia]?.[c.periodo]; return cell?.docenteId === docId; }); return ( <div style={{ display:'flex', flexDirection:'column', gap:18 }}><div style={{ background:'white', borderRadius:20, padding:'24px 28px', display:'flex', justifyContent:'space-between', alignItems:'center' }}><SectionTitle icon={<UserCircle size={22}/>} title={esDocente ? `Mi Horario — ${doc?.nombre||''}` : "Agenda Docente"} subtitle="Horario Personal"/>{!esDocente && <div style={{ minWidth:260 }}><Sel value={filtroDocente} onChange={e=>setFiltroDocente(e.target.value)}>{docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</Sel></div>}</div>{editModeDocente && puedeEditar && <div>Modo edición activo</div>}<ConflictPanel lista={dConfl} onResolve={undefined} />{doc ? ( <><div style={{ background:'white', borderRadius:20, overflow:'hidden' }}><div style={{ padding:'20px 24px', background:'#f8fafc', display:'flex', alignItems:'center', gap:16 }}><div style={{ width:48, height:48, borderRadius:14, background:'#6366f1', color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}><Users size={24}/></div><div><div style={{ fontSize:9, fontWeight:900, color:'#94a3b8' }}>Planificación Individual</div><div style={{ fontSize:18, fontWeight:900, color:C.navy }}>{doc.nombre}</div></div><div style={{ marginLeft:'auto', padding:'10px 20px', background:C.navy, borderRadius:14 }}><span style={{ fontSize:28, fontWeight:900, color:C.gold }}>{horasDoc[docId]||0}</span><span style={{ fontSize:8, color:'#94a3b8' }}> períodos/sem</span></div></div><div style={{ overflowX:'auto' }}><table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}><thead><tr><th>Hora</th>{DIAS.map(d => <th key={d}>{d}</th>)}</tr></thead><tbody>{RENDER_SLOTS.map((slot, si) => { if (slot.type==='break') return <tr key={si}><td colSpan={6} style={{ textAlign:'center' }}>RECESO</td></tr>; return <tr key={si}><td style={{ background:'#f8fafc', textAlign:'center' }}>P{slot.idx+1}<br/>{slot.inicio}</td>{DIAS.map((_, di) => { let cell = null, matchedSem = null; for (const sem of SEMESTRES) { const c = horario?.[sem]?.[di]?.[slot.idx]; if (c?.docenteId === docId) { cell = c; matchedSem = sem; break; } } return <td key={di} style={{ padding:5 }}><CeldaCom celda={cell} dia={di} periodo={slot.idx} sem={matchedSem}/></td>; })}</tr>; })}</tbody></table></div></div><div style={{ background:'white', borderRadius:20, padding:'24px 28px' }}><div style={{ fontSize:9, fontWeight:900, color:'#94a3b8' }}>Materias Asignadas</div>{materias.filter(m => m.docenteId === docId).map(m => <div key={m.id} style={{ padding:'8px 12px', background:'#f8fafc', marginBottom:6, borderRadius:10 }}>{m.nombre} ({m.semestre}° Sem)</div>)}</div></> ) : <EmptyState icon={<UserCircle size={48}/>} titulo="Seleccione un docente"/>}</div> ); };

  const ViewAula = () => { const [modoMapa, setModoMapa] = useState(true); const aula = aulas.find(a => a.id === filtroAula); const occ = ocupancyAula[filtroAula] || { ocupados:0, total:0, pct:0 }; const aulaToSem = {}; grupos.forEach(g => { if (g.aulaFijaId) aulaToSem[g.aulaFijaId] = g.semestre; }); return ( <div style={{ display:'flex', flexDirection:'column', gap:18 }}><div style={{ background:'white', borderRadius:20, padding:'24px 28px', display:'flex', justifyContent:'space-between' }}><SectionTitle icon={<Building2 size={22}/>} title="Uso de Ambientes" subtitle="Ocupación"/><div><button onClick={()=>setModoMapa(!modoMapa)} style={{ padding:'6px 14px', borderRadius:10, background:C.navy, color:C.gold }}>{modoMapa ? 'Ver Grilla' : 'Ver Mapa'}</button></div></div>{editModeAula && puedeEditar && <div>Modo edición activo</div>}<ConflictPanel lista={conflictos.filter(c => horario?.[c.sem]?.[c.dia]?.[c.periodo]?.aulaId === filtroAula)} onResolve={undefined} />{modoMapa ? ( <div style={{ background:'white', borderRadius:20, padding:'20px' }}><div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:16 }}><div><div style={{ fontWeight:900, marginBottom:10 }}>Bloque A</div>{aulas.filter((_,i)=>i%2===0).map(a => <div key={a.id} onClick={()=>setFiltroAula(a.id)} style={{ border:`2px solid ${a.id===filtroAula?C.gold:'#e2e8f0'}`, borderRadius:12, padding:12, marginBottom:8, cursor:'pointer' }}><div><strong>{a.nombre}</strong> (Cap.{a.capacidad})</div><div>{aulaToSem[a.id] ? `${aulaToSem[a.id]}° Sem` : 'Libre'}</div><div style={{ fontSize:8, marginTop:4 }}>{occ.pct}% uso</div>{editModeAula && puedeEditar && <button onClick={()=>setModalReasignAula({ aulaId:a.id, semActual:aulaToSem[a.id] })} style={{ marginTop:8, fontSize:8, border:'1px solid gold', borderRadius:6, padding:'2px 6px' }}>Reasignar</button>}</div>)}</div><div className="campus-pasillo">Pasillo Central</div><div><div style={{ fontWeight:900, marginBottom:10 }}>Bloque B</div>{aulas.filter((_,i)=>i%2!==0).map(a => <div key={a.id} onClick={()=>setFiltroAula(a.id)} style={{ border:`2px solid ${a.id===filtroAula?C.gold:'#e2e8f0'}`, borderRadius:12, padding:12, marginBottom:8 }}><div><strong>{a.nombre}</strong></div><div>{aulaToSem[a.id] ? `${aulaToSem[a.id]}° Sem` : 'Libre'}</div></div>)}</div></div></div> ) : ( <div style={{ background:'white', borderRadius:20, overflow:'hidden' }}><div style={{ padding:'20px', background:'#f8fafc' }}><strong>{aula?.nombre}</strong> - Capacidad {aula?.capacidad} - Ocupación {occ.pct}%</div><div style={{ overflowX:'auto' }}><table style={{ width:'100%' }}><thead><tr><th>Hora</th>{DIAS.map(d => <th key={d}>{d}</th>)}</tr></thead><tbody>{RENDER_SLOTS.map((slot, si) => { if (slot.type==='break') return <tr key={si}><td colSpan={6} style={{ textAlign:'center' }}>RECESO</td></tr>; return <tr key={si}><td style={{ background:'#f8fafc', textAlign:'center' }}>P{slot.idx+1}<br/>{slot.inicio}</td>{DIAS.map((_, di) => { let cell = null, matchedSem = null; for (const sem of SEMESTRES) { const c = horario?.[sem]?.[di]?.[slot.idx]; if (c?.aulaId === filtroAula) { cell = c; matchedSem = sem; break; } } return <td key={di} style={{ padding:5 }}><CeldaCom celda={cell} dia={di} periodo={slot.idx} sem={matchedSem}/></td>; })}</tr>; })}</tbody></table></div></div> )}</div> ); };

  const ViewBuscar = () => {
    const results = useMemo(() => {
      const list = [];
      SEMESTRES.forEach((s) => {
        for (let d = 0; d < 5; d += 1) {
          for (let p = 0; p < RENDER_SLOTS.length; p += 1) {
            const c = horario?.[s]?.[d]?.[p];
            if (!c) continue;
            if (esDocente && c.docenteId !== (usuario?.docenteId || filtroDocente)) continue;
            if (searchDocente !== 'Todos' && c.docenteId !== searchDocente) continue;
            if (searchMateria !== 'Todas' && c.nombre !== searchMateria) continue;
            if (searchSemestre !== 'Todos' && String(s) !== searchSemestre) continue;
            if (searchDia !== 'Todos' && DIAS[d] !== searchDia) continue;
            if (searchTipoPeriodo !== 'Todos' && c.tipoPeriodo !== searchTipoPeriodo) continue;
            list.push({ ...c, sem: s, dia: d, p });
          }
        }
      });
      return list;
    }, [horario, esDocente, filtroDocente, usuario, searchDocente, searchMateria, searchSemestre, searchDia, searchTipoPeriodo]);

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
        <div style={{ background:'white', borderRadius:20, padding:'24px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
            <SectionTitle icon={<Filter size={22}/>} title="Búsqueda Avanzada" subtitle="Filtros"/>
            <div style={{ fontSize:28, fontWeight:900 }}>{results.length}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px,1fr))', gap:14 }}>
            {!esDocente && (
              <FormField label="Docente">
                <Sel value={searchDocente} onChange={e => setSearchDocente(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </Sel>
              </FormField>
            )}
            <FormField label="Materia">
              <Sel value={searchMateria} onChange={e => setSearchMateria(e.target.value)}>
                <option value="Todas">Todas</option>
                {[...new Set(materias.map(m => m.nombre))].map(n => <option key={n} value={n}>{n}</option>)}
              </Sel>
            </FormField>
            {!esDocente && (
              <FormField label="Semestre">
                <Sel value={searchSemestre} onChange={e => setSearchSemestre(e.target.value)}>
                  <option value="Todos">Todos</option>
                  {SEMESTRES.map(s => <option key={s} value={String(s)}>{s}°</option>)}
                </Sel>
              </FormField>
            )}
            <FormField label="Día">
              <Sel value={searchDia} onChange={e => setSearchDia(e.target.value)}>
                <option value="Todos">Todos</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </Sel>
            </FormField>
            <FormField label="Tipo">
              <Sel value={searchTipoPeriodo} onChange={e => setSearchTipoPeriodo(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Teórico">Teórico</option>
                <option value="Práctico">Práctico</option>
                <option value="Laboratorio">Laboratorio</option>
              </Sel>
            </FormField>
          </div>
        </div>

        <div style={{ background:'white', borderRadius:20, overflow:'auto' }}>
          <table style={{ width:'100%' }}>
            <thead>
              <tr>
                <th>Asignatura</th>
                <th>Docente</th>
                <th>Horario</th>
                <th>Aula</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={`${r.sem}-${r.dia}-${r.p}`}>
                  <td>{r.nombre} ({r.sem}°)</td>
                  <td>{docentes.find(d => d.id === r.docenteId)?.nombre}</td>
                  <td>{DIAS[r.dia]} P{r.p + 1}</td>
                  <td>{aulas.find(a => a.id === r.aulaId)?.nombre}</td>
                  <td>{r.tipoPeriodo && <Badge tipo={r.tipoPeriodo}/>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div style={{ padding:'64px 24px', textAlign:'center' }}>
            <div style={{ width:56, height:56, background:'#f8fafc', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', border:'1px solid #f1f5f9' }}>
              <Eye size={24} style={{ color:'#e2e8f0' }}/>
            </div>
            <div style={{ color:'#94a3b8', fontFamily:'serif', fontSize:16, fontStyle:'italic' }}>
              No se encontraron registros con los filtros aplicados.
            </div>
          </div>
        )}
      </div>
    );
  };

  const currentEditMode = { general:editModeGeneral, docente:editModeDocente, grupo:editModeGrupo, aula:editModeAula }[vistaActiva];
  return ( <div className="schedule-management-module" style={{ display:'flex', flexDirection:'column', gap:14 }}><div className="no-print" style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', padding:'8px 10px', borderRadius:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}><div style={{ display:'flex', gap:4 }}>{TABS.map(tab => <button key={tab.id} onClick={()=>setVistaActiva(tab.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, fontSize:10, fontWeight:900, background:vistaActiva===tab.id?C.navy:'transparent', color:vistaActiva===tab.id?C.gold:'#64748b' }}>{tab.icon} {tab.label}</button>)}</div><div style={{ display:'flex', gap:8, alignItems:'center' }}>{estadoHorario==='aprobado' && <span style={{ background:'#dcfce7', color:'#166534', padding:'6px 14px', borderRadius:20 }}><CheckCircle size={12}/> Aprobado</span>}{esJefeCarrera && <span style={{ background:'#ede9fe', color:'#7c3aed', padding:'6px 14px', borderRadius:20 }}><Eye size={12}/> Solo Lectura</span>}{esDocente && <span style={{ background:'#dbeafe', color:'#1d4ed8', padding:'6px 14px', borderRadius:20 }}><UserCircle size={12}/> Mi Horario</span>}{puedeEditar && vistaActiva !== 'buscar' && <button onClick={()=>setEditModeCurrent(!currentEditMode)} style={{ padding:'8px 18px', borderRadius:10, display:'flex', alignItems:'center', gap:6, background:currentEditMode?'rgba(251,191,36,0.12)':'white', color:currentEditMode?'#92400e':'#64748b', border:currentEditMode?`2px solid ${C.gold}`:'1px solid #e2e8f0' }}><Pencil size={13}/>{currentEditMode?'Editando...':'Editar'}</button>}</div></div><div className="print-container">{vistaActiva==='general' && <ViewGeneral/>}{vistaActiva==='grupo' && <ViewGrupo/>}{vistaActiva==='docente' && <ViewDocente/>}{vistaActiva==='aula' && <ViewAula/>}{vistaActiva==='buscar' && <ViewBuscar/>}</div>{puedeObservar && <PanelObservacionesFlotante usuario={usuario} vistaActiva={vistaActiva} semestreRef={semestreRef} onEnviar={onObservacion} />}{modalCelda && puedeEditar && ( <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}><div style={{ background:'white', borderRadius:20, width:460, maxWidth:'95vw' }}><div style={{ background:C.navy, padding:'20px 24px', color:'white' }}><div>Reasignar Docente/Aula</div><button onClick={()=>setModalCelda(null)} style={{ position:'absolute', right:20, top:20, background:'none', border:'none', color:'white' }}><X/></button></div><div style={{ padding:'20px 24px' }}><FormField label="Docente"><Sel value={modalDocNewVal} onChange={e=>setModalDocNewVal(e.target.value)}><option value="">— Libre —</option>{docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}</Sel></FormField><FormField label="Aula"><Sel value={modalAulaNewVal} onChange={e=>setModalAulaNewVal(e.target.value)}><option value="">— Sin aula —</option>{aulas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}</Sel></FormField><div style={{ display:'flex', gap:10, marginTop:20 }}><button onClick={handleClearCell} style={{ flex:1, padding:'10px', background:'#fef2f2', color:'#dc2626', borderRadius:10 }}>Vaciar</button><button onClick={handleSaveReassign} style={{ flex:1, padding:'10px', background:C.navy, color:C.gold, borderRadius:10 }}>Guardar</button></div></div></div></div> )}{modalReasignAula && puedeEditar && ( <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}><div style={{ background:'white', borderRadius:20, width:440 }}><div style={{ background:C.navy, padding:'20px 24px', color:'white' }}>Reasignar Aula a Semestre</div><div style={{ padding:'20px 24px' }}><div>Seleccione el semestre:</div><div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:16 }}>{SEMESTRES.map(s => <button key={s} onClick={()=>handleReasignarAula(modalReasignAula.aulaId, s)} style={{ padding:'14px', borderRadius:10, background:C.navy, color:C.gold }}>{s}°</button>)}</div><button onClick={()=>handleReasignarAula('', modalReasignAula.semActual)} style={{ marginTop:16, width:'100%', padding:'10px', background:'#fef2f2', color:'#dc2626', borderRadius:10 }}>Liberar aula</button></div></div></div> )}</div> ); }
export const ScheduleView = Mod4HorariosView;