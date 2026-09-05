import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { administrativosService } from '../../services/administrativosService';
import logo from '../../assets/itl_leon.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DetalleResumenAdminModal from '../../components/modals/DetalleResumenAdminModal';
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
  const [modalData, setModalData] = useState(null);

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

  const getChartData = (preguntas) => {
    // Para simplificar la vista, unimos todas las opciones de todas las preguntas de la sección.
    // O si preferimos por pregunta, mostramos una gráfica por pregunta. 
    // Como las secciones pueden tener N preguntas, en el dashboard alumno era 1 gráfica por sección
    // Si queremos gráficos fieles, es mejor mapear por pregunta. Las imágenes muestran N gráficos.
    return preguntas;
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
                <h4 className="mb-0 fw-bold text-tec">Resumen general</h4>
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
                {resultados.map((seccion) => {
                  const showChart = seccion.id_seccion !== 2 && seccion.id_seccion !== 3;

                  return (
                    <div key={seccion.id_seccion} className="col-12 mb-5">
                      <h4 className="fw-bold text-dark border-start border-5 border-primary ps-3 mb-4">
                        {seccion.nombre}
                      </h4>

                      {showChart ? (
                        <div className="row">
                          {seccion.preguntas.map((pregunta, idx) => (
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
                      ) : (
                        <div className="bg-white p-4 rounded border shadow-sm text-center">
                          <button
                            className="btn border-0 bg-transparent text-primary"
                            onClick={() => setModalData(seccion)}
                          >
                            <i className="bi bi-eye-fill me-2"></i>
                            Ver detalles
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DetalleResumenAdminModal
          modalData={modalData}
          onClose={() => setModalData(null)}
        />

      </div>
    </div>
  );
};

export default ResultadosGeneralesAdmin;
