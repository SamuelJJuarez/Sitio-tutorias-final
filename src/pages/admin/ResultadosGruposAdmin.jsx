import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { administrativosService } from '../../services/administrativosService';
import logo from '../../assets/itl_leon.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DetalleResumenAdminModal from '../../components/modals/DetalleResumenAdminModal';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import ListaAlumnosModal from '../../components/modals/ListaAlumnosModal';
import RespuestasAbiertasModal from '../../components/modals/RespuestasAbiertasModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ResultadosGruposAdmin = () => {
  const navigate = useNavigate();
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingResultados, setLoadingResultados] = useState(false);

  // Filtros
  const [carreras, setCarreras] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');

  // Datos
  const [grupos, setGrupos] = useState([]);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [alumnosGrupo, setAlumnosGrupo] = useState([]);
  
  // Paginación de secciones
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Modales
  const [modalAlumnosOpen, setModalAlumnosOpen] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // 1. Cargar filtros iniciales
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const res = await administrativosService.getFiltros();
        if (res.success) {
          setCarreras(res.data.carreras);
          setPeriodos(res.data.periodos);
          if (res.data.carreras.length > 0) setSelectedCarrera(res.data.carreras[0]);
          if (res.data.periodos.length > 0) setSelectedPeriodo(res.data.periodos[0]);
        }
      } catch (error) {
        console.error("Error cargando filtros:", error);
      } finally {
        setLoadingFiltros(false);
      }
    };
    fetchFiltros();
  }, []);

  // 2. Cargar grupos al cambiar carrera o periodo (si estamos en vista de grupos)
  useEffect(() => {
    if (!selectedCarrera || !selectedPeriodo) return;

    const fetchGrupos = async () => {
      // Si el admin cambia el filtro mientras ve gráficas, lo regresamos a ver tarjetas
      setSelectedGrupo(null);
      setLoadingGrupos(true);
      try {
        const res = await administrativosService.getGrupos(selectedCarrera, selectedPeriodo);
        if (res.success) setGrupos(res.data);
        else setGrupos([]);
      } catch (error) {
        console.error("Error cargando grupos:", error);
        setGrupos([]);
      } finally {
        setLoadingGrupos(false);
      }
    };
    fetchGrupos();
  }, [selectedCarrera, selectedPeriodo]);

  // 3. Cargar resultados al seleccionar grupo
  useEffect(() => {
    if (!selectedGrupo) return;
    const fetchResultados = async () => {
      setLoadingResultados(true);
      try {
        const res = await administrativosService.getResultadosPorGrupo(selectedCarrera, selectedPeriodo, selectedGrupo.indice_grupo);
        if (res.success && res.data) {
          setResultados(res.data.frecuencias || []);
          setAlumnosGrupo(res.data.alumnos || []);
          setCurrentSectionIndex(0);
        } else {
          setResultados([]);
          setAlumnosGrupo([]);
        }
      } catch (error) {
        console.error("Error cargando resultados por grupo:", error);
        setResultados([]);
        setAlumnosGrupo([]);
      } finally {
        setLoadingResultados(false);
      }
    };
    fetchResultados();
  }, [selectedGrupo, selectedCarrera, selectedPeriodo]);

  const handleNextSection = () => {
    if (currentSectionIndex < resultados.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loadingFiltros) return <div className="d-flex justify-content-center align-items-center min-vh-100 bg-tec-full"><div className="spinner-border text-white"></div></div>;

  return (
    <div className="bg-tec-full min-vh-100 py-5 px-3">
      <div className="container">
        <div className="card shadow-lg border-0 rounded-3 overflow-hidden">

          {/* Header / Top Bar */}
          <div className="card-header bg-white border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center">
              <img src={logo} alt="ITL" style={{ height: '50px' }} />
              <div className="ms-3">
                <h4 className="mb-0 fw-bold text-tec">Resultados por grupo</h4>
                <small className="text-muted">{selectedGrupo ? `Grupo ${selectedGrupo.letra_grupo}` : 'Selección de grupo'}</small>
              </div>
            </div>

            {/* Filtros */}
            <div className="d-flex gap-2">
              <select
                className="form-select fw-bold border-primary text-primary shadow-sm"
                value={selectedCarrera}
                onChange={(e) => setSelectedCarrera(e.target.value)}
              >
                <option value="">Seleccione carrera</option>
                {carreras.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                className="form-select fw-bold border-primary text-primary shadow-sm"
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
              >
                <option value="">Seleccione periodo</option>
                {periodos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="d-flex gap-2">
              {selectedGrupo && (
                <button className="btn border-0 bg-transparent text-tec" onClick={() => setSelectedGrupo(null)}>
                  <IoArrowBackCircleSharp size={25} /> Regresar a los grupos
                </button>
              )}
              <button className="btn border-0 bg-transparent text-tec" onClick={() => navigate('/admin/dashboard')}>
                <IoArrowBackCircleSharp size={25} /> Salir
              </button>
            </div>
          </div>

          <div className="card-body p-5 bg-light">

            {/* VISTA 1: TARJETAS DE GRUPOS */}
            {!selectedGrupo && (
              <>
                {loadingGrupos ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : grupos.length === 0 ? (
                  <div className="alert alert-info text-center">No hay grupos registrados para esta carrera y periodo</div>
                ) : (
                  <div className="row g-4 justify-content-center">
                    {grupos.map(g => (
                      <div key={g.indice_grupo} className="col-sm-6 col-md-4 col-lg-3">
                        <div
                          className="card shadow h-100 text-center p-4 border-0 card-custom cursor-pointer zoom-effect bg-white"
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedGrupo(g)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedGrupo(g);
                            }
                          }}
                        >
                          <div className="card-body d-flex flex-column justify-content-center p-2">
                            <h3 className="fw-bold fs-1 text-dark mb-2">{g.letra_grupo}</h3>
                            <span className="text-muted small mb-2">{g.periodo}</span>
                            <p className="badge bg-info text-white align-self-center mb-1 px-3 py-2">Ver diagnóstico</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* VISTA 2: GRÁFICAS DEL GRUPO SELECCIONADO */}
            {selectedGrupo && (
              <>
                {loadingResultados ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : resultados.length === 0 ? (
                  <div className="alert alert-warning text-center">Nadie en este grupo ha contestado el cuestionario aún</div>
                ) : (
                  <div className="row g-4">
                    {resultados.length > 0 && (
                      <div className="col-12 mb-5">
                        {(() => {
                          const seccion = resultados[currentSectionIndex];
                          const closedQuestions = seccion.preguntas.filter(p => !p.tipo_resp || (!p.tipo_resp.startsWith('Abierta') && p.tipo_resp !== 'Fecha'));
                          const openQuestions = seccion.preguntas.filter(p => p.tipo_resp && (p.tipo_resp.startsWith('Abierta') || p.tipo_resp === 'Fecha'));

                          return (
                            <>
                              <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="fw-bold text-dark border-start border-5 border-info ps-3 mb-0">
                                  {seccion.nombre}
                                </h4>
                                <span className="badge bg-secondary">Sección {currentSectionIndex + 1} de {resultados.length}</span>
                              </div>

                              <div className="row">
                                {closedQuestions.map((pregunta) => (
                                  <div key={pregunta.id_pregunta} className="col-md-6 mb-4">
                                    <div className="bg-white p-3 rounded border shadow-sm h-100">
                                      <h6 className="fw-bold text-secondary mb-3">{pregunta.pregunta}</h6>
                                      <div style={{ height: 250 }}>
                                        <ResponsiveContainer>
                                          <BarChart data={pregunta.opciones} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="opcion" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: '#f0f0f0' }} />
                                            <Bar dataKey="cantidad" name="Votos" radius={[4, 4, 0, 0]}>
                                              {pregunta.opciones.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                              ))}
                                            </Bar>
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {openQuestions.length > 0 && (
                                <div className="bg-white p-4 rounded border shadow-sm text-center mt-4 border-top border-3 border-primary">
                                  <h6 className="fw-bold mb-3">Esta sección contiene {openQuestions.length} pregunta(s) abierta(s)</h6>
                                  <button
                                    className="btn border-0 bg-transparent text-primary fw-bold fs-5"
                                    onClick={() => setModalAlumnosOpen(true)}
                                  >
                                    <i className="bi bi-people-fill me-2"></i>
                                    Ver respuestas abiertas por alumno
                                  </button>
                                </div>
                              )}

                              {/* Controles de paginación */}
                              <div className="d-flex justify-content-between align-items-center mt-5 flex-wrap gap-3">
                                <button 
                                  className="btn border-0 bg-transparent text-primary fw-bold px-3" 
                                  onClick={handlePrevSection} 
                                  disabled={currentSectionIndex === 0}
                                >
                                  <i className="bi bi-chevron-left me-1"></i> Anterior
                                </button>
                                
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                  {resultados.map((_, idx) => (
                                    <button
                                      key={idx}
                                      className={`btn rounded-circle fw-bold d-flex justify-content-center align-items-center ${currentSectionIndex === idx ? 'btn-primary text-white shadow' : 'btn-light text-secondary border'}`}
                                      style={{ width: '45px', height: '45px' }}
                                      onClick={() => {
                                        setCurrentSectionIndex(idx);
                                        window.scrollTo(0, 0);
                                      }}
                                    >
                                      {idx + 1}
                                    </button>
                                  ))}
                                </div>

                                <button 
                                  className="btn border-0 bg-transparent text-primary fw-bold px-3" 
                                  onClick={handleNextSection} 
                                  disabled={currentSectionIndex === resultados.length - 1}
                                >
                                  Siguiente <i className="bi bi-chevron-right ms-1"></i>
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {modalAlumnosOpen && (
          <ListaAlumnosModal
            alumnos={alumnosGrupo}
            seccionNombre={resultados[currentSectionIndex]?.nombre}
            onClose={() => setModalAlumnosOpen(false)}
            onSelectAlumno={(alum) => {
              setSelectedAlumno(alum);
            }}
          />
        )}

        {selectedAlumno && (
          <RespuestasAbiertasModal
            alumno={selectedAlumno}
            seccionId={resultados[currentSectionIndex]?.id_seccion}
            seccionNombre={resultados[currentSectionIndex]?.nombre}
            onClose={() => setSelectedAlumno(null)}
          />
        )}

      </div>
    </div>
  );
};

export default ResultadosGruposAdmin;
