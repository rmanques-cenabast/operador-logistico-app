import React from 'react';
import { Eye } from 'lucide-react';
import { ArrivalOrder } from './ArrivalDetailModal';
import { TableSkeleton } from '../common/TableSkeleton';

interface ArrivalsTableProps {
  orders: ArrivalOrder[];
  isLoading?: boolean;
  onOpenDetail: (rowId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export const ArrivalsTable: React.FC<ArrivalsTableProps> = ({
  orders,
  isLoading = false,
  onOpenDetail,
  currentPage,
  onPageChange,
  itemsPerPage = 10
}) => {
  const totalPages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <th className="py-3.5 px-5">Pre Aviso</th>
              <th className="py-3.5 px-5">RUT Prov.</th>
              <th className="py-3.5 px-5">P. Compra</th>
              <th className="py-3.5 px-5">Material</th>
              <th className="py-3.5 px-5">Lote Físico</th>
              <th className="py-3.5 px-5 text-right">Cant. Recibida</th>
              <th className="py-3.5 px-5 text-center">Doc. Material SAP</th>
              <th className="py-3.5 px-5 text-center">Estado Físico</th>
              <th className="py-3.5 px-5 text-center">Sinc. SAP</th>
              <th className="py-3.5 px-5 text-center">Acción</th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton rows={5} columns={10} />
          ) : (
            <tbody className="divide-y divide-slate-200">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                    No se encontraron recepciones confirmadas.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, idx) => (
                  <tr key={`${order.rowId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-slate-900">
                      {order.id}
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-600 truncate max-w-[140px]">
                      {order.provider}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                        {order.poNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-800 font-bold">
                      {order.productCode}
                    </td>
                    <td className="py-4 px-5 font-mono font-semibold text-slate-700">
                      {order.batch}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-slate-800">
                      {order.receivedQty.toLocaleString('es-CL')} {order.uom}
                    </td>
                    <td className="py-4 px-5 text-center font-mono">
                      {order.documentoSAP ? (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-xs">
                          {order.documentoSAP}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                        order.status === 'COMPLETA' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : order.status === 'PARCIAL'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                        order.sapStatus === 'SINCRONIZADO'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : order.sapStatus === 'ESP. LIBERACIÓN'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {order.sapStatus || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button 
                        onClick={() => onOpenDetail(order.rowId)}
                        title="Ver Detalle y Documentos"
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
        <span>Mostrando {orders.length} registros filtrados</span>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs"
          >
            &lt;
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded font-mono font-bold text-xs">
            {currentPage}
          </span>
          <button 
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
