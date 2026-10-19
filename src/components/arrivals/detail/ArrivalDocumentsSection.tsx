import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Paperclip, Loader2, Eye, X, Download, FileX, RefreshCw } from 'lucide-react';
import { VISOR_API_URL } from '../../../config/api';
import { ArrivalOrder } from '../ArrivalDetailModal';

interface ArrivalDocumentsSectionProps {
  lines: ArrivalOrder[];
  documentsMap: Record<string, any[]>;
  headerInfo?: ArrivalOrder;
  attachedDocs: Set<number>;
  attachingDocId: number | null;
  onAdjuntarDocASap: (doc: any) => Promise<void>;
}

// Subcomponente con manejo de carga, blob URL y estado visual elegante ante error
const InlineDocumentViewer: React.FC<{ doc: any }> = ({ doc }) => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('cenabast_token') || sessionStorage.getItem('cenabast_token')) : '';
  const authQuery = token ? `token=${encodeURIComponent(token)}` : '';
  const fileUrl = `${VISOR_API_URL}/inbound/documents/file/${doc.id}${authQuery ? `?${authQuery}` : ''}`;
  const downloadUrl = `${VISOR_API_URL}/inbound/documents/file/${doc.id}?download=true${authQuery ? `&${authQuery}` : ''}`;

  const loadDocument = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(fileUrl);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok || contentType.includes('application/json')) {
        let message = 'No se ha encontrado el archivo físico en el servidor para esta recepción.';
        try {
          const json = await response.json();
          if (json.message) message = json.message;
        } catch {
          // Ignorar error de parsing json
        }
        setErrorMsg(message);
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setBlobUrl(objectUrl);
    } catch (err: any) {
      setErrorMsg('Ocurrió un problema de comunicación al intentar descargar la vista previa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [doc.id]);

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes((doc.extensionArchivo || '').toLowerCase());

  return (
    <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Barra superior de la vista previa */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Eye size={15} color="#2563eb" /> Vista Previa del Documento
        </div>
        {!errorMsg && !loading && (
          <a href={downloadUrl} download style={{ textDecoration: 'none', background: 'white', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }}>
            <Download size={14} /> DESCARGAR
          </a>
        )}
      </div>

      {/* Contenedor central */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '420px', backgroundColor: '#f1f5f9', padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#64748b' }}>
            <Loader2 size={32} className="animate-spin" color="#2563eb" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Cargando documento digital...</span>
          </div>
        ) : errorMsg ? (
          <div style={{ background: 'white', border: '1px solid #fee2e2', borderRadius: '16px', padding: '36px 32px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.08), 0 8px 10px -6px rgba(239, 68, 68, 0.04)' }}>
            {/* Icono central con halo suave */}
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1.5px solid #fee2e2', boxShadow: '0 0 0 6px #fff5f5' }}>
              <FileX size={34} color="#ef4444" strokeWidth={2.2} />
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Archivo no disponible
            </h4>

            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.55, maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
              No se ha encontrado el archivo físico en el almacenamiento para esta recepción.
            </p>

            {/* Badges / Chips centrados y ordenados */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '5px 12px', fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                <FileText size={13} color="#64748b" />
                <span>{doc.nombreArchivo}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '5px 12px', fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{doc.tipoDocumento || 'FACTURA'}</span>
                {doc.numeroFactura && <span style={{ color: '#64748b' }}>• Factura: {doc.numeroFactura}</span>}
              </div>
            </div>

            {/* Botón de acción centrado */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={loadDocument}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                <RefreshCw size={14} color="#64748b" /> Reintentar lectura
              </button>
            </div>
          </div>
        ) : blobUrl ? (
          isImage ? (
            <img 
              src={blobUrl} 
              alt={`Documento ${doc.nombreArchivo}`}
              style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '6px' }}
            />
          ) : (
            <iframe 
              src={blobUrl} 
              style={{ width: '100%', height: '600px', border: 'none', display: 'block', backgroundColor: 'white', borderRadius: '6px' }} 
              title={`Documento ${doc.nombreArchivo}`}
            />
          )
        ) : null}
      </div>
    </div>
  );
};

