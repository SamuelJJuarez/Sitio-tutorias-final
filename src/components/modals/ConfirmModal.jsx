import React from 'react';
import { Modal } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  titulo = 'Confirmar acción',
  mensaje,
  confirmText = 'Eliminar',
  variant = 'danger',
  isLoading = false
}) => {
  const headerClass = variant === 'warning'
    ? 'bg-warning text-dark'
    : variant === 'primary'
      ? 'bg-primary text-white'
      : 'bg-danger text-white';

  const btnClass = variant === 'warning'
    ? 'btn btn-warning text-dark fw-bold'
    : variant === 'primary'
      ? 'btn btn-primary'
      : 'btn btn-danger';

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className={headerClass}>
        <Modal.Title className="fw-bold fs-5">{titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-4 text-center">
        <h6 className="mb-0 text-secondary lh-base">{mensaje}</h6>
      </Modal.Body>
      <Modal.Footer className="border-0 justify-content-center gap-2 pb-4">
        <button className={`${btnClass} px-3`} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Enviando...' : confirmText}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
