import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogDisplay from './LogDisplay';
import './main.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      if (window.ERSSO && window.ERSSO.t) {
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = () => {
    (function(w, d, s, l, i, c){
      const ch = Math.floor(Math.random() * 99999);
      window.ERSSO = {t: i, h: {}, c: c};
      let f = d.getElementsByTagName(s)[0],
        j = d.createElement(s);
      j.async = true;
      j.src = 'https://gsso.seguroselroble.com/ERLd.js?c=' + ch;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'elRoble', '7249f332b02a8fb35c72185183ce5ab977bdd977c0d58d18d68e3f52334b', function (response) {
      console.log('Respuesta completa del SSO:', response);

      //if (response.status === 'success') {
        setIsAuthenticated(true);
        //window.location.href = "/"; // Redirige a los logs después de iniciar sesión
      //} else {
      //  console.error('Error en la autenticación:', response);
      //}
    });
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            !isAuthenticated ? (
              <div className="login-container">
                <div className="login-box">
                  <h1>Gestor de procesos</h1>
                  <h2>Iniciar sesión</h2>
                  <p>Presiona el botón para iniciar sesión</p>
                  <button className="login-button" onClick={handleLogin}>Iniciar sesión</button>
                  <a href="#" className="forgot-password">Olvidé mi contraseña</a>
                </div>
              </div>
            ) : (
              <LogDisplay />
            )
          } 
        />
        
        {/* Agrega una ruta para acceder directamente a LogDisplay sin autenticación */}
        <Route path="/logs" element={<LogDisplay />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);