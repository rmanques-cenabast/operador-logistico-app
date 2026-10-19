import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { Truck, Clock, CheckCircle2, AlertTriangle, Boxes, CheckCircle } from 'lucide-react';
import { OutboundService, OutboundDelivery, OutboundMetrics } from '../services/outbound.service';
import { OutboundFilters } from '../components/outbound/OutboundFilters';
import { OutboundTable } from '../components/outbound/OutboundTable';
import { PickingDetailModal } from '../components/outbound/PickingDetailModal';

const Outbound: React.FC = () => {
  const [deliveries, setDeliveries] = useState<OutboundDelivery[]>([]);
  const [metrics, setMetrics] = useState<OutboundMetrics>({
    PendientesPicking: 0,
    EnPicking: 0,
    PickingConfirmado: 0,
    DespachadosTotal: 0,
    Urgentes: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncBanner, setSyncBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [fechaDesde, setFechaDesde] = useState<string>('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState<string>('2026-07-31');
  const [selectedDelivery, setSelectedDelivery] = useState<OutboundDelivery | null>(null);

  // ESTADOS DE PAGINACIÓN (10 O 15 POR PÁGINA)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deliveriesRes, metricsRes] = await Promise.all([
        OutboundService.getDeliveries({
          status: statusFilter,
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage
        }),
        OutboundService.getMetrics()
      ]);

      if (deliveriesRes.status === 'success' && Array.isArray(deliveriesRes.data)) {
        setDeliveries(deliveriesRes.data);
        const count = deliveriesRes.totalItems ?? (deliveriesRes.data[0]?.TotalRegistros ?? deliveriesRes.data.length);
        setTotalItems(count);
        setTotalPages(deliveriesRes.totalPages ?? Math.max(1, Math.ceil(count / itemsPerPage)));
      }
      if (metricsRes) {
        setMetrics(metricsRes);
      }
    } catch (err) {
      console.error('Error fetching outbound data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSyncSap = async () => {
    setSyncing(true);
    setSyncBanner(null);
    try {
      // Sincroniza desde el rango configurado (por defecto desde Enero hasta Julio 2026 para SAP DEV)
      const res = await OutboundService.syncFromSap(fechaDesde, fechaHasta);
      setSyncBanner({
        type: 'success',
        message: `Sincronización SAP exitosa: ${res.nuevas} entregas nuevas incorporadas y ${res.existentes} verificadas (período: ${res.fechaDesde} al ${res.fechaHasta}).`
      });
      await fetchData();
    } catch (err: any) {
      setSyncBanner({
        type: 'error',
        message: err.message || 'Error al conectar con la API de SAP para sincronizar entregas.'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <Header showSearch={false} />
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 w-full">
        <main className="px-8 py-6 w-full flex-1">
          {/* TÍTULO */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                SALIDAS Y PICKEO EN BODEGA (OUTBOUND)
              </h2>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                GESTIÓN DE ENTREGAS DE SALIDA SAP (VL01N), PICKING FÍSICO Y GUÍAS DE DESPACHO DTE 52
              </p>
            </div>
          </div>

          {/* BANNER DE SINCRONIZACIÓN SAP */}
          {syncBanner && (
            <div className={`p-4 rounded-xl mb-6 flex items-center justify-between text-xs font-medium border ${
              syncBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {syncBanner.type === 'success' ? (
                  <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                )}
                <span>{syncBanner.message}</span>
              </div>
              <button
                onClick={() => setSyncBanner(null)}
                className="text-slate-400 hover:text-slate-600 font-bold ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* MÉTRICAS SUPERIORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* PENDIENTES DE PICKING */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  PENDIENTES DE PICKING
                </span>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  {metrics.PendientesPicking < 10 ? `0${metrics.PendientesPicking}` : metrics.PendientesPicking}
                </div>
                <span className="text-[10px] text-amber-600 font-semibold uppercase mt-1 block">
                  POR INICIAR PICKING
                </span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock size={22} />
              </div>
            </div>

            {/* EN PICKING */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  EN PICKING (PREPARACIÓN)
                </span>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  {metrics.EnPicking < 10 ? `0${metrics.EnPicking}` : metrics.EnPicking}
                </div>
                <span className="text-[10px] text-sky-600 font-semibold uppercase mt-1 block">
                  EN ESTANTERÍA
                </span>
              </div>
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Boxes size={22} />
              </div>
            </div>

            {/* PICKING CONFIRMADO (LISTO DTE) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  PICKING CONFIRMADO
                </span>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  {metrics.PickingConfirmado < 10 ? `0${metrics.PickingConfirmado}` : metrics.PickingConfirmado}
                </div>
                <span className="text-[10px] text-purple-600 font-semibold uppercase mt-1 block">
                  LISTO EMISIÓN DTE 52
                </span>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <CheckCircle2 size={22} />
              </div>
            </div>

            {/* TOTAL DESPACHADOS */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  DESPACHADOS (PGI 601)
                </span>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  {metrics.DespachadosTotal < 10 ? `0${metrics.DespachadosTotal}` : metrics.DespachadosTotal}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold uppercase mt-1 block">
                  CAMIÓN EN RUTA
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck size={22} />
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS */}
          <OutboundFilters
            searchTerm={searchTerm}
            setSearchTerm={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            fechaDesde={fechaDesde}
            setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta}
            setFechaHasta={setFechaHasta}
            onRefresh={fetchData}
            loading={loading}
            onSyncSap={handleSyncSap}
            syncing={syncing}
          />

          {/* TABLA PRINCIPAL DE ENTREGAS */}
          <OutboundTable
            deliveries={deliveries}
            loading={loading}
            onSelectDelivery={(delivery) => setSelectedDelivery(delivery)}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />

          {/* MODAL DE DETALLE Y PICKEO */}
          {selectedDelivery && (
            <PickingDetailModal
              deliveryId={selectedDelivery.IdEntrega}
              onClose={() => setSelectedDelivery(null)}
              onDispatched={() => fetchData()}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default Outbound;
