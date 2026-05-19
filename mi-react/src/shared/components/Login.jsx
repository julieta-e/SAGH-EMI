import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { C } from '../constants';
import { GlobalStyles } from '../styles/globalStyles';

export function Login({ usuarios, onLogin }) {
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

