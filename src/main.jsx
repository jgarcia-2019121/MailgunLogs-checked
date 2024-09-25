import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogDisplay from './LogDisplay';
import './main.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya está autenticado en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    const checkAuthentication = () => {
      if (window.ERSSO && window.ERSSO.t) {
        setIsAuthenticated(true);
        localStorage.setItem('token', window.ERSSO.t); // Guardar token en localStorage
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = () => {
    (function (w, d, s, l, i, c) {
      const ch = Math.floor(Math.random() * 99999);
      window.ERSSO = { t: i, h: {}, c: c };
      let f = d.getElementsByTagName(s)[0],
        j = d.createElement(s);
      j.async = true;
      j.src = 'https://gsso.seguroselroble.com/ERLd.js?c=' + ch;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'elRoble', '7249f332b02a8fb35c72185183ce5ab977bdd977c0d58d18d68e3f52334b', function (response) {
      console.log('Respuesta completa del SSO:', response);

      setIsAuthenticated(true);
      localStorage.setItem('token', window.ERSSO.t); // Guardar token en localStorage

      // Redirigir a la página de logs
      window.location.href = '/logs';
    });
  };

  const handleLogout = () => {
    // Eliminar token de localStorage y redirigir al login
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/'; // Redirige al login
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <div className="login-container">
                <div className='logo-box'>
                  
                </div>
                <div className="login-box">
                  <h1>Gestor de procesos</h1>
                  <h2>Iniciar sesión</h2>
                  <p>Presiona el botón para iniciar sesión</p>
                  <button className="login-button" onClick={handleLogin}>Iniciar sesión</button>
                  <a href="#" className="forgot-password">Olvidé mi contraseña</a>
                </div>
              </div>
            ) : (
              <Navigate to="/logs" />
            )
          }
        />
        <Route
          path="/logs"
          element={
            isAuthenticated ? (
              <LogDisplay handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" /> // Si no está autenticado, redirigir al login
            )
          }
        />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
