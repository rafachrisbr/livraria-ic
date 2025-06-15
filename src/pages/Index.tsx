
import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </>
  );
};

export default Index;
