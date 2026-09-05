import React, { useState } from 'react';
import EmailVerificationModal from './EmailVerificationModal';
import SuccessModal from './SuccessModal';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    rol: 'alumno',
    correo: '',
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.nueva_contrasena.length < 8 || formData.nueva_contrasena.length > 30) {
      setError('La contraseña debe tener entre 8 y 30 caracteres.');
      return;
    }

    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        correo: formData.correo,
        rol: formData.rol,
        nueva_contrasena: formData.nueva_contrasena,
        frontendUrl: window.location.origin
      };

      const res = await fetch(`https://api-sitio-tutorias.vercel.app/api/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      const data = await res.json();

      if (data.success && data.status === 'pending') {
        setShowEmailModal(true);
        const { registroId } = data;

        let attempts = 0;
        const maxAttempts = 300; // 10 minutes

        const pollInterval = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setShowEmailModal(false);
            setError('Tiempo de espera agotado. Intente de nuevo.');
            setLoading(false);
            return;
          }

          try {
            const statusRes = await fetch(`https://api-sitio-tutorias.vercel.app/api/verificacion/status/${registroId}`);
            const statusData = await statusRes.json();

            if (statusData.success && statusData.status === 'verified') {
              clearInterval(pollInterval);
              setShowEmailModal(false);
              setShowSuccessModal(true);
              setTimeout(() => {
                setShowSuccessModal(false);
                setLoading(false);
                onClose();
              }, 2000);
            }
          } catch (err) {
            console.error('Error polling status');
          }
        }, 2000);
      } else {
        setError(data.message || 'Error al solicitar cambio de contraseña');
        setLoading(false);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title text-tec fw-bold">Recuperar contraseña</h5>
              <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3 d-flex justify-content-around">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="rol" value="alumno"
                      checked={formData.rol === 'alumno'} onChange={handleChange} disabled={loading} />
                    <label className="form-check-label">Alumno</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="rol" value="maestro"
                      checked={formData.rol === 'maestro'} onChange={handleChange} disabled={loading} />
                    <label className="form-check-label">Profesor</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="rol" value="admin"
                      checked={formData.rol === 'admin'} onChange={handleChange} disabled={loading} />
                    <label className="form-check-label">Admin</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Correo institucional:</label>
                  <input
                    type="email"
                    name="correo"
                    className="form-control"
                    placeholder="ejemplo@leon.tecnm.mx"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Nueva contraseña:</label>
                  <input
                    type="password"
                    name="nueva_contrasena"
                    className="form-control"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.nueva_contrasena}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={8}
                    maxLength={30}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary">Confirmar nueva contraseña:</label>
                  <input
                    type="password"
                    name="confirmar_contrasena"
                    className="form-control"
                    placeholder="Repita su contraseña"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={8}
                    maxLength={30}
                  />
                </div>

                {error && (
                  <div className="alert alert-danger text-center p-2 mb-3 small" role="alert">
                    {error}
                  </div>
                )}

                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-tec fw-bold" disabled={loading}>
                    {loading ? 'Procesando...' : 'Reestablecer contraseña'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <EmailVerificationModal isOpen={showEmailModal} />
      <SuccessModal isOpen={showSuccessModal} message="Contraseña actualizada exitosamente" />
    </>
  );
};

export default ForgotPasswordModal;
