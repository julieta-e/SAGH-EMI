export const GlobalStyles = () => (
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


