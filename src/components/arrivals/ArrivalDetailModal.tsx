import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ArrivalsService } from '../../services/arrivals.service';
import { ArrivalFlowStepper } from './detail/ArrivalFlowStepper';
import { SapReleaseStrategyCard } from './detail/SapReleaseStrategyCard';
import { ArrivalProductsSummary } from './detail/ArrivalProductsSummary';
import { ArrivalReceptionHistory } from './detail/ArrivalReceptionHistory';
import { ArrivalDocumentsSection } from './detail/ArrivalDocumentsSection';
import { SapReleaseWarningModal } from './detail/SapReleaseWarningModal';
import { ReleaseStatusModal, ReleaseStatusModalData } from './detail/ReleaseStatusModal';

export interface ArrivalOrder {
  rowId: string;
  id: string; // NumeroEntrega (PRE-X)
  idRecepcion?: number;
  provider: string; // RutProveedor
  rut: string;
  lineNo: number;
  productCode: string;
  poNumber: string;
  batch: string;
  expDate: string;
  receptionDate?: string;
  expectedQty: number;
  receivedQty: number;
  uom: string;
  status: string;
  badge: string;
  almacenSAP?: string;
  sapStatus?: string;
  sapBadge?: string;
  documentoSAP?: string;
  loteEsperado?: string;
  fechaExpEsperada?: string;
  loteRecibido?: string;
  fechaExpRecibida?: string;
  numeroEntregas?: number;
  numeroLotes?: number;
  historialEntregas?: any[];
  numeroFactura?: string;
}

interface ArrivalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRowId: string | null;
  orders: ArrivalOrder[];
  documentsMap: Record<string, any[]>;
  onLiberar: (numeroPreAviso?: string) => Promise<any>;
  lineaNegocioLabel?: string;
}

export const ArrivalDetailModal: React.FC<ArrivalDetailModalProps> = ({
  isOpen,
  onClose,
  selectedRowId,
  orders,
  documentsMap,
  onLiberar
}) => {
  const [poReleaseInfo, setPoReleaseInfo] = useState<any | null>(null);
  const [checkingPo, setCheckingPo] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isLiberando, setIsLiberando] = useState<boolean>(false);
  const [attachingDocId, setAttachingDocId] = useState<number | null>(null);
  const [attachedDocs, setAttachedDocs] = useState<Set<number>>(new Set());
  const [releaseStatusModal, setReleaseStatusModal] = useState<ReleaseStatusModalData | null>(null);

  const targetOrder = orders.find(o => o.rowId === selectedRowId);
  // Filtrar estrictamente por la recepción seleccionada (idRecepcion) para mantener el flujo 1 a 1
  const selectedLines = targetOrder?.idRecepcion
    ? orders.filter(o => o.idRecepcion === targetOrder.idRecepcion)
    : (targetOrder ? [targetOrder] : []);
  const headerInfo = targetOrder || selectedLines[0];

  const isEsperandoLiberacion = selectedLines.some(l => l.sapStatus === 'ESP. LIBERACIÓN');

  const handleLiberarClick = async () => {
    if (poReleaseInfo && !poReleaseInfo.estaLiberado) {
      setShowWarningModal(true);
      return;
    }

    setIsLiberando(true);
    try {
      const res: any = await onLiberar(headerInfo?.id);
      if (res && res.success === false) {
        setReleaseStatusModal({
          type: 'error',
          actionType: 'release',
          title: 'No se pudo liberar a SAP',
          message: res.message || 'Ocurrió un inconveniente al intentar autorizar la liberación en SAP.'
        });
      } else {
        setReleaseStatusModal({
          type: 'success',
          actionType: 'release',
          title: '¡Liberación Autorizada con Éxito!',
          message: res?.message || `Se ha autorizado la liberación a SAP para el preaviso ${headerInfo?.id}.`
        });
      }
    } catch (err: any) {
      setReleaseStatusModal({
        type: 'error',
        actionType: 'release',
        title: 'Error de Comunicación',
        message: err?.message || 'No fue posible comunicarse con el servidor.'
      });
    } finally {
      setIsLiberando(false);
    }
  };

  const handleAdjuntarDocASap = async (doc: any) => {
    if (!headerInfo?.documentoSAP) {
      setReleaseStatusModal({
        type: 'error',
        actionType: 'attachment',
        title: 'MIGO No Disponible',
        message: 'Para adjuntar a SAP, primero debe existir un Documento de Material (MIGO) generado.'
      });
      return;
    }

    setAttachingDocId(doc.id);
    try {
      const res: any = await ArrivalsService.adjuntarDocumentoASap(doc.id);
      if (res && res.status === 'success') {
        setAttachedDocs(prev => new Set(prev).add(doc.id));
        doc.estadoSAP = 'PROCESADO';
        doc.documentoMaterialSAP = headerInfo.documentoSAP;
        setReleaseStatusModal({
          type: 'success',
          actionType: 'attachment',
          title: '¡Anexo Vinculado con Éxito en SAP!',
          message: res.message || `El archivo '${doc.nombreArchivo}' fue vinculado al Documento de Material ${headerInfo.documentoSAP} en SAP.`
        });
      } else {
        setReleaseStatusModal({
          type: 'error',
          actionType: 'attachment',
          title: 'Error al Adjuntar en SAP',
          message: res?.message || 'SAP rechazó la vinculación del archivo al documento de material.'
        });
      }
    } catch (err: any) {
      setReleaseStatusModal({
        type: 'error',
        actionType: 'attachment',
        title: 'Error de Comunicación con SAP',
        message: err?.message || 'No fue posible conectarse con el servicio de anexos de SAP.'
      });
    } finally {
      setAttachingDocId(null);
    }
  };

  const checkSapReleaseStatus = async (poNumber?: string) => {
    if (!poNumber) return;
    setCheckingPo(true);
    try {
      const res = await ArrivalsService.getPoReleaseStatus(poNumber);
      if (res.status === 'success') {
        setPoReleaseInfo(res.data);
      }
    } catch (e) {
      console.error("Error al consultar liberación de Pedido de Compra en SAP:", e);
    } finally {
      setCheckingPo(false);
    }
  };

  useEffect(() => {
    if (isOpen && headerInfo?.poNumber) {
      checkSapReleaseStatus(headerInfo.poNumber);
    } else {
      setPoReleaseInfo(null);
    }
  }, [isOpen, headerInfo?.poNumber]);

  if (!isOpen || !selectedRowId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '1080px', maxWidth: '95vw', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        {/* Header */}
        <div className="panel-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a', background: '#f8fafc' }}>
          <div className="flex items-center gap-3">
            <span className="font-mono">
              Detalle RECEPCIÓN: {headerInfo?.idRecepcion ? `REC-${headerInfo.idRecepcion}` : (headerInfo?.id ? `REC-${headerInfo.id.replace('PRE-', '')}` : '')}
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              PA: {headerInfo?.id}
            </span>
            <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
              PC: {headerInfo?.poNumber}
            </span>
            {headerInfo?.numeroFactura && headerInfo.numeroFactura !== '-' && (
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200" title="Factura informada por el Operador Logístico en andén">
                FAC INFORMADA: {headerInfo.numeroFactura}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Contenido Modularizado */}
        <div className="panel-content" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Stepper del flujo */}
          <ArrivalFlowStepper />

          {/* Tarjeta de liberación SAP en tiempo real */}
          <SapReleaseStrategyCard
            poNumber={headerInfo?.poNumber}
            checkingPo={checkingPo}
            poReleaseInfo={poReleaseInfo}
            isEsperandoLiberacion={isEsperandoLiberacion}
            isLiberando={isLiberando}
            onLiberarClick={handleLiberarClick}
          />

          {/* Resumen de productos declarados vs recibidos */}
          <ArrivalProductsSummary lines={selectedLines} />

          {/* Historial de recepciones en bodega */}
          <ArrivalReceptionHistory lines={selectedLines} />

          {/* Documentos adjuntos, visor inline y botón adjuntar SAP */}
          <ArrivalDocumentsSection
            lines={selectedLines}
            documentsMap={documentsMap}
            headerInfo={headerInfo}
            attachedDocs={attachedDocs}
            attachingDocId={attachingDocId}
            onAdjuntarDocASap={handleAdjuntarDocASap}
          />
        </div>

        {/* Footer */}
        <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button className="btn" onClick={onClose} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 18px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Advertencia de Firmas Pendientes en SAP */}
      <SapReleaseWarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        poNumber={headerInfo?.poNumber}
        nivelesLiberacion={poReleaseInfo?.nivelesLiberacion}
      />

      {/* Modal de Resultado de Liberación (Éxito o Error) */}
      <ReleaseStatusModal
        modalData={releaseStatusModal}
        onClose={() => setReleaseStatusModal(null)}
        headerInfo={headerInfo}
        onSuccessClose={onClose}
      />
    </div>
  );
};
