import React from 'react';
import { Eye } from 'lucide-react';
import { PreAvisoLine } from './PreavisoDetailModal';
import { TableSkeleton } from '../common/TableSkeleton';

interface PreavisoTableProps {
  lines: PreAvisoLine[];
  isLoading?: boolean;
  onViewDetail: (preAvisoId: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export const PreavisoTable: React.FC<PreavisoTableProps> = ({
  lines,
  isLoading = false,
  onViewDetail,
  currentPage,
  onPageChange,
  itemsPerPage = 10
}) => {
  const totalPages = Math.max(1, Math.ceil(lines.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLines = lines.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-xs">
              <th className="py-3.5 px-5">Pre Aviso</th>
              <th className="py-3.5 px-5">RUT Prov.</th>
              <th className="py-3.5 px-5">P. Compra</th>
              <th className="py-3.5 px-5">Lote</th>
              <th className="py-3.5 px-5">Material</th>
              <th className="py-3.5 px-5">Fecha Recep.</th>
              <th className="py-3.5 px-5 text-center">Recepción</th>
              <th className="py-3.5 px-5 text-center">Acción</th>
            </tr>
          </thead>
          {isLoading ? (
            <TableSkeleton rows={5} columns={8} />
          ) : (
            <tbody className="divide-y divide-slate-200">
              {currentLines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No se encontraron preavisos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                currentLines.map((line, idx) => {
                  const isCompleta = line.status === 'APROBADO OL' || line.qty <= 0;
                  return (
                    <tr key={`${line.preAvisoId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {line.preAvisoId}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600">
                        {line.provider}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                          {line.poNumber}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-700 font-semibold">
                        {line.batch}
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-800 font-bold">
                        {line.productCode}
                      </td>
                      <td className="py-4 px-5 text-slate-600">
                        {line.receptionDate || 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wide uppercase ${
                          isCompleta 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isCompleta ? 'Completa' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button 
                          onClick={() => onViewDetail(line.preAvisoId)}
                          title="Ver Detalle Preaviso"
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
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

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
        <span>Mostrando {lines.length} registros filtrados</span>
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
