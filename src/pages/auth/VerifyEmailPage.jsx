import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`https://api-sitio-tutorias.vercel.app/api/verificacion/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="bg-tec-full d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-body p-5 text-center">
          {status === 'loading' && (
            <>
              <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <h4 className="mb-0">Validando...</h4>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-success mb-4">
                <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="mb-3">¡Verificación exitosa!</h4>
              <p className="text-muted">
                Usuario registrado, pulse <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-primary fw-bold text-decoration-none">aquí</a> para iniciar sesión.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-danger mb-4">
                <i className="bi bi-x-circle-fill" style={{ fontSize: '4rem' }}></i>
              </div>
              <h4 className="mb-3">Error en la verificación</h4>
              <p className="text-muted">
                Tiempo de espera agotado. Intente registrarse de nuevo.
              </p>
              <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/')}>Volver al inicio</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
