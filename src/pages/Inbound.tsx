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
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterProvider, setFilterProvider] = useState('');
  const [filterPoNumber, setFilterPoNumber] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { lineaNegocio, lineaNegocioLabel } = useAuth();

  // Usar hook usePolling con caché en memoria SWR
  const { data: preAvisoLines, isLoading } = usePolling<PreAvisoLine[]>({
    fetcher: () => InboundService.getPreavisos(lineaNegocio),
    initialData: InboundService.getCachedPreavisos(lineaNegocio),
    intervalMs: 20000,
    dependencies: [lineaNegocio]
  });

  const lines: PreAvisoLine[] = preAvisoLines || [];

  const uniqueProviders = useMemo(() => {
    return Array.from(new Set(lines.map(l => l.provider))).filter(Boolean);
  }, [lines]);

  // Filtrado de registros
  const filteredLines = useMemo(() => {
    return lines.filter(line => {
      // Filtro de Proveedor (RUT o nombre)
      if (filterProvider.trim()) {
        const provTerm = filterProvider.toLowerCase().trim();
        if (!line.provider.toLowerCase().includes(provTerm)) return false;
      }

      // Filtro de Pedido de Compra (PC)
      if (filterPoNumber.trim()) {
        const poTerm = filterPoNumber.toLowerCase().trim();
        if (!line.poNumber.toLowerCase().includes(poTerm)) return false;
      }

      // Filtro de Estado
      if (filterStatus !== 'TODOS') {
        const isCompleta = line.status === 'APROBADO OL' || line.qty <= 0;
        if (filterStatus === 'PENDIENTE' && isCompleta) return false;
        if (filterStatus === 'APROBADO OL' && !isCompleta) return false;
      }

      // Filtro de Rango de Fechas
      if (filterStartDate || filterEndDate) {
        const dateStr = line.rawReceptionDate ? line.rawReceptionDate.substring(0, 10) : '';
        if (dateStr) {
          if (filterStartDate && dateStr < filterStartDate) return false;
          if (filterEndDate && dateStr > filterEndDate) return false;
        }
      }

      // Barra principal: Búsqueda directa por N° Pre-Aviso
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        if (!line.preAvisoId.toLowerCase().includes(term)) return false;
      }

      return true;
    });
  }, [lines, filterProvider, filterPoNumber, filterStatus, filterStartDate, filterEndDate, searchTerm]);

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

          {/* Filtros */}
          <PreavisoFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterProvider={filterProvider}
            onProviderChange={setFilterProvider}
            filterPoNumber={filterPoNumber}
            onPoNumberChange={setFilterPoNumber}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterStartDate={filterStartDate}
            onStartDateChange={setFilterStartDate}
            filterEndDate={filterEndDate}
            onEndDateChange={setFilterEndDate}
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
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-[800px] overflow-hidden animate-in zoom-in-95 duration-200"
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
