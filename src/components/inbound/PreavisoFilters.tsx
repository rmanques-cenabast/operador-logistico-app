import React from 'react';
import { Search } from 'lucide-react';

interface PreavisoFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterProvider: string;
  onProviderChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  filterMonth: string;
  onMonthChange: (value: string) => void;
  filterYear: string;
  onYearChange: (value: string) => void;
  providers: string[];
}

export const PreavisoFilters: React.FC<PreavisoFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterProvider,
  onProviderChange,
  filterStatus,
  onStatusChange,
  filterMonth,
  onMonthChange,
  filterYear,
  onYearChange,
  providers
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
      {/* Buscador */}
      <div className="relative flex-1 min-w-[320px]">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar por Preaviso, OC, Material..." 
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Filtros Dropdowns */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Proveedor:</span>
          <select 
            value={filterProvider} 
            onChange={(e) => onProviderChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">TODOS</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Estado:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => onStatusChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">TODOS</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="APROBADO OL">RECIBIDO EN OL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Mes:</span>
          <select 
            value={filterMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">TODOS</option>
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((m, idx) => (
              <option key={idx} value={String(idx + 1).padStart(2, '0')}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Año:</span>
          <select 
            value={filterYear} 
            onChange={(e) => onYearChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODOS">TODOS</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>
    </div>
  );
};
