import React from 'react';
import { Modal } from 'react-bootstrap';

const IncompletoModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="bg-warning text-dark border-0">
        <Modal.Title className="fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Atención</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <h5 className="mb-3">Cuestionario incompleto</h5>
        <p>Debes completar todo el cuestionario antes de poder ver tus resultados.</p>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <button className="btn btn-primary" onClick={onHide}>Aceptar</button>
      </Modal.Footer>
    </Modal>
  );
};

export default IncompletoModal;
