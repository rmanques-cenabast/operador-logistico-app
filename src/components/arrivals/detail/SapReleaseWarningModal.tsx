import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SapReleaseWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  poNumber?: string;
  nivelesLiberacion?: any[];
}

export const SapReleaseWarningModal: React.FC<SapReleaseWarningModalProps> = ({
  isOpen,
  onClose,
  poNumber,
  nivelesLiberacion
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Aviso */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              No es posible liberar a SAP
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Pedido de Compra: {poNumber}
            </span>
          </div>
        </div>

        {/* Contenido del Aviso */}
        <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            El Pedido de Compra <strong className="font-mono text-slate-900">{poNumber}</strong> no puede ser procesado en SAP porque aún presenta firmas pendientes en su Estrategia de Liberación.
          </p>

          {/* Listado de Áreas Pendientes */}
          {nivelesLiberacion && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <span className="font-bold text-slate-700 text-xs block mb-2">
                📋 Áreas pendientes de firma en SAP:
              </span>
              <ul className="space-y-1.5 font-medium text-slate-800">
                {nivelesLiberacion
                  .filter((n: any) => !n.aprobado)
                  .map((nivel: any) => (
                    <li key={nivel.codigo} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span className="font-mono text-slate-500 font-bold">[{nivel.codigo}]</span>
                      <span>{nivel.descripcion}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Mensaje de espera */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 font-medium text-xs">
            💡 Debe esperar a que las áreas correspondientes realicen la liberación en SAP.
          </div>
        </div>

        {/* Botón Entendido */}
        <div className="pt-3 border-t border-slate-100 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm hover:shadow"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
