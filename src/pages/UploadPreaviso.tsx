import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface UploadPreavisoProps {
  onSuccess?: () => void;
}

const UploadPreaviso: React.FC<UploadPreavisoProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const { user } = useAuth();
  
  // Transformar el rol del frontend al esperado por el backend heredado si es necesario
  const currentRole = user?.role === 'intermediacion' ? 'ROL_INTERMEDIACION' : 'ROL_FARMACIA_PRIVADA';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simular tiempo de carga para feedback visual y evitar múltiples clics rápidos
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Usar la ruta correcta de tu API
      const response = await fetch(`${API_URL}/ol/inbound/preaviso/upload`, {
        method: 'POST',
        headers: {
          'x-user-role': currentRole
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Subido correctamente. Línea asignada: ${data.lineaAsignada}`);
        
        // Auto-cerrar después de 2 segundos si se proporcionó onSuccess
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al subir el archivo');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error de red al conectar con el servidor');
    }
  };

  return (
    <div style={{ padding: '0 24px 24px 24px', background: 'white' }}>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
        Sube el archivo Excel con los detalles del pre-aviso. El sistema lo clasificará automáticamente basado en tu perfil actual.
      </p>

      <div style={{ 
        border: '2px dashed #cbd5e1', 
        padding: '40px', 
        textAlign: 'center',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        marginBottom: '24px',
        transition: 'all 0.2s ease'
      }}>
        <UploadCloud size={48} color="#64748b" style={{ marginBottom: '20px' }} strokeWidth={1.5} />
        <br />
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="excel-upload"
        />
        <label htmlFor="excel-upload" style={{ 
          cursor: 'pointer', 
          padding: '10px 24px', 
          backgroundColor: 'white', 
          color: '#0f172a', 
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          display: 'inline-block',
          transition: 'all 0.2s ease'
        }}>
          Explorar Archivo Excel
        </label>
        {file && (
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', width: 'fit-content', margin: '20px auto 0' }}>
            <File size={16} color="var(--primary-main)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>{file.name}</span>
            <X 
              size={16} 
              color="var(--error-main)" 
              style={{ cursor: 'pointer', opacity: 0.7 }} 
              onClick={() => setFile(null)} 
            />
          </div>
        )}
      </div>

      <button 
        onClick={handleUpload}
        disabled={!file || status === 'uploading' || status === 'success'}
        style={{
          padding: '12px 16px',
          backgroundColor: !file || status === 'uploading' || status === 'success' ? '#f1f5f9' : 'var(--primary-main)',
          color: !file || status === 'uploading' || status === 'success' ? '#64748b' : 'white',
          border: !file || status === 'uploading' || status === 'success' ? '1px solid #e2e8f0' : 'none',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.9rem',
          cursor: !file || status === 'uploading' || status === 'success' ? 'not-allowed' : 'pointer',
          width: '100%',
          boxShadow: !file || status === 'uploading' || status === 'success' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        {status === 'uploading' && (
          <style>
            {`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}
          </style>
        )}
        {status === 'uploading' && <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #64748b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>}
        {status === 'uploading' ? 'PROCESANDO PRE-AVISO...' : status === 'success' ? 'PROCESADO EXITOSAMENTE' : 'PROCESAR PRE-AVISO'}
      </button>

      {status === 'success' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', fontWeight: 500 }}>
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {status === 'error' && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}>
          Error: {message}
        </div>
      )}
    </div>
  );
};

export default UploadPreaviso;
