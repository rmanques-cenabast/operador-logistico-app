import React from 'react';
import { X, Package, FileText, Database, ArrowRightLeft, Building2, User, Calendar, CheckCircle2 } from 'lucide-react';
import { AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';

interface MovementDetailModalProps {
  header: AdjustmentHeader;
  detalle: AdjustmentDetail;
  onClose: () => void;
}

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({ header, detalle, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ width: '840px', maxWidth: '95vw', borderRadius: '10px' }}>
        
        {/* ENCABEZADO MINIMALISTA Y LIMPIO */}
        <div className="panel-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          
          {/* IZQUIERDA: CÓDIGO MATERIAL Y LOTE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package color="#475569" size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.2 }}>
                ZCEN: {detalle.Codigo_Material}
              </h3>
              <div style={{ display: 'flex', gap: '12px', marginTop: '3px', fontSize: '0.82rem', color: '#64748b' }}>
                <span>Lote SAP: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{detalle.Lote_SAP}</strong></span>
                <span>•</span>
                <span>Línea: <strong style={{ color: '#0f172a' }}>{header.Linea_Negocio || 'CENABAST'}</strong></span>
              </div>
            </div>
          </div>

          {/* DERECHA: CHIPS UNIFORMES Y BOTÓN DE CIERRE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
              OC: {detalle.Numero_OC || 'Sin OC'} {detalle.Posicion_OC ? `(Pos ${detalle.Posicion_OC})` : ''}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
              Folio: <strong style={{ color: '#0f172a' }}>{header.Nro_Ajuste}</strong>
            </span>
            {header.Centro && (
              <span style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 500 }}>
                Centro: <strong style={{ color: '#0f172a' }}>{header.Centro}</strong>
              </span>
            )}

            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '6px', borderRadius: '6px', marginLeft: '4px', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={18} />
            </button>
          </div>

        </div>

        <div className="panel-content" style={{ padding: '24px', background: 'var(--app-bg)', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* BANNER DIAGRAMA DE TRASLADO MEJOR ESTRUCTURADO */}
              {['311', '321', '344', '309'].includes(detalle.Tipo_Movimiento) || (detalle.Almacen_Origen && detalle.Almacen_Destino && detalle.Almacen_Origen !== detalle.Almacen_Destino) ? (
                <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRightLeft size={14} color="#0284c7" /> Flujo Físico de Reubicación de Almacenes
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    
                    {/* ALMACÉN ORIGEN */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bae6fd' }}>
                        <Building2 size={18} color="#0369a1" />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', display: 'block' }}>ALMACÉN ORIGEN</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a', fontFamily: 'monospace' }}>Almacén {detalle.Almacen_Origen || '6001'}</strong>
                      </div>
                    </div>

                    {/* FLECHA Y CANTIDAD DE TRASLADO */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, padding: '0 24px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', background: 'white', padding: '4px 14px', borderRadius: '16px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                        <Package size={13} /> +{detalle.Cantidad} Unidades (Clase {detalle.Tipo_Movimiento})
                      </span>
                      <div style={{ width: '100%', height: '2px', background: 'linear-gradient(to right, #0284c7, #0369a1)', borderRadius: '2px', position: 'relative', marginTop: '4px' }}>
                        <div style={{ position: 'absolute', right: '-4px', top: '-4px', width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #0369a1' }}></div>
                      </div>
                    </div>

                    {/* ALMACÉN DESTINO */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', display: 'block' }}>ALMACÉN DESTINO</span>
                        <strong style={{ fontSize: '1.1rem', color: '#0f172a', fontFamily: 'monospace' }}>Almacén {detalle.Almacen_Destino || '6009'}</strong>
                      </div>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bbf7d0' }}>
                        <Building2 size={18} color="#15803d" />
                      </div>
                    </div>

                  </div>
                </div>
              ) : null}

              {/* TARJETAS DE INFORMACIÓN SAP Y WMS ARMONIZADAS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                
                {/* CARD SAP */}
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={15} color="var(--primary-main)" /> Contabilización SAP
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Documento Material:</span>
                      <span style={{ fontFamily: 'monospace', color: '#0369a1', fontWeight: 700, background: '#f0f9ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontSize: '0.88rem' }}>
                        {header.Documento_SAP_Ref || 'Pendiente'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Clase de Movimiento:</span>
                      <strong style={{ color: '#0f172a' }}>Mov. {detalle.Tipo_Movimiento}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Centro Logístico:</span>
                      <strong style={{ color: '#0f172a' }}>Centro {header.Centro || '1000'}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Línea de Negocio:</span>
                      <strong style={{ color: '#0f172a' }}>{header.Linea_Negocio || 'CENABAST'}</strong>
                    </div>
                  </div>
                </div>

                {/* CARD WMS */}
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={15} color="var(--primary-main)" /> Registro Operativo WMS
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={13} /> Operador:</span>
                      <strong style={{ color: '#0f172a' }}>{header.Usuario_OL}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> Fecha Registro:</span>
                      <strong style={{ color: '#0f172a' }}>{new Date(header.Fecha_Creacion).toLocaleString('es-CL')}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Folio Transacción:</span>
                      <strong style={{ color: '#0f172a' }}>{header.Nro_Ajuste}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Estado Transacción:</span>
                      <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} color="#15803d" /> PROCESADO EN SAP
                      </span>
                    </div>

                    {/* MOTIVO REUBICADO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Observaciones / Motivo:</span>
                      <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontStyle: detalle.Motivo ? 'normal' : 'italic' }}>
                        {detalle.Motivo || 'Sin observaciones registradas.'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
