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
          {activeTab === 'mod6' && <Mod6ReportesView horario={horarioData} docentes={docentes} materias={materias} aulas={aulas} grupos={grupos} horasDoc={horasDocData} estadoHorario={estadoHorario} />}
        </div>
      </main>
    </div>
  );
}

