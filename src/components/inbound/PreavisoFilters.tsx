import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw, ChevronDown } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';

interface PreavisoFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterProvider: string;
  onProviderChange: (value: string) => void;
  filterPoNumber: string;
  onPoNumberChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterStartDate: string;
  onStartDateChange: (value: string) => void;
  filterEndDate: string;
  onEndDateChange: (value: string) => void;
  providers: string[];
  onResetFilters?: () => void;
}

export const PreavisoFilters: React.FC<PreavisoFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterProvider,
  onProviderChange,
  filterPoNumber,
  onPoNumberChange,
  filterStatus,
  onStatusChange,
  filterStartDate,
  onStartDateChange,
  filterEndDate,
  onEndDateChange,
  providers,
  onResetFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFiltersCount = [
    filterProvider.trim() !== '',
    filterPoNumber.trim() !== '',
    filterStatus !== 'TODOS',
    filterStartDate !== '',
    filterEndDate !== '',
    searchTerm.trim() !== ''
  ].filter(Boolean).length;

  const handleReset = () => {
    onSearchChange('');
    onProviderChange('');
    onPoNumberChange('');
    onStatusChange('TODOS');
    onStartDateChange('');
    onEndDateChange('');
    if (onResetFilters) onResetFilters();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 transition-all">
      {/* Barra Principal de Búsqueda */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Campo de búsqueda directo por N° Pre-Aviso */}
          <div className="relative flex-1 min-w-[260px] max-w-lg flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-blue-500 transition-all shadow-sm">
            <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por N° Pre-Aviso (ej. PRE-15)..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-transparent text-xs sm:text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Botón para desplegar filtros */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${
              showAdvanced || activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown size={13} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Botón de limpiar si hay filtros */}
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-all shadow-sm"
            title="Restablecer todos los filtros"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Panel Desplegable de Filtros Específicos */}
      {showAdvanced && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-xl animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
            {/* RUT o Nombre Proveedor escribible con autocompletado */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Search size={12} className="text-slate-400" />
                RUT / Proveedor
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  list="providers-autocomplete"
                  value={filterProvider}
                  onChange={(e) => onProviderChange(e.target.value)}
                  placeholder="Escribir RUT (ej. 9654...)"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                <datalist id="providers-autocomplete">
                  {providers.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                {filterProvider && (
                  <button
                    type="button"
                    onClick={() => onProviderChange('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Pedido de Compra (PC) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pedido Compra (PC)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={filterPoNumber}
                  onChange={(e) => onPoNumberChange(e.target.value)}
                  placeholder="Ej. 4500041356"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 font-mono text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
                {filterPoNumber && (
                  <button
                    type="button"
                    onClick={() => onPoNumberChange('')}
                    className="absolute right-2 p-0.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Estado Recepción
              </label>
              <select
                value={filterStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                <option value="TODOS">TODOS</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="APROBADO OL">RECIBIDO EN OL</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <CustomDatePicker
                label="Fecha Desde (Recep.)"
                placeholder="dd/mm/aaaa"
                value={filterStartDate}
                onChange={onStartDateChange}
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <CustomDatePicker
                label="Fecha Hasta (Recep.)"
                placeholder="dd/mm/aaaa"
                value={filterEndDate}
                onChange={onEndDateChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
