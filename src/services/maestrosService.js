const API_URL = 'https://api-sitio-tutorias.vercel.app/api/maestros';
const CUESTIONARIO_URL = 'https://api-sitio-tutorias.vercel.app/api/cuestionario';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
};

export const maestrosService = {
  //Estaba solo register y API_URL
  register: async (maestroData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maestroData),
    });
    return await response.json();
  },
  getGrupos: async () => {
    const res = await fetch(`${API_URL}/grupos`, { headers: getAuthHeaders() });
    return await res.json();
  },
  getAlumnos: async (indiceGrupo) => {
    const res = await fetch(`${API_URL}/alumnos/${indiceGrupo}`, { headers: getAuthHeaders() });
    return await res.json();
  },
  getEntrevistas: async (numControlAlum) => {
    const res = await fetch(`${API_URL}/entrevistas/${numControlAlum}`, { headers: getAuthHeaders() });
    return await res.json();
  },
  createEntrevista: async (data) => {
    const res = await fetch(`${API_URL}/entrevista`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return await res.json();
  },
  updateResumen: async (data) => {
    const res = await fetch(`${API_URL}/entrevista/resumen`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return await res.json();
  },
  reprogramar: async (data) => {
    const res = await fetch(`${API_URL}/entrevista/reprogramar`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    });
    return await res.json();
  },
  deleteEntrevista: async (id_entrevista) => {
    const res = await fetch(`${API_URL}/entrevista/${id_entrevista}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    return await res.json();
  },
  // Obtener resultados de alumno especifico
  getResultadosAlumno: async (numControl) => {
    const res = await fetch(`${CUESTIONARIO_URL}/resultados/${numControl}`, { headers: getAuthHeaders() });
    return await res.json();
  },
  // Notificar a todos los alumnos del grupo para que llenen su cuestionario
  notificarCuestionario: async (indiceGrupo) => {
    const res = await fetch(`${API_URL}/notificar-cuestionario/${indiceGrupo}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await res.json();
  }
};