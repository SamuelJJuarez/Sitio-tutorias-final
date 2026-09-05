const API_URL = 'https://api-sitio-tutorias.vercel.app/api/grupos';

export const gruposService = {
  getByCarrera: async (carrera) => {
    const response = await fetch(`${API_URL}/recientes?carrera=${encodeURIComponent(carrera)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  }
};