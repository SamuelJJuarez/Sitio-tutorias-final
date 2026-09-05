const API_URL = 'https://api-sitio-tutorias.vercel.app/api/cuestionario';

// Helper para obtener el token del almacenamiento local
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const cuestionarioService = {
  getEstatus: async () => {
    const response = await fetch(`${API_URL}/estatus`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  getSeccion: async (idSeccion) => {
    const response = await fetch(`${API_URL}/seccion/${idSeccion}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  saveSeccion: async (data) => {
    const response = await fetch(`${API_URL}/guardar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  getResultados: async () => {
    const response = await fetch(`${API_URL}/resultados`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await response.json();
  }
};