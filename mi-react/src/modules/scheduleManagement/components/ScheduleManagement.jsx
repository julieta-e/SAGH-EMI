/**
 * ScheduleManagement.jsx — MOD-4 SAGH · Escuela Militar de Ingeniería
 * Gestión y consulta institucional del horario académico.
 *
 * EXPORTA: Mod4HorariosView (nombre original preservado para compatibilidad)
 *
 * Mejoras integradas:
 *  - Detección de conflictos por tipo (doc, aula, disponibilidad, capacidad)
 *  - Intercambio seguro con historial de deshacer (hasta 20 pasos)
 *  - Vistas: General, Por Grupo, Por Docente, Por Aula, Búsqueda Avanzada
 *  - Métricas: horas docente, ocupación de aulas
 *  - Modal de reasignación con detalle de conflictos
 *  - Colores estables por materia + badge de tipo de período
 *  - Encabezado institucional EMI + tabla resumen de materias (para impresión)
 *  - Animaciones CSS y diseño refinado institucional
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Calendar, Users, Pencil, Trash2, Save, X, Printer,
  Info, BookOpen, Filter, Layers, AlertTriangle,
  UserCircle, Building2, CheckCircle, ArrowLeftRight,
  Search, Eye, RotateCcw, MapPin, Shield,
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
} from '../backend/scheduleManagementService';
import '../styles/scheduleManagement.css';

// ─── Paleta estable de colores de materia ─────────────────────────────────────
const COLORES_BG = [
  '#dbeafe','#dcfce7','#fef9c3','#fce7f3','#ede9fe',
  '#ffedd5','#cffafe','#f1f5f9','#fef2f2','#f0fdf4',
  '#e0f2fe','#fef3c7','#d1fae5','#fde8ff','#fff7ed',
];
const COLORES_BORDER = [
  '#93c5fd','#86efac','#fde047','#f9a8d4','#c4b5fd',
  '#fdba74','#67e8f9','#cbd5e1','#fca5a5','#6ee7b7',
  '#38bdf8','#fcd34d','#34d399','#e879f9','#fb923c',
];

const getColorBg     = (mId, materias) => { const i = (materias||[]).findIndex(m => m.id === mId); return i >= 0 ? COLORES_BG[i % COLORES_BG.length] : '#f1f5f9'; };
const getColorBorder = (mId, materias) => { const i = (materias||[]).findIndex(m => m.id === mId); return i >= 0 ? COLORES_BORDER[i % COLORES_BORDER.length] : '#cbd5e1'; };

// ─── Configuración de tipos de período y conflictos ───────────────────────────
const TIPO_PERIODO_CFG = {
  'Teórico':     { bg: '#e0f2fe', color: '#075985', border: '#bae6fd', label: 'T' },
  'Práctico':    { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'P' },
  'Laboratorio': { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe', label: 'L' },
};
const CONFLICT_CFG = {
  doc:            { label: 'Cruce Docente',        color: '#b91c1c', bg: '#fee2e2', icon: '👤' },
  aula:           { label: 'Cruce de Aula',         color: '#c2410c', bg: '#ffedd5', icon: '🏛️' },
  disponibilidad: { label: 'Doc. Indisponible',     color: '#a16207', bg: '#fef9c3', icon: '⏰' },
  capacidad:      { label: 'Cap. Insuficiente',     color: '#7c3aed', bg: '#ede9fe', icon: '👥' },
};

// ─── Semestres disponibles (puede llegar por constante o por prop) ─────────────
const SEMESTRES_DEFAULT = [3, 4, 5, 6, 7, 8, 9, 10];
const SEMNOM = { 3:'Tercer',4:'Cuarto',5:'Quinto',6:'Sexto',7:'Séptimo',8:'Octavo',9:'Noveno',10:'Décimo' };

// ─── Componentes UI locales ────────────────────────────────────────────────────

/** Badge de tipo de período (T / P / L) */
const Badge = ({ tipo }) => {
  const cfg = TIPO_PERIODO_CFG[tipo];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 6px', borderRadius: 4,
      fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
};

/** Pastilla de conflicto con icono */
const ConflictPill = ({ msg, tipo }) => {
  const cfg = CONFLICT_CFG[tipo] || { color: '#b91c1c', bg: '#fee2e2', icon: '⚠️' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 9999,
      fontSize: 7, fontWeight: 900, textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color,
    }}>
      <AlertTriangle size={8} /> {msg}
    </div>
  );
};

/** Tarjeta de estadística */
const StatCard = ({ label, value, detail, icon, bg, color, pulse }) => (
  <div className="stat-card" style={{
    padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
    outline: pulse ? '2px solid #fca5a5' : 'none',
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 16,
      background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: 20,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 900, color: C.navy, fontFamily: 'serif', lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginTop: 2 }}>{detail}</div>
    </div>
  </div>
);

