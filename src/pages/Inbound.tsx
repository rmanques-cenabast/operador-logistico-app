import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { UploadCloud } from 'lucide-react';
import UploadPreaviso from './UploadPreaviso';
import { useAuth } from '../contexts/AuthContext';
import { PreAvisoLine, PreavisoDetailModal } from '../components/inbound/PreavisoDetailModal';
import { PreavisoFilters } from '../components/inbound/PreavisoFilters';
import { PreavisoTable } from '../components/inbound/PreavisoTable';
import { InboundService } from '../services/inbound.service';
import { usePolling } from '../hooks/usePolling';

const Inbound: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  
  // Filtros
  const [filterMonth, setFilterMonth] = useState('TODOS');
  const [filterYear, setFilterYear] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { user } = useAuth();
  const lineaNegocio = user?.role === 'intermediacion' ? 'INT' : 'FP';
  const lineaNegocioLabel = user?.role === 'intermediacion' ? 'INTERMEDIACIÓN' : 'FARMACIAS PRIVADAS';

  // Usar hook usePolling con caché en memoria SWR
  const { data: preAvisoLines, isLoading } = usePolling<PreAvisoLine[]>({
    fetcher: () => InboundService.getPreavisos(lineaNegocio),
    initialData: InboundService.getCachedPreavisos(lineaNegocio),
    intervalMs: 20000,
    dependencies: [lineaNegocio]
  });

  const lines: PreAvisoLine[] = preAvisoLines || [];

  const uniqueProviders = useMemo(() => {
    return Array.from(new Set(lines.map(l => l.provider)));
  }, [lines]);
  
  // Métricas
  const totalActivos = useMemo(() => Array.from(new Set(lines.map(l => l.preAvisoId))).length, [lines]);
  const pendientesOL = useMemo(() => {
    return Array.from(new Set(lines.filter(l => l.status === 'PENDIENTE' || l.status === 'NOTIFICADO').map(l => l.preAvisoId))).length;
  }, [lines]);

  // Filtrado de registros
  const filteredLines = useMemo(() => {
    return lines.filter(line => {
      if (filterProvider !== 'TODOS' && line.provider !== filterProvider) return false;
      if (filterStatus !== 'TODOS') {
        const isCompleta = line.status === 'APROBADO OL' || line.qty <= 0;
        if (filterStatus === 'PENDIENTE' && isCompleta) return false;
        if (filterStatus === 'APROBADO OL' && !isCompleta) return false;
      }
      if (filterMonth !== 'TODOS' || filterYear !== 'TODOS') {
        if (!line.receptionDate || line.receptionDate === 'N/A') return false;
        const dateParts = line.receptionDate.split(' ');
        if (dateParts.length >= 3) {
          const monthStr = dateParts[1].toLowerCase().replace(',', '');
          const yearStr = dateParts[2];
          const monthsMap: Record<string, string> = {
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
          };
          if (filterMonth !== 'TODOS' && monthsMap[monthStr] !== filterMonth) return false;
          if (filterYear !== 'TODOS' && yearStr !== filterYear) return false;
        }
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          line.preAvisoId.toLowerCase().includes(term) ||
          line.poNumber.toLowerCase().includes(term) ||
          line.provider.toLowerCase().includes(term) ||
          line.productCode.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [lines, filterProvider, filterStatus, filterMonth, filterYear, searchTerm]);

  const handleOpenDetail = (preAvisoId: string) => {
    setSelectedPA(preAvisoId);
    setIsPanelOpen(true);
  };

  return (
    <>
      <Header showSearch={false} />
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 w-full">
        <main className="px-8 py-6 w-full flex-1">
          
          {/* Header de Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {lineaNegocioLabel}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                PRE AVISO
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide transition-colors shadow-sm"
              >
                <UploadCloud size={18} />
                Subir Pre-Aviso
              </button>
            </div>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Pre Avisos Totales
              </span>
              <span className="text-4xl font-mono font-bold text-slate-900">
                {isLoading && lines.length === 0 ? '...' : String(totalActivos).padStart(2, '0')}
              </span>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Pendiente Aprobación OL
              </span>
              <span className="text-4xl font-mono font-bold text-amber-600">
                {isLoading && lines.length === 0 ? '...' : String(pendientesOL).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Filtros */}
          <PreavisoFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterProvider={filterProvider}
            onProviderChange={setFilterProvider}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterMonth={filterMonth}
            onMonthChange={setFilterMonth}
            filterYear={filterYear}
            onYearChange={setFilterYear}
            providers={uniqueProviders}
          />

          {/* Tabla */}
          <PreavisoTable 
            lines={filteredLines}
            isLoading={isLoading && lines.length === 0}
            onViewDetail={handleOpenDetail}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </main>

        {/* Modal de Detalle */}
        <PreavisoDetailModal 
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          selectedPreAvisoId={selectedPA}
          lines={lines}
          lineaNegocioLabel={lineaNegocioLabel}
        />

        {/* Modal de Carga de Archivo */}
        {isUploadOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsUploadOpen(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-[620px] overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-8 pt-8 pb-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Subir Nuevo Pre-Aviso</h3>
                <button 
                  onClick={() => setIsUploadOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg text-lg"
                >
                  ✕
                </button>
              </div>
              <div className="px-8 pb-8 pt-2">
                <UploadPreaviso 
                  onSuccess={() => {
                    setIsUploadOpen(false);
                    InboundService.getPreavisos(lineaNegocio);
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inbound;
