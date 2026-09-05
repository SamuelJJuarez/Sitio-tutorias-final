import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cuestionarioService } from '../../services/cuestionarioService';
import logo from '../../assets/itl_leon.png'; // Tu logo
import SuccessModal from '../../components/modals/SuccessModal';

const CuestionarioPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Cuestionario finalizado");
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState([]);
  const [indiceSeccionActual, setIndiceSeccionActual] = useState(0);
  const [preguntas, setPreguntas] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [respuestasUsuario, setRespuestasUsuario] = useState({}); // { idPregunta: indiceOpcion }

  // 1. Al cargar, checamos el estatus
  useEffect(() => {
    const initCuestionario = async () => {
      try {
        const res = await cuestionarioService.getEstatus();
        if (res.success) {
          const { totalSecciones, completadas } = res.data;
          setSecciones(totalSecciones);

          // Calculamos en qué sección debe ir (La primera que NO esté en completadas)
          const siguienteIndice = totalSecciones.findIndex(sec => !completadas.includes(sec.id_seccion));

          if (siguienteIndice === -1 && totalSecciones.length > 0) {
            // Ya acabó todo
            setModalMessage("Ya has completado todo el cuestionario");
            setShowModal(true);
            setTimeout(() => {
              navigate('/alumno/dashboard');
            }, 1000);
          } else {
            setIndiceSeccionActual(siguienteIndice);
          }
        }
      } catch (error) {
        console.error("Error iniciando", error);
      }
    };
    initCuestionario();
  }, [user, navigate]);

  // 2. Cada vez que cambie el índice de sección, cargamos sus preguntas
  useEffect(() => {
    if (secciones.length > 0 && secciones[indiceSeccionActual]) {
      const cargarSeccion = async () => {
        setLoading(true);
        setRespuestasUsuario({}); // Limpiamos respuestas anteriores para evitar basura
        const idSeccion = secciones[indiceSeccionActual].id_seccion;

        const res = await cuestionarioService.getSeccion(idSeccion);
        if (res.success) {
          setPreguntas(res.data.preguntas);
          setOpciones(res.data.opciones);
        }
        setLoading(false);
      };
      cargarSeccion();
    }
  }, [indiceSeccionActual, secciones]);

  // Manejar selección de opción
  const handleOptionSelect = (idPregunta, idOpcion) => {
    setRespuestasUsuario(prev => {
      const updated = { ...prev };
      if (idOpcion) {
        updated[idPregunta] = idOpcion;
      } else {
        delete updated[idPregunta];
      }
      return updated;
    });
  };

  // Renderizado dinámico según el tipo de pregunta
  const renderOpcionesPregunta = (preg) => {
    const currentYear = new Date().getFullYear();

    // 1. Pregunta 21: Año en el que cursó la última materia (Dropdown dinámico hasta el año en curso)
    if (preg.id_pregunta === 21) {
      const opcionesFiltradas = (preg.opciones || [])
        .filter((op) => {
          const year = parseInt(op.opcion, 10);
          return !isNaN(year) && year <= currentYear;
        })
        .sort((a, b) => parseInt(b.opcion, 10) - parseInt(a.opcion, 10)); // Año más reciente primero

      return (
        <div className="col-12 col-md-6 col-lg-4">
          <select
            className="form-select form-select-lg shadow-sm border-primary"
            value={respuestasUsuario[preg.id_pregunta] || ""}
            onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">-- Selecciona el año --</option>
            {opcionesFiltradas.map((op) => (
              <option key={op.id_opcion} value={op.id_opcion}>
                {op.opcion}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // 2. Pregunta 27: Promedio (Dropdown compacto 6.0 a 10.0)
    if (preg.id_pregunta === 27) {
      return (
        <div className="col-12 col-md-6 col-lg-4">
          <select
            className="form-select form-select-lg shadow-sm border-primary"
            value={respuestasUsuario[preg.id_pregunta] || ""}
            onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">-- Selecciona tu promedio --</option>
            {preg.opciones && preg.opciones.map((op) => (
              <option key={op.id_opcion} value={op.id_opcion}>
                {op.opcion}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // 3. Preguntas estándar con Radio Buttons
    return (
      <div className="d-flex flex-column gap-2">
        {preg.opciones && preg.opciones.map((op) => (
          <div key={op.id_opcion} className="form-check p-2 rounded hover-bg-light">
            <input
              className="form-check-input"
              type="radio"
              name={`preg_${preg.id_pregunta}`}
              id={`opt_${op.id_opcion}`}
              onChange={() => handleOptionSelect(preg.id_pregunta, op.id_opcion)}
              checked={respuestasUsuario[preg.id_pregunta] === op.id_opcion}
            />
            <label className="form-check-label w-100 cursor-pointer" htmlFor={`opt_${op.id_opcion}`}>
              {op.opcion}
            </label>
          </div>
        ))}
      </div>
    );
  };

  // Verificar si todas las preguntas tienen respuesta
  const validarAvance = () => {
    // Revisamos si el número de respuestas guardadas coincide con el número de preguntas
    if (preguntas.length === 0) return false;
    return Object.keys(respuestasUsuario).length === preguntas.length;
  };

  // Enviar sección y pasar a la siguiente
  const handleSiguiente = async () => {
    if (!validarAvance()) return;

    try {
      // Convertimos el objeto de respuestas a un array de detalle
      const respuestasDetalle = Object.entries(respuestasUsuario).map(([id_pregunta, id_opcion]) => ({
        id_pregunta: parseInt(id_pregunta),
        id_opcion: parseInt(id_opcion)
      }));

      await cuestionarioService.saveSeccion({
        id_seccion: secciones[indiceSeccionActual].id_seccion,
        respuestasDetalle
      });

      // Avanzar
      if (indiceSeccionActual < secciones.length - 1) {
        setIndiceSeccionActual(prev => prev + 1);
        window.scrollTo(0, 0); // Subir scroll
      } else {
        // Era la última
        setModalMessage("Cuestionario finalizado");
        setShowModal(true);
        setTimeout(() => {
          navigate('/alumno/dashboard');
        }, 1000);
      }

    } catch (error) {
      alert("Error al guardar respuestas");
    }
  };

  if (loading) return <div className="text-white text-center mt-5">Cargando cuestionario...</div>;

  const seccionActualData = secciones[indiceSeccionActual];

  return (
    <div className="bg-tec-full min-vh-100 py-4"> {/* Fondo Azul Institucional */}
      <div className="container">

        {/* Encabezado Estilo PDF */}
        <div className="card shadow mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div className="text-center">
              <h5 className="fw-bold mb-0">{seccionActualData?.nom_seccion}</h5>
            </div>
          </div>
        </div>

        {/* Lista de Preguntas */}
        <div className="card shadow">
          <div className="card-body p-5">
            {preguntas.map((preg, index) => (
              <div key={preg.id_pregunta} className="mb-5 border-bottom pb-4">
                <h5 className="fw-bold mb-3">{index + 1}. {preg.pregunta}</h5>
                {renderOpcionesPregunta(preg)}
              </div>
            ))}

            {/* Botonera de Navegación */}
            <div className="d-flex justify-content-end mt-4">
              {/* Botón Siguiente o Finalizar */}
              <button
                className={`btn btn-lg ${indiceSeccionActual === secciones.length - 1 ? 'btn-success' : 'btn-tec'}`}
                onClick={handleSiguiente}
                disabled={!validarAvance()} // Bloqueado hasta contestar todo
              >
                {indiceSeccionActual === secciones.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>

            {!validarAvance() && (
              <div className="text-end mt-2 text-danger small">
                * Conteste todas las preguntas para avanzar
              </div>
            )}
          </div>
        </div>

      </div>
      <SuccessModal isOpen={showModal} message={modalMessage} />
    </div>
  );
};

export default CuestionarioPage;