import React from 'react';
import { CheckCircle, Calendar, Users, BookOpen, Building2, Play, Clock, FileText, ChevronRight, Activity, Layers, ClipboardList } from 'lucide-react';
import { C } from '../constants';

export function DashboardView({ docentes, materias, aulas, grupos, horarioData, estadoHorario, historial, onNavigate }) {
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
