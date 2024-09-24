import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LogDisplay from './LogDisplay';
import './main.css';

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificación de si el usuario está autenticado (revisar si hay un token en el localStorage)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Función para manejar el login
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

      // Si la autenticación fue exitosa, guarda el token
      localStorage.setItem('token', window.ERSSO.t); // Guardar token en localStorage
      setIsAuthenticated(true);
    });
  };

  // Función para manejar el logout
  const handleLogout = () => {
    // Remover token y redirigir al login
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/'; // Redirigir al login
  };

  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <div className="login-container">
                <div className="login-box">
                  <h1>Gestor de procesos</h1>
                  <h2>Iniciar sesión</h2>
                  <p>Presiona el botón para iniciar sesión</p>
                  <button className="login-button" onClick={handleLogin}>
                    Iniciar sesión
                  </button>
                  <a href="#" className="forgot-password">Olvidé mi contraseña</a>
                </div>
              </div>
            ) : (
              <Navigate to="/logs" />
            )
          }
        />

        {/* Ruta para los logs si está autenticado */}
        <Route
          path="/logs"
          element={
            isAuthenticated ? (
              <LogDisplay handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" /> // Redirige al login si no está autenticado
            )
          }
        />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
