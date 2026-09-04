import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface UploadPreavisoProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const UploadPreaviso: React.FC<UploadPreavisoProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const currentRole = user?.role === 'intermediacion' ? 'ROL_INTERMEDIACION' : 'ROL_FARMACIA_PRIVADA';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFile = (selectedFile: File) => {
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidExt = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (hasValidExt) {
      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
    } else {
      setStatus('error');
      setMessage('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

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
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1200);
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
    <div className="w-full">
      {/* Texto Descriptivo */}
      <p className="text-sm text-slate-500 mb-6 leading-relaxed font-normal">
        Excel con los detalles del pre aviso. el sistema lo clasificará de manera automatica según el perfil actual.
      </p>

      {/* Dropzone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all mb-5 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/40'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Icono Circular de Carga */}
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3.5 shadow-inner">
          <Upload size={24} className="stroke-[2.2]" />
        </div>

        <span className="text-sm font-bold text-slate-800 mb-1.5">
          Explorar Archivo Excel o arrastra y suelta aquí
        </span>
        <span className="text-xs text-slate-400 font-normal">
          Formatos soportados: .xlsx, .xls
        </span>
      </div>

      {/* Tarjeta de Archivo Seleccionado */}
      {file && (
        <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <FileSpreadsheet size={22} />
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-slate-800 truncate block font-mono">
                  {file.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-slate-500 font-mono">
                100%
              </span>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setStatus('idle');
                  setMessage('');
                }}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                title="Eliminar archivo"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-3">
            <div className="bg-emerald-500 h-full w-full rounded-full transition-all duration-300"></div>
          </div>

          {/* Estado de Carga */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 size={15} />
            <span>Carga completada ({formatFileSize(file.size)})</span>
          </div>
        </div>
      )}

      {/* Feedback de Estado */}
      {status === 'success' && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2.5 text-sm font-medium">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Botón Principal */}
      <button 
        type="button"
        onClick={handleUpload}
        disabled={!file || status === 'uploading' || status === 'success'}
        className={`w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
          !file || status === 'uploading' || status === 'success'
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-[0.99]'
        }`}
      >
        {status === 'uploading' && (
          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
        )}
        {status === 'uploading' ? 'PROCESANDO PRE-AVISO...' : status === 'success' ? 'PROCESADO EXITOSAMENTE' : 'PROCESAR PRE-AVISO'}
      </button>
    </div>
  );
};

export default UploadPreaviso;
