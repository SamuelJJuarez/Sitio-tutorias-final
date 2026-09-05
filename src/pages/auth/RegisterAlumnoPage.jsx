import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alumnosService } from '../../services/alumnosService';
import { gruposService } from '../../services/gruposService';
import SuccessModal from '../../components/modals/SuccessModal';
import EmailVerificationModal from '../../components/modals/EmailVerificationModal';

const RegisterAlumnoPage = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [grupos, setGrupos] = useState([]);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    num_control_alum: '',
    nombre: '',
    apellidoP: '',
    apellidoM: '',
    semestre: '',
    correo: '',
    contrasena: '',
    estado_civil: 'Soltero', // Valor por defecto
    carrera: '',
    indice_grupo: ''
  });

  // Cargar grupos al iniciar
  useEffect(() => {
    const cargarGrupos = async () => {
      // Solo buscamos si ya seleccionó una carrera
      if (formData.carrera) {
        try {
          const res = await gruposService.getByCarrera(formData.carrera);
          if (res.success) {
            setGrupos(res.data);
          } else {
            setGrupos([]); // Limpiar si no hay éxito
          }
        } catch (error) {
          console.error("Error cargando grupos");
        }
      } else {
        setGrupos([]); // Si quita la carrera, limpiamos los grupos
      }
    };
    cargarGrupos();
  }, [formData.carrera]);

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
  };

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

    if (formData.num_control_alum.trim().length < 8) {
      return;
    }

    if (formData.contrasena.trim().length < 8) {
      return;
    }

    if (formData.semestre.trim().length < 1) {
      return;
    }

    const correoRegex = /^[a-zA-Z0-9._%+-]+@leon\.tecnm\.mx$/;
    if (!correoRegex.test(formData.correo)) {
      return;
    }

    try {
      const dataToSend = { ...formData, frontendUrl: window.location.origin };
      const res = await alumnosService.register(dataToSend);
      if (res.success && res.status === 'pending') {
        setShowEmailModal(true);
        const { registroId } = res;

        let attempts = 0;
        const maxAttempts = 300; // 10 minutos (300 * 2s = 600s)

        const pollInterval = setInterval(async () => {
          attempts++;
          if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setShowEmailModal(false);
            alert('Tiempo de espera agotado. Intente registrarse de nuevo.');
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
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 text-tec fw-bold">Registrar alumno</h2>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Fila 1 */}
                  <div className="col-md-6">
                    <label className="form-label">Número de control</label>
                    <input type="text" name="num_control_alum" className={`form-control ${formData.num_control_alum.length > 0 && formData.num_control_alum.trim().length < 8 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={12} />
                    <div className="invalid-feedback">
                      El Número de control debe tener al menos 8 caracteres
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Estado Civil</label>
                    <select name="estado_civil" className="form-select" onChange={handleChange}>
                      <option value="Soltero">Soltero/a</option>
                      <option value="Casado">Casado/a</option>
                      <option value="Unión Libre">Unión Libre</option>
                      <option value="Divorciado">Divorciado/a</option>
                      <option value="Viudo">Viudo/a</option>
                    </select>
                  </div>

                  {/* Fila 2 */}
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className={`form-control ${formData.nombre.length > 0 && formData.nombre.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={40} />
                    <div className="invalid-feedback">
                      El nombre debe tener al menos 3 caracteres
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Carrera</label>
                    <select name="carrera" className="form-select" onChange={handleChange} required>
                      <option value="">Seleccione...</option>
                      <option value="Ingeniería en Sistemas Computacionales">Ing. Sistemas Computacionales</option>
                      <option value="Ingeniería Industrial">Ing. Industrial</option>
                      <option value="Ingeniería en Gestión Empresarial">Ing. Gestión Empresarial</option>
                      <option value="Ingeniería Electrónica">Ing. Electrónica</option>
                      <option value="Ingeniería Mecatrónica">Ing. Mecatrónica</option>
                      <option value="Ingeniería en Logística">Ing. en Logística</option>
                      <option value="Ingeniería Electromecánica">Ing. Electromecánica</option>
                      <option value="Ingeniería en TICS">Ing. en Tecnologías de la Información y Comunicaciones</option>
                    </select>
                  </div>

                  {/* Fila 3 */}
                  <div className="col-md-6">
                    <label className="form-label">Apellido Paterno</label>
                    <input type="text" name="apellidoP" className={`form-control ${formData.apellidoP.length > 0 && formData.apellidoP.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={20} />
                    <div className="invalid-feedback">
                      El apellido paterno debe tener al menos 3 caracteres
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellido Materno</label>
                    <input type="text" name="apellidoM" className={`form-control ${formData.apellidoM.length > 0 && formData.apellidoM.trim().length < 3 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={20} />
                    <div className="invalid-feedback">
                      El apellido materno debe tener al menos 3 caracteres
                    </div>
                  </div>

                  {/* Fila 4 */}
                  <div className="col-md-6">
                    <label className="form-label">Semestre</label>
                    <input
                      type="number"
                      name="semestre"
                      className={`form-control ${formData.semestre.length > 0 && formData.semestre.trim().length < 1 ? 'is-invalid' : ''}`}
                      onChange={handleChange}
                      onInput={(e) => {
                        if (e.target.value.length > 2) {
                          e.target.value = e.target.value.slice(0, 2);
                        }
                      }}
                      required
                    />
                    <div className="invalid-feedback">
                      El semestre debe tener al menos 1 caracter
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grupo</label>
                    <select name="indice_grupo" className="form-select" onChange={handleChange} required>
                      <option value="">Seleccione...</option>
                      {grupos.map((g) => (
                        // Asumiendo que tu API devuelve indice_grupo y letra_grupo
                        <option key={g.indice_grupo} value={g.indice_grupo}>
                          {g.letra_grupo} ({g.periodo})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fila 5 */}
                  <div className="col-md-6">
                    <label className="form-label">Correo Institucional</label>
                    <input type="email" name="correo" className={`form-control ${formData.correo.length > 0 && !/^[a-zA-Z0-9._%+-]+@leon\.tecnm\.mx$/.test(formData.correo) ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={35} />
                    <div className="invalid-feedback">
                      El correo debe ser institucional (@leon.tecnm.mx)
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contraseña</label>
                    <input type="password" name="contrasena" className={`form-control ${formData.contrasena.length > 0 && formData.contrasena.trim().length < 8 ? 'is-invalid' : ''}`} onChange={handleChange} required maxLength={30} />
                    <div className="invalid-feedback">
                      La contraseña debe tener al menos 8 caracteres
                    </div>
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

export default RegisterAlumnoPage;