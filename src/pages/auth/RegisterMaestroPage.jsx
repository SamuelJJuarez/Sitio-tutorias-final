import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { maestrosService } from '../../services/maestrosService';
import SuccessModal from '../../components/modals/SuccessModal';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';

const RegisterMaestroPage = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [formData, setFormData] = useState({
    num_control_prof: '',
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    correo: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nombre' || name === 'apellidoP' || name === 'apellidoM') {

      // Esta regex permite: Letras, Acentos, Ñ, Diéresis y Espacios
      const soloTextoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;

      // Si el valor NO coincide con la regex, no hacemos nada (bloqueamos la tecla)
      if (!soloTextoRegex.test(value)) {
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nombre.trim().length < 3) {
      return;
    }

    if (formData.apellidoP.trim().length < 3) {
      return;
    }

    if (formData.apellidoM.trim().length < 3) {
      return;
    }

    if (formData.num_control_prof.trim().length < 4) {
      return;
    }

    if (formData.contrasena.trim().length < 8) {
      return;
    }

    const correoRegex = /^[a-zA-Z0-9._%+-]+@leon\.tecnm\.mx$/;
    if (!correoRegex.test(formData.correo)) {
      return;
    }

    try {
      const dataToSend = { ...formData, frontendUrl: window.location.origin };
      const res = await maestrosService.register(dataToSend);
      if (res.success && res.status === 'pending') {
        setShowEmailModal(true);
        const { registroId } = res;

        let attempts = 0;
        const maxAttempts = 300;

        const pollInterval = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setShowEmailModal(false);
            alert('Tiempo de espera agotado. Intente registrarse de nuevo.');
            return;
          }

          try {
            const statusRes = await fetch(`https://apitutoriasitl.vercel.app/api/verificacion/status/${registroId}`);
            const statusData = await statusRes.json();

            if (statusData.success && statusData.status === 'verified') {
              clearInterval(pollInterval);
              setShowEmailModal(false);
              setShowSuccessModal(true);
              setTimeout(() => {
                navigate('/');
              }, 2000);
            }
          } catch (e) {
            console.error('Error polling status');
          }
        }, 2000);
      } else if (res.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        alert('Error: ' + res.message);
      }
    } catch (error) {
      alert('Error de conexión al enviar el correo');
    }
  };

  return (
    <div className="bg-tec-full">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 text-tec fw-bold">Registrar profesor</h2>
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label>Número de control</label>
                  <input type="text" name="num_control_prof" className={`form-control ${formData.num_control_prof.length > 0 && formData.num_control_prof.trim().length < 4 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={4} />
                  <div className="invalid-feedback">
                    El Número de control debe tener al menos 4 caracteres
                  </div>
                </div>
                <div className="col-12">
                  <label>Nombre</label>
                  <input type="text" name="nombre" className={`form-control ${formData.nombre.length > 0 && formData.nombre.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={40} />
                  <div className="invalid-feedback">
                    El nombre debe tener al menos 3 caracteres
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Apellido Paterno</label>
                  <input type="text" name="apellidoP" className={`form-control ${formData.apellidoP.length > 0 && formData.apellidoP.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={20} />
                  <div className="invalid-feedback">
                    El apellido paterno debe tener al menos 3 caracteres
                  </div>
                </div>
                <div className="col-md-6">
                  <label>Apellido Materno</label>
                  <input type="text" name="apellidoM" className={`form-control ${formData.apellidoM.length > 0 && formData.apellidoM.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={20} />
                  <div className="invalid-feedback">
                    El apellido materno debe tener al menos 3 caracteres
                  </div>
                </div>
                <div className="col-12">
                  <label>Correo Institucional</label>
                  <input type="email" name="correo" className={`form-control ${formData.correo.length > 0 && !/^[a-zA-Z0-9._%+-]+@leon\.tecnm\.mx$/.test(formData.correo) ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={60} />
                  <div className="invalid-feedback">
                    El correo debe ser institucional (@leon.tecnm.mx)
                  </div>
                </div>
                <div className="col-12">
                  <label>Contraseña</label>
                  <input type="password" name="contrasena" className={`form-control ${formData.contrasena.length > 0 && formData.contrasena.trim().length < 8 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={30} />
                  <div className="invalid-feedback">
                    La contraseña debe tener al menos 8 caracteres
                  </div>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button type="submit" className="btn btn-tec btn-lg">Aceptar</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal isOpen={showSuccessModal} message="Usuario registrado correctamente" />
      <EmailVerificationModal isOpen={showEmailModal} />
    </div>
  );
};

export default RegisterMaestroPage;