import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { cuestionarioService } from '../../services/cuestionarioService';
// Íconos nuevos
import { FaClipboardList, FaChartBar } from 'react-icons/fa';
import InstruccionesModal from '../../components/modals/InstruccionesModal';
import IncompletoModal from '../../components/modals/IncompletoModal';

const DashboardAlumno = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modales
  const [showInstrucciones, setShowInstrucciones] = useState(false);
  const [showIncompleto, setShowIncompleto] = useState(false);

  // Estado del cuestionario
  const [estatus, setEstatus] = useState({ total: 0, contestadas: 0 });

  useEffect(() => {
    const checkEstatus = async () => {
      try {
        const res = await cuestionarioService.getEstatus();
        if (res.success) {
          setEstatus({
            total: res.data.totalSecciones.length,
            contestadas: res.data.completadas.length
          });
        }
      } catch (error) {
        console.error("Error al cargar estatus");
      }
    };
    checkEstatus();
  }, []);

  const handleStartExamen = () => {
    setShowInstrucciones(false);
    navigate('/alumno/cuestionario');
  };

  const handleVerResultados = () => {
    // VALIDACIÓN: Si no ha terminado todo, muestra alerta
    if (estatus.contestadas < estatus.total) {
      setShowIncompleto(true);
    } else {
      navigate('/alumno/resultados');
    }
  };

  return (
    // CORRECCIÓN: Fondo Azul Institucional ocupando toda la altura
    <div className="bg-tec-full min-vh-100 p-4 d-flex flex-column align-items-center justify-content-start pt-5">

      {/* Texto de Bienvenida en Blanco para contraste con el fondo azul */}
      <h2 className="mb-5 text-white fw-bold text-center">
        ¡Bienvenido, {user?.nombre}!
      </h2>

      <div className="row g-5 justify-content-center w-100" style={{ maxWidth: '900px' }}>
        {/* Tarjeta Examen */}
        <div className="col-md-5">
          <div 
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={() => setShowInstrucciones(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowInstrucciones(true); }}
          >
            <div className="card-body">
              <FaClipboardList className="display-1 text-primary mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Realizar examen</h3>
              <p className="card-text text-muted">Contesta el cuestionario de tutorías.</p>
            </div>
          </div>
        </div>

        {/* Tarjeta Resultados */}
        <div className="col-md-5">
          <div 
            className="card shadow h-100 text-center p-4 card-custom cursor-pointer zoom-effect border-0"
            role="button"
            tabIndex={0}
            onClick={handleVerResultados}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleVerResultados(); }}
          >
            <div className="card-body">
              <FaChartBar className="display-1 text-success mb-3" size={80} />
              <h3 className="card-title fw-bold text-dark">Ver resultados</h3>
              <p className="card-text text-muted">Consulta tu diagnóstico.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALES --- */}
      <InstruccionesModal
        show={showInstrucciones}
        onHide={() => setShowInstrucciones(false)}
        onStart={handleStartExamen}
      />

      <IncompletoModal
        show={showIncompleto}
        onHide={() => setShowIncompleto(false)}
      />
    </div>
  );
};

export default DashboardAlumno;