const API_URL = 'https://api-sitio-tutorias.vercel.app/api/alumnos';

export const alumnosService = {
  register: async (alumnoData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alumnoData),
    });
    return await response.json();
  }
};