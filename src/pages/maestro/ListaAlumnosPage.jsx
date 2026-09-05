import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Accordion } from 'react-bootstrap';
import { maestrosService } from '../../services/maestrosService';
import { FaSearch, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaEdit, FaTrash, FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import EntrevistaModal from '../../components/modals/EntrevistaModal';
import SuccessModal from '../../components/modals/SuccessModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

const ITEMS_POR_PAGINA = 10;

const ListaAlumnosPage = () => {
    const { indice_grupo } = useParams();
    const { state } = useLocation(); // Para traer el nombre del grupo del dashboard
    const navigate = useNavigate();

    const [alumnos, setAlumnos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const [loading, setLoading] = useState(true);

    // Estados para Success Modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Estados para Confirm Modal (Eliminar)
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [entrevistaAEliminar, setEntrevistaAEliminar] = useState(null);

    // Estados para Confirm Modal (Notificar Cuestionario)
    const [showNotificarModal, setShowNotificarModal] = useState(false);
    const [isNotificando, setIsNotificando] = useState(false);

    // Estados para Modal Entrevista
    const [showModal, setShowModal] = useState(false);
    const [modoModal, setModoModal] = useState('crear'); // crear, editar_resumen, reprogramar
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [entrevistaSeleccionada, setEntrevistaSeleccionada] = useState(null);

    // Datos del Formulario Modal
    const [formData, setFormData] = useState({ fecha: '', hora: '', lugar: '', resumen: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Entrevistas cargadas del alumno actual (para el acordeón abierto)
    const [entrevistasAlumno, setEntrevistasAlumno] = useState([]);

    useEffect(() => {
        cargarAlumnos();
    }, [indice_grupo]);

    const cargarAlumnos = async () => {
        try {
            const res = await maestrosService.getAlumnos(indice_grupo);
            if (res.success) setAlumnos(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    // Filtrado y Paginación
    const alumnosFiltrados = alumnos.filter(a =>
        `${a.nombre} ${a.apellidoP} ${a.apellidoM} ${a.num_control_alum}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPaginas = Math.ceil(alumnosFiltrados.length / ITEMS_POR_PAGINA);
    const alumnosPaginados = alumnosFiltrados.slice(
        (paginaActual - 1) * ITEMS_POR_PAGINA,
        paginaActual * ITEMS_POR_PAGINA
    );

    // Manejo de Accordion (Cargar entrevistas al abrir)
    const handleAccordionSelect = async (eventKey) => {
        if (eventKey) { // Si se abre un item (eventKey es el num_control)
            const res = await maestrosService.getEntrevistas(eventKey);
            if (res.success) setEntrevistasAlumno(res.data);
        }
    };

    // Abrir Modal crear
    const handleOpenCrear = (alumno) => {
        setAlumnoSeleccionado(alumno);
        setModoModal('crear');
        setFormData({ fecha: '', hora: '', lugar: '', resumen: '' });
        setFormErrors({});
        setShowModal(true);
    };

    // Abrir Modal editar resumen
    const handleOpenEditar = (entrevista) => {
        setEntrevistaSeleccionada(entrevista);
        setModoModal('editar_resumen');
        setFormData({ ...formData, resumen: entrevista.resumen || '' });
        setFormErrors({});
        setShowModal(true);
    };

    // Abrir Modal reprogramar
    const handleOpenReprogramar = (entrevista, alumno) => {
        setEntrevistaSeleccionada(entrevista);
        setAlumnoSeleccionado(alumno); // Necesitamos datos del alumno para el correo
        setModoModal('reprogramar');
        // Cargar datos actuales
        // Convertir fecha a YYYY-MM-DD para el input
        const fechaISO = new Date(entrevista.fecha).toISOString().split('T')[0];
        setFormData({ fecha: fechaISO, hora: entrevista.hora, lugar: entrevista.lugar, resumen: '' });
        setFormErrors({});
        setShowModal(true);
    };

    const validarCampos = () => {
        let newErrors = {};

        if (modoModal === 'editar_resumen') {
            // El resumen es opcional, no se exige texto obligatorio
        } else {
            const { fecha, hora, lugar } = formData;
            if (!fecha) {
                newErrors.fecha = 'Selecciona una fecha válida.';
            } else {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const [y, m, d] = fecha.split('-').map(Number);
                const fechaSeleccionada = new Date(y, m - 1, d);

                if (fechaSeleccionada < hoy) {
                    newErrors.fecha = 'La fecha debe ser igual o posterior al día de hoy.';
                }
            }

            if (!hora) {
                newErrors.hora = 'Selecciona una hora.';
            } else {
                const [h, m] = hora.split(':').map(Number);
                if (h < 7 || h > 21 || (h === 21 && m > 0)) {
                    newErrors.hora = 'La hora debe estar entre las 7:00 am y las 9:00 pm.';
                }
            }

            if (!lugar || lugar.trim().length < 2) {
                newErrors.lugar = 'El lugar es obligatorio y debe tener al menos 2 caracteres.';
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeleteEntrevista = (entrevista, numControlAlum) => {
        setEntrevistaAEliminar({ entrevista, numControlAlum });
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (!entrevistaAEliminar) return;

        const { entrevista, numControlAlum } = entrevistaAEliminar;
        try {
            const res = await maestrosService.deleteEntrevista(entrevista.id_entrevista);
            if (res.success) {
                setShowConfirmModal(false);
                setSuccessMessage(res.message);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    handleAccordionSelect(numControlAlum);
                }, 1000);
            } else {
                alert('Error: ' + res.message);
            }
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleSubmit = async () => {
        if (!validarCampos()) return;
        setIsSubmitting(true);

        try {
            let res;
            if (modoModal === 'crear') {
                res = await maestrosService.createEntrevista({
                    ...formData, num_control_alum: alumnoSeleccionado.num_control_alum
                });
            } else if (modoModal === 'editar_resumen') {
                res = await maestrosService.updateResumen({
                    id_entrevista: entrevistaSeleccionada.id_entrevista, resumen: formData.resumen
                });
            } else if (modoModal === 'reprogramar') {
                res = await maestrosService.reprogramar({
                    id_entrevista: entrevistaSeleccionada.id_entrevista,
                    fecha: formData.fecha, hora: formData.hora, lugar: formData.lugar,
                    num_control_alum: alumnoSeleccionado.num_control_alum
                });
            }

            if (res.success) {
                setShowModal(false);
                setSuccessMessage(res.message);
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                    // Recargar entrevistas del alumno actual
                    const currentKey = alumnoSeleccionado ? alumnoSeleccionado.num_control_alum : entrevistaSeleccionada.num_control_alum;
                    handleAccordionSelect(currentKey);
                }, 1000);
            }
        } catch (error) { alert('Error al procesar'); }
        finally { setIsSubmitting(false); }
    };

    const handleNotificarClick = () => {
        if (alumnos.length === 0) {
            alert('No hay alumnos registrados en este grupo para notificar.');
            return;
        }
        setShowNotificarModal(true);
    };

    const handleConfirmNotificar = async () => {
        setIsNotificando(true);
        try {
            const res = await maestrosService.notificarCuestionario(indice_grupo);
            setShowNotificarModal(false);
            if (res.success) {
                setSuccessMessage(res.message || 'Notificaciones enviadas correctamente');
                setShowSuccessModal(true);
                setTimeout(() => {
                    setShowSuccessModal(false);
                }, 3000);
            } else {
                alert(res.message || 'No se pudieron enviar las notificaciones.');
            }
        } catch (error) {
            alert('Error al enviar notificaciones.');
        } finally {
            setIsNotificando(false);
        }
    };

    return (
        <div className="bg-tec-full min-vh-100 p-4 pt-5">
            <div className="container">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4 text-white flex-wrap gap-3">
                    <div>
                        <h2 className="fw-bold m-0">{state?.grupo?.letra_grupo || 'Grupo'}</h2>
                        <span className="badge bg-secondary fs-6">{state?.grupo?.periodo}</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-outline text-warning fw-bold d-flex align-items-center gap-2 "
                            onClick={handleNotificarClick}
                            disabled={loading || alumnos.length === 0}
                            title="Enviar recordatorio a todos los alumnos del grupo"
                        >
                            <FaEnvelope /> Notificar llenado de formulario
                        </button>
                        <button className="btn border-0 bg-transparent text-white d-flex align-items-center" onClick={() => navigate('/maestro/dashboard')}>
                            <IoArrowBackCircleSharp size={30} className="me-1" /> Regresar
                        </button>
                    </div>
                </div>

                {/* Buscador */}
                <div className="card shadow-sm mb-4 border-0">
                    <div className="card-body p-3 d-flex align-items-center">
                        <FaSearch className="text-muted me-3" />
                        <input
                            type="text" className="form-control border-0"
                            placeholder="Buscar alumno por nombre o número de control..."
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                        />
                    </div>
                </div>

                {/* Lista Accordion */}
                <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
                    <div className="card-body p-0">
                        <Accordion onSelect={handleAccordionSelect}>
                            {alumnosPaginados.map((alum) => (
                                <Accordion.Item eventKey={alum.num_control_alum} key={alum.num_control_alum}>
                                    <Accordion.Header>
                                        <div className="d-flex w-100 justify-content-between pe-3">
                                            <span className="fw-bold text-primary">{alum.num_control_alum}</span>
                                            <span className="text-dark text-uppercase">{alum.nombre} {alum.apellidoP} {alum.apellidoM}</span>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="bg-light">
                                        <div className="d-flex gap-3 mb-4">
                                            <button className="btn border-0 bg-transparent text-primary" onClick={() => navigate(`/maestro/resultados/${alum.num_control_alum}`)}>
                                                <FaSearch className="me-2" /> Ver informe
                                            </button>
                                            <button className="btn border-0 bg-transparent text-success" onClick={() => handleOpenCrear(alum)}>
                                                <FaCalendarAlt className="me-2" /> Programar entrevista
                                            </button>
                                        </div>

                                        <h6 className="fw-bold border-bottom pb-2 mb-3">Historial de entrevistas</h6>
                                        {entrevistasAlumno.length === 0 ? (
                                            <p className="text-muted small fst-italic">Sin entrevistas registradas</p>
                                        ) : (
                                            <div className="row g-3">
                                                {entrevistasAlumno.map(ent => (
                                                    <div key={ent.id_entrevista} className="col-12">
                                                        <div className={`card border-start border-4 ${ent.estado === 'confirmada' ? 'border-success' : ent.estado === 'rechazada' ? 'border-danger' : 'border-warning'} shadow-sm`}>
                                                            <div className="card-body py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                <div>
                                                                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                                                        <span className="fw-bold"><FaCalendarAlt className="me-1" /> {new Date(ent.fecha).toLocaleDateString()} - {ent.hora}</span>
                                                                        {ent.estado === 'confirmada' && (
                                                                            <span className="badge bg-success bg-opacity-10 text-success border border-success">
                                                                                <FaCheckCircle className="me-1" /> Asistencia confirmada
                                                                            </span>
                                                                        )}
                                                                        {ent.estado === 'rechazada' && (
                                                                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">
                                                                                <FaTimesCircle className="me-1" /> Inasistencia
                                                                            </span>
                                                                        )}
                                                                        {(!ent.estado || ent.estado === 'pendiente') && (
                                                                            <span className="badge bg-warning bg-opacity-10 text-dark border border-warning">
                                                                                <FaClock className="me-1" /> Pendiente de confirmación
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="small text-muted">Lugar: {ent.lugar}</div>
                                                                    {ent.estado === 'rechazada' && ent.motivo_rechazo && (
                                                                        <div className="small text-danger mt-1">
                                                                            <b>Motivo inasistencia:</b> <i>"{ent.motivo_rechazo}"</i>
                                                                        </div>
                                                                    )}
                                                                    <div className="small mt-1 text-dark">Resumen: {ent.resumen || 'Sin resumen'}</div>
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button className="btn border-0 bg-transparent text-secondary" onClick={() => handleOpenEditar(ent)}>
                                                                        <FaEdit /> Editar resumen
                                                                    </button>
                                                                    <button className="btn border-0 bg-transparent text-warning" onClick={() => handleOpenReprogramar(ent, alum)}>
                                                                        <FaCalendarAlt className="me-2" />Reprogramar
                                                                    </button>
                                                                    <button className="btn border-0 bg-transparent text-danger" onClick={() => handleDeleteEntrevista(ent, alum.num_control_alum)}>
                                                                        <FaTrash /> Eliminar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                        {alumnosFiltrados.length === 0 && <div className="p-4 text-center">No hay alumnos</div>}
                    </div>

                    {/* Paginación */}
                    {totalPaginas > 1 && (
                        <div className="card-footer bg-white d-flex justify-content-between align-items-center p-3">
                            <button className="btn btn-outline-primary btn-sm" disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)}>
                                <FaChevronLeft /> Anterior
                            </button>
                            <span className="text-muted small">Página {paginaActual} de {totalPaginas}</span>
                            <button className="btn btn-outline-primary btn-sm" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)}>
                                Siguiente <FaChevronRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* MODAL UNIVERSAL (Crear / Editar / Reprogramar) */}
                <EntrevistaModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    modo={modoModal}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSubmit}
                    errors={formErrors}
                    isSubmitting={isSubmitting}
                />

                <SuccessModal isOpen={showSuccessModal} message={successMessage} />

                <ConfirmModal
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    titulo="Eliminar entrevista"
                    mensaje="¿Estás seguro de que deseas eliminar esta entrevista?"
                    confirmText="Eliminar"
                    variant="danger"
                />

                <ConfirmModal
                    show={showNotificarModal}
                    onHide={() => !isNotificando && setShowNotificarModal(false)}
                    onConfirm={handleConfirmNotificar}
                    titulo="Notificar llenado de cuestionario"
                    mensaje={`¿Deseas enviar un correo de recordatorio a los ${alumnos.length} alumno(s) de este grupo para que completen su cuestionario diagnóstico?`}
                    confirmText="Enviar recordatorio"
                    variant="warning"
                    isLoading={isNotificando}
                />

            </div>
        </div>
    );
};

export default ListaAlumnosPage;