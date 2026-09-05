import React from 'react';
import { Modal } from 'react-bootstrap';

const EntrevistaModal = ({
  show,
  onHide,
  modo,
  formData,
  setFormData,
  onSave,
  errors = {},
  isSubmitting = false
}) => {
  // Obtener fecha de hoy en formato YYYY-MM-DD para el atributo min
  const hoyString = new Date().toISOString().split('T')[0];
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          {modo === 'crear' && 'Programar Entrevista'}
          {modo === 'editar_resumen' && 'Editar Resumen'}
          {modo === 'reprogramar' && 'Reprogramar Entrevista'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Campos para Crear y Reprogramar */}
        {(modo === 'crear' || modo === 'reprogramar') && (
          <>
            <div className="mb-3">
              <label className="form-label fw-bold">Fecha</label>
              <input 
                type="date" 
                className={`form-control ${errors.fecha ? 'is-invalid' : ''}`} 
                value={formData.fecha} 
                min={hoyString}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} 
                required 
              />
              {errors.fecha && <div className="invalid-feedback d-block">{errors.fecha}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Hora</label>
              <input 
                type="time" 
                className={`form-control ${errors.hora ? 'is-invalid' : ''}`} 
                value={formData.hora} 
                min="07:00"
                max="21:00"
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })} 
                required 
              />
              {errors.hora && <div className="invalid-feedback d-block">{errors.hora}</div>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Lugar</label>
              <input 
                type="text" 
                className={`form-control ${errors.lugar ? 'is-invalid' : ''}`} 
                placeholder="Ej: Cubículo 4" 
                value={formData.lugar} 
                minLength={2}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })} 
                required 
              />
              {errors.lugar && <div className="invalid-feedback d-block">{errors.lugar}</div>}
            </div>
          </>
        )}

        {/* Campo solo para Editar Resumen */}
        {modo === 'editar_resumen' && (
          <div className="mb-3">
            <label className="form-label fw-bold">Resumen / Notas</label>
            <textarea 
              className={`form-control ${errors.resumen ? 'is-invalid' : ''}`} 
              rows="4" 
              value={formData.resumen} 
              onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
            ></textarea>
            {errors.resumen && <div className="invalid-feedback d-block">{errors.resumen}</div>}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide} disabled={isSubmitting}>Cancelar</button>
        <button className="btn btn-primary" onClick={onSave} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default EntrevistaModal;
