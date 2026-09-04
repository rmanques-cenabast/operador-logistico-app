import React from 'react';
import { X, CheckCircle, Package } from 'lucide-react';

export interface PreAvisoLine {
  preAvisoId: string;
  provider: string;
  lineNo: number;
  poNumber: string;
  productCode: string;
  batch: string;
  expDate: string;
  receptionDate: string;
  qty: number;
  qtyExpected: number;
  qtyReceived: number;
  uom: string;
  status: string;
  badge: string;
  estadoFisico: string;
}

interface PreavisoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPreAvisoId: string | null;
  lines: PreAvisoLine[];
  lineaNegocioLabel?: string;
}

export const PreavisoDetailModal: React.FC<PreavisoDetailModalProps> = ({
  isOpen,
  onClose,
  selectedPreAvisoId,
  lines
}) => {
  if (!isOpen || !selectedPreAvisoId) return null;

  const currentLines = lines.filter(l => l.preAvisoId === selectedPreAvisoId);
  const activePA = currentLines[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ width: '1050px', maxWidth: '95vw', background: 'white', borderRadius: '8px', overflow: 'hidden' }}
      >
        <div className="panel-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>
          <span>Detalle PRE AVISO - {selectedPreAvisoId?.replace('PRE-', '')}</span>
          <X size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={onClose} />
        </div>

        <div className="panel-content" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {/* Stepper Original */}
          <div className="panel-section-title" style={{ marginTop: '0', textAlign: 'center', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', letterSpacing: '1px' }}>
            ESTADO DEL PEDIDO
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '72px', marginTop: '24px', padding: '0 70px' }}>
            {/* Step 1 */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                <CheckCircle size={20} />
              </div>
              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', width: '160px', textAlign: 'center' }}>
                PENDIENTE RECEPCIÓN
              </div>
            </div>

            {/* Line 1 */}
            <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: activePA?.estadoFisico !== 'Pendiente' ? '100%' : '0%', background: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', borderRadius: '2px' }}></div>
            </div>

            {/* Step 1.5 (Parcial) */}
            {activePA?.estadoFisico === 'Parcial' && (
              <>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--warning-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                    <CheckCircle size={20} />
                  </div>
                  <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: 'var(--warning-main)', width: '160px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    RECEPCIÓN PARCIAL
                  </div>
                </div>
                <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: 'var(--warning-main)', borderRadius: '2px' }}></div>
                </div>
              </>
            )}

            {/* Step 2 (Final) */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: activePA?.estadoFisico === 'Completa' ? 'var(--success-main)' : 'var(--bg-color)', border: activePA?.estadoFisico === 'Completa' ? 'none' : '2px solid var(--border-color)', color: activePA?.estadoFisico === 'Completa' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
                {activePA?.estadoFisico === 'Completa' ? <CheckCircle size={20} /> : (activePA?.estadoFisico === 'Parcial' ? '3' : '2')}
              </div>
              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: activePA?.estadoFisico === 'Completa' ? 'var(--success-main)' : 'var(--text-muted)', width: '120px', textAlign: 'center' }}>
                RECIBIDO EN OL
              </div>
            </div>
          </div>

          {/* Tabla de Productos Original */}
          <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Package size={16} />
            RESUMEN DE PRODUCTOS DECLARADOS
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--sidebar-bg)' }}>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Posición</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Pedido Compra</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Material</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Lote</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>F. Vencimiento</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Cant. Orig.</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Recibido</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Pendiente</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Recepción OL</th>
                </tr>
              </thead>
              <tbody>
                {currentLines.map((line, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>0{line.lineNo}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {line.poNumber}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontWeight: 400 }}>{line.productCode}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontFamily: 'monospace' }}>{line.batch}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>{line.expDate}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400 }}>
                      {line.qtyExpected} {line.uom}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400, color: line.qtyReceived > 0 ? 'var(--success-main)' : 'inherit' }}>
                      {line.qtyReceived} {line.uom}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400, color: (line.qty > 0) ? 'var(--warning-main)' : 'var(--text-muted)' }}>
                      {line.qty ?? 0} {line.uom}
                    </td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                      {(line.qty <= 0 || (line.qtyReceived >= line.qtyExpected && line.qtyExpected > 0)) ? (
                        <span style={{ fontSize: '0.65rem', background: 'var(--success-bg)', color: 'var(--success-text)', padding: '4px 8px', borderRadius: '4px', fontWeight: 400, letterSpacing: '0.5px' }}>
                          RECIBIDO EN OL
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.65rem', background: 'var(--warning-bg)', color: 'var(--warning-text)', padding: '4px 8px', borderRadius: '4px', fontWeight: 400, letterSpacing: '0.5px' }}>
                          PENDIENTE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
          <button className="btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '6px', fontWeight: 400, cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
