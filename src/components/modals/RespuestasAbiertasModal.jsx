import React, { useState, useEffect } from 'react';
import { cuestionarioService } from '../../services/cuestionarioService';

const RespuestasAbiertasModal = ({ alumno, seccionId, seccionNombre, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [respuestasAbiertas, setRespuestasAbiertas] = useState([]);

  useEffect(() => {
    const fetchRespuestas = async () => {
      setLoading(true);
      try {
        const res = await cuestionarioService.getResultadosPorAlumnoId(alumno.num_control_alum);
        if (res.success && res.data) {
          // Filtrar la sección solicitada
          const seccion = res.data.find(s => s.id_seccion === seccionId);
          if (seccion && seccion.respuestas) {
            // Filtrar solo las respuestas abiertas (Abierta_Corta, Abierta_Larga, Fecha)
            const abiertas = seccion.respuestas.filter(r => 
              r.tipo_resp && (r.tipo_resp.startsWith('Abierta') || r.tipo_resp === 'Fecha')
            );
            setRespuestasAbiertas(abiertas);
          } else {
            setRespuestasAbiertas([]);
          }
        }
      } catch (error) {
        console.error('Error cargando respuestas abiertas del alumno:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRespuestas();
  }, [alumno, seccionId]);

  if (!alumno) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-tec text-white">
            <div>
              <h5 className="modal-title fw-bold mb-0">Respuestas Abiertas</h5>
              <small className="opacity-75">{alumno.apellidoP} {alumno.apellidoM} {alumno.nombre} - {seccionNombre}</small>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4 bg-light">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Cargando respuestas...</p>
              </div>
            ) : respuestasAbiertas.length === 0 ? (
              <div className="alert alert-info text-center">El alumno no proporcionó respuestas abiertas para esta sección.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {respuestasAbiertas.map((resp, idx) => (
                  <div key={resp.id_pregunta} className="bg-white p-4 rounded border shadow-sm">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                      {resp.pregunta}
                    </h6>
                    <p className="text-secondary mb-0 p-3 bg-light rounded border">
                      {resp.respuesta_elegida && resp.respuesta_elegida.trim() !== '' ? (
                        resp.respuesta_elegida
                      ) : (
                        <span className="fst-italic text-muted">Sin respuesta</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer bg-light border-top-0">
            <button className="btn btn-secondary px-4" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RespuestasAbiertasModal;
