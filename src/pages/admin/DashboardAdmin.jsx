import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaClipboardList, FaChartLine, FaUsersCog, FaChartPie } from 'react-icons/fa';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-tec-full min-vh-100 p-4 d-flex flex-column align-items-center justify-content-start pt-5">

      {/* Texto de Bienvenida en Blanco para contraste con el fondo azul */}
      <h2 className="mb-5 text-white fw-bold text-center">
        ¡Bienvenido, {user?.nombre || 'Administrador'}!
      </h2>

      <div className="row g-5 justify-content-center w-100" style={{ maxWidth: '1000px' }}>
        {/* Tarjeta Resultados por Carrera */}
        <div className="col-md-4">
          <div
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/resultados/generales')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/resultados/generales'); }}
          >
            <div className="card-body">
              <FaClipboardList className="display-1 text-primary mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Resultados por carrera</h3>
              <p className="card-text text-muted">Consulta los resultados por carrera</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Resultados por Grupo */}
        <div className="col-md-4">
          <div
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/resultados/grupos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/resultados/grupos'); }}
          >
            <div className="card-body">
              <FaChartLine className="display-1 text-info mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Resultados por grupo</h3>
              <p className="card-text text-muted">Consulta el diagnóstico por grupos específicos</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Resultados por Semestre */}
        <div className="col-md-4">
          <div
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/resultados/semestre')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/resultados/semestre'); }}
          >
            <div className="card-body">
              <FaChartPie className="display-1 text-success mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Resultados por semestre</h3>
              <p className="card-text text-muted">Consulta los resultados globales de un periodo</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Crear Grupos */}
        <div className="col-md-4">
          <div
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/crear-grupos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/admin/crear-grupos'); }}
          >
            <div className="card-body">
              <FaUsersCog className="display-1 text-success mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Crear grupos</h3>
              <p className="card-text text-muted">Genera y asigna nuevos grupos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
