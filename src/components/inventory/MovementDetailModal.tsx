import React from 'react';
import { X, Package, Database, Truck, Grid, Building2, User, Calendar, CheckCircle2, MessageSquare, ArrowRight, FileText, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';

interface MovementDetailModalProps {
  header: AdjustmentHeader;
  detalle: AdjustmentDetail;
  onClose: () => void;
}

const renderBadge = (tipoStockRaw: string | undefined | null) => {
  const tipoStock = String(tipoStockRaw || '').toUpperCase();
  if (!tipoStock || tipoStock === 'UNDEFINED' || tipoStock === 'NULL') {
    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
  }
  let stockLabel = 'L. UTILIZACIÓN';
  let stockColor = '#15803d';
  let stockBg = '#dcfce7';
  if (tipoStock === 'BLOQUEADO') {
    stockLabel = 'BLOQUEADO';
    stockColor = '#b91c1c';
    stockBg = '#fee2e2';
  } else if (tipoStock === 'CALIDAD') {
    stockLabel = 'C. CALIDAD';
    stockColor = '#b45309';
    stockBg = '#fef3c7';
  }
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stockColor, background: stockBg, padding: '3px 8px', borderRadius: '4px', border: `1px solid ${stockColor}40`, whiteSpace: 'nowrap' }}>
      {stockLabel}
    </span>
  );
};

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({ header, detalle, onClose }) => {
  // Determine success status for the badge
  const estadoUpper = (header.Estado_SAP || '').toUpperCase();
  const isExitoso = estadoUpper === 'PROCESADO' || estadoUpper === 'EXITOSO' || estadoUpper === 'COMPLETADO';
  
  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw', background: '#f8fafc', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* ENCABEZADO */}
        <div style={{ padding: '24px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0' }}>
          
          {/* IZQUIERDA: ICONO + TÍTULOS */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package color="white" size={24} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 600, letterSpacing: '-0.02em' }}>
                ZCEN: {detalle.Codigo_Material}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isExitoso ? (
                   <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                     <CheckCircle2 size={12} /> PROCESADO EN SAP
                   </span>
                ) : (
                   <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                     PENDIENTE EN SAP
                   </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', fontSize: '0.8rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Grid size={14} color="#94a3b8" />
                  <span>Lote SAP: <strong style={{ color: '#0f172a' }}>{detalle.Lote_SAP || 'N/A'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} color="#94a3b8" />
                  <span>Línea: <strong style={{ color: '#0f172a' }}>{header.Linea_Negocio || 'CENABAST'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* DERECHA: CAJAS Y CERRAR */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>OC:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{detalle.Numero_OC ? `${detalle.Numero_OC}` : 'Sin OC'}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Folio:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{header.Nro_Ajuste}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 8px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Centro:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.8rem' }}>{header.Centro || '6000'}</strong>
              </div>
            </div>
            
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#f8fafc' }}>
          
          {/* FLUJO DE STOCK */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase' }}>
              FLUJO DE STOCK (MOV. {detalle.Tipo_Movimiento})
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Stock Origen</span>
                {renderBadge((detalle as any).StockOrigen || (detalle as any).stockorigen)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, padding: '0 20px' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                  +{detalle.Cantidad} Un.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px', color: '#cbd5e1' }}>
                  <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                  <Truck size={16} />
                  <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                  <ArrowRight size={14} style={{ marginLeft: '-4px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Stock Destino</span>
                {renderBadge((detalle as any).StockDestino || (detalle as any).stockdestino)}
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', margin: '0 -24px' }}></div>

          {/* LISTAS DE DETALLES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* CONTABILIZACION SAP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Database size={14} /> CONTABILIZACIÓN SAP
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Doc. Material</span>
                <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{header.Documento_SAP_Ref || 'Pendiente'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowRightLeft size={14} /> Clase Mov.</span>
                <strong style={{ color: '#0f172a' }}>{detalle.Tipo_Movimiento}</strong>
              </div>
            </div>

            {/* REGISTRO WMS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <FileText size={14} /> REGISTRO WMS
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> Operador</span>
                <strong style={{ color: '#0f172a' }}>{header.Usuario_OL}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Fecha Registro</span>
                <span style={{ color: '#475569' }}>
                  {(() => {
                     const d = new Date(String(header.Fecha_Creacion).replace('Z', ''));
                     let ampm = d.getHours() >= 12 ? 'p.m.' : 'a.m.';
                     return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} ${ampm}`;
                  })()}
                </span>
              </div>
            </div>

          </div>

          {/* MENSAJE DE RECHAZO / ERROR SAP (Si existe) */}
          {(() => {
            if (!header.logsSap || header.logsSap.length === 0) return null;
            const ultimoLog = header.logsSap[header.logsSap.length - 1];
            if (!ultimoLog.Respuesta_SAP) return null;
            
            let errorText = '';
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

            if (!errorText) return null;

            return (
              <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '6px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                  <AlertCircle size={14} /> Detalle de Respuesta SAP
                </div>
                <div style={{ fontSize: '0.85rem', color: '#7f1d1d', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                  {errorText}
                </div>
              </div>
            );
          })()}

          {/* OBSERVACIONES */}
          <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} /> Observaciones / Motivo
            </div>
            <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
              {detalle.Motivo || 'Sin observaciones registradas.'}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
