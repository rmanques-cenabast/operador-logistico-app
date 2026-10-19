import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ArrivalOrder } from '../ArrivalDetailModal';

export interface ReleaseStatusModalData {
  type: 'success' | 'error';
  title: string;
  message: string;
  actionType?: 'release' | 'attachment';
}

interface ReleaseStatusModalProps {
  modalData: ReleaseStatusModalData | null;
  onClose: () => void;
  headerInfo?: ArrivalOrder;
  onSuccessClose?: () => void;
}

export const ReleaseStatusModal: React.FC<ReleaseStatusModalProps> = ({
  modalData,
  onClose,
  headerInfo,
  onSuccessClose
}) => {
  if (!modalData) return null;

  const handleAction = () => {
    const isSuccess = modalData.type === 'success';
    const isRelease = modalData.actionType === 'release';
    onClose();
    // Solo cerrar el modal de detalle si la acción fue liberar la recepción a SAP
    if (isSuccess && isRelease && onSuccessClose) {
      onSuccessClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={handleAction}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-200 text-center flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono Centrado con halo */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shrink-0 ${modalData.type === 'success'
            ? 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50'
            : 'bg-rose-100 text-rose-600 ring-8 ring-rose-50'
          }`}>
          {modalData.type === 'success' ? (
            <CheckCircle2 size={32} />
          ) : (
            <AlertCircle size={32} />
          )}
        </div>

        {/* Título y Subtítulo Centrados */}
        <h3 className="font-bold text-lg text-slate-900 mb-1 text-center">
          {modalData.title}
        </h3>
        <span className="text-xs text-slate-500 font-mono block mb-3 text-center">
          Preaviso: {headerInfo?.id} {headerInfo?.poNumber ? `| PC: ${headerInfo.poNumber}` : ''}
        </span>

        {/* Mensaje descriptivo Centrado */}
        <div className="py-2 space-y-3 text-slate-700 text-sm leading-relaxed text-center w-full">
          <p className="text-slate-700">
            {modalData.message}
          </p>

          {/* Bloque contextual según el tipo de acción */}
          {modalData.type === 'success' ? (
            modalData.actionType === 'release' ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-semibold text-xs text-emerald-800">
                  <Clock size={14} className="text-emerald-600" />
                  <span>Próximo paso del flujo:</span>
                </div>
                <p className="text-xs text-emerald-700">
                  El <strong>Worker Inbound</strong> procesará este ingreso en su próximo ciclo para registrar el movimiento de material en SAP de manera automática.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-emerald-900 text-center">
                <p className="text-xs text-emerald-800 font-medium">
                  ✓ El archivo digital quedó vinculado exitosamente a los Servicios de Objeto Genérico (GOS) del documento en SAP.
                </p>
              </div>
            )
          ) : (
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs font-medium text-center">
              💡 Por favor, verifique el estado del pedido en SAP o contacte al administrador si el problema persiste.
            </div>
          )}
        </div>

        {/* Botón de acción Centrado */}
        <div className="pt-4 mt-2 border-t border-slate-100 w-full flex justify-center">
          <button
            onClick={handleAction}
            className={`w-full py-2.5 px-6 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm cursor-pointer text-center ${modalData.type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white hover:shadow'
                : 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white'
              }`}
          >
            {modalData.type === 'success' ? 'Entendido y Continuar' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
