import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { C } from '../constants/colors';

export function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      if (user === 'admin' && pass === 'emi123') {
        onLogin();
      } else {
        setError('Credenciales incorrectas. (admin / emi123)');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${C.navy} 0%, #0a1a35 60%, #1a365d 100%)`,
      fontFamily: "'Georgia', serif", overflow: 'auto'
    }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100% !important; height: 100% !important; min-height: 100vh; overflow: hidden; }
        body { font-family: 'Georgia', serif; }
      `}</style>
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
