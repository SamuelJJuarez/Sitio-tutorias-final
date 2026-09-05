import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from '../../assets/itl_leon.png';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserTie, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const API_URL = 'https://api-sitio-tutorias.vercel.app/api/verificacion';

const ResponderEntrevistaPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const accionInicial = searchParams.get('accion') === 'rechazar' ? 'rechazar' : 'confirmar';

  const [accion, setAccion] = useState(accionInicial);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entrevista, setEntrevista] = useState(null);
  const [error, setError] = useState('');
  const [respuestaEstado, setRespuestaEstado] = useState(null); // 'confirmada' | 'rechazada' | null

  useEffect(() => {
    const fetchEntrevista = async () => {
      if (!token) {
        setError('Enlace inválido o token no proporcionado.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/entrevista/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setEntrevista(data.data);
          if (data.data.estado !== 'pendiente') {
            setRespuestaEstado(data.data.estado);
          }
        } else {
          setError(data.message || 'No se pudo cargar la información de la entrevista.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntrevista();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (accion === 'rechazar' && !motivo.trim()) {
      alert('Por favor, indica el motivo por el cual no podrás asistir.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/entrevista/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          accion,
          motivo: accion === 'rechazar' ? motivo.trim() : null
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRespuestaEstado(data.estado);
      } else {
        setError(data.message || 'Error al registrar tu respuesta.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al procesar tu respuesta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-tec-full min-vh-100 p-3 d-flex align-items-center justify-content-center">
      <div className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white" style={{ maxWidth: '560px', width: '100%' }}>
        
        {/* Encabezado con Logo */}
        <div className="text-center mb-4">
          <img src={logo} alt="Logo ITL" style={{ width: '75px', marginBottom: '10px' }} />
          <h4 className="fw-bold text-tec m-0">INSTITUTO TECNOLÓGICO DE LEÓN</h4>
          <small className="text-secondary fw-bold">SISTEMA INSTITUCIONAL DE TUTORÍAS</small>
        </div>

        {/* Estado: Cargando */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted mt-3">Cargando datos de la entrevista...</p>
          </div>
        )}

        {/* Estado: Error */}
        {!loading && error && (
          <div className="alert alert-danger text-center p-4 rounded-3">
            <FaExclamationTriangle size={32} className="mb-2 text-danger" />
            <h5 className="fw-bold">Aviso</h5>
            <p className="mb-0">{error}</p>
            <button className="btn btn-tec mt-3 btn-sm" onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
        )}

        {/* Estado: Ya respondida o recién respondida */}
        {!loading && !error && respuestaEstado && (
          <div className="text-center py-4">
            {respuestaEstado === 'confirmada' ? (
              <>
                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex p-3 mb-3">
                  <FaCheckCircle size={55} />
                </div>
                <h4 className="fw-bold text-success">¡Asistencia Confirmada!</h4>
                <p className="text-muted mt-2">
                  Tu tutor ha sido notificado de tu confirmación para la sesión de tutoría.
                </p>
              </>
            ) : (
              <>
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-3 mb-3">
                  <FaTimesCircle size={55} />
                </div>
                <h4 className="fw-bold text-danger">Inasistencia Registrada</h4>
                <p className="text-muted mt-2">
                  Tu tutor ha recibido el motivo de tu inasistencia y podrá reprogramar la sesión en una nueva fecha.
                </p>
                {entrevista?.motivo_rechazo && (
                  <div className="bg-light p-3 rounded-3 text-start mt-3 border">
                    <small className="fw-bold text-secondary">Motivo registrado:</small>
                    <p className="mb-0 text-dark fst-italic">"{entrevista.motivo_rechazo}"</p>
                  </div>
                )}
              </>
            )}

            {/* Detalles de la cita */}
            {entrevista && (
              <div className="card bg-light border-0 p-3 rounded-3 mt-4 text-start">
                <div className="small text-secondary mb-1">
                  <FaUserTie className="me-2 text-tec" />
                  <b>Tutor:</b> {entrevista.profesor_nombre} {entrevista.profesor_apellido_p}
                </div>
                <div className="small text-secondary mb-1">
                  <FaCalendarAlt className="me-2 text-tec" />
                  <b>Fecha:</b> {entrevista.fecha}
                </div>
                <div className="small text-secondary mb-1">
                  <FaClock className="me-2 text-tec" />
                  <b>Hora:</b> {entrevista.hora}
                </div>
                <div className="small text-secondary">
                  <FaMapMarkerAlt className="me-2 text-tec" />
                  <b>Lugar:</b> {entrevista.lugar}
                </div>
              </div>
            )}

            <button className="btn btn-tec w-100 mt-4 py-2 fw-bold" onClick={() => navigate('/')}>
              Ir a la plataforma
            </button>
          </div>
        )}

        {/* Estado: Pendiente de respuesta (Formulario) */}
        {!loading && !error && !respuestaEstado && entrevista && (
          <div>
            <h5 className="fw-bold text-center text-dark mb-3">Respuesta a Entrevista de Tutoría</h5>
            
            {/* Tarjeta de Resumen de la Cita */}
            <div className="bg-light p-3 rounded-3 mb-4 border">
              <div className="mb-2">
                <small className="text-muted d-block">Alumno:</small>
                <span className="fw-bold text-dark">{entrevista.alumno_nombre} {entrevista.alumno_apellido_p} ({entrevista.num_control_alum})</span>
              </div>
              <div className="mb-2">
                <small className="text-muted d-block">Tutor:</small>
                <span className="fw-bold text-tec">{entrevista.profesor_nombre} {entrevista.profesor_apellido_p}</span>
              </div>
              <hr className="my-2" />
              <div className="row g-2 text-secondary small">
                <div className="col-6">
                  <FaCalendarAlt className="me-1 text-primary" /> <b>Fecha:</b> {entrevista.fecha}
                </div>
                <div className="col-6">
                  <FaClock className="me-1 text-primary" /> <b>Hora:</b> {entrevista.hora}
                </div>
                <div className="col-12">
                  <FaMapMarkerAlt className="me-1 text-primary" /> <b>Lugar:</b> {entrevista.lugar}
                </div>
              </div>
            </div>

            {/* Opciones de Acción */}
            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                className={`btn flex-fill py-2 fw-bold ${accion === 'confirmar' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'}`}
                onClick={() => setAccion('confirmar')}
              >
                ✓ Asistiré
              </button>
              <button
                type="button"
                className={`btn flex-fill py-2 fw-bold ${accion === 'rechazar' ? 'btn-danger text-white shadow-sm' : 'btn-outline-secondary'}`}
                onClick={() => setAccion('rechazar')}
              >
                ✗ No Podré Asistir
              </button>
            </div>

            {/* Formulario de confirmación / justificación */}
            <form onSubmit={handleSubmit}>
              {accion === 'confirmar' ? (
                <div className="text-center py-2 mb-4">
                  <p className="text-secondary small">
                    Al confirmar, se enviará una notificación a tu tutor indicando que asistirás puntualmente a la cita.
                  </p>
                  <button 
                    type="submit" 
                    className="btn btn-success w-100 py-2 fs-6 fw-bold shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Asistencia'}
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small">
                    Motivo por el cual no podrás asistir (Obligatorio):
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Escribe brevemente la razón por la que no puedes asistir en este horario..."
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                  ></textarea>
                  <small className="text-muted d-block mt-1">
                    Esta justificación le llegará a tu profesor para que pueda reprogramar la cita.
                  </small>
                  <button 
                    type="submit" 
                    className="btn btn-danger w-100 py-2 fs-6 fw-bold shadow-sm mt-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando justificación...' : 'Enviar Justificación de Inasistencia'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResponderEntrevistaPage;
