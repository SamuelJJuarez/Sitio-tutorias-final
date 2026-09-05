import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // URL base de la API
  const API_URL = 'https://api-sitio-tutorias.vercel.app/api';

  // Efecto para verificar si ya hay sesión al recargar la página
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (correo, contraseña, tipoUsuario) => {
    try {
      let endpoint = '';

      // Selección del endpoint según el tipo de usuario
      switch (tipoUsuario) {
        case 'alumno':
          endpoint = '/alumnos/login'; //
          break;
        case 'maestro':
          endpoint = '/maestros/login'; //
          break;
        case 'admin':
          endpoint = '/administrativos/login'; //
          break;
        default:
          throw new Error('Tipo de usuario no válido');
      }

      // --- AQUÍ ESTÁ EL CAMBIO A FETCH ---
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo,
          contraseña
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token, usuario } = data.data;

        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        localStorage.setItem('role', tipoUsuario);

        // Configurar estado
        setUser(usuario);
        setRole(tipoUsuario);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        // Si la API responde con error (ej. 401 o 400)
        return {
          success: false,
          message: data.message || 'Credenciales incorrectas'
        };
      }

    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: 'Error al conectar con el servidor'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    role,
    isAuthenticated,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};