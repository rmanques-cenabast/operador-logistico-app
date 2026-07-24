import React from 'react';
import Header from '../components/Header';

const MaestrosMateriales: React.FC = () => {
  return (
    <>
      <Header showSearch={true} />
      <div className="page-container">
        <h2 className="page-title">Maestro de Materiales</h2>
        <div className="page-content" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Módulo en construcción...</p>
        </div>
      </div>
    </>
  );
};

export default MaestrosMateriales;
