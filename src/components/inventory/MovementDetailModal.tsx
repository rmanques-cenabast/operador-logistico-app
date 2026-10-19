import React from 'react';
import { 
  X, 
  Package, 
  Database, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare
} from 'lucide-react';
import { AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { getMovimientoTypeBadge, renderStockBadge } from './InventoryTable';

interface MovementDetailModalProps {
  header: AdjustmentHeader;
  detalle: AdjustmentDetail;
  onClose: () => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({ header, detalle, onClose }) => {
  const estadoUpper = (header.Estado_SAP || '').toUpperCase();
  const isExitoso = estadoUpper === 'PROCESADO' || estadoUpper === 'EXITOSO' || estadoUpper === 'COMPLETADO';
  const isError = estadoUpper.includes('ERROR') || estadoUpper.includes('FALLO') || estadoUpper === 'RECHAZADO';

  const movBadge = getMovimientoTypeBadge(detalle.Tipo_Movimiento, detalle.Almacen_Origen, detalle.Almacen_Destino);

  const esEgreso = ['711', '717', '551', '553', '555', '331', '333'].includes(detalle.Tipo_Movimiento);
  const cantidadReal = esEgreso ? -Math.abs(detalle.Cantidad) : detalle.Cantidad;

  // Formato de fecha
  const fechaFmtCompleta = (() => {
    const raw = header.Fecha_Creacion ? String(header.Fecha_Creacion).replace('Z', '') : '';
    const d = raw ? new Date(raw) : null;
    if (!d || isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const time = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${day}-${month}-${year} (${time})`;
  })();

  // Parsear logs de error de SAP si existen
  let errorText = '';
  if (header.logsSap && header.logsSap.length > 0) {
    const ultimoLog = header.logsSap[header.logsSap.length - 1];
    if (ultimoLog.Respuesta_SAP) {
      try {
        const res = JSON.parse(ultimoLog.Respuesta_SAP);
        if (res.mensajes && Array.isArray(res.mensajes) && res.mensajes.length > 0) {
          errorText = res.mensajes.map((m: any) => `[${m.tipo}] ${m.mensaje}`).join(' | ');
        } else if (res.error) {
          errorText = res.error;
        }
      } catch (e) {
        errorText = ultimoLog.Respuesta_SAP;
      }
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '1080px', maxWidth: '95vw', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="panel-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a', background: '#f8fafc' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-base font-bold text-slate-900">
              Detalle AJUSTE: {header.Nro_Ajuste}
            </span>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
              ZCEN: {detalle.Codigo_Material}
            </span>
            {detalle.Numero_OC && (
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded border border-amber-200" title="Orden de Compra Asociada">
                OC: {detalle.Numero_OC}
              </span>
            )}
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              LOTE: {detalle.Lote_SAP || 'N/A'}
            </span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              CENTRO: {header.Centro || '6000'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 cursor-pointer"
            title="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido Modularizado */}
        <div className="panel-content" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Stepper del flujo */}
          <div 
            className="panel-section-title" 
            style={{ marginTop: '0', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px' }}
          >
            ESTADO DEL FLUJO DE INVENTARIO
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '56px', marginTop: '20px', padding: '0 80px' }}>
            {/* Step 1: WMS */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                <CheckCircle size={20} />
              </div>
              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 700, color: '#059669', width: '180px', textAlign: 'center' }}>
                REGISTRADO EN WMS
              </div>
            </div>

            {/* Connecting Line */}
            <div style={{ flex: 1, height: '4px', background: '#e2e8f0', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                width: isExitoso ? '100%' : (isError ? '100%' : '50%'), 
                background: isExitoso ? '#10b981' : (isError ? '#ef4444' : '#f59e0b'), 
                borderRadius: '2px' 
              }}></div>
            </div>

            {/* Step 2: SAP ERP */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                background: isExitoso ? '#10b981' : (isError ? '#ef4444' : '#f59e0b'), 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold', 
                zIndex: 2 
              }}>
                {isExitoso ? <CheckCircle size={20} /> : (isError ? <AlertCircle size={20} /> : <Clock size={20} />)}
              </div>
              <div style={{ 
                position: 'absolute', 
                top: '44px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: isExitoso ? '#059669' : (isError ? '#b91c1c' : '#b45309'), 
                width: '180px', 
                textAlign: 'center' 
              }}>
                {isExitoso ? 'SINCRONIZADO EN SAP' : (isError ? 'ERROR EN SAP' : 'PENDIENTE EN SAP')}
              </div>
            </div>
          </div>

          {/* Tarjeta de integración SAP ERP */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Database size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  INTEGRACIÓN SAP ERP
                </div>
                <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  {header.Documento_SAP_Ref ? (
                    <span>DOC. MATERIAL SAP: <span className="text-blue-600">{header.Documento_SAP_Ref}</span></span>
                  ) : (
                    <span className="text-amber-600">PENDIENTE DE CONTABILIZACIÓN EN SAP</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span 
                className="inline-block px-3 py-1 rounded text-xs font-bold tracking-wide uppercase"
                style={{ background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}` }}
              >
                OPERACIÓN {movBadge.label}
              </span>
              <span 
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                  isExitoso 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : (isError 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200')
                }`}
              >
                {isExitoso && <CheckCircle size={13} />}
                {isError && <AlertCircle size={13} />}
                {!isExitoso && !isError && <Clock size={13} />}
                {isExitoso ? 'SINCRONIZADO' : (isError ? 'FALLO SAP' : 'PENDIENTE SAP')}
              </span>
            </div>
          </div>

          {/* Resumen de Movimiento y Stock */}
          <div 
            className="panel-section-title" 
            style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Package size={16} />
            RESUMEN DE MOVIMIENTO Y STOCK
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: 'white', marginBottom: '24px' }}>
            {/* Cabecera del item */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  LÍNEA {header.Linea_Negocio || 'CENABAST'}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  ZCEN: {detalle.Codigo_Material}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 uppercase">
                  CENTRO {header.Centro || '6000'}
                </span>
                <span 
                  className="inline-block px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase"
                  style={{ background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}` }}
                >
                  {movBadge.label}
                </span>
              </div>
            </div>

            {/* 5 Cajas Métricas (Idénticas a Recepción de Mercancía) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">LOTE SAP:</span>
                <strong className="font-mono text-xs md:text-sm text-slate-900 font-bold truncate max-w-full uppercase">
                  {detalle.Lote_SAP || 'N/A'}
                </strong>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">ALMACÉN (ORIGEN → DEST.):</span>
                <div className="flex items-center gap-1 font-mono text-xs md:text-sm text-slate-900 font-bold">
                  <span>{detalle.Almacen_Origen || '-'}</span>
                  <ArrowRight size={12} className="text-blue-500" />
                  <span>{detalle.Almacen_Destino || '-'}</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">STOCK ORIGEN:</span>
                <div className="flex justify-center items-center">
                  {renderStockBadge((detalle as any).StockOrigen || (detalle as any).stockorigen)}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">STOCK DESTINO:</span>
                <div className="flex justify-center items-center">
                  {renderStockBadge((detalle as any).StockDestino || (detalle as any).stockdestino)}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">CANTIDAD AJUSTADA:</span>
                <strong className={`font-mono text-xs md:text-sm font-bold ${
                  cantidadReal > 0 ? 'text-emerald-600' : (cantidadReal < 0 ? 'text-rose-600' : 'text-slate-800')
                }`}>
                  {cantidadReal > 0 ? `+${cantidadReal}` : cantidadReal} UN.
                </strong>
              </div>
            </div>
          </div>

          {/* Historial de Registro y Trazabilidad */}
          <div 
            className="panel-section-title" 
            style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Calendar size={16} />
            DATOS DE REGISTRO Y TRAZABILIDAD
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 text-left">FECHA Y HORA</th>
                  <th className="py-3 px-3 text-center">FOLIO AJUSTE</th>
                  <th className="py-3 px-3 text-center">OPERADOR WMS</th>
                  <th className="py-3 px-3 text-center">OPERACIÓN SAP</th>
                  <th className="py-3 px-3 text-center">DOC. SAP REF.</th>
                  <th className="py-3 px-3 text-center">ORDEN COMPRA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                    {fechaFmtCompleta}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                    {header.Nro_Ajuste}
                  </td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-700 uppercase">
                    {header.Usuario_OL || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span 
                      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase"
                      style={{ background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}` }}
                    >
                      {movBadge.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono">
                    {header.Documento_SAP_Ref ? (
                      <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {header.Documento_SAP_Ref}
                      </span>
                    ) : (
                      <span className="text-slate-400 uppercase">PENDIENTE</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                    {detalle.Numero_OC || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mensaje de Respuesta / Error SAP (si existe) */}
          {errorText && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                <AlertCircle size={15} className="text-rose-600" />
                <span>DETALLE DE RESPUESTA SAP</span>
              </div>
              <div className="text-xs text-rose-900 font-mono whitespace-pre-wrap leading-relaxed">
                {errorText}
              </div>
            </div>
          )}

          {/* Observaciones / Motivo */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/80 mb-2 flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <MessageSquare size={15} className="text-slate-500" />
              <span>OBSERVACIONES / MOTIVO DEL AJUSTE</span>
            </div>
            <div className="inline-block bg-white px-6 py-2.5 rounded-lg border border-slate-200 font-mono text-xs md:text-sm text-slate-800 text-center max-w-2xl shadow-sm">
              {detalle.Motivo ? detalle.Motivo : <span className="text-slate-400">SIN OBSERVACIONES REGISTRADAS.</span>}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button 
            onClick={onClose} 
            className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
