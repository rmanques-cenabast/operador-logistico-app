import React from 'react';
import { Eye, Truck, Clock, CheckCircle2, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { OutboundDelivery } from '../../services/outbound.service';

interface OutboundTableProps {
  deliveries: OutboundDelivery[];
  loading: boolean;
  onSelectDelivery: (delivery: OutboundDelivery) => void;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

export const OutboundTable: React.FC<OutboundTableProps> = ({
  deliveries,
  loading,
  onSelectDelivery,
  currentPage = 1,
  totalPages = 1,
  totalItems = deliveries.length,
  itemsPerPage = 15,
  onPageChange,
  onItemsPerPageChange
}) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderStatusBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE_PICKING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
            <Clock size={11} />
            PENDIENTE PICKING
          </span>
        );
      case 'EN_PICKING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase tracking-wide">
            <PackageCheck size={11} />
            EN PICKING
          </span>
        );
      case 'PICKING_CONFIRMADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide">
            <CheckCircle2 size={11} />
            PICKING CONFIRMADO
          </span>
        );
      case 'DESPACHADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
            <Truck size={11} />
            DESPACHADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-2.5 text-center">ENTREGA SAP</th>
              <th className="py-3 px-2.5 text-center">DOC</th>
              <th className="py-3 px-2.5 text-center">SOLICITANTE</th>
              <th className="py-3 px-2.5 text-center">DESTINATARIO</th>
              <th className="py-3 px-3">RAZÓN SOCIAL</th>
              <th className="py-3 px-3">DIRECCIÓN DESTINO</th>
              <th className="py-3 px-2.5 text-center">COMPROMISO</th>
              <th className="py-3 px-2 text-center">LÍNEAS</th>
              <th className="py-3 px-2.5 text-center">PICKING</th>
              <th className="py-3 px-2.5 text-center">ESTADO</th>
              <th className="py-3 px-2 text-center">SM</th>
              <th className="py-3 px-2.5 text-center">GUÍA DTE</th>
              <th className="py-3 px-2.5 text-center">DOC SAP</th>
              <th className="py-3 px-2.5 text-center">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                      CARGANDO ENTREGAS DE SALIDA...
                    </span>
                  </div>
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-12 text-center text-slate-400 font-medium">
                  NO SE ENCONTRARON ENTREGAS DE SALIDA ACTIVAS
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => {
                const totalReq = delivery.TotalCantidadSolicitada || 1;
                const totalPick = delivery.TotalCantidadPickeada || 0;
                const percent = Math.min(100, Math.round((totalPick / totalReq) * 100));

                return (
                  <tr
                    key={delivery.IdEntrega || (delivery as any).idEntrega || delivery.Numero_Entrega_SAP}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* ENTREGA SAP */}
                    <td className="py-3 px-2.5 text-center font-mono font-bold text-blue-600 text-xs whitespace-nowrap">
                      {delivery.Numero_Entrega_SAP || (delivery as any).entregaSalidaSap || (delivery as any).entregaSap}
                    </td>

                    {/* DOC (MODELO / PEDIDO) */}
                    <td className="py-3 px-2.5 text-center font-mono font-semibold text-slate-700 text-xs whitespace-nowrap">
                      {delivery.Doc_Modelo && !delivery.Doc_Modelo.startsWith('PED-')
                        ? delivery.Doc_Modelo
                        : (delivery.Pedido_Venta_SAP && !delivery.Pedido_Venta_SAP.startsWith('PED-') ? delivery.Pedido_Venta_SAP : '-')}
                    </td>

                    {/* SOLICITANTE */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      {delivery.Solicitante ? (
                        <span className="font-mono font-bold text-slate-800 text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 inline-block" title={`Solicitante SAP (KUNAG): ${delivery.Solicitante}`}>
                          {delivery.Solicitante}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* DESTINATARIO (CÓDIGO KUNNR) */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      {delivery.Codigo_Destinatario ? (
                        <span className="font-mono font-bold text-sky-700 text-xs px-2 py-0.5 rounded bg-sky-50 border border-sky-200 inline-block" title={`Código Destinatario (KUNNR): ${delivery.Codigo_Destinatario}`}>
                          {delivery.Codigo_Destinatario}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* RAZÓN SOCIAL (NOMBRE CLIENTE) */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 uppercase line-clamp-1 text-xs" title={delivery.Destinatario}>
                        {delivery.Destinatario}
                      </div>
                    </td>

                    {/* DIRECCIÓN DESTINO */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-slate-600 uppercase line-clamp-1 font-medium">
                        {delivery.Direccion_Destino ? `${delivery.Direccion_Destino}${delivery.Comuna ? `, ${delivery.Comuna}` : ''}` : '-'}
                      </div>
                    </td>

                    {/* FECHA COMPROMISO */}
                    <td className="py-3 px-2.5 text-center font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDate(delivery.Fecha_Compromiso)}
                    </td>

                    {/* ÍTEMS */}
                    <td className="py-3 px-2 text-center font-mono font-semibold whitespace-nowrap text-xs">
                      {delivery.TotalItems}
                    </td>

                    {/* PICKING (PROGRESO RESUMIDO Y COMPACTO) */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${percent === 100
                          ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                          : percent > 0
                            ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200'
                            : 'bg-slate-100 text-slate-600 font-medium'
                        }`}>
                        <span>{totalPick}/{totalReq}</span>
                        <span className={percent === 100 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>({percent}%)</span>
                      </span>
                    </td>

                    {/* ESTADO OPERATIVO */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      {renderStatusBadge(delivery.Estado)}
                    </td>

                    {/* ESTATUS SM SAP (WBSTK) */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-xs border ${delivery.SM === 'C' || delivery.Estado === 'DESPACHADO'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : delivery.SM === 'B' || delivery.Estado === 'EN_PICKING' || delivery.Estado === 'PICKING_CONFIRMADO'
                              ? 'bg-sky-100 text-sky-800 border-sky-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        title={`Estatus Salida de Mercancías SAP (WBSTK): ${(delivery.SM === 'C' || delivery.Estado === 'DESPACHADO')
                            ? 'C - Salida Contabilizada / PGI 601'
                            : (delivery.SM === 'B' || delivery.Estado === 'EN_PICKING' || delivery.Estado === 'PICKING_CONFIRMADO')
                              ? 'B - Tratado parcialmente'
                              : 'A - No tratado / Pendiente picking'
                          }`}
                      >
                        {delivery.SM || (delivery.Estado === 'DESPACHADO' ? 'C' : delivery.Estado === 'EN_PICKING' || delivery.Estado === 'PICKING_CONFIRMADO' ? 'B' : 'A')}
                      </span>
                    </td>

                    {/* GUÍA DTE */}
                    <td className="py-3 px-2.5 text-center font-mono text-[11px] font-semibold whitespace-nowrap">
                      {delivery.Folio_DTE ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {delivery.Folio_DTE}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* DOC SAP (DOCUMENTO DE MATERIAL PGI) */}
                    <td className="py-3 px-2.5 text-center font-mono whitespace-nowrap">
                      {delivery.Documento_SAP_PGI ? (
                        <span
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold inline-block"
                          title={`Documento de Material SAP (PGI Mov. 601): ${delivery.Documento_SAP_PGI}`}
                        >
                          {delivery.Documento_SAP_PGI}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    {/* ACCIÓN */}
                    <td className="py-3 px-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDelivery(delivery);
                          }}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-all duration-200 shadow-sm cursor-pointer"
                          title="Ver Detalle y Guía"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN CON ESTILO HOMOLOGADO */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-3.5 border-t border-slate-200 bg-white gap-3 font-mono text-xs uppercase">
        <div className="flex flex-wrap items-center gap-3 text-slate-500">
          <span>
            MOSTRANDO RESULTADOS {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} AL {Math.min(currentPage * itemsPerPage, totalItems)} DE UN TOTAL DE {totalItems} ENTREGAS
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-slate-400">POR PÁG:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                if (onItemsPerPageChange) onItemsPerPageChange(newLimit);
                if (onPageChange) onPageChange(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || loading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="PÁGINA ANTERIOR"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="px-3 py-1 font-semibold text-slate-700">
            PÁGINA {currentPage} DE {Math.max(1, totalPages)}
          </div>

          <button
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || loading}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="PÁGINA SIGUIENTE"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
