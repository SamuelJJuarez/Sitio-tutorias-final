import React from 'react';

const DetalleRespuestasModal = ({ modalData, onClose }) => {
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
            <div className="bg-white p-4 rounded border shadow-sm">
              {modalData.respuestas && modalData.respuestas.map((resp, idx) => (
                <div key={resp.id_pregunta} className={`d-flex flex-column ${idx !== modalData.respuestas.length - 1 ? 'border-bottom mb-3 pb-3' : ''}`}>
                  <span className="fw-semibold text-secondary mb-1">
                    {idx + 1}. {resp.pregunta}
                  </span>
                  <span className="text-tec fw-bold">
                    <i className="bi bi-check-circle-fill me-2 text-success"></i> 
                    {resp.respuesta_elegida}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer bg-light border-top-0">
            <button className="btn btn-secondary px-4" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleRespuestasModal;
