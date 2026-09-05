import React from 'react';

const SuccessModal = ({ isOpen, message }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px 40px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        minWidth: '350px',
        border: '1px solid #ddd'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: '#00d632',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 20px auto'
        }}>
          <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h5 style={{
          margin: 0,
          color: '#444',
          fontWeight: '600',
          fontSize: '1.1rem'
        }}>
          {message}
        </h5>
      </div>
    </div>
  );
};

export default SuccessModal;
