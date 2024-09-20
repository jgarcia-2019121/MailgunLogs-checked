import React, { useState } from 'react';
import Login from './Login';
import LogDisplay from './LogDisplay';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <div>
      {isAuthenticated ? (
        <LogDisplay />
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </div>
  );
};

export default App;
