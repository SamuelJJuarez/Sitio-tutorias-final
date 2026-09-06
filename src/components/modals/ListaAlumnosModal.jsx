import React from 'react';

const ListaAlumnosModal = ({ alumnos, onClose, onSelectAlumno, seccionNombre }) => {
  if (!alumnos) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-tec text-white">
            <h5 className="modal-title fw-bold">Alumnos ({seccionNombre})</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4 bg-light">
            {alumnos.length === 0 ? (
              <div className="alert alert-info text-center">No hay alumnos disponibles.</div>
            ) : (
              <div className="list-group list-group-flush shadow-sm rounded">
                {alumnos.map((alum) => (
                  <button
                    key={alum.num_control_alum}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3 border-0 border-bottom"
                    onClick={() => onSelectAlumno(alum)}
                  >
                    <div>
                      <h6 className="fw-bold mb-1 text-dark">
                        {alum.apellidoP} {alum.apellidoM} {alum.nombre}
                      </h6>
                      <small className="text-muted">No. Control: {alum.num_control_alum}</small>
                    </div>
                    <i className="bi bi-chevron-right text-primary"></i>
                  </button>
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

export default ListaAlumnosModal;
