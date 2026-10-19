import React from 'react';
import { Search, RefreshCw, X, CloudDownload, Calendar } from 'lucide-react';

interface OutboundFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  fechaDesde: string;
  setFechaDesde: (value: string) => void;
  fechaHasta: string;
  setFechaHasta: (value: string) => void;
  onRefresh: () => void;
  loading: boolean;
  onSyncSap?: () => void;
  syncing?: boolean;
}

export const OutboundFilters: React.FC<OutboundFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  onRefresh,
  loading,
  onSyncSap,
  syncing = false
}) => {
  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('TODOS');
    setFechaDesde('2026-01-01');
    setFechaHasta('2026-07-31');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'TODOS' || fechaDesde !== '2026-01-01' || fechaHasta !== '2026-07-31';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
      {/* BUSCADOR */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="BUSCAR ENTREGA SAP, PEDIDO DE VENTA, DESTINATARIO O DTE..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 uppercase placeholder:normal-case focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* FILTROS Y ACCIONES */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {/* SELECT DE ESTADO */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            ESTADO:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase cursor-pointer"
          >
            <option value="TODOS">TODOS LOS ESTADOS</option>
            <option value="PENDIENTE_PICKING">PENDIENTES DE PICKING</option>
            <option value="EN_PICKING">EN PICKING</option>
            <option value="PICKING_CONFIRMADO">PICKING CONFIRMADO (LISTO DTE)</option>
            <option value="DESPACHADO">DESPACHADOS</option>
          </select>
        </div>

        {/* RANGO DE FECHAS SAP (JULIO / HISTÓRICO) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          <Calendar size={13} className="text-slate-400" />
          <span className="uppercase text-[10px]">DESDE:</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-700 outline-none focus:border-blue-500"
            title="Fecha inicio para sincronizar de SAP"
          />
          <span className="uppercase text-[10px] ml-1">HASTA:</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-700 outline-none focus:border-blue-500"
            title="Fecha corte (Julio 2026 para SAP DEV)"
          />
        </div>

        {/* BOTÓN LIMPIAR */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors uppercase tracking-wider cursor-pointer"
          >
            <X size={14} />
            LIMPIAR
          </button>
        )}

        {/* BOTÓN REFRESCAR */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors active:scale-95 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          REFRESCAR
        </button>

        {/* BOTÓN SINCRONIZAR DESDE SAP */}
        {onSyncSap && (
          <button
            onClick={onSyncSap}
            disabled={syncing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
            title="Descargar entregas de salida pendientes desde SAP (rango histórico DEV/QAS)"
          >
            <CloudDownload size={15} className={syncing ? 'animate-bounce' : ''} />
            {syncing ? 'BAJANDO DE SAP...' : 'SINCRONIZAR SAP'}
          </button>
        )}
      </div>
    </div>
  );
};
