import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { administrativosService } from '../../services/administrativosService';
import SuccessModal from '../../components/modals/SuccessModal';
import AlertModal from '../../components/modals/AlertModal';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import logo from '../../assets/itl_leon.png';

const CrearGruposAdmin = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertModal, setAlertModal] = useState({
    show: false,
    title: 'Campos incompletos',
    message: ''
  });
  const [maestros, setMaestros] = useState([]);

  const showAlert = (message, title = 'Campos incompletos') => {
    setAlertModal({
      show: true,
      title,
      message
    });
  };

  const hideAlert = () => {
    setAlertModal(prev => ({ ...prev, show: false }));
  };

  // Phase 1 state
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [cantidadGrupos, setCantidadGrupos] = useState('');
  const [fase, setFase] = useState(1); // 1 = Configuración inicial, 2 = Llenar filas

  // Phase 2 state
  const [filas, setFilas] = useState([]);

  const carreras = [
    "Ingeniería en Sistemas Computacionales",
    "Ingeniería Industrial",
    "Ingeniería en Gestión Empresarial",
    "Ingeniería Electrónica",
    "Ingeniería Mecatrónica",
    "Ingeniería en Logística",
    "Ingeniería Electromecánica",
    "Ingeniería en TICS"
  ];

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Fetch teachers when component mounts
    const fetchMaestros = async () => {
      try {
        const res = await administrativosService.getMaestros();
        if (res.success) {
          setMaestros(res.data);
        }
      } catch (error) {
        console.error("Error al cargar maestros", error);
      }
    };
    fetchMaestros();
  }, []);

  const handleAceptar = () => {
    const cantidad = parseInt(cantidadGrupos);
    if (!carreraSeleccionada && (!cantidadGrupos || isNaN(cantidad))) {
      showAlert("Por favor, seleccione una carrera y especifique la cantidad de grupos a crear.", "Campos requeridos");
      return;
    }
    if (!carreraSeleccionada) {
      showAlert("Por favor, seleccione una carrera.", "Carrera requerida");
      return;
    }
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > 10) {
      showAlert("Por favor, ingrese una cantidad de grupos válida (entre 1 y 10).", "Cantidad no válida");
      return;
    }

    // Initialize rows
    const nuevasFilas = Array.from({ length: cantidad }).map(() => ({
      letra_grupo: '',
      mesInicio: '',
      mesFin: '',
      anio: currentYear.toString(),
      num_control_prof: ''
    }));

    setFilas(nuevasFilas);
    setFase(2);
  };

  const handleFilaChange = (index, field, value) => {
    setFilas(prevFilas => {
      const nuevas = [...prevFilas];
      if (field === 'letra_grupo') {
        // Auto-uppercase and max 1 character
        nuevas[index][field] = value.toUpperCase().slice(0, 1);
      } else if (field === 'anio') {
        // Max 4 characters, validation of min value happens on blur or submit
        nuevas[index][field] = value.slice(0, 4);
      } else {
        nuevas[index][field] = value;
      }
      return nuevas;
    });
  };

  const handleCrearGrupos = async () => {
    // Validate all rows
    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      if (!fila.letra_grupo || !fila.mesInicio || !fila.mesFin || !fila.anio || !fila.num_control_prof) {
        showAlert(`Por favor, complete todos los campos en la fila ${i + 1} antes de crear los grupos.`, "Campos incompletos");
        return;
      }
      
      const idxInicio = meses.indexOf(fila.mesInicio);
      const idxFin = meses.indexOf(fila.mesFin);
      if (idxInicio >= idxFin) {
        showAlert(`En la fila ${i + 1}, el mes de inicio (${fila.mesInicio}) debe ocurrir antes que el mes de fin (${fila.mesFin}).`, "Periodo no válido");
        return;
      }

      const anioNum = parseInt(fila.anio);
      if (isNaN(anioNum) || anioNum < currentYear) {
        showAlert(`El año en la fila ${i + 1} debe ser mayor o igual al actual (${currentYear}).`, "Año no válido");
        return;
      }
    }

    // Format data for backend
    const dataToSend = filas.map(fila => ({
      letra_grupo: fila.letra_grupo,
      periodo: `${fila.mesInicio}-${fila.mesFin} ${fila.anio}`,
      carrera: carreraSeleccionada,
      num_control_prof: fila.num_control_prof
    }));

    try {
      const res = await administrativosService.bulkCreateGrupos({ grupos: dataToSend });
      if (res.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        showAlert(res.message || "Error al crear grupos.", "Error al crear grupos");
      }
    } catch (error) {
      showAlert("Error de conexión al intentar crear los grupos.", "Error de conexión");
    }
  };

  return (
    <div className="bg-tec-full min-vh-100 p-4 pt-5">
      <div className="container" style={{ maxWidth: '1200px' }}>

        <div className="card-header bg-white border-bottom p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center">
            <img src={logo} alt="ITL" style={{ height: '50px' }} />
            <div className="ms-3">
              <h2 className="text-tec fw-bold m-0">Crear grupos</h2>
            </div>
          </div>
          <button className="btn border-0 bg-transparent text-tec" onClick={() => navigate('/admin/dashboard')}>
            <IoArrowBackCircleSharp size={25} /> Regresar
          </button>
        </div>


        <div className="card-body p-5 bg-light">
          <div className="card-body p-4">
            {/* Phase 1: Carrera y Cantidad */}
            <div className="row g-3 align-items-end mb-4">
              <div className="col-md-5">
                <label className="form-label fw-bold">Carrera</label>
                <select
                  className="form-select"
                  value={carreraSeleccionada}
                  onChange={(e) => setCarreraSeleccionada(e.target.value)}
                  disabled={fase === 2}
                >
                  <option value="">Seleccione una carrera...</option>
                  {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold">Cantidad de grupos</label>
                <input
                  type="number"
                  className="form-select"
                  min="1"
                  max="50"
                  value={cantidadGrupos}
                  onChange={(e) => setCantidadGrupos(e.target.value)}
                  disabled={fase === 2}
                />
              </div>
              <div className="col-md-2">
                {fase === 1 ? (
                  <button type="button" className="btn btn-link text-decoration-none fw-bold text-tec" onClick={handleAceptar}>
                    Aceptar
                  </button>
                ) : (
                  <button type="button" className="btn btn-link text-decoration-none fw-bold text-tec" onClick={() => setFase(1)}>
                    Editar configuración
                  </button>
                )}
              </div>
            </div>

            {/* Phase 2: Filas dinámicas */}
            {fase === 2 && (
              <div className="mt-5">
                <h5 className="mb-4 text-tec fw-bold">Detalle de los grupos</h5>
                {filas.map((fila, index) => (
                  <div key={index} className="row g-3 align-items-end mb-3 border-bottom pb-3">
                    <div className="col-md-1">
                      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>Letra</label>
                      <input
                        type="text"
                        className="form-control"
                        value={fila.letra_grupo}
                        onChange={(e) => handleFilaChange(index, 'letra_grupo', e.target.value)}
                        maxLength={1}
                        placeholder="Ej. A"
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>Mes inicio</label>
                      <select
                        className="form-select"
                        value={fila.mesInicio}
                        onChange={(e) => handleFilaChange(index, 'mesInicio', e.target.value)}
                      >
                        <option value="">Mes...</option>
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>Mes fin</label>
                      <select
                        className="form-select"
                        value={fila.mesFin}
                        onChange={(e) => handleFilaChange(index, 'mesFin', e.target.value)}
                      >
                        <option value="">Mes...</option>
                        {meses.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>Año</label>
                      <input
                        type="number"
                        className="form-control"
                        value={fila.anio}
                        onChange={(e) => handleFilaChange(index, 'anio', e.target.value)}
                        min={currentYear}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label fw-bold" style={{ fontSize: '0.9rem' }}>Maestro asignado</label>
                      <select
                        className="form-select"
                        value={fila.num_control_prof}
                        onChange={(e) => handleFilaChange(index, 'num_control_prof', e.target.value)}
                      >
                        <option value="">Seleccione maestro...</option>
                        {maestros.map(m => (
                          <option key={m.num_control_prof} value={m.num_control_prof}>
                            {m.nombre} {m.apellidoP} {m.apellidoM}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                <div className="text-center mt-4">
                  <button className="btn btn-tec btn-lg px-5" onClick={handleCrearGrupos}>
                    Crear grupos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <SuccessModal isOpen={showSuccessModal} message="Grupos creados correctamente" />
      <AlertModal 
        show={alertModal.show} 
        onHide={hideAlert} 
        title={alertModal.title} 
        message={alertModal.message} 
      />
    </div>
  );
};

export default CrearGruposAdmin;
