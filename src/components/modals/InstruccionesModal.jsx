import React from 'react';
import { Modal } from 'react-bootstrap';

const InstruccionesModal = ({ show, onHide, onStart }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-tec">Cuestionario</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="fw-bold">Instrucciones:</h5>
        <p>Conteste cada pregunta seleccionando la respuesta que considere más adecuada.</p>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>Cancelar</button>
        <button className="btn btn-tec" onClick={onStart}>Comenzar</button>
      </Modal.Footer>
    </Modal>
  );
};

export default InstruccionesModal;
