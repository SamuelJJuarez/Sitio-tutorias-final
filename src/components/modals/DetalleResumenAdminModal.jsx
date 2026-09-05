import React from 'react';

const DetalleResumenAdminModal = ({ modalData, onClose }) => {
  if (!modalData) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-tec text-white">
            <h5 className="modal-title fw-bold">Detalles: {modalData.nombre}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4 bg-light">
            {modalData.preguntas && modalData.preguntas.map((preg, idx) => {
              const currentYear = new Date().getFullYear();
              let opcionesMostrar = preg.opciones || [];

              // Para la pregunta 21 (año de egreso / bachillerato), solo mostrar hasta el año actual y ordenado
              if (preg.id_pregunta === 21) {
                opcionesMostrar = opcionesMostrar
                  .filter(op => {
                    const year = parseInt(op.opcion, 10);
                    return isNaN(year) || year <= currentYear;
                  })
                  .sort((a, b) => parseInt(b.opcion, 10) - parseInt(a.opcion, 10));
              }

              return (
                <div key={preg.id_pregunta} className="bg-white p-4 rounded border shadow-sm mb-4">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                        {idx + 1}. {preg.pregunta}
                    </h6>
                    <ul className="list-group list-group-flush">
                        {opcionesMostrar.map((op, i) => (
                            <li key={i} className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                                <span className="text-secondary">{op.opcion}</span>
                                <span className="badge bg-primary text-white rounded-pill px-3 py-2 fs-6">{op.cantidad}</span>
                            </li>
                        ))}
                    </ul>
                </div>
              );
            })}
          </div>
          <div className="modal-footer bg-light border-top-0">
            <button className="btn btn-secondary px-4" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleResumenAdminModal;
