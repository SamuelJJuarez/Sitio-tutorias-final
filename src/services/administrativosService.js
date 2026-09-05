const API_URL = 'https://api-sitio-tutorias.vercel.app/api/administrativos';

// Función auxiliar para obtener headers con auth
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const administrativosService = {
  register: async (adminData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
    return await response.json();
  },

  getFiltros: async () => {
    const response = await fetch(`${API_URL}/filtros`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getGrupos: async (carrera, periodo) => {
    const params = new URLSearchParams({ carrera, periodo });
    const response = await fetch(`${API_URL}/grupos?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getResultadosGenerales: async (carrera, periodo) => {
    const params = new URLSearchParams({ carrera, periodo });
    const response = await fetch(`${API_URL}/resultados/generales?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getResultadosPorGrupo: async (carrera, periodo, indice_grupo) => {
    const params = new URLSearchParams({ carrera, periodo, indice_grupo });
    const response = await fetch(`${API_URL}/resultados/grupo?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getMaestros: async () => {
    const response = await fetch(`${API_URL}/maestros`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  bulkCreateGrupos: async (gruposData) => {
    const response = await fetch(`${API_URL}/grupos/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gruposData),
    });
    return await response.json();
  }
};