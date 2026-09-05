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
  const handleOptionSelect = (idPregunta, valor) => {
    setRespuestasUsuario(prev => {
      const updated = { ...prev };
      if (valor !== null && valor !== "" && (Array.isArray(valor) ? valor.length > 0 : true)) {
        updated[idPregunta] = valor;
      } else {
        delete updated[idPregunta];
      }
      return updated;
    });
  };

  const handleMultipleSelect = (idPregunta, idOpcion, isChecked) => {
    setRespuestasUsuario(prev => {
      const updated = { ...prev };
      const actuales = updated[idPregunta] || [];
      if (isChecked) {
        updated[idPregunta] = [...actuales, idOpcion];
      } else {
        const filtradas = actuales.filter(v => v !== idOpcion);
        if (filtradas.length > 0) {
           updated[idPregunta] = filtradas;
        } else {
           delete updated[idPregunta];
        }
      }
      return updated;
    });
  };

  // Renderizado dinámico según el tipo de pregunta
  const renderOpcionesPregunta = (preg) => {
    const valorActual = respuestasUsuario[preg.id_pregunta];

    switch (preg.tipo_resp) {
      case 'Abierta_Corta':
        return (
          <div className="col-12 col-md-8">
            <input 
              type="text" 
              className="form-control form-control-lg shadow-sm border-primary"
              maxLength={40}
              value={valorActual || ''}
              onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value)}
              placeholder="Escribe tu respuesta..."
            />
          </div>
        );
      case 'Abierta_Larga':
        return (
          <div className="col-12">
            <textarea 
              className="form-control form-control-lg shadow-sm border-primary"
              maxLength={80}
              rows={3}
              value={valorActual || ''}
              onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value)}
              placeholder="Escribe tu respuesta..."
            ></textarea>
          </div>
        );
      case 'Fecha':
        return (
          <div className="col-12 col-md-6 col-lg-4">
            <input 
              type="date" 
              className="form-control form-control-lg shadow-sm border-primary"
              value={valorActual || ''}
              onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value)}
            />
          </div>
        );
      case 'Scroll':
        return (
          <div className="col-12 col-md-6 col-lg-4">
            <select
              className="form-select form-select-lg shadow-sm border-primary"
              value={valorActual || ""}
              onChange={(e) => handleOptionSelect(preg.id_pregunta, e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">-- Selecciona --</option>
              {preg.opciones && preg.opciones.map((op) => (
                <option key={op.id_opcion} value={op.id_opcion}>
                  {op.opcion}
                </option>
              ))}
            </select>
          </div>
        );
      case 'Multiple':
        return (
          <div className="d-flex flex-column gap-2">
            {preg.opciones && preg.opciones.map((op) => {
              const isChecked = Array.isArray(valorActual) && valorActual.includes(op.id_opcion);
              return (
                <div key={op.id_opcion} className="form-check p-2 rounded hover-bg-light">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`opt_${op.id_opcion}`}
                    onChange={(e) => handleMultipleSelect(preg.id_pregunta, op.id_opcion, e.target.checked)}
                    checked={isChecked}
                  />
                  <label className="form-check-label w-100 cursor-pointer" htmlFor={`opt_${op.id_opcion}`}>
                    {op.opcion}
                  </label>
                </div>
              );
            })}
          </div>
        );
      case 'Cerrada':
      default:
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
                  checked={valorActual === op.id_opcion}
                />
                <label className="form-check-label w-100 cursor-pointer" htmlFor={`opt_${op.id_opcion}`}>
                  {op.opcion}
                </label>
              </div>
            ))}
          </div>
        );
    }
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
      const respuestasDetalle = Object.entries(respuestasUsuario).map(([id_pregunta, valor]) => ({
        id_pregunta: parseInt(id_pregunta),
        valor: valor
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