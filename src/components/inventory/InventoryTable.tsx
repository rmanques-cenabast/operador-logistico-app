import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { MovementDetailModal } from './MovementDetailModal';

export const getMovimientoTypeBadge = (mov: string, origen?: string, destino?: string) => {
  if (mov === '311' || (origen && destino && origen !== destino)) {
    return { label: 'TRASPASO (311)', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
  } else if (mov === '321') {
    return { label: 'LIBERADO (321)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '344') {
    return { label: 'CUARENTENA (344)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  } else if (mov === '343') {
    return { label: 'DESBLOQUEO (343)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '309') {
    return { label: 'RECLASIF. SKU (309)', bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
  } else if (mov === '555' || mov === '556') {
    return { label: 'DESGUACE (555)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  } else if (mov === '711' || mov === '717') {
    return { label: 'FALTANTE (711)', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  } else if (mov === '712' || mov === '718') {
    return { label: 'SOBRANTE (712)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '331' || mov === '333') {
    return { label: 'MUESTREO (331)', bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' };
  } else if (mov === '511') {
    return { label: 'ENTRADA SIN OC (511)', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
  }
  return { label: `MOV ${mov}`, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
};

interface InventoryTableProps {
  loading: boolean;
  filteredAdjustments: AdjustmentHeader[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  selectedAjuste: { header: AdjustmentHeader, detalle: AdjustmentDetail } | null;
  setSelectedAjuste: React.Dispatch<React.SetStateAction<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  loading,
  filteredAdjustments,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  selectedAjuste,
  setSelectedAjuste
}) => {
  return (
    <>
      <div className="data-table-container" style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>FOLIO</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>OPERACIÓN SAP</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>ESTADO SAP</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>REF. SAP</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>C.MATERIAL</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>LOTE SAP</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>ORIGEN</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>DESTINO</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>TIPO STOCK</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>CANTIDAD</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>CENTRO</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>FECHA</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} style={{ textAlign: 'center', padding: '2rem' }}>Cargando movimientos e información desde la BD...</td></tr>
            ) : filteredAdjustments.length === 0 ? (
              <tr><td colSpan={13} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron registros en esta vista con los filtros seleccionados.</td></tr>
            ) : (
              filteredAdjustments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((header) => (
                <React.Fragment key={header.ID}>
                  {header.detalles.map((det, j) => {
                    const rowKey = `${header.ID}-${j}`;

                    let estadoSapBadge = { label: 'Pendiente', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
                    const estadoUpper = (header.Estado_SAP || '').toUpperCase();
                    if (estadoUpper === 'PROCESADO' || estadoUpper === 'EXITOSO' || estadoUpper === 'COMPLETADO') {
                      estadoSapBadge = { label: 'Sincronizado', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                    } else if (estadoUpper.includes('ERROR') || estadoUpper.includes('FALLO')) {
                      estadoSapBadge = { label: 'Fallo SAP', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
                    }

                    const movBadge = getMovimientoTypeBadge(det.Tipo_Movimiento, det.Almacen_Origen, det.Almacen_Destino);

                    return (
                      <tr
                        key={rowKey}
                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--app-bg)'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => { setSelectedAjuste({ header, detalle: det }); }}
                      >
                        <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>
                          {header.Nro_Ajuste}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {movBadge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', background: estadoSapBadge.bg, color: estadoSapBadge.color, border: `1px solid ${estadoSapBadge.border}` }}>
                            {estadoSapBadge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                          {header.Documento_SAP_Ref ? (
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              {header.Documento_SAP_Ref}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendiente</span>
                          )}
                        </td>

                        {/* CÓDIGO MATERIAL (ZCEN) INDEPENDIENTE */}
                        <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)' }}>
                          {det.Codigo_Material}
                        </td>

                        {/* LOTE SAP INDEPENDIENTE */}
                        <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {det.Lote_SAP || 'N/A'}
                          </span>
                        </td>

                        {/* ALMACÉN ORIGEN Y DESTINO SEPARADOS */}
                        <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                          {det.Almacen_Origen ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>Alm {det.Almacen_Origen}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                          {det.Almacen_Origen && det.Almacen_Destino && (
                            <ArrowRight className="transfer-arrow" size={14} style={{ color: 'var(--primary-main)', position: 'absolute', right: '-7px', top: '50%', marginTop: '-7px', zIndex: 10 }} />
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {det.Almacen_Destino ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', fontFamily: 'monospace' }}>Alm {det.Almacen_Destino}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {(() => {
                            const detAny = det as any;
                            let tipoStock = String(detAny.TipoStockDestino || detAny.tipo_stock_destino || detAny.tipostockdestino || '').toUpperCase();
                            
                            // Asignación inteligente en base al tipo de movimiento si viene vacío
                            if (!tipoStock) {
                              if (det.Tipo_Movimiento === '555') tipoStock = 'BLOQUEADO';
                              else if (['553', '331', '333'].includes(det.Tipo_Movimiento)) tipoStock = 'CALIDAD';
                            }

                            let stockLabel = 'L.UTILIZACION';
                            let stockColor = '#15803d'; // green
                            let stockBg = '#dcfce7';

                            if (tipoStock === 'BLOQUEADO') {
                              stockLabel = 'BLOQUEADO';
                              stockColor = '#b91c1c'; // red
                              stockBg = '#fee2e2';
                            } else if (tipoStock === 'CALIDAD') {
                              stockLabel = 'C.CALIDAD';
                              stockColor = '#b45309'; // orange
                              stockBg = '#fef3c7';
                            }

                            return (
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stockColor, background: stockBg, padding: '3px 8px', borderRadius: '12px', border: `1px solid ${stockColor}40`, whiteSpace: 'nowrap' }}>
                                {stockLabel}
                              </span>
                            );
                          })()}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          {(() => {
                            const esEgreso = ['711', '717', '551', '553', '555', '331', '333'].includes(det.Tipo_Movimiento);
                            const cantidadReal = esEgreso ? -Math.abs(det.Cantidad) : det.Cantidad;
                            return (
                              <span style={{ 
                                fontWeight: 600, 
                                color: cantidadReal > 0 ? 'var(--success-text)' : (cantidadReal < 0 ? 'var(--danger-text)' : 'inherit') 
                              }}>
                                {cantidadReal > 0 ? '+' + cantidadReal : cantidadReal} Un.
                              </span>
                            );
                          })()}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                          {header.Centro || '1000'}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span>{new Date(String(header.Fecha_Creacion).replace('Z', '')).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(String(header.Fecha_Creacion).replace('Z', '')).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'white' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Mostrando resultados {filteredAdjustments.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, filteredAdjustments.length)} al {Math.min(currentPage * itemsPerPage, filteredAdjustments.length)} de un total de {filteredAdjustments.length} movimientos
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
              Página {currentPage} de {Math.max(1, Math.ceil(filteredAdjustments.length / itemsPerPage))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAdjustments.length / itemsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? '#f8fafc' : 'white', color: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? '#94a3b8' : 'var(--text-main)', cursor: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedAjuste && (
        <MovementDetailModal
          header={selectedAjuste.header}
          detalle={selectedAjuste.detalle}
          onClose={() => setSelectedAjuste(null)}
        />
      )}
    </>
  );
};
