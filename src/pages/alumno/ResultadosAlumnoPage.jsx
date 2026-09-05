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

  const getGroupedChartData = (respuestas) => {
    const cerradas = respuestas.filter(r => r.tipo_resp === 'Cerrada');
    
    const groups = {};
    cerradas.forEach(r => {
      // Extraemos el número base de la pregunta (ej. "43" de "43.1", o "61" de "61.")
      const match = r.pregunta.match(/^(\d+)/);
      const baseNum = match ? match[1] : r.id_pregunta;
      
      const key = baseNum + "-" + JSON.stringify(r.opciones_posibles || []);
      
      if (!groups[key]) groups[key] = { opciones: r.opciones_posibles || [], preguntas: [] };
      groups[key].preguntas.push(r);
    });

    const charts = [];
    Object.values(groups).forEach(group => {
      if (group.preguntas.length >= 2) {
        const counts = {};
        group.preguntas.forEach(r => {
          if (r.respuesta_elegida && r.respuesta_elegida !== "Sin responder") {
            counts[r.respuesta_elegida] = (counts[r.respuesta_elegida] || 0) + 1;
          }
        });
        
        const chartData = Object.keys(counts).map(key => ({
          name: key,
          cantidad: counts[key]
        }));
        
        const regex = /^(\d+(\.\d+)?)/;
        const nums = group.preguntas.map(p => {
          const match = p.pregunta.match(regex);
          return match ? match[1] : null;
        }).filter(n => n !== null);
        
        let label = "Preguntas agrupadas";
        if (nums.length > 0) {
           label = `Preguntas ${nums[0]} a ${nums[nums.length-1]}`;
           
           // Extraer el texto base de la primera pregunta para dar contexto
           const firstPregunta = group.preguntas[0].pregunta;
           const titleMatch = firstPregunta.match(/^\d+(?:\.\d+)?\s*(.*?)\s*(?:-|$)/);
           if (titleMatch && titleMatch[1]) {
             label += ` - ${titleMatch[1].trim()}`;
           }
        }
        
        charts.push({
          label,
          opcionesTexto: group.opciones.join(' / '),
          data: chartData
        });
      }
    });
    
    return charts;
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
                const charts = getGroupedChartData(seccion.respuestas || []);

                return (
                  <div key={seccion.id_seccion} className="col-12 mb-5">
                    <h5 className="fw-bold text-dark border-start border-5 border-primary ps-3 mb-3">
                      {seccion.nombre}
                    </h5>

                    {charts.map((chart, idx) => (
                      <div key={idx} className="bg-white p-4 rounded border shadow-sm mb-4">
                        <div className="mb-4 text-center border-bottom pb-2">
                          <h6 className="fw-bold text-primary mb-1">{chart.label}</h6>
                          <small className="text-muted">Opciones evaluadas: {chart.opcionesTexto}</small>
                        </div>
                        <div style={{ height: 350 }}>
                          <ResponsiveContainer>
                            <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                              <YAxis allowDecimals={false} />
                              <Tooltip cursor={{ fill: '#f0f0f0' }} />
                              <Bar dataKey="cantidad" name="Respuestas" radius={[4, 4, 0, 0]}>
                                {chart.data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}

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