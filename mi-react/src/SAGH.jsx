import React, { useState } from 'react';
import {
  Calendar, Users, BookOpen, LogOut, CheckCircle, Menu,
  Building2, Shield, Play, AlertCircle, User, ChevronDown
} from 'lucide-react';

// Importar componentes
import { GlobalStyles } from './components/SharedComponents';
import { Login } from './components/Login';
import { GeneradorView } from './components/GeneradorView';
import { HorariosView } from './components/HorariosView';
import { ValidacionView } from './components/ValidacionView';
import { DocentesView } from './components/DocentesView';
import { MateriasView } from './components/MateriasView';
import { AulasView } from './components/AulasView';

// Importar constantes
import { C } from './constants/colors';
import { INIT_DOCENTES, INIT_AULAS, INIT_MATERIAS } from './constants/initialData';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('generador');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recursosOpen, setRecursosOpen] = useState(false);
  const [docentes, setDocentes] = useState(INIT_DOCENTES);
  const [materias, setMaterias] = useState(INIT_MATERIAS);
  const [aulas, setAulas] = useState(INIT_AULAS);
  const [horarioData, setHorarioData] = useState(null);
  const [horasDocData, setHorasDocData] = useState(null);
  const [estadoValidacion, setEstadoValidacion] = useState(null);

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
  ];

  const recursosTabs = [
    { id: 'docentes', label: 'Docentes', icon: <Users size={18} /> },
    { id: 'materias', label: 'Materias', icon: <BookOpen size={18} /> },
    { id: 'aulas', label: 'Aulas', icon: <Building2 size={18} /> },
  ];

  const allTabs = [...tabs, ...recursosTabs];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Georgia', serif", position: 'fixed', inset: 0 }}>
      <GlobalStyles />
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
          
          {/* Recursos Desplegable */}
          <div>
            <button onClick={() => setRecursosOpen(!recursosOpen)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: recursosTabs.some(t => t.id === activeTab) ? 'rgba(200,168,75,0.15)' : 'none',
              borderLeft: recursosTabs.some(t => t.id === activeTab) ? `3px solid ${C.gold}` : '3px solid transparent',
              border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              color: recursosTabs.some(t => t.id === activeTab) ? C.gold : '#94a3b8',
              cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', position: 'relative'
            }}>
              <Building2 size={18} />
              {sidebarOpen && (
                <>
                  <span>Recursos</span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      marginLeft: 'auto', 
                      transition: 'transform 0.2s',
                      transform: recursosOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} 
                  />
                </>
              )}
            </button>
            
            {recursosOpen && (
              <div style={{ paddingLeft: '8px', background: 'rgba(0,0,0,0.1)' }}>
                {recursosTabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                    background: activeTab === t.id ? 'rgba(200,168,75,0.15)' : 'none',
                    borderLeft: activeTab === t.id ? `3px solid ${C.gold}` : '3px solid transparent',
                    border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                    color: activeTab === t.id ? C.gold : '#94a3b8',
                    cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', marginLeft: '8px'
                  }}>
                    <span style={{ opacity: 0.7 }}>—</span>
                    {sidebarOpen && <span>{t.label}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
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

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          background: 'white', padding: '0 24px', height: 56, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `3px solid ${C.gold}`, flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 3, height: 20, background: C.gold, borderRadius: 2 }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 'bold', color: C.navy, letterSpacing: 0.5 }}>
              {allTabs.find(t => t.id === activeTab)?.label}
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
