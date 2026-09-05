import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maestrosService } from '../../services/maestrosService';
import logo from '../../assets/itl_leon.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DetalleRespuestasModal from '../../components/modals/DetalleRespuestasModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const ResultadosAlumnoVista = () => {
  const { num_control } = useParams(); // Recibimos ID
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

  const getChartData = (respuestas) => {
    const counts = {};
    respuestas.forEach(r => {
      if (r.respuesta_elegida && r.respuesta_elegida !== "Sin responder") {
        counts[r.respuesta_elegida] = (counts[r.respuesta_elegida] || 0) + 1;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      cantidad: counts[key]
    }));
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await maestrosService.getResultadosAlumno(num_control);
        if (res.success) setResultados(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, [num_control]);

  if (loading) return <div className="text-white text-center mt-5">Cargando...</div>;

  return (
    <div className="bg-tec-full min-vh-100 py-5 px-3">
      <div className="container">
        <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img src={logo} alt="ITL" style={{ height: '50px' }} />
              <div className="ms-3">
                <h4 className="mb-0 fw-bold text-tec">Informe del alumno</h4>
                <small className="text-muted">{num_control}</small>
              </div>
            </div>
            <button className="btn border-0 bg-transparent text-tec d-flex align-items-center gap-2" onClick={() => navigate(-1)}>Regresar</button>
          </div>
          <div className="card-body p-5 bg-light">
            {resultados.length === 0 ? <div className="alert alert-warning">El alumno no ha completado el cuestionario.</div> : (
              <div className="row g-4">
                {resultados.map((seccion) => {
                  const showChart = seccion.id_seccion !== 2 && seccion.id_seccion !== 3;
                  const chartData = showChart ? getChartData(seccion.respuestas || []) : [];

                  return (
                    <div key={seccion.id_seccion} className="col-12 mb-5">
                      <h5 className="fw-bold text-dark border-start border-5 border-primary ps-3 mb-3">{seccion.nombre}</h5>

                      {showChart && (
                        <div className="bg-white p-3 rounded border shadow-sm mb-3" style={{ height: 350 }}>
                          <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ bottom: 50, top: 20, right: 30, left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                              <YAxis allowDecimals={false} />
                              <Tooltip cursor={{ fill: '#f0f0f0' }} />
                              <Bar dataKey="cantidad" name="Respuestas" radius={[4, 4, 0, 0]}>
                                {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      <div>
                        <button
                          className="btn border-0 bg-transparent text-primary"
                          onClick={() => setModalData(seccion)}
                        >
                          <i className="bi bi-eye-fill me-2"></i>
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DetalleRespuestasModal
          modalData={modalData}
          onClose={() => setModalData(null)}
        />

      </div>
    </div>
  );
};

export default ResultadosAlumnoVista;