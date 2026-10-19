import React from 'react';
import { Package } from 'lucide-react';
import { ArrivalOrder } from '../ArrivalDetailModal';

interface ArrivalProductsSummaryProps {
  lines: ArrivalOrder[];
}

export const ArrivalProductsSummary: React.FC<ArrivalProductsSummaryProps> = ({ lines }) => {
  return (
    <>
      <div 
        className="panel-section-title" 
        style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Package size={16} />
        RESUMEN DE PRODUCTOS DECLARADOS
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '28px' }}>
        {lines.map((line) => {
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
                  {line.numeroFactura && line.numeroFactura !== '-' && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a' }} title="Factura informada por el Operador Logístico">
                      FAC: {line.numeroFactura}
                    </span>
                  )}
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

              {/* Resumen de Datos Declarados vs Recibidos Centrado */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Lote Declarado:</span>
                  <strong className="font-mono text-xs md:text-sm text-slate-900 font-bold truncate max-w-full">
                    {line.loteEsperado || '-'}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Vence Declarado:</span>
                  <strong className="font-mono text-xs md:text-sm text-slate-900 font-bold truncate max-w-full">
                    {line.fechaExpEsperada || '-'}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Cant. Declarada:</span>
                  <strong className="font-mono text-xs md:text-sm text-slate-900 font-bold">
                    {line.expectedQty.toLocaleString('es-CL')} {line.uom}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Cant. Física Recibida:</span>
                  <strong className="font-mono text-xs md:text-sm text-slate-900 font-bold">
                    {line.receivedQty.toLocaleString('es-CL')} {line.uom}
                  </strong>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70 text-center flex flex-col justify-center items-center col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Diferencia:</span>
                  <strong className={`font-mono text-xs md:text-sm font-bold ${
                    diff === 0 ? 'text-emerald-600' : (diff < 0 ? 'text-rose-600' : 'text-blue-600')
                  }`}>
                    {diff > 0 ? `+${diff.toLocaleString('es-CL')}` : diff.toLocaleString('es-CL')} {line.uom}
                  </strong>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </>
  );
};