/** Título de sección con icono */
const SectionTitle = ({ icon, title, subtitle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{
      width: 44, height: 44, borderRadius: 14, background: C.navy, color: C.gold,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      boxShadow: '0 4px 14px rgba(15,36,68,0.2)',
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8' }}>{subtitle}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.navy, fontFamily: 'serif' }}>{title}</div>
    </div>
  </div>
);

/** Select estilizado */
const Select = ({ value, onChange, children, style = {} }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      ...inputStyle,
      width: '100%', padding: '8px 12px', borderRadius: 10,
      border: '1px solid #e2e8f0', background: 'white',
      fontSize: 12, fontWeight: 700, color: C.navy,
      cursor: 'pointer', outline: 'none',
      ...style,
    }}
  >
    {children}
  </select>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — exportado con el nombre original para compatibilidad
// ═══════════════════════════════════════════════════════════════════════════════

export function Mod4HorariosView({
  horario,
  docentes   = [],
  aulas      = [],
  materias   = [],
  grupos     = [],
  estadoHorario,
  onCambio,
  setGrupos,
  usuario,
  SEMESTRES,
}) {
  const SEMS = SEMESTRES || SEMESTRES_DEFAULT;
  const rol = usuario?.rol || '';
  const puedeEditar = (rol === 'DDE' || rol === 'Administrador' || !rol) && estadoHorario !== 'aprobado';

  // ── Navegación de vistas
  const [vistaActiva, setVistaActiva]       = useState('general');
  const [semestreActivo, setSemestreActivo] = useState(SEMS[0] ?? 3);
  const [filtroDocente, setFiltroDocente]   = useState(usuario?.docenteId || docentes[0]?.id || '');
  const [filtroAula, setFiltroAula]         = useState(aulas[0]?.id || '');

  // ── Filtros de búsqueda avanzada
  const [searchDocente,    setSearchDocente]    = useState('Todos');
  const [searchMateria,    setSearchMateria]    = useState('Todas');
  const [searchSemestre,   setSearchSemestre]   = useState('Todos');
  const [searchDia,        setSearchDia]        = useState('Todos');
  const [searchTipoPeriodo,setSearchTipoPeriodo]= useState('Todos');

  // ── Modos de edición por vista
  const [editModeGeneral, setEditModeGeneral] = useState(false);
  const [editModeDocente, setEditModeDocente] = useState(false);
  const [editModeGrupo,   setEditModeGrupo]   = useState(false);
  const [editModeAula,    setEditModeAula]    = useState(false);

  // ── Estado de selección para swap y modal
  const [celdaSel,       setCeldaSel]       = useState(null);
  const [modalCelda,     setModalCelda]     = useState(null);
  const [modalDocNewVal, setModalDocNewVal] = useState('');
  const [modalAulaNewVal,setModalAulaNewVal]= useState('');

  // ── Historial de deshacer (hasta 20 pasos)
  const historial = useRef([]);
  const pushHistory = (h) => { historial.current = [...historial.current.slice(-19), structuredClone(h)]; };
  const handleUndo  = () => {
    if (!historial.current.length) return;
    onCambio(historial.current.pop());
  };

  // ── Helpers de color de materia
  const getColor       = useCallback((mId) => getColorBg(mId, materias),     [materias]);
  const getBorderColor = useCallback((mId) => getColorBorder(mId, materias), [materias]);

  // ── editMode activo según vista
  const editMode = useMemo(() => ({
    general: editModeGeneral, docente: editModeDocente,
    grupo: editModeGrupo, aula: editModeAula,
  }[vistaActiva] ?? false), [vistaActiva, editModeGeneral, editModeDocente, editModeGrupo, editModeAula]);

  const setEditModeCurrent = (val) => {
    if (vistaActiva === 'general') setEditModeGeneral(val);
    else if (vistaActiva === 'docente') setEditModeDocente(val);
    else if (vistaActiva === 'grupo')   setEditModeGrupo(val);
    else if (vistaActiva === 'aula')    setEditModeAula(val);
    if (!val) setCeldaSel(null);
  };

  // ── Métricas reactivas
  const conflictos   = useMemo(() => horario ? detectConfl(horario, docentes, aulas, grupos, SEMS) : [], [horario, docentes, aulas, grupos, SEMS]);
  const horasDoc     = useMemo(() => calculateTeacherHours(horario, docentes, SEMS),  [horario, docentes, SEMS]);
  const ocupancyAula = useMemo(() => calculateAulaOccupancy(horario, aulas, SEMS),   [horario, aulas, SEMS]);

  // ── Operación de swap (selección doble)
  const handleCellSwap = useCallback((dia, periodo, sem) => {
    if (!editMode || !puedeEditar || !horario) return;
    if (celdaSel) {
      if (celdaSel.dia === dia && celdaSel.periodo === periodo && celdaSel.sem === sem) {
        setCeldaSel(null); return;
      }
      pushHistory(horario);
      onCambio(swapScheduleCells(horario, celdaSel, { sem, dia, periodo }));
      setCeldaSel(null);
    } else {
      if (horario[sem]?.[dia]?.[periodo]) setCeldaSel({ dia, periodo, sem });
    }
  }, [editMode, puedeEditar, horario, celdaSel, onCambio]);

  // ── Abrir modal de reasignación
  const handleOpenModal = useCallback((dia, periodo, sem) => {
    if (!puedeEditar) return;
    const c = horario?.[sem]?.[dia]?.[periodo];
    if (!c) return;
    setModalCelda({ dia, periodo, sem });
    setModalDocNewVal(c.docenteId || '');
    setModalAulaNewVal(c.aulaId || '');
  }, [puedeEditar, horario]);

  // ── Guardar reasignación
  const handleSaveReassign = () => {
    if (!modalCelda || !horario) return;
    const { dia, periodo, sem } = modalCelda;
    pushHistory(horario);
    onCambio(updateScheduleCellDetails(horario, sem, dia, periodo, modalDocNewVal, modalAulaNewVal || null));
    setModalCelda(null);
  };

  // ── Vaciar celda
  const handleClearCell = () => {
    if (!modalCelda || !horario) return;
    const { dia, periodo, sem } = modalCelda;
    pushHistory(horario);
    onCambio(clearScheduleCell(horario, sem, dia, periodo));
    setModalCelda(null);
  };

  // ── Borrar todo el horario
  const handleClearAll = () => {
    if (!window.confirm('¿Confirma BORRAR TODA la carga académica? Esta acción no se puede deshacer.')) return;
    pushHistory(horario);
    onCambio(SEMS.reduce((acc, s) => { acc[s] = {}; return acc; }, {}));
  };

  // ── Imprimir
  const ejecutarImpresion = () => window.print();

  // ── Renderizado defensivo inicial
  if (!horario || Object.keys(horario).length === 0) {
    return (
      <EmptyState
        icon={<Calendar size={48} />}
        titulo="Sin horario generado disponible"
        desc='Diríjase al módulo "Generación Algorítmica (MOD-3)" para establecer la base horaria del ciclo académico.'
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Celda de la grilla horaria
  // ─────────────────────────────────────────────────────────────────────────────
  const CeldaCom = ({ celda, dia, periodo, sem }) => {
    if (!celda) {
      if (editMode && puedeEditar) {
        const isTarget = !!celdaSel;
        return (
          <div
            onClick={() => handleCellSwap(dia, periodo, sem)}
            style={{
              minHeight: 64, borderRadius: 12,
              border: isTarget ? `2px dashed ${C.gold}` : '2px dashed #e2e8f0',
              background: isTarget ? `rgba(200,168,75,0.08)` : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            {isTarget && (
              <span style={{ fontSize: 8, fontWeight: 900, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeftRight size={10} /> Mover aquí
              </span>
            )}
          </div>
        );
      }
      return <div style={{ minHeight: 50 }} />;
    }

    const doc     = docentes.find(d => d.id === celda.docenteId);
    const aulaObj = aulas.find(a => a.id === celda.aulaId);
    const isSel   = celdaSel?.dia === dia && celdaSel?.periodo === periodo && celdaSel?.sem === sem;
    const matchedCfls = conflictos.filter(c => c.sem === sem && c.dia === dia && c.periodo === periodo);
    const hasConfl    = matchedCfls.length > 0;
    const bg          = hasConfl ? '#fff5f5' : getColor(celda.id || celda.materiaId || celda.nombre);
    const borderColor = hasConfl ? '#fca5a5' : (isSel ? C.gold : getBorderColor(celda.id || celda.materiaId || celda.nombre));

    return (
      <div
        className={hasConfl ? 'cell-conflict' : isSel ? 'cell-selected' : ''}
        onClick={() => editMode && puedeEditar && handleCellSwap(dia, periodo, sem)}
        onContextMenu={e => { e.preventDefault(); editMode && puedeEditar && handleOpenModal(dia, periodo, sem); }}
        title={editMode ? 'Clic: intercambiar · Clic derecho: reasignar' : celda.nombre}
        style={{
          position: 'relative',
          padding: '7px 9px',
          borderRadius: 12,
          minHeight: 64,
          border: `2px solid ${borderColor}`,
          background: bg,
          cursor: editMode ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          boxShadow: isSel ? `0 0 0 3px rgba(200,168,75,0.3)` : '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* Nombre de materia + badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.navy, lineHeight: 1.25, textTransform: 'uppercase', flex: 1 }}>
            {celda.nombre}
          </div>
          {celda.tipoPeriodo && <Badge tipo={celda.tipoPeriodo} />}
        </div>

        {/* Docente */}
        {doc && (
          <div style={{ fontSize: 9, color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <UserCircle size={9} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre}</span>
          </div>
        )}
        {!doc && (
          <div style={{ fontSize: 9, color: '#f87171', fontWeight: 700, marginTop: 2 }}>Sin docente asignado</div>
        )}

        {/* Aula */}
        {aulaObj && (
          <div style={{ fontSize: 8, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
            <MapPin size={8} style={{ color: '#94a3b8', flexShrink: 0 }} />
            {aulaObj.nombre}
          </div>
        )}

        {/* Indicador de asignatura crítica */}
        {celda.critica && (
          <div style={{ position: 'absolute', top: 4, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} title="Período crítico" />
        )}

        {/* Conflictos */}
        {hasConfl && (
          <div style={{ marginTop: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {matchedCfls.map((cf, i) => (
              <ConflictPill key={i} msg={cf.msg} tipo={cf.tipo} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Encabezado institucional EMI
  // ─────────────────────────────────────────────────────────────────────────────
  const EMIHeader = ({ sem }) => {
    const g = grupos.find(x => x.semestre === sem);
    const aulaAsig = aulas.find(a => a.id === g?.aulaFijaId);
    return (
      <div className="emi-header" style={{ background: 'white', padding: '20px 32px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: 12, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.navy }}>Escuela Militar de Ingeniería</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>"Mcal. Antonio José de Sucre"</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>Unidad Académica La Paz — BOLIVIA</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {[['Carrera','INGENIERÍA DE SISTEMAS'],['Semestre', SEMNOM[sem] ? SEMNOM[sem].toUpperCase() : `${sem}°`],['Curso','A'],['Gestión','I/2026']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', fontSize: 9, marginBottom: 1 }}>
                <span style={{ fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}:</span>
                <span style={{ fontWeight: 900, color: C.navy, textTransform: 'uppercase' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center', fontSize: 9, marginTop: 2 }}>
              <span style={{ fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aula:</span>
              {(editModeGeneral || editModeGrupo) && setGrupos ? (
                <select
                  value={g?.aulaFijaId || ''}
                  onChange={e => setGrupos(grupos.map(gr => gr.semestre === sem ? { ...gr, aulaFijaId: e.target.value } : gr))}
                  style={{ fontSize: 9, fontWeight: 900, background: 'white', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 6px', cursor: 'pointer' }}
                >
                  <option value="">No Asignada</option>
                  {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              ) : (
                <span style={{ fontWeight: 900, color: C.gold, background: '#fef9c3', padding: '2px 10px', borderRadius: 6, border: '1px solid #fde68a' }}>
                  {aulaAsig?.nombre?.replace('Aula ','') || 'No Asignada'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="emi-header-title" style={{ fontSize: 16, letterSpacing: '0.3em', padding: '4px 0' }}>
          Horario de Clases
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Tabla resumen de materias (al pie del horario imprimible)
  // ─────────────────────────────────────────────────────────────────────────────
  const EMISummaryTable = ({ sem }) => {
    const semMaterias = materias.filter(m => m.semestre === sem);
    return (
      <div style={{ background: 'white', padding: '16px 32px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', marginBottom: 10 }}>
          Resumen de Componentes Docentes
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Asignatura','Docente','Teoría','Práctica','Lab.','Total'].map(h => (
                <th key={h} style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', fontSize: 8, letterSpacing: '0.1em', color: C.navy }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {semMaterias.map(m => {
              const doc = docentes.find(d => d.id === m.docenteId);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 16, borderRadius: 4, background: getColor(m.id), flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: C.navy }}>{m.nombre}</span>
                    </div>
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', color: '#475569', fontWeight: 600 }}>{doc?.nombre || '—'}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{m.t || 0}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{m.p || 0}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{m.l || 0}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', fontWeight: 900, background: C.navy, color: C.gold }}>{m.periodos || ((m.t||0)+(m.p||0)+(m.l||0))}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.navy, color: 'white', fontWeight: 900, textTransform: 'uppercase', fontSize: 8 }}>
              <td colSpan={2} style={{ padding: '6px 8px', textAlign: 'right', letterSpacing: '0.1em' }}>Carga Total Semanal:</td>
              <td style={{ padding: '6px 8px', textAlign: 'center' }}>{semMaterias.reduce((a,m)=>a+(m.t||0),0)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center' }}>{semMaterias.reduce((a,m)=>a+(m.p||0),0)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center' }}>{semMaterias.reduce((a,m)=>a+(m.l||0),0)}</td>
              <td style={{ padding: '6px 8px', textAlign: 'center', background: C.gold, color: C.navy }}>
                {semMaterias.reduce((a,m)=>a+(m.periodos||(m.t||0)+(m.p||0)+(m.l||0)),0)} Hrs
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Grilla horaria (tabla de períodos × días)
  // ─────────────────────────────────────────────────────────────────────────────
  const GridBody = ({ sem, diasFiltro = [0,1,2,3,4] }) => (
    <div style={{ overflowX: 'auto', borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
      <table className="schedule-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, background: 'white', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}` }}>
            <th colSpan={2} style={{ padding: '10px 12px', width: 80, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.navy, borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Hora</th>
            {diasFiltro.map(d => (
              <th key={d} style={{ padding: '10px 12px', background: C.navy, color: C.gold, fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'serif', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                {DIAS[d]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RENDER_SLOTS.map((slot, si) => {
            if (slot.type === 'break') return (
              <tr key={si} style={{ background: '#fffbeb' }}>
                <td colSpan={2} style={{ padding: '4px 8px', borderRight: '1px solid #fde68a', fontSize: 8, fontFamily: 'monospace', color: '#d97706', textAlign: 'center' }}>{slot.inicio}–{slot.fin}</td>
                <td colSpan={diasFiltro.length} style={{ padding: '4px 12px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#92400e', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid #fde68a', borderBottom: '1px solid #fde68a' }}>
                  RECESO
                </td>
              </tr>
            );
            const pIdx = slot.idx;
            return (
              <tr key={si} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', width: 36 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: C.navy }}>P{pIdx+1}</div>
                </td>
                <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle', width: 52 }}>
                  <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.5 }}>{slot.inicio}<br/>{slot.fin}</div>
                </td>
                {diasFiltro.map(d => (
                  <td
                    key={d}
                    style={{ padding: 5, borderRight: '1px solid #f1f5f9', minWidth: 130, verticalAlign: 'top', cursor: editMode ? 'pointer' : 'default' }}
                    onContextMenu={e => { e.preventDefault(); editMode && puedeEditar && handleOpenModal(d, pIdx, sem); }}
                  >
                    <CeldaCom celda={horario?.[sem]?.[d]?.[pIdx] || null} dia={d} periodo={pIdx} sem={sem} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Banner de modo edición activo
  // ─────────────────────────────────────────────────────────────────────────────
  const EditBanner = ({ title, desc, onFinish, showClearAll, showUndo }) => (
    <div className="no-print" style={{
      background: '#fffbeb', border: '2px dashed #fcd34d', borderRadius: 16,
      padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={22} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#92400e', fontFamily: 'serif' }}>{title}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#b45309', marginTop: 2, maxWidth: 560 }}>{desc}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {showUndo && (
          <button onClick={handleUndo} disabled={!historial.current.length}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, opacity: historial.current.length ? 1 : 0.4 }}>
            <RotateCcw size={13} /> Deshacer
          </button>
        )}
        {showClearAll && (
          <button onClick={handleClearAll}
            style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Trash2 size={13} /> Borrar Todo
          </button>
        )}
        <button onClick={onFinish}
          style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: C.navy, color: C.gold, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,36,68,0.25)' }}>
          Finalizar Edición
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Subcomponente: Panel de conflictos detectados
  // ─────────────────────────────────────────────────────────────────────────────
  const ConflictPanel = ({ lista = conflictos, onResolve }) => {
    if (!lista.length) return null;
    return (
      <div className="conflict-panel no-print" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div className="alert-icon-pulse" style={{ width: 44, height: 44, borderRadius: 14, background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#7f1d1d', fontFamily: 'serif' }}>{lista.length} Conflicto{lista.length > 1 ? 's' : ''} Detectado{lista.length > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#b91c1c', marginTop: 2 }}>Solapamientos críticos que requieren corrección para validar el horario.</div>
          </div>
          {onResolve && (
            <button onClick={onResolve} style={{ padding: '8px 18px', borderRadius: 10, background: C.navy, color: C.gold, border: 'none', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              Resolver
            </button>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
          {lista.map((c, i) => {
            const cfg = CONFLICT_CFG[c.tipo] || { bg: '#fee2e2', color: '#b91c1c', icon: '⚠️' };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', minWidth: 180 }}>
                <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: cfg.color }}>{c.msg}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#334155' }}>{DIAS[c.dia]}, P{c.periodo+1} <span style={{ color: '#94a3b8' }}>({c.sem}° Sem)</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA: GENERAL — todos los semestres apilados
  // ─────────────────────────────────────────────────────────────────────────────
  const ViewGeneral = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <StatCard label="Semestres"  value={`${SEMS.length} Grupos`}     detail="Carga total académica"  icon={<Layers size={20}/>}    bg="#e0f2fe" color="#0369a1" />
        <StatCard label="Plantilla"  value={`${docentes.length} Doc.`}    detail="Docentes activos"       icon={<Users size={20}/>}     bg="#dcfce7" color="#15803d" />
        <StatCard label="Ambientes"  value={`${aulas.length} Aulas`}      detail="Infraestructura total"  icon={<Building2 size={20}/>} bg="#fef9c3" color="#92400e" />
        <StatCard
          label="Conflictos"
          value={conflictos.length === 0 ? 'Sin cruces' : `${conflictos.length} Cruces`}
          detail={conflictos.length === 0 ? 'Horario limpio ✓' : 'Requieren atención urgente'}
          icon={conflictos.length ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
          bg={conflictos.length ? '#fee2e2' : '#e0f2fe'}
          color={conflictos.length ? '#dc2626' : '#0369a1'}
          pulse={conflictos.length > 0}
        />
      </div>

      {/* Banner de edición */}
      {editModeGeneral && puedeEditar && (
        <EditBanner
          title="Modo Edición — Vista General"
          desc="Clic en una celda para seleccionarla (origen), luego clic en el destino para intercambiar. Clic derecho en cualquier celda para reasignar docente o aula."
          onFinish={() => { setEditModeGeneral(false); setCeldaSel(null); }}
          showClearAll showUndo
        />
      )}

      {/* Panel de conflictos */}
      <ConflictPanel onResolve={!editModeGeneral && puedeEditar ? () => setEditModeGeneral(true) : undefined} />

      {/* Grillas por semestre */}
      {SEMS.map(s => (
        <div key={s} id={`semestre-${s}`} className="view-transition" style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px -8px rgba(15,36,68,0.1)', overflow: 'hidden' }}>
          {/* Separador de semestre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', background: 'linear-gradient(90deg, #f8fafc 0%, white 100%)', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'rgba(15,36,68,0.05)', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1, userSelect: 'none' }}>{s}°</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: C.gold }}>Programación</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.navy, fontFamily: 'serif' }}>{SEMNOM[s] || s+'°'} Semestre</div>
            </div>
          </div>
          <EMIHeader sem={s} />
          <GridBody sem={s} />
          <EMISummaryTable sem={s} />
        </div>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA: POR GRUPO (un semestre a la vez, con filtro de día)
  // ─────────────────────────────────────────────────────────────────────────────
  const ViewGrupo = () => {
    const [filtroDia, setFiltroDia] = useState('Todos');
    const g = grupos.find(x => x.semestre === semestreActivo);
    const diasFiltro = filtroDia === 'Todos' ? [0,1,2,3,4] : [DIAS.indexOf(filtroDia)];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Header con selector de semestre */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 4px 20px -4px rgba(15,36,68,0.08)', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle icon={<Calendar size={22}/>} title={`Grupo ${semestreActivo}° Semestre`} subtitle="Visor por Grupo Académico" />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SEMS.map(s => (
              <button key={s} onClick={() => setSemestreActivo(s)} style={{
                width: 44, height: 44, borderRadius: 12, fontWeight: 900, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: semestreActivo === s ? C.navy : '#f1f5f9',
                color: semestreActivo === s ? C.gold : '#64748b',
                boxShadow: semestreActivo === s ? '0 4px 12px rgba(15,36,68,0.2)' : 'none',
              }}>{s}°</button>
            ))}
          </div>
        </div>

        {/* Filtro de día */}
        <div className="no-print" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Todos', ...DIAS].map(d => (
            <button key={d} onClick={() => setFiltroDia(d)} style={{
              padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.15s',
              background: filtroDia === d ? C.navy : 'white', color: filtroDia === d ? C.gold : '#64748b',
              border: filtroDia === d ? 'none' : '1px solid #e2e8f0',
              boxShadow: filtroDia === d ? '0 4px 10px rgba(15,36,68,0.15)' : 'none',
            }}>{d}</button>
          ))}
        </div>

        {editModeGrupo && puedeEditar && (
          <EditBanner
            title={`Modo Edición — ${semestreActivo}° Semestre`}
            desc="Clic: seleccionar celda origen. Clic en otra: intercambiar. Clic derecho: reasignar docente o aula."
            onFinish={() => { setEditModeGrupo(false); setCeldaSel(null); }}
            showUndo
          />
        )}

        <ConflictPanel lista={conflictos.filter(c => c.sem === semestreActivo)} onResolve={!editModeGrupo && puedeEditar ? () => setEditModeGrupo(true) : undefined} />

        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px -8px rgba(15,36,68,0.1)', overflow: 'hidden' }}>
          <EMIHeader sem={semestreActivo} />
          <GridBody sem={semestreActivo} diasFiltro={diasFiltro} />
          <EMISummaryTable sem={semestreActivo} />
        </div>

        {/* Ficha del grupo */}
        {g && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 2px 12px -4px rgba(15,36,68,0.07)' }}>
            <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', marginBottom: 14 }}>Datos del Grupo</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {[['Semestre',`${g.semestre}°`],['Estudiantes',g.numEstudiantes??'—'],['Aula Fija',aulas.find(a=>a.id===g.aulaFijaId)?.nombre||'No asignada'],['Materias',materias.filter(m=>m.semestre===g.semestre).length]].map(([k,v]) => (
                <div key={k} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.navy, fontFamily: 'serif' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA: POR DOCENTE — carga horaria individual
  // ─────────────────────────────────────────────────────────────────────────────
  const ViewDocente = () => {
    const doc = docentes.find(d => d.id === filtroDocente);
    const leads = materias.filter(m => m.docenteId === filtroDocente);
    const docenteConfl = conflictos.filter(c => { const cell = horario?.[c.sem]?.[c.dia]?.[c.periodo]; return cell?.docenteId === filtroDocente; });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 4px 20px -4px rgba(15,36,68,0.08)', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle icon={<UserCircle size={22}/>} title="Agenda Docente" subtitle="Seguimiento Individual" />
          <div style={{ minWidth: 260 }}>
            <Select value={filtroDocente} onChange={e => setFiltroDocente(e.target.value)}>
              {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </Select>
          </div>
        </div>

        {editModeDocente && puedeEditar && (
          <EditBanner
            title="Modo Edición — Por Docente"
            desc="Use clic derecho en cualquier celda para reasignar el docente. Los intercambios entre semestres distintos deben hacerse desde Vista General."
            onFinish={() => { setEditModeDocente(false); setCeldaSel(null); }}
            showUndo
          />
        )}

        <ConflictPanel lista={docenteConfl} />

        {doc ? (
          <>
            {/* Grilla del docente */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px -8px rgba(15,36,68,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>Planificación Individual</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>{doc.nombre}</div>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>{doc.especialidad} · {doc.tipo}</div>
                </div>
                <div style={{ padding: '10px 20px', background: C.navy, borderRadius: 14, boxShadow: '0 4px 12px rgba(15,36,68,0.2)', display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.gold, fontFamily: 'serif', lineHeight: 1 }}>{horasDoc[filtroDocente] || 0}</div>
                  <div style={{ fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', lineHeight: 1.2, paddingBottom: 2 }}>Períodos<br/>Sem.</div>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, background: 'white', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}` }}>
                      <th style={{ padding: '10px 12px', width: 80, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.navy, borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Hora</th>
                      {DIAS.map(d => <th key={d} style={{ padding: '10px 12px', background: C.navy, color: C.gold, fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'serif', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {RENDER_SLOTS.map((slot, si) => {
                      if (slot.type === 'break') return (
                        <tr key={si} style={{ background: '#fffbeb' }}>
                          <td style={{ padding: '4px 8px', fontSize: 8, fontFamily: 'monospace', color: '#d97706', textAlign: 'center', borderRight: '1px solid #fde68a' }}>{slot.inicio}–{slot.fin}</td>
                          <td colSpan={5} style={{ padding: '4px 12px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#92400e', fontStyle: 'italic', textAlign: 'center' }}>RECESO</td>
                        </tr>
                      );
                      return (
                        <tr key={si} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: C.navy }}>P{slot.idx+1}</div>
                            <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.inicio}</div>
                          </td>
                          {DIAS.map((_, di) => {
                            let cell = null, matchedSem = null;
                            for (const sem of SEMS) {
                              const c = horario?.[sem]?.[di]?.[slot.idx];
                              if (c?.docenteId === filtroDocente) { cell = c; matchedSem = sem; break; }
                            }
                            return (
                              <td key={di} style={{ padding: 5, borderRight: '1px solid #f1f5f9', minWidth: 130, verticalAlign: 'top' }}
                                onContextMenu={e => { e.preventDefault(); editModeDocente && matchedSem !== null && handleOpenModal(di, slot.idx, matchedSem); }}>
                                {cell ? <CeldaCom celda={cell} dia={di} periodo={slot.idx} sem={matchedSem} /> : <div style={{ minHeight: 48 }} />}
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

            {/* Ficha del docente + materias asignadas */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 2px 12px -4px rgba(15,36,68,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.navy, fontFamily: 'serif', fontSize: 15, marginBottom: 18 }}>
                <div style={{ width: 6, height: 20, background: C.gold, borderRadius: 3 }} />
                Ficha Informativa del Personal Docente
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 6 }}>Apellidos y Nombres</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.navy, fontFamily: 'serif', marginBottom: 14 }}>{doc.nombre}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['Especialidad', doc.especialidad], ['Categoría', doc.tipo]].filter(([,v]) => v).map(([k,v]) => (
                      <div key={k} style={{ padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                        <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', marginBottom: 8 }}>Materias Asignadas</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {leads.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(m.id) }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{m.nombre}</span>
                        </div>
                        <span style={{ padding: '2px 10px', background: C.navy, color: C.gold, borderRadius: 6, fontSize: 8, fontWeight: 900, textTransform: 'uppercase' }}>{m.semestre}° Sem</span>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', padding: '14px', border: '1px dashed #e2e8f0', borderRadius: 10, textAlign: 'center' }}>
                        Sin materias asignadas para el período actual.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon={<UserCircle size={48}/>} titulo="Seleccione un docente" desc="Elija un docente del listado para visualizar su carga horaria individual." />
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA: POR AULA — ocupación de ambientes físicos
  // ─────────────────────────────────────────────────────────────────────────────
  const ViewAula = () => {
    const aula = aulas.find(a => a.id === filtroAula);
    const occ  = ocupancyAula[filtroAula] || { ocupados: 0, total: 0, pct: 0 };
    const aulaConfl = conflictos.filter(c => horario?.[c.sem]?.[c.dia]?.[c.periodo]?.aulaId === filtroAula);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 4px 20px -4px rgba(15,36,68,0.08)', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle icon={<Building2 size={22}/>} title="Uso de Ambientes" subtitle="Ocupación de Infraestructura" />
          <div style={{ minWidth: 260 }}>
            <Select value={filtroAula} onChange={e => setFiltroAula(e.target.value)}>
              {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre} — Cap: {a.capacidad}</option>)}
            </Select>
          </div>
        </div>

        {editModeAula && puedeEditar && (
          <EditBanner
            title="Modo Edición — Por Aula"
            desc="Clic derecho en cualquier celda para reasignar el aula. También puede cambiar el semestre que tiene este ambiente como aula fija."
            onFinish={() => { setEditModeAula(false); setCeldaSel(null); }}
            showUndo
          />
        )}

        <ConflictPanel lista={aulaConfl} />

        {aula ? (
          <>
            {/* KPIs del aula */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                ['Capacidad', `${aula.capacidad} personas`, 'Aforo máximo'],
                ['Ocupados',  `${occ.ocupados} períodos`,  'Esta semana'],
                ['Libres',    `${occ.total - occ.ocupados}`, `de ${occ.total} totales`],
                ['% Uso',     `${occ.pct}%`, occ.pct > 80 ? 'Alta demanda' : occ.pct > 50 ? 'Uso moderado' : 'Baja ocupación'],
              ].map(([k,v,d]) => (
                <div key={k} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 18px', boxShadow: '0 2px 8px -4px rgba(15,36,68,0.06)' }}>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.navy, fontFamily: 'serif' }}>{v}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </div>

            {/* Grilla del aula */}
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 8px 30px -8px rgba(15,36,68,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24}/></div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>Disponibilidad Semanal</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>{aula.nombre}</div>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>Capacidad: {aula.capacidad} estudiantes · {aula.tipo}</div>
                  </div>
                </div>
                {editModeAula && setGrupos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8' }}>Aula fija de:</span>
                    <Select value={grupos.find(g => g.aulaFijaId === filtroAula)?.semestre || ''} onChange={e => {
                      const sem = parseInt(e.target.value);
                      setGrupos(grupos.map(g => {
                        if (g.semestre === sem) return { ...g, aulaFijaId: filtroAula };
                        if (g.aulaFijaId === filtroAula) return { ...g, aulaFijaId: '' };
                        return g;
                      }));
                    }} style={{ width: 'auto', minWidth: 120 }}>
                      <option value="">Ninguno</option>
                      {SEMS.map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                    </Select>
                  </div>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700, background: 'white', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${C.navy}` }}>
                      <th style={{ padding: '10px 12px', width: 80, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.navy, borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Hora</th>
                      {DIAS.map(d => <th key={d} style={{ padding: '10px 12px', background: C.navy, color: C.gold, fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'serif', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {RENDER_SLOTS.map((slot, si) => {
                      if (slot.type === 'break') return (
                        <tr key={si} style={{ background: '#fffbeb' }}>
                          <td style={{ padding: '4px 8px', fontSize: 8, fontFamily: 'monospace', color: '#d97706', textAlign: 'center', borderRight: '1px solid #fde68a' }}>{slot.inicio}–{slot.fin}</td>
                          <td colSpan={5} style={{ padding: '4px 12px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#92400e', fontStyle: 'italic', textAlign: 'center' }}>RECESO</td>
                        </tr>
                      );
                      return (
                        <tr key={si} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '6px 8px', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: C.navy }}>P{slot.idx+1}</div>
                            <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#94a3b8' }}>{slot.inicio}</div>
                          </td>
                          {DIAS.map((_, di) => {
                            let cell = null, matchedSem = null;
                            for (const sem of SEMS) {
                              const c = horario?.[sem]?.[di]?.[slot.idx];
                              if (c?.aulaId === filtroAula) { cell = c; matchedSem = sem; break; }
                            }
                            return (
                              <td key={di} style={{ padding: 5, borderRight: '1px solid #f1f5f9', minWidth: 130, verticalAlign: 'top' }}
                                onContextMenu={e => { e.preventDefault(); editModeAula && matchedSem !== null && handleOpenModal(di, slot.idx, matchedSem); }}>
                                {cell
                                  ? <CeldaCom celda={cell} dia={di} periodo={slot.idx} sem={matchedSem} />
                                  : <div style={{ minHeight: 48, background: '#f0fdf4', borderRadius: 8, border: '1px dashed #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ fontSize: 8, fontWeight: 900, color: '#86efac', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Libre</span>
                                    </div>
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Barra de ocupación */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8' }}>Ocupación semanal</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.navy }}>{occ.pct}%</div>
                </div>
                <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 9999, height: 8, overflow: 'hidden' }}>
                  <div className="occupancy-bar" style={{
                    width: `${occ.pct}%`,
                    background: occ.pct > 80 ? '#dc2626' : occ.pct > 50 ? '#f59e0b' : '#22c55e',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>
                  <span>{occ.ocupados} períodos ocupados</span>
                  <span>{occ.total - occ.ocupados} disponibles</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState icon={<Building2 size={48}/>} titulo="Seleccione un aula" desc="Elija un ambiente para visualizar su disponibilidad y ocupación semanal." />
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VISTA: BÚSQUEDA AVANZADA — filtros combinados
  // ─────────────────────────────────────────────────────────────────────────────
  const results = useMemo(() => {
    if (!horario) return [];
    const list = [];
    SEMS.forEach(s => {
      for (let d = 0; d < 5; d++) {
        for (let p = 0; p < 8; p++) {
          const c = horario[s]?.[d]?.[p];
          if (!c) continue;
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
  }, [horario, searchDocente, searchMateria, searchSemestre, searchDia, searchTipoPeriodo]);

  const ViewBuscar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: '24px 28px', boxShadow: '0 4px 20px -4px rgba(15,36,68,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <SectionTitle icon={<Filter size={22}/>} title="Búsqueda Avanzada" subtitle="Filtros Combinados" />
          <div style={{ background: '#f8fafc', padding: '12px 20px', borderRadius: 14, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, fontFamily: 'serif', lineHeight: 1 }}>{results.length}</div>
            <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', lineHeight: 1.2, paddingBottom: 2 }}>Clases<br/>encontradas</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
          {[
            ['DOCENTE', searchDocente, setSearchDocente, [['Todos','Todos los Docentes'], ...docentes.map(d => [d.id, d.nombre])]],
            ['MATERIA', searchMateria, setSearchMateria, [['Todas','Todas las Materias'], ...[...new Set(materias.map(m=>m.nombre))].sort().map(n=>[n,n])]],
            ['SEMESTRE', searchSemestre, setSearchSemestre, [['Todos','Todos'], ...SEMS.map(s=>[String(s),`${s}° Semestre`])]],
            ['DÍA', searchDia, setSearchDia, [['Todos','Todos'], ...DIAS.map(d=>[d,d])]],
            ['TIPO', searchTipoPeriodo, setSearchTipoPeriodo, [['Todos','Cualquier Tipo'],['Teórico','Teórico'],['Práctico','Práctico'],['Laboratorio','Laboratorio']]],
          ].map(([label, val, setter, opts]) => (
            <FormField key={label} label={label}>
              <Select value={val} onChange={e => setter(e.target.value)}>
                {opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormField>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -4px rgba(15,36,68,0.08)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Asignatura / Semestre','Docente Asignado','Temporalidad','Ubicación','Tipo'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 8, color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.navy, color: C.gold, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.sem}°</div>
                      <span style={{ fontWeight: 900, color: C.navy, fontSize: 13 }}>{r.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 700 }}>{docentes.find(d => d.id === (r.docenteId || r.docId))?.nombre || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <span style={{ fontWeight: 900, color: C.navy, fontSize: 11 }}>{DIAS[r.dia]}</span>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#94a3b8' }}>P{r.p+1}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 600 }}>
                      <Building2 size={13} style={{ color: C.gold }} />
                      {aulas.find(a => a.id === r.aulaId)?.nombre || 'Por confirmar'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{r.tipoPeriodo && <Badge tipo={r.tipoPeriodo} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {results.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', border: '1px solid #f1f5f9' }}>
              <Eye size={24} style={{ color: '#e2e8f0' }} />
            </div>
            <div style={{ color: '#94a3b8', fontFamily: 'serif', fontSize: 16, fontStyle: 'italic' }}>No se encontraron registros con los filtros aplicados.</div>
            <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#cbd5e1', marginTop: 6 }}>Intente ajustar los parámetros de búsqueda</div>
          </div>
        )}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Render principal
  // ─────────────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'general', label: 'Vista General', icon: <Calendar size={13}/> },
    { id: 'grupo',   label: 'Por Grupo',     icon: <Layers size={13}/> },
    { id: 'docente', label: 'Por Docente',   icon: <Users size={13}/> },
    { id: 'aula',    label: 'Por Aula',      icon: <Building2 size={13}/> },
    { id: 'buscar',  label: 'Buscar',        icon: <Filter size={13}/> },
  ];

  const currentEditMode = { general: editModeGeneral, docente: editModeDocente, grupo: editModeGrupo, aula: editModeAula }[vistaActiva];

  return (
    <div className="schedule-management-module" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Barra de navegación sticky ────────────────────────────────────── */}
      <div className="no-print" style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        padding: '8px 10px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 8px 32px -8px rgba(15,36,68,0.12)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'rgba(226,232,240,0.5)', borderRadius: 14, overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setVistaActiva(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 10,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                border: 'none', cursor: 'pointer', transition: 'all 0.18s ease', whiteSpace: 'nowrap',
                background: vistaActiva === tab.id ? C.navy : 'transparent',
                color: vistaActiva === tab.id ? C.gold : '#64748b',
                boxShadow: vistaActiva === tab.id ? '0 4px 12px rgba(15,36,68,0.2)' : 'none',
              }}
            >
              {tab.icon} {tab.label}
              {tab.id === 'general' && conflictos.length > 0 && (
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#dc2626', color: 'white', fontSize: 7, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{conflictos.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {estadoHorario === 'aprobado' && (
            <span style={{ background: '#dcfce7', color: '#166534', fontSize: 10, padding: '6px 14px', borderRadius: 20, fontWeight: 900, border: '1px solid #16a34a', display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={12} /> Horario Aprobado
            </span>
          )}
          {/**7 */}<button onClick={ejecutarImpresion} style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: C.navy, cursor: 'pointer', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Printer size={13} /> Imprimir
          </button>
          {puedeEditar && vistaActiva !== 'buscar' && (
            <button
              onClick={() => setEditModeCurrent(!currentEditMode)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
                background: currentEditMode ? 'rgba(251,191,36,0.12)' : 'white',
                color: currentEditMode ? '#92400e' : '#64748b',
                border: currentEditMode ? `2px solid ${C.gold}` : '1px solid #e2e8f0',
                boxShadow: currentEditMode ? `0 0 0 4px rgba(200,168,75,0.15)` : 'none',
              }}
            >
              <Pencil size={13} style={{ animation: currentEditMode ? 'slow-pulse 1.5s infinite' : 'none' }} />
              {currentEditMode ? 'Editando...' : 'Editar'}
            </button>
          )}
        </div>
      </div>

      {/* ── Área de contenido principal ─────────────────────────────────── */}
      <div className="print-container view-transition">
        {vistaActiva === 'general' && <ViewGeneral />}
        {vistaActiva === 'grupo'   && <ViewGrupo />}
        {vistaActiva === 'docente' && <ViewDocente />}
        {vistaActiva === 'aula'    && <ViewAula />}
        {vistaActiva === 'buscar'  && <ViewBuscar />}
      </div>

      {/* ── Pie de leyenda ────────────────────────────────────────────────── */}
      <div className="no-print" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 10, color: '#94a3b8', fontWeight: 600, paddingTop: 4 }}>
        <span><strong style={{ color: C.navy }}>★</strong> Asignatura Crítica Priorizada</span>
        <span><strong style={{ color: C.navy }}>📚</strong> Intervalo de Autoestudio Mandatorio</span>
        <span><strong style={{ color: C.navy }}>📌 RAC-03:</strong> Bloque de inicio Lunes a las 07:45</span>
        <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ Celdas rojas indican colisiones en la grilla.</span>
      </div>

      {/* ── Modal de reasignación (clic derecho) ─────────────────────────── */}
      {modalCelda && (() => {
        const { dia, periodo, sem } = modalCelda;
        const c = horario[sem]?.[dia]?.[periodo];
        if (!c) return null;
        const celdaConfl = conflictos.filter(cf => cf.sem === sem && cf.dia === dia && cf.periodo === periodo);
        return (
          <div className="no-print" style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}>
            <div className="modal-enter" style={{
              background: 'white', borderRadius: 20, width: 460, maxWidth: '95vw',
              boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35)', overflow: 'hidden',
            }}>
              {/* Cabecera del modal */}
              <div style={{ background: C.navy, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: 20, opacity: 0.05, color: C.gold }}><Layers size={90}/></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.4em', color: C.gold, marginBottom: 4 }}>Asignatura</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'white', fontFamily: 'serif', lineHeight: 1.2, marginBottom: 10 }}>{c.nombre}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[[`${sem}° Semestre`],[DIAS[dia]],[`Período ${periodo + 1}`]].map(([t]) => (
                      <span key={t} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.12)', borderRadius: 6, color: 'white', fontWeight: 900, fontSize: 9, textTransform: 'uppercase' }}>{t}</span>
                    ))}
                    {c.tipoPeriodo && <Badge tipo={c.tipoPeriodo} />}
                  </div>
                </div>
                <button onClick={() => setModalCelda(null)} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                  <X size={16}/>
                </button>
              </div>

              {/* Cuerpo del modal */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Conflictos en esta celda */}
                {celdaConfl.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#dc2626', marginBottom: 6 }}>⚠ Conflictos en esta celda</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {celdaConfl.map((cf, i) => <ConflictPill key={i} msg={cf.msg} tipo={cf.tipo} />)}
                    </div>
                  </div>
                )}

                <FormField label="Personal Docente Responsable">
                  <Select value={modalDocNewVal} onChange={e => setModalDocNewVal(e.target.value)}>
                    <option value="">— Sin carga docente / Libre —</option>
                    {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre} [{d.tipo}]</option>)}
                  </Select>
                </FormField>

                <FormField label="Ambiente Físico / Laboratorio">
                  <Select value={modalAulaNewVal} onChange={e => setModalAulaNewVal(e.target.value)}>
                    <option value="">— Sin aula asignada (virtual) —</option>
                    {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.tipo}) — Cap: {a.capacidad} est.</option>)}
                  </Select>
                </FormField>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button onClick={handleClearCell} style={{ flex: 1, padding: '11px', border: '1px solid #fecaca', borderRadius: 12, background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <Trash2 size={14}/> Vaciar Celda
                  </button>
                  <button onClick={handleSaveReassign} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 12, background: C.navy, color: C.gold, cursor: 'pointer', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, boxShadow: '0 4px 12px rgba(15,36,68,0.2)' }}>
                    <CheckCircle size={14}/> Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Alias de exportación con el nuevo nombre para uso futuro
export const ScheduleView = Mod4HorariosView;
