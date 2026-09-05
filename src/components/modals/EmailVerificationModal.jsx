import React from 'react';

const EmailVerificationModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-body text-center p-5">
            <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Cargando...</span>
            </div>
            <h4 className="mb-3">Verificando correo</h4>
            <p className="text-muted mb-0">Se ha enviado un correo electrónico para verificar su registro.</p>
            <p className="text-muted small mt-2">Por favor, revise su bandeja de entrada y siga las instrucciones. Tiene 10 minutos para confirmar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
