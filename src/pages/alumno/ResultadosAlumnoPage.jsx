import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cuestionarioService } from '../../services/cuestionarioService';
import logo from '../../assets/itl_leon.png';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import DetalleRespuestasModal from '../../components/modals/DetalleRespuestasModal';
import { IoArrowBackCircleSharp } from "react-icons/io5";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const ResultadosAlumnoPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resultados, setResultados] = useState([]);
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
    const fetchResultados = async () => {
      try {
        const res = await cuestionarioService.getResultados();
        if (res.success) {
          setResultados(res.data);
        }
      } catch (error) {
        console.error("Error cargando resultados");
      } finally {
        setLoading(false);
      }
    };
    fetchResultados();
  }, []);

  if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100 bg-tec-full"><div className="spinner-border text-white"></div></div>;

  return (
    // 1. Fondo Azul (bg-tec-full)
    <div className="bg-tec-full min-vh-100 py-5 px-3">

      {/* 2. Contenedor Centrado */}
      <div className="container">

        {/* 3. CAJA BLANCA ÚNICA (Contiene todo: Header y Gráficas) */}
        <div className="card shadow-lg border-0 rounded-3 overflow-hidden">

          {/* Header interno de la caja blanca */}
          <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <img src={logo} alt="ITL" style={{ height: '50px' }} />
              <div className="ms-3">
                <h4 className="mb-0 fw-bold text-tec">Resultados del diagnóstico</h4>
                <small className="text-muted">Informe personal</small>
              </div>
            </div>
            <button className="btn border-0 bg-transparent text-tec d-flex align-items-center gap-2" onClick={() => navigate('/alumno/dashboard')}>
              <IoArrowBackCircleSharp size={30} /> Regresar
            </button>
          </div>

          <div className="card-body p-5 bg-light">
            {/* Aquí dentro van las gráficas, quizás separadas por tarjetas sutiles o divisores */}

            {resultados.length === 0 && (
              <div className="alert alert-info text-center">No hay datos disponibles.</div>
            )}

            <div className="row g-4">
              {resultados.map((seccion) => {
                const showChart = seccion.id_seccion !== 2 && seccion.id_seccion !== 3;
                const chartData = showChart ? getChartData(seccion.respuestas || []) : [];

                return (
                  <div key={seccion.id_seccion} className="col-12 mb-5">
                    <h5 className="fw-bold text-dark border-start border-5 border-primary ps-3 mb-3">
                      {seccion.nombre}
                    </h5>

                    {showChart && (
                      <div className="bg-white p-3 rounded border shadow-sm mb-3" style={{ height: 350 }}>
                        <ResponsiveContainer>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                            <YAxis allowDecimals={false} />
                            <Tooltip cursor={{ fill: '#f0f0f0' }} />
                            <Bar dataKey="cantidad" name="Respuestas" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
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

            <div className="text-center mt-5">
              <button className="btn border-0 bg-transparent text-tec px-5 py-2" onClick={() => navigate('/alumno/dashboard')}>
                <IoArrowBackCircleSharp size={30} /> Regresar
              </button>
            </div>
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

export default ResultadosAlumnoPage;