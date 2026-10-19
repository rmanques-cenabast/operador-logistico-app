import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Eye } from 'lucide-react';
import { AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { MovementDetailModal } from './MovementDetailModal';
import { TableSkeleton } from '../common/TableSkeleton';

export const getMovimientoTypeBadge = (mov: string, origen?: string, destino?: string) => {
  if (mov === '311' || (origen && destino && origen !== destino)) {
    return { label: '(311)', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
  } else if (mov === '321') {
    return { label: '(321)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '344') {
    return { label: '(344)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  } else if (mov === '343') {
    return { label: '(343)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '309') {
    return { label: '(309)', bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
  } else if (mov === '555' || mov === '556') {
    return { label: '(555)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  } else if (mov === '711' || mov === '717') {
    return { label: '(711)', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
  } else if (mov === '712' || mov === '718') {
    return { label: '(712)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
  } else if (mov === '331' || mov === '333') {
    return { label: '(331)', bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' };
  } else if (mov === '511') {
    return { label: '(511)', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
  }
  return { label: `MOV ${mov}`, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
};

export const renderStockBadge = (tipoStockRaw: string) => {
  const tipoStock = String(tipoStockRaw || '').toUpperCase();
  if (!tipoStock || tipoStock === 'UNDEFINED' || tipoStock === 'NULL') {
    return <span style={{ color: 'var(--text-muted)' }}>-</span>;
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
  const flattenedRows = React.useMemo(() => {
    return filteredAdjustments.flatMap(header => header.detalles.map((det, index) => ({ header, det, index })));
  }, [filteredAdjustments]);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4 text-left whitespace-nowrap">FECHA</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">OPERACIÓN SAP</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">ESTADO SAP</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">REF. SAP</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">C. MATERIAL</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">LOTE SAP</th>
                <th className="py-3.5 px-2 text-center whitespace-nowrap">ORIGEN</th>
                <th className="py-3.5 px-2 text-center whitespace-nowrap">DESTINO</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">STOCK ORIGEN</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">STOCK DESTINO</th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">CANTIDAD</th>
                <th className="py-3.5 px-2 text-center whitespace-nowrap">ACCIÓN</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={8} columns={12} />
            ) : (
              <tbody className="divide-y divide-slate-200">
                {flattenedRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 text-sm font-semibold uppercase">
                      NO SE ENCONTRARON REGISTROS EN ESTA VISTA CON LOS FILTROS SELECCIONADOS.
                    </td>
                  </tr>
                ) : (
                  flattenedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(({ header, det, index: j }) => {
                    const rowKey = `${header.ID}-${j}`;

                    let estadoSapBadge = { label: 'PENDIENTE', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
                    const estadoUpper = (header.Estado_SAP || '').toUpperCase();
                    if (estadoUpper === 'PROCESADO' || estadoUpper === 'EXITOSO' || estadoUpper === 'COMPLETADO') {
                      estadoSapBadge = { label: 'SINCRONIZADO', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                    } else if (estadoUpper === 'RECHAZADO') {
                      estadoSapBadge = { label: 'SUPERVISIÓN', bg: '#ffedd5', color: '#c2410c', border: '#fed7aa' };
                    } else if (estadoUpper.includes('ERROR') || estadoUpper.includes('FALLO')) {
                      estadoSapBadge = { label: 'FALLO SAP', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
                    }

                    const movBadge = getMovimientoTypeBadge(det.Tipo_Movimiento, det.Almacen_Origen, det.Almacen_Destino);

                    const fechaRaw = header.Fecha_Creacion ? String(header.Fecha_Creacion).replace('Z', '') : '';
                    const d = fechaRaw ? new Date(fechaRaw) : null;
                    const fechaFmt = d && !isNaN(d.getTime()) 
                      ? `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
                      : '-';
                    const horaFmt = d && !isNaN(d.getTime())
                      ? d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : '';

                    const esEgreso = ['711', '717', '551', '553', '555', '331', '333'].includes(det.Tipo_Movimiento);
                    const cantidadReal = esEgreso ? -Math.abs(det.Cantidad) : det.Cantidad;

                    return (
                      <tr
                        key={rowKey}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* FECHA */}
                        <td className="py-4 px-4 text-left whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span className="font-semibold text-slate-800">{fechaFmt}</span>
                            <span className="text-slate-400">{horaFmt}</span>
                          </div>
                        </td>

                        {/* OPERACIÓN SAP */}
                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          <span 
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase"
                            style={{ background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}` }}
                          >
                            {movBadge.label}
                          </span>
                        </td>

                        {/* ESTADO SAP */}
                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          <span 
                            className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide uppercase"
                            style={{ background: estadoSapBadge.bg, color: estadoSapBadge.color, border: `1px solid ${estadoSapBadge.border}` }}
                          >
                            {estadoSapBadge.label}
                          </span>
                        </td>

                        {/* REF. SAP */}
                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          {header.Documento_SAP_Ref ? (
                            <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 text-xs inline-block">
                              {header.Documento_SAP_Ref}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono uppercase">PENDIENTE</span>
                          )}
                        </td>

                        {/* CÓDIGO MATERIAL */}
                        <td className="py-4 px-3 text-center font-mono font-bold text-slate-800 text-sm whitespace-nowrap">
                          {det.Codigo_Material}
                        </td>

                        {/* LOTE SAP */}
                        <td className="py-4 px-3 text-center font-mono font-semibold text-slate-700 text-sm uppercase whitespace-nowrap">
                          {det.Lote_SAP || 'N/A'}
                        </td>

                        {/* ALMACÉN ORIGEN */}
                        <td className="py-4 px-2 text-center whitespace-nowrap" style={{ position: 'relative' }}>
                          {det.Almacen_Origen ? (
                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              {det.Almacen_Origen}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                          {det.Almacen_Origen && det.Almacen_Destino && (
                            <ArrowRight
                              className="transfer-arrow"
                              size={14}
                              style={{
                                color: 'var(--primary-main)',
                                position: 'absolute',
                                right: '-7px',
                                top: '50%',
                                marginTop: '-7px',
                                zIndex: 10
                              }}
                            />
                          )}
                        </td>

                        {/* ALMACÉN DESTINO */}
                        <td className="py-4 px-2 text-center whitespace-nowrap">
                          {det.Almacen_Destino ? (
                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              {det.Almacen_Destino}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* STOCK ORIGEN */}
                        <td className="py-4 px-3 text-center whitespace-nowrap" style={{ position: 'relative' }}>
                          {((det as any).StockOrigen || (det as any).stockorigen) ? (
                            renderStockBadge((det as any).StockOrigen || (det as any).stockorigen)
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                          {((det as any).StockOrigen || (det as any).stockorigen) && ((det as any).StockDestino || (det as any).stockdestino) && (
                            <ArrowRight
                              className="transfer-arrow"
                              size={14}
                              style={{
                                color: 'var(--primary-main)',
                                position: 'absolute',
                                right: '-7px',
                                top: '50%',
                                marginTop: '-7px',
                                zIndex: 10
                              }}
                            />
                          )}
                        </td>

                        {/* STOCK DESTINO */}
                        <td className="py-4 px-3 text-center whitespace-nowrap">
                          {((det as any).StockDestino || (det as any).stockdestino) ? (
                            renderStockBadge((det as any).StockDestino || (det as any).stockdestino)
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>

                        {/* CANTIDAD */}
                        <td className="py-4 px-3 text-center font-mono text-sm font-bold whitespace-nowrap">
                          <span className={cantidadReal > 0 ? 'text-emerald-600' : (cantidadReal < 0 ? 'text-rose-600' : 'text-slate-700')}>
                            {cantidadReal > 0 ? `+${cantidadReal}` : cantidadReal} UN.
                          </span>
                        </td>

                        {/* ACCIÓN (ÚNICO DISPARADOR DEL MODAL) */}
                        <td className="py-4 px-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAjuste({ header, detalle: det });
                            }}
                            title="VER DETALLE DE MOVIMIENTO"
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center cursor-pointer"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Paginación con estilo homologado en mayúsculas */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-slate-200 bg-white gap-3 font-mono text-xs uppercase">
          <div className="text-slate-500">
            MOSTRANDO RESULTADOS {flattenedRows.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, flattenedRows.length)} AL {Math.min(currentPage * itemsPerPage, flattenedRows.length)} DE UN TOTAL DE {flattenedRows.length} MOVIMIENTOS
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="PÁGINA ANTERIOR"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 py-1 font-semibold text-slate-700">
              PÁGINA {currentPage} DE {Math.max(1, Math.ceil(flattenedRows.length / itemsPerPage))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(flattenedRows.length / itemsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(flattenedRows.length / itemsPerPage)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="PÁGINA SIGUIENTE"
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
