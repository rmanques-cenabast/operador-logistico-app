import React from 'react';
import { Calendar } from 'lucide-react';
import { ArrivalOrder } from '../ArrivalDetailModal';

interface ArrivalReceptionHistoryProps {
  lines: ArrivalOrder[];
}

export const ArrivalReceptionHistory: React.FC<ArrivalReceptionHistoryProps> = ({ lines }) => {
  const historyItems = lines.flatMap(line => 
    (line.historialEntregas || []).map((h: any) => ({ ...h, pos: line.lineNo, prod: line.productCode }))
  );

  return (
    <>
      <div 
        className="panel-section-title" 
        style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Calendar size={16} />
        HISTORIAL DE RECEPCIÓN DE MERCANCÍA
      </div>

      <div style={{ marginBottom: '28px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Fecha y Hora</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Pos.</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Material</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Lote Recibido</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Vencimiento</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Cant. Recibida</th>
              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Factura</th>
            </tr>
          </thead>
          <tbody>
            {historyItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '18px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay registros en el historial de recepciones.
                </td>
              </tr>
            ) : (
              lines.flatMap(line => (line.historialEntregas || []).map((entrega: any, idx: number) => {
                const d = entrega.fecha ? new Date(entrega.fecha) : null;
                const fechaFmt = d ? d.toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
                const horaFmt = d ? d.toLocaleTimeString('es-CL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                const vencFmt = entrega.vencimiento ? new Date(entrega.vencimiento).toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

                return (
                  <tr key={`hist-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', color: '#334155', textAlign: 'center' }}>
                      <strong className="font-mono">{fechaFmt}</strong> {horaFmt && <span style={{ color: '#64748b' }}>({horaFmt})</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#64748b', textAlign: 'center' }} className="font-mono font-medium">
                      {String(line.lineNo).padStart(3, '0')}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a', textAlign: 'center' }} className="font-mono">
                      {line.productCode}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#334155', textAlign: 'center' }} className="font-mono">
                      {entrega.lote || '-'}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#334155', textAlign: 'center' }} className="font-mono">
                      {vencFmt}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }} className="font-mono">
                      {Number(entrega.cantidad || 0).toLocaleString('es-CL')} Un.
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }} className="font-mono">
                      {line.numeroFactura && line.numeroFactura !== '-' ? (
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 text-xs">
                          {line.numeroFactura}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                );
              }))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
