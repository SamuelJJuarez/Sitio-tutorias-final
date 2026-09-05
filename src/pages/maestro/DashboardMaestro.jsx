import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { maestrosService } from '../../services/maestrosService';
import { FaUsers, FaSearch } from 'react-icons/fa';

const DashboardMaestro = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await maestrosService.getGrupos();
        if (res.success) setGrupos(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchGrupos();
  }, []);

  const gruposFiltrados = grupos.filter(g =>
    g.letra_grupo.toLowerCase().includes(busqueda.toLowerCase()) ||
    g.periodo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="bg-tec-full min-vh-100 p-4 pt-5">
      <div className="container">
        <h2 className="text-white fw-bold mb-4">¡Bienvenido, {user?.nombre}!</h2>

        {/* Barra de Búsqueda */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body p-3 d-flex align-items-center">
            <FaSearch className="text-muted me-3" />
            <input
              type="text"
              className="form-control border-0"
              placeholder="Buscar grupo por letra o periodo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <h4 className="text-white mb-3 border-bottom pb-2">Mis grupos</h4>

        <div className="row g-4">
          {gruposFiltrados.map((g) => (
            <div key={g.indice_grupo} className="col-md-4 col-lg-3">
              <div
                className="card h-100 shadow border-0 card-custom cursor-pointer zoom-effect"
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/maestro/grupo/${g.indice_grupo}`, { state: { grupo: g } })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/maestro/grupo/${g.indice_grupo}`, { state: { grupo: g } }); }}
              >
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                    <FaUsers className="text-primary display-6" />
                  </div>
                  <h3 className="fw-bold text-dark">{g.letra_grupo}</h3>
                  <span className="badge bg-secondary">{g.periodo}</span>
                  <p className="text-muted small mt-2">Ver alumnos</p>
                </div>
              </div>
            </div>
          ))}
          {gruposFiltrados.length === 0 && (
            <p className="text-white text-center mt-4">No se encontraron grupos.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMaestro;