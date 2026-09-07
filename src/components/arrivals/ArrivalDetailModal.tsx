import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Package, FileText, Download, Eye, Calendar, ShieldCheck, Clock, Check, Lock, CheckCircle2, AlertTriangle, Loader2, AlertCircle, Paperclip } from 'lucide-react';
import { API_URL } from '../../config/api';
import { ArrivalsService } from '../../services/arrivals.service';

export interface ArrivalOrder {
  rowId: string;
  id: string; // NumeroEntrega (PRE-X)
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
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);
  const [poReleaseInfo, setPoReleaseInfo] = useState<any | null>(null);
  const [checkingPo, setCheckingPo] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [isLiberando, setIsLiberando] = useState<boolean>(false);
  const [attachingDocId, setAttachingDocId] = useState<number | null>(null);
  const [attachedDocs, setAttachedDocs] = useState<Set<number>>(new Set());
  const [releaseStatusModal, setReleaseStatusModal] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const targetOrder = orders.find(o => o.rowId === selectedRowId);
  const targetId = targetOrder ? targetOrder.id : (selectedRowId ? selectedRowId.split('-')[0] : '');
  const selectedLines = orders.filter(o => o.id === targetId);
  const headerInfo = selectedLines[0] || targetOrder;

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
          title: 'No se pudo liberar a SAP',
          message: res.message || 'Ocurrió un inconveniente al intentar autorizar la liberación en SAP.'
        });
      } else {
        setReleaseStatusModal({
          type: 'success',
          title: '¡Liberación Autorizada con Éxito!',
          message: res?.message || `Se ha autorizado la liberación a SAP para el preaviso ${headerInfo?.id}.`
        });
      }
    } catch (err: any) {
      setReleaseStatusModal({
        type: 'error',
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
        setReleaseStatusModal({
          type: 'success',
          title: '¡Anexo Vinculado con Éxito en SAP!',
          message: res.message || `El archivo '${doc.nombreArchivo}' fue vinculado al Documento de Material ${headerInfo.documentoSAP} en SAP.`
        });
      } else {
        setReleaseStatusModal({
          type: 'error',
          title: 'Error al Adjuntar en SAP',
          message: res?.message || 'SAP rechazó la vinculación del archivo al documento de material.'
        });
      }
    } catch (err: any) {
      setReleaseStatusModal({
        type: 'error',
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
            <span className="font-mono">Detalle RECEPCIÓN - {headerInfo?.id?.replace('PRE-', '')}</span>
            <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
              PC: {headerInfo?.poNumber}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="panel-content" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Stepper */}
          <div className="panel-section-title" style={{ marginTop: '0', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px' }}>
            ESTADO DEL FLUJO DE INGRESO
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '56px', marginTop: '20px', padding: '0 70px' }}>
            {/* Step 1 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                <CheckCircle size={20} />
              </div>
              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 600, color: '#059669', width: '160px', textAlign: 'center' }}>
                PENDIENTE RECEPCIÓN
              </div>
            </div>

            {/* Line 1 */}
            <div style={{ flex: 1, height: '4px', background: '#e2e8f0', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', background: '#10b981', borderRadius: '2px' }}></div>
            </div>

            {/* Step 2 (Final) */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                <CheckCircle size={20} />
              </div>
              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 600, color: '#059669', width: '120px', textAlign: 'center' }}>
                RECIBIDO EN OL
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 🛡️ TARJETA DE VERIFICACIÓN DE LIBERACIÓN SAP EN VIVO */}
          {/* ======================================================== */}
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
              <ShieldCheck className="text-blue-600" size={20} />
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                Estrategia de Liberación en SAP
              </h4>
            </div>

            <div className="mt-3">
              {/* Tarjeta SAP ERP en Tiempo Real */}
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Pedido de Compra: {headerInfo?.poNumber}
                    </span>
                  </div>

                  {/* Estado Final */}
                  {checkingPo ? (
                    <div className="h-6 bg-slate-100 rounded animate-pulse w-36"></div>
                  ) : poReleaseInfo ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-normal ${
                      poReleaseInfo.estaLiberado 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {poReleaseInfo.estaLiberado ? (
                        <>
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Liberado en SAP
                        </>
                      ) : (
                        <>
                          <Lock size={13} className="text-amber-600" />
                          Pendiente de Liberación
                        </>
                      )}
                    </span>
                  ) : null}
                </div>

                {/* ======================================================== */}
                {/* 🧭 PASOS DE LIBERACIÓN SAP EN FORMATO HORIZONTAL */}
                {/* ======================================================== */}
                {poReleaseInfo?.nivelesLiberacion && poReleaseInfo.nivelesLiberacion.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                      {poReleaseInfo.nivelesLiberacion.map((nivel: any) => (
                        <div 
                          key={nivel.codigo} 
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all shadow-xs"
                        >
                          {/* Icono Redondeado Izquierdo */}
                          <div className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center ${
                            nivel.aprobado 
                              ? 'bg-slate-100 border-slate-300 text-slate-800' 
                              : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {nivel.aprobado ? (
                              <Check size={18} className="stroke-[2.5]" />
                            ) : (
                              <Clock size={17} className="text-slate-500" />
                            )}
                          </div>

                          {/* Contenido de la Tarjeta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-mono text-[11px] text-slate-400 font-semibold tracking-wider">
                                Cód: {nivel.codigo}
                              </span>

                              {/* Badge de Estado */}
                              {nivel.aprobado ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                  <Check size={10} className="stroke-[3]" /> Aprobado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  <Clock size={10} className="text-amber-600" /> Pendiente
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-xs text-slate-800 truncate" title={nivel.descripcion}>
                              {nivel.descripcion}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mensaje de estado SAP */}
                <div className="text-xs text-slate-500 mb-2 text-center">
                  {poReleaseInfo?.mensaje || 'Consultando estado en SAP...'}
                </div>

                {/* ======================================================== */}
                {/* 🚀 ACCIÓN INTEGRADA: LIBERAR A SAP CENTRADO ABAJO */}
                {/* ======================================================== */}
                {isEsperandoLiberacion && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center text-center bg-blue-50/60 rounded-xl p-4 border border-blue-100">
                    <div className="mb-3 w-full">
                      <strong className="text-blue-900 text-sm block font-bold">
                        Estado: ESPERANDO LIBERACIÓN
                      </strong>
                      <p className="text-xs text-blue-600 mt-1 w-full">
                        La recepción física fue confirmada en bodega. Al autorizar la liberación, se contabilizará el movimiento de mercaderías en SAP.
                      </p>
                    </div>
                    <button 
                      onClick={handleLiberarClick}
                      disabled={isLiberando}
                      className={`px-8 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm inline-flex items-center justify-center gap-2 ${
                        isLiberando
                          ? 'bg-blue-400 text-white cursor-wait opacity-85'
                          : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer hover:shadow'
                      }`}
                    >
                      {isLiberando ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Liberando a SAP...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>Liberar a SAP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tarjetas de Producto Declarado (Compactas) */}
          <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Package size={16} />
            RESUMEN DE PRODUCTOS DECLARADOS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '28px' }}>
            {selectedLines.map((line) => {
              const diff = line.receivedQty - line.expectedQty;
              return (
                <div key={line.rowId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', background: 'white' }}>
                  
                  {/* Cabecera de Línea Compacta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                        Posición {String(line.lineNo).padStart(3, '0')}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {line.productCode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', background: line.badge === 'success' ? '#dcfce7' : '#fef3c7', color: line.badge === 'success' ? '#166534' : '#92400e', border: `1px solid ${line.badge === 'success' ? '#bbf7d0' : '#fde68a'}` }}>
                        {line.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', background: line.sapBadge === 'success' ? '#dcfce7' : (line.sapBadge === 'danger' ? '#fee2e2' : '#fef3c7'), color: line.sapBadge === 'success' ? '#166534' : (line.sapBadge === 'danger' ? '#991b1b' : '#92400e'), border: `1px solid ${line.sapBadge === 'success' ? '#bbf7d0' : (line.sapBadge === 'danger' ? '#fca5a5' : '#fde68a')}` }}>
                        {line.sapStatus || 'PENDIENTE'}
                      </span>
                    </div>
                  </div>

                  {/* Resumen de Datos Declarados vs Recibidos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.8rem', background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Lote Declarado:</span>
                      <strong style={{ color: '#0f172a' }}>{line.loteEsperado || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Vence Declarado:</span>
                      <strong style={{ color: '#0f172a' }}>{line.fechaExpEsperada || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Cant. Declarada:</span>
                      <strong style={{ color: '#0f172a' }}>{line.expectedQty.toLocaleString('es-CL')} {line.uom}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Cant. Física Recibida:</span>
                      <strong style={{ color: '#0f172a' }}>{line.receivedQty.toLocaleString('es-CL')} {line.uom}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>Diferencia:</span>
                      <strong style={{ color: diff === 0 ? '#16a34a' : (diff < 0 ? '#dc2626' : '#2563eb') }}>
                        {diff > 0 ? `+${diff}` : diff} {line.uom}
                      </strong>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* 📦 SECCIÓN INDEPENDIENTE: HISTORIAL DE RECEPCIONES */}
          {/* ======================================================== */}
          <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Calendar size={16} />
            HISTORIAL DE RECEPCIONES EN BODEGA
          </div>

          <div style={{ marginBottom: '28px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 12px' }}>Fecha y Hora</th>
                  <th style={{ padding: '8px 12px' }}>Pos.</th>
                  <th style={{ padding: '8px 12px' }}>Material</th>
                  <th style={{ padding: '8px 12px' }}>Lote Recibido</th>
                  <th style={{ padding: '8px 12px' }}>Vencimiento</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Cant. Recibida</th>
                </tr>
              </thead>
              <tbody>
                {selectedLines.flatMap(line => (line.historialEntregas || []).map(h => ({ ...h, pos: line.lineNo, prod: line.productCode }))).length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                      No hay registros en el historial de recepciones.
                    </td>
                  </tr>
                ) : (
                  selectedLines.flatMap(line => (line.historialEntregas || []).map((entrega: any, idx: number) => {
                    const d = entrega.fecha ? new Date(entrega.fecha) : null;
                    const fechaFmt = d ? d.toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
                    const horaFmt = d ? d.toLocaleTimeString('es-CL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                    const vencFmt = entrega.vencimiento ? new Date(entrega.vencimiento).toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

                    return (
                      <tr key={`hist-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>
                          <strong>{fechaFmt}</strong> {horaFmt && <span style={{ color: '#64748b' }}>({horaFmt})</span>}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>
                          {String(line.lineNo).padStart(3, '0')}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                          {line.productCode}
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#334155' }}>
                          {entrega.lote || '-'}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#334155' }}>
                          {vencFmt}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                          {Number(entrega.cantidad || 0).toLocaleString('es-CL')} Un.
                        </td>
                      </tr>
                    );
                  }))
                )}
              </tbody>
            </table>
          </div>

          {/* ======================================================== */}
          {/* 📄 SECCIÓN DE DOCUMENTOS ADJUNTOS CON VISOR INLINE */}
          {/* ======================================================== */}
          <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FileText size={16} />
            DOCUMENTOS ADJUNTOS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {selectedLines.flatMap(line => {
              const key = `${line.poNumber}-${line.id}`;
              const docs = documentsMap[key] || [];
              if (docs.length === 0) {
                return (
                  <div key={`no-doc-${line.rowId}`} style={{ padding: '16px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Sin documentos adjuntos para el Pedido de Compra {line.poNumber}
                  </div>
                );
              }
              return docs.map((doc: any) => (
                <div key={doc.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '6px', color: '#2563eb' }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{doc.nombreArchivo}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Tipo: <strong>{doc.tipoDocumento || 'ADJUNTO'}</strong> | Subido el: {(() => {
                            if (!doc.fechaSubida) return '-';
                            const d = new Date(doc.fechaSubida);
                            const fechaStr = d.toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
                            const horaStr = d.toLocaleTimeString('es-CL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });
                            return `${fechaStr} a las ${horaStr} hrs`;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Botón Adjuntar a SAP */}
                      {attachedDocs.has(doc.id) ? (
                        <span 
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                          title="Archivo vinculado en SAP GOS exitosamente"
                        >
                          <CheckCircle size={15} /> Adjunto en SAP
                        </span>
                      ) : headerInfo?.documentoSAP ? (
                        <button
                          onClick={() => handleAdjuntarDocASap(doc)}
                          disabled={attachingDocId === doc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: attachingDocId === doc.id ? '#f1f5f9' : '#047857',
                            border: '1px solid #047857',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: attachingDocId === doc.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: attachingDocId === doc.id ? '#64748b' : 'white',
                            transition: 'all 0.2s'
                          }}
                          title={`Vincular a MIGO ${headerInfo.documentoSAP} en SAP`}
                        >
                          {attachingDocId === doc.id ? (
                            <>
                              <Loader2 size={15} className="animate-spin" /> Adjuntando...
                            </>
                          ) : (
                            <>
                              <Paperclip size={15} /> Adjuntar a SAP
                            </>
                          )}
                        </button>
                      ) : (
                        <span 
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1', cursor: 'not-allowed' }}
                          title="Primero debe generarse la MIGO en SAP para poder vincular la factura"
                        >
                          <Paperclip size={13} /> Pendiente MIGO
                        </span>
                      )}

                      <button 
                        onClick={() => viewingDocId === doc.id ? setViewingDocId(null) : setViewingDocId(doc.id)} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: viewingDocId === doc.id ? '#f1f5f9' : 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', transition: 'all 0.2s' }}
                      >
                        {viewingDocId === doc.id ? <><X size={16} /> CERRAR VISTA</> : <><Eye size={16} /> VER DOCUMENTO</>}
                      </button>
                    </div>
                  </div>
                  
                  {/* VISOR INLINE */}
                  {viewingDocId === doc.id && (
                    <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Eye size={14} /> Vista Previa
                        </div>
                        <a href={`${API_URL}/ol/inbound/documents/file/${doc.id}?download=true`} download style={{ textDecoration: 'none', background: 'white', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
                          <Download size={14} /> DESCARGAR
                        </a>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                        {['png', 'jpg', 'jpeg', 'gif', 'webp'].includes((doc.extensionArchivo || '').toLowerCase()) ? (
                          <img 
                            src={`${API_URL}/ol/inbound/documents/file/${doc.id}`} 
                            alt={`Documento ${doc.nombreArchivo}`}
                            style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                        ) : (
                          <iframe 
                            src={`${API_URL}/ol/inbound/documents/file/${doc.id}`} 
                            style={{ width: '100%', height: '600px', border: 'none', display: 'block', backgroundColor: 'white' }} 
                            title={`Documento ${doc.nombreArchivo}`}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ));
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button className="btn" onClick={onClose} style={{ background: 'white', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px 18px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ⚠️ MODAL DE ADVERTENCIA: LIBERACIÓN PENDIENTE EN SAP */}
      {/* ======================================================== */}
      {showWarningModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
          onClick={(e) => { e.stopPropagation(); setShowWarningModal(false); }}
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
                  Pedido de Compra: {headerInfo?.poNumber}
                </span>
              </div>
            </div>

            {/* Contenido del Aviso */}
            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                El Pedido de Compra <strong className="font-mono text-slate-900">{headerInfo?.poNumber}</strong> no puede ser procesado en SAP porque aún presenta firmas pendientes en su Estrategia de Liberación.
              </p>

              {/* Listado de Áreas Pendientes */}
              {poReleaseInfo?.nivelesLiberacion && (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  <span className="font-bold text-slate-700 text-xs block mb-2">
                    📋 Áreas pendientes de firma en SAP:
                  </span>
                  <ul className="space-y-1.5 font-medium text-slate-800">
                    {poReleaseInfo.nivelesLiberacion
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
                onClick={() => setShowWarningModal(false)}
                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl font-bold text-xs tracking-wide transition-colors cursor-pointer shadow-sm hover:shadow"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO DE LIBERACIÓN (Éxito o Error) */}
      {releaseStatusModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (releaseStatusModal.type === 'success') {
              setReleaseStatusModal(null);
              onClose();
            } else {
              setReleaseStatusModal(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                releaseStatusModal.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' 
                  : 'bg-rose-100 text-rose-600 ring-4 ring-rose-50'
              }`}>
                {releaseStatusModal.type === 'success' ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {releaseStatusModal.title}
                </h3>
                <span className="text-xs text-slate-500 font-mono block truncate">
                  Preaviso: {headerInfo?.id} {headerInfo?.poNumber ? `| PC: ${headerInfo.poNumber}` : ''}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <div className="py-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="text-slate-700 text-sm">
                {releaseStatusModal.message}
              </p>

              {releaseStatusModal.type === 'success' ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-xs text-emerald-800">
                    <Clock size={14} className="text-emerald-600" />
                    <span>Próximo paso del flujo:</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    El <strong>Worker Inbound</strong> procesará este ingreso en su próximo ciclo para registrar el movimiento de material en SAP de manera automática.
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs font-medium">
                  💡 Por favor, verifique el estado del pedido en SAP o contacte al administrador si el problema persiste.
                </div>
              )}
            </div>

            {/* Botón de acción */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  const isSuccess = releaseStatusModal.type === 'success';
                  setReleaseStatusModal(null);
                  if (isSuccess) {
                    onClose();
                  }
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm cursor-pointer ${
                  releaseStatusModal.type === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white hover:shadow'
                    : 'bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white'
                }`}
              >
                {releaseStatusModal.type === 'success' ? 'Entendido y Continuar' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
