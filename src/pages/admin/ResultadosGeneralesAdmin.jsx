import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { administrativosService } from '../../services/administrativosService';
import logo from '../../assets/itl_leon.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ResultadosGeneralesAdmin = () => {
  const navigate = useNavigate();
  const [loadingFiltros, setLoadingFiltros] = useState(true);
  const [loadingDatos, setLoadingDatos] = useState(false);

  // Filtros disponibles
  const [carreras, setCarreras] = useState([]);
  const [periodos, setPeriodos] = useState([]);

  // Filtros seleccionados
  const [selectedCarrera, setSelectedCarrera] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');

  const [resultados, setResultados] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Cargar filtros al inicio
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

  // Cargar resultados cuando cambien ambos filtros
  useEffect(() => {
    if (!selectedCarrera || !selectedPeriodo) return;

    const fetchResultados = async () => {
      setLoadingDatos(true);
      try {
        const res = await administrativosService.getResultadosGenerales(selectedCarrera, selectedPeriodo);
        if (res.success) {
          setResultados(res.data);
          setCurrentSectionIndex(0);
        } else {
          setResultados([]);
        }
      } catch (error) {
        console.error("Error cargando resultados generales:", error);
        setResultados([]);
      } finally {
        setLoadingDatos(false);
      }
    };
    fetchResultados();
  }, [selectedCarrera, selectedPeriodo]);

  const handleNextSection = () => {
    if (currentSectionIndex < resultados.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
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
                <h4 className="mb-0 fw-bold text-tec">Resultados por carrera</h4>
                <small className="text-muted">Resultados globales</small>
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

            <button className="btn border-0 bg-transparent text-tec" onClick={() => navigate('/admin/dashboard')}>
              <IoArrowBackCircleSharp size={25} /> Regresar
            </button>
          </div>

          <div className="card-body p-5 bg-light">
            {loadingDatos ? (
              <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
            ) : resultados.length === 0 ? (
              <div className="alert alert-info text-center">No hay datos disponibles para estos filtros.</div>
            ) : (
              <div className="row g-4">
                {(() => {
                  const seccion = resultados[currentSectionIndex];
                  if (!seccion) return null;

                  // Filtrar las preguntas abiertas
                  const closedQuestions = seccion.preguntas.filter(p => !p.tipo_resp || (!p.tipo_resp.startsWith('Abierta') && p.tipo_resp !== 'Fecha'));

                  return (
                    <div className="col-12 mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-dark border-start border-5 border-primary ps-3 mb-0">
                          {seccion.nombre}
                        </h4>
                        <span className="badge bg-secondary">Sección {currentSectionIndex + 1} de {resultados.length}</span>
                      </div>

                      <div className="row">
                        {closedQuestions.length > 0 ? closedQuestions.map((pregunta) => (
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
                        )) : (
                          <div className="col-12">
                            <div className="alert alert-light text-center border">
                              No hay gráficas disponibles para esta sección.
                            </div>
                          </div>
                        )}
                      </div>

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
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadosGeneralesAdmin;