export const ArrivalDocumentsSection: React.FC<ArrivalDocumentsSectionProps> = ({
  lines,
  documentsMap,
  headerInfo,
  attachedDocs,
  attachingDocId,
  onAdjuntarDocASap
}) => {
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);

  // Deduplicar líneas por Pedido de Compra para evitar tarjetas repetidas en recepciones con múltiples posiciones
  const uniquePoLines = React.useMemo(() => {
    const map = new Map<string, ArrivalOrder>();
    for (const line of lines) {
      const k = `${line.poNumber}-${line.id}`;
      if (!map.has(k)) {
        map.set(k, line);
      }
    }
    return Array.from(map.values());
  }, [lines]);

  return (
    <>
      <div 
        className="panel-section-title" 
        style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <FileText size={16} />
        DOCUMENTOS ADJUNTOS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {uniquePoLines.flatMap(line => {
          const key = `${line.poNumber}-${line.id}`;
          const rawDocs = documentsMap[key] || [];
          const docs = Array.from(new Map(rawDocs.map((d: any) => [d.id, d])).values());
          
          if (docs.length === 0) {
            const hasFactura = line.numeroFactura && line.numeroFactura !== '-';
            return (
              <div 
                key={`no-doc-${line.poNumber}-${line.id}`} 
                style={{ 
                  padding: '24px 20px', 
                  background: hasFactura ? '#fffbeb' : '#f8fafc', 
                  borderRadius: '12px', 
                  border: hasFactura ? '1px dashed #fcd34d' : '1px dashed #cbd5e1', 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: `1px solid ${hasFactura ? '#fde68a' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <FileText size={18} color={hasFactura ? '#d97706' : '#94a3b8'} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hasFactura ? '#92400e' : '#334155', marginBottom: '4px' }}>
                  {hasFactura ? `Factura Informada por el OL: ${line.numeroFactura}` : 'Sin documentos adjuntos'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {hasFactura ? (
                    <>⏳ Pendiente de adjuntar archivo digital (PDF) para el pedido de compra <strong style={{ color: '#0f172a' }}>#{line.poNumber}</strong></>
                  ) : (
                    <>No se han encontrado registros de facturas para el pedido de compra <strong style={{ color: '#0f172a' }}>#{line.poNumber}</strong></>
                  )}
                </div>
              </div>
            );
          }
          return docs.map((doc: any) => {
            const isDocAttached = attachedDocs.has(doc.id) || doc.estadoSAP === 'PROCESADO' || doc.estadoSap === 'PROCESADO';

            return (
              <div key={doc.id} style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '6px', color: '#2563eb' }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{doc.nombreArchivo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Tipo: <strong>{doc.tipoDocumento || 'ADJUNTO'}</strong>
                        {doc.numeroFactura && <> | Factura: <strong style={{ color: '#1e293b' }}>{doc.numeroFactura}</strong></>}
                        {' '}| Subido el: {(() => {
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
                    {isDocAttached ? (
                      <span 
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                        title={`Archivo vinculado en SAP GOS exitosamente${doc.documentoMaterialSAP ? ` (MIGO: ${doc.documentoMaterialSAP})` : ''}`}
                      >
                        <CheckCircle size={15} /> Adjunto en SAP
                      </span>
                    ) : headerInfo?.documentoSAP ? (
                      <button
                        onClick={() => onAdjuntarDocASap(doc)}
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
                
                {/* VISOR INLINE ELEGANTE CON MANEJO DE ERROR Y LOADER */}
                {viewingDocId === doc.id && (
                  <InlineDocumentViewer doc={doc} />
                )}
              </div>
            );
          });
        })}
      </div>
    </>
  );
};
