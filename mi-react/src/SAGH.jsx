import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, LogOut, CheckCircle, AlertCircle, Menu, Shield, Database, Play, FileText, ChevronDown, Mail } from 'lucide-react';
import { C, INIT_GRUPOS, PERMISOS_ROL } from './shared/constants';
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

const API = 'http://localhost:3001/api';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [activeTab, setActiveTab] = useState('mod1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const perfilRef = useRef(null);

  const [usuarios, setUsuarios] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [grupos, setGrupos] = useState(INIT_GRUPOS);
  const [horarioData, setHorarioData] = useState(null);
  const [horasDocData, setHorasDocData] = useState(null);
  const [estadoHorario, setEstadoHorario] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (perfilRef.current && !perfilRef.current.contains(e.target)) {
        setPerfilOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!usuario) return;

    fetch(`${API}/usuarios`)
      .then(r => r.json())
      .then(data => setUsuarios(data))
      .catch(console.error);

    Promise.all([
      fetch(`${API}/docentes`).then(r => r.json()),
      fetch(`${API}/materias`).then(r => r.json()),
      fetch(`${API}/aulas`).then(r => r.json()),
    ]).then(([docs, mats, auls]) => {
      setDocentes(docs);
      setMaterias(mats);
      setAulas(auls);
    }).catch(console.error);

    fetch(`${API}/horarios/ultimo`)
      .then(r => r.json())
      .then(h => {
        if (h) {
          setHorarioData(h.datos_horario);
          setEstadoHorario(h.estado);
        }
      })
      .catch(console.error);

  }, [usuario]);

  const addNotif = (msg, tipo = 'info') => {
    const n = { id: Date.now(), msg, tipo, fecha: new Date().toLocaleString() };
    setNotificaciones(prev => [n, ...prev].slice(0, 20));
  };

  const handleLogin = async ({ usuario, password }) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUsuario(data.usuario);
      setActiveTab('mod1');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
    setPerfilOpen(false);
  };

  const onHorarioGenerado = async (horario, horas) => {
    setHorarioData(horario);
    setHorasDocData(horas);
    setEstadoHorario('pendiente');
    const entry = {
      id: Date.now(),
      accion: 'Horario generado',
      usuario: usuario?.nombre,
      fecha: new Date().toLocaleString(),
      estado: 'pendiente'
    };
    setHistorial(prev => [entry, ...prev]);
    try {
      await fetch(`${API}/horarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodo_academico: '2026-I', datos_horario: horario })
      });
    } catch (err) {
      console.error('Error guardando horario:', err);
    }
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
    const entry = {
      id: Date.now(),
      accion: 'Horario aprobado',
      usuario: usuario?.nombre,
      fecha: new Date().toLocaleString(),
      estado: 'aprobado'
    };
    setHistorial(prev => [entry, ...prev]);
    addNotif('Horario aprobado formalmente', 'success');
    setActiveTab('mod4');
  };

  if (!usuario) return <Login onLogin={handleLogin} />;

  const permisos = PERMISOS_ROL[usuario.rol] || [];
  const canAccess = (mod) => permisos.includes(mod);

  const TABS = [
    { id: 'mod1', label: 'Administracion del Sistema', icon: <Shield size={16} />, mod: 'mod1' },
    { id: 'mod2', label: 'Gestión Académica',          icon: <Database size={16} />, mod: 'mod2' },
    { id: 'mod3', label: 'Generación de Horarios',     icon: <Play size={16} />, mod: 'mod3' },
    { id: 'mod4', label: 'Gestión Horarios',           icon: <Calendar size={16} />, mod: 'mod4', badge: estadoHorario === 'pendiente' },
    { id: 'mod5', label: 'Validación',                 icon: <CheckCircle size={16} />, mod: 'mod5' },
    { id: 'mod6', label: 'Reportes',                   icon: <FileText size={16} />, mod: 'mod6' },
  ].filter(t => t.always || canAccess(t.mod));

  const inicial = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Georgia', serif", position: 'fixed', inset: 0 }}>
      <GlobalStyles />

      {/* SIDEBAR */}
      <aside style={{ width: sidebarOpen ? 230 : 56, background: C.navy, color: 'white', display: 'flex', flexDirection: 'column', transition: 'width 0.25s', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 80 }}>
          {sidebarOpen && (
            <div>
              <div style={{ color: C.gold, fontWeight: 'bold', fontSize: 14, letterSpacing: 2 }}>EMI — SAGH</div>
              <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 1 }}>Sistema Acad. de Horarios</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
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
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: sidebarOpen ? '9px 14px' : '9px 0',
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

        {sidebarOpen && estadoHorario && (
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ background: estadoHorario === 'aprobado' ? 'rgba(22,101,52,0.3)' : 'rgba(200,168,75,0.15)', border: `1px solid ${estadoHorario === 'aprobado' ? '#16a34a' : C.gold}`, borderRadius: 6, padding: '5px 8px', fontSize: 10, color: estadoHorario === 'aprobado' ? '#4ade80' : C.gold, display: 'flex', alignItems: 'center', gap: 5 }}>
              {estadoHorario === 'aprobado' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
              {estadoHorario === 'aprobado' ? 'Horario Aprobado' : 'Pendiente Validación'}
            </div>
          </div>
        )}
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* HEADER — más alto y con más padding */}
        <header style={{
          background: 'white',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `3px solid ${C.gold}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, background: C.gold, borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 'bold', color: C.navy }}>
              {TABS.find(t => t.id === activeTab)?.label || 'Administracion del Sistema'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <NotifBell notificaciones={notificaciones} />

            {/* Botón perfil — más grande y separado del borde */}
            <div ref={perfilRef} style={{ position: 'relative', marginRight: 8 }}>
              <button
                onClick={() => setPerfilOpen(!perfilOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: perfilOpen ? '#f1f5f9' : 'none',
                  border: '1px solid',
                  borderColor: perfilOpen ? '#e2e8f0' : 'transparent',
                  borderRadius: 12,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Avatar más grande con borde dorado */}
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: C.navy,
                  color: C.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 'bold',
                  flexShrink: 0,
                  border: `2px solid ${C.gold}`,
                }}>
                  {inicial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: C.navy, lineHeight: 1.3 }}>{usuario.nombre}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>{usuario.rol}</div>
                </div>
                <ChevronDown
                  size={13}
                  color="#94a3b8"
                  style={{ transition: 'transform 0.2s', transform: perfilOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Dropdown */}
              {perfilOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: 260,
                  background: 'white',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  zIndex: 1000,
                  overflow: 'hidden',
                }}>

                  {/* Cabecera del perfil */}
                  <div style={{ background: C.navy, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: C.gold,
                      color: C.navy,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      fontWeight: 'bold',
                      flexShrink: 0,
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}>
                      {inicial}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{usuario.nombre}</div>
                      <div style={{ color: C.gold, fontSize: 11, marginTop: 3 }}>{usuario.rol}</div>
                    </div>
                  </div>

                  {/* Info del perfil */}
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                    {usuario.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                        <Mail size={14} color="#94a3b8" />
                        <span>{usuario.email}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#64748b' }}>
                      <Shield size={14} color="#94a3b8" />
                      <span>Rol: {usuario.rol}</span>
                    </div>
                  </div>

                  {/* Botón cerrar sesión */}
                  <div style={{ padding: '10px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: 'none',
                        background: '#fef2f2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 'bold',
                      }}
                    >
                      <LogOut size={15} />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
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
    </div>
  );
}