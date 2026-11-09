import React from 'react';
import { Calendar, CheckCircle, Paperclip, Loader2 } from 'lucide-react';
import { ArrivalOrder } from '../ArrivalDetailModal';

interface ArrivalReceptionHistoryProps {
  lines: ArrivalOrder[];
  documentsMap?: Record<string, any[]>;
  attachingDocKey?: string | null;
  attachedDocSAPs?: Set<string>;
  onAdjuntarDocASap?: (doc: any, docSAP: string) => Promise<void>;
}

export const ArrivalReceptionHistory: React.FC<ArrivalReceptionHistoryProps> = ({ 
  lines,
  documentsMap = {},
  attachingDocKey,
  attachedDocSAPs,
  onAdjuntarDocASap
}) => {
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
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Fecha y Hora</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>Pos.</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Material</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Lote Recibido</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Vencimiento</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Cant. Recibida</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>Factura</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>Doc. Material SAP</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>Anexo SAP</th>
            </tr>
          </thead>
          <tbody>
            {historyItems.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '18px', textAlign: 'center', color: '#94a3b8' }}>
                  No hay registros en el historial de recepciones.
                </td>
              </tr>
            ) : (
              lines.flatMap(line => (line.historialEntregas || []).map((entrega: any, idx: number) => {
                const d = entrega.fecha ? new Date(entrega.fecha) : null;
                const fechaFmt = d ? d.toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
                const horaFmt = d ? d.toLocaleTimeString('es-CL', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                const vencFmt = entrega.vencimiento ? new Date(entrega.vencimiento).toLocaleDateString('es-CL', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
                
                const facEntrega = entrega.factura || line.numeroFactura;
                const docSAP = entrega.docSAP;
                const isAttached = entrega.tieneFacturaSAP === 1 || (docSAP && attachedDocSAPs?.has(docSAP));

                const key = `${line.poNumber}-${line.id}`;
                const rawDocs = documentsMap[key] || [];
                const matchingDoc = facEntrega && facEntrega !== '-'
                  ? (rawDocs.find((doc: any) => doc.numeroFactura && String(doc.numeroFactura).trim() === String(facEntrega).trim()) 
                     || (rawDocs.length === 1 && !rawDocs[0].numeroFactura ? rawDocs[0] : (rawDocs.length === 1 ? rawDocs[0] : null)))
                  : (rawDocs.length === 1 ? rawDocs[0] : null);
                const isThisAttaching = docSAP && matchingDoc && attachingDocKey === `${matchingDoc.id}-${docSAP}`;

                return (
                  <tr key={`hist-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', color: '#334155', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <strong className="font-mono">{fechaFmt}</strong> {horaFmt && <span style={{ color: '#64748b' }}>({horaFmt})</span>}
                    </td>
                    <td style={{ padding: '12px 10px', color: '#64748b', textAlign: 'center', whiteSpace: 'nowrap' }} className="font-mono font-medium">
                      {String(line.lineNo).padStart(3, '0')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', textAlign: 'center', whiteSpace: 'nowrap' }} className="font-mono">
                      {line.productCode}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155', textAlign: 'center', whiteSpace: 'nowrap' }} className="font-mono">
                      {entrega.lote || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155', textAlign: 'center', whiteSpace: 'nowrap' }} className="font-mono">
                      {vencFmt}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap' }} className="font-mono">
                      {Number(entrega.cantidad || 0).toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }} className="font-mono">
                      {facEntrega && facEntrega !== '-' ? (
                        <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 text-xs">
                          {facEntrega}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {docSAP ? (
                        <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
                          {docSAP}
                        </span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Pendiente SAP
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {isAttached ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle size={13} className="text-emerald-600" />
                          Anexado a SAP
                        </span>
                      ) : docSAP && matchingDoc ? (
                        <button
                          type="button"
                          onClick={() => onAdjuntarDocASap?.(matchingDoc, docSAP)}
                          disabled={Boolean(attachingDocKey)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                          title={`Adjuntar ${matchingDoc.nombreArchivo} al Documento SAP ${docSAP}`}
                        >
                          {isThisAttaching ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Adjuntando...
                            </>
                          ) : (
                            <>
                              <Paperclip size={12} />
                              Adjuntar a SAP
                            </>
                          )}
                        </button>
                      ) : docSAP && !matchingDoc ? (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium" title="Suba primero el archivo PDF de la factura">
                          Sin PDF Factura
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          Requiere MIGO
                        </span>
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
