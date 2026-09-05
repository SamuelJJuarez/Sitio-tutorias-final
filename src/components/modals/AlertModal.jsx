import React from 'react';
import { Modal } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

const AlertModal = ({ 
  show, 
  onHide, 
  title = 'Campos incompletos', 
  message = 'Por favor, complete todos los campos obligatorios antes de continuar.' 
}) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={true}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-dark d-flex align-items-center gap-2">
          <FaExclamationTriangle className="text-warning" size={24} />
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4 px-4">
        <p className="text-secondary mb-0 fs-6">{message}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center pt-0 pb-4">
        <button 
          type="button"
          className="btn btn-tec px-4 py-2 fw-semibold" 
          onClick={onHide}
          autoFocus
        >
          Aceptar
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;
