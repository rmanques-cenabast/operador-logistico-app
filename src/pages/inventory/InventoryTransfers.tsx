import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { Hexagon, RefreshCcw, CheckCircle2, AlertCircle, XCircle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InventoryTransfers: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [flujoPeriodo, setFlujoPeriodo] = useState<number>(14);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
      const tieneTraspaso = header.detalles.some(d => ['311', '321', '344', '343', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino));
      if (!tieneTraspaso) return false;

      if (selectedTipoStock !== 'TODOS') {
        const matchStock = header.detalles.some(d => {
          const dAny = d as any;
          const tipoStock = String(dAny.TipoStockDestino || dAny.tipo_stock_destino || dAny.tipostockdestino || '').toUpperCase();
          let stockLabel = 'L.UTILIZACION';
          if (tipoStock === 'BLOQUEADO') stockLabel = 'BLOQUEADO';
          else if (tipoStock === 'CALIDAD') stockLabel = 'C.CALIDAD';
          return stockLabel === selectedTipoStock;
        });
        if (!matchStock) return false;
      }

      if (selectedTipoMov !== 'TODOS') {
        const matchMov = header.detalles.some(d => d.Tipo_Movimiento === selectedTipoMov);
        if (!matchMov) return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchHeader =
          (header.Nro_Ajuste && header.Nro_Ajuste.toLowerCase().includes(term)) ||
          (header.Usuario_OL && header.Usuario_OL.toLowerCase().includes(term)) ||
          (header.Documento_SAP_Ref && header.Documento_SAP_Ref.toLowerCase().includes(term));
        const matchDetail = header.detalles.some(d =>
          (d.Codigo_Material && d.Codigo_Material.toLowerCase().includes(term)) ||
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  const traspasoHeaders = adjustments.filter(h => h.detalles.some(d => ['311', '321', '344', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino)));
  let sapSincronizados = 0;
  let sapErrores = 0;
  let sapPendientes = 0;
  traspasoHeaders.forEach(h => {
    const est = (h.Estado_SAP || '').toUpperCase();
    if (est === 'PROCESADO' || est === 'EXITOSO' || est === 'COMPLETADO') sapSincronizados++;
    else if (est.includes('ERROR') || est.includes('FALLO')) sapErrores++;
    else sapPendientes++;
  });
  const successRate = traspasoHeaders.length > 0 ? Math.round((sapSincronizados / traspasoHeaders.length) * 100) : 100;

  let traspasosConFecha = adjustments.flatMap(h =>
    h.detalles
      .filter(d => ['311', '321', '344', '343', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino))
      .map(d => ({ ...d, fechaObj: new Date(h.Fecha_Creacion) }))
  );

  let countLibre = 0;
  let countCalidad = 0;
  let countBloqueado = 0;
  
  traspasosConFecha.forEach(d => {
    const dAny = d as any;
    const tipoStock = String(dAny.TipoStockDestino || dAny.tipo_stock_destino || dAny.tipostockdestino || '').toUpperCase();
    if (tipoStock === 'BLOQUEADO') countBloqueado++;
    else if (tipoStock === 'CALIDAD') countCalidad++;
    else countLibre++;
  });

  const flujoCutoff = new Date();
  flujoCutoff.setDate(flujoCutoff.getDate() - (flujoPeriodo - 1));
  flujoCutoff.setHours(0, 0, 0, 0);
  
  const traspasosFiltrados = traspasosConFecha.filter(t => t.fechaObj >= flujoCutoff);
  const totalTraspasos = traspasosFiltrados.length;

  const groupedTraspasos = traspasosConFecha.reduce((acc, curr) => {
    const dateStr = curr.fechaObj.toISOString().split('T')[0];
    acc[dateStr] = (acc[dateStr] || 0) + Math.abs(curr.Cantidad);
    return acc;
  }, {} as Record<string, number>);

  let traspasosChartData = [];
  for (let i = flujoPeriodo - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const qty = groupedTraspasos[dateStr] || 0;
    traspasosChartData.push({
      name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      Unidades: qty
    });
  }

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Reubicaciones y Traspasos Internos</h2>
        <p className="page-subtitle">Traslados entre almacenes, cuarentena, liberaciones de calidad y reetiquetado de SKU. (SAP 311, 321, 344, 343, 309)</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                <Hexagon size={14} /> DISTRIBUCIÓN POR TIPO STOCK
              </div>
              <div style={{ display: 'flex', width: '100%', marginTop: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px #dcfce7' }}></div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{countLibre}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Libre Utilización</span>
                </div>
                
                <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#facc15', boxShadow: '0 0 0 2px #fef9c3' }}></div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{countCalidad}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Control Calidad</span>
                </div>
                
                <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 2px #fee2e2' }}></div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{countBloqueado}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Bloqueado</span>
                </div>
              </div>
            </div>

            <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
                <RefreshCcw size={14} /> ESTADO SINCRONIZACIÓN SAP
              </div>
              <div style={{ display: 'flex', width: '100%', marginTop: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} color="var(--success-main)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-main)', lineHeight: 1 }}>{sapSincronizados}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Sincronizados</span>
                </div>
                
                <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} color="var(--warning-main)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning-main)', lineHeight: 1 }}>{sapPendientes}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Pendientes</span>
                </div>
                
                <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }}></div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <XCircle size={16} color="var(--danger-main)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger-main)', lineHeight: 1 }}>{sapErrores}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>Con Errores</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-main)', marginBottom: '4px' }}>
                  <Activity size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>FLUJO DE MATERIALES</span>
                </div>
              </div>
              <select 
                value={flujoPeriodo} 
                onChange={(e) => setFlujoPeriodo(Number(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#334155', outline: 'none', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
              >
                <option value={7}>Últimos 7 Días</option>
                <option value={14}>Últimos 14 Días</option>
                <option value={30}>Últimos 30 Días</option>
              </select>
            </div>

            <div style={{ height: '140px', width: '100%', marginTop: 'auto' }}>
              {traspasosChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={traspasosChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFlujo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--danger-main)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--danger-main)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.85rem' }}
                      itemStyle={{ color: 'var(--danger-main)', fontWeight: 600 }}
                      labelStyle={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}
                      formatter={(value: any) => [`${value ?? 0} Un.`, 'Volumen']}
                    />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={-10} width={40} />
                    <Area type="monotone" dataKey="Unidades" stroke="var(--danger-main)" strokeWidth={3} fillOpacity={1} fill="url(#colorFlujo2)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ width: '100%', height: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--app-bg)', borderRadius: '6px' }}>
                  Sin movimientos recientes
                </div>
              )}
            </div>
          </div>
        </div>

        <InventoryFilters 
          activeTab="traspasos"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedTipoMov={selectedTipoMov} setSelectedTipoMov={setSelectedTipoMov}
          selectedTipoStock={selectedTipoStock} setSelectedTipoStock={setSelectedTipoStock}
          inputFechaDesde="" setInputFechaDesde={() => {}}
          inputFechaHasta="" setInputFechaHasta={() => {}}
          mermasFechaDesde="" setMermasFechaDesde={() => {}}
          mermasFechaHasta="" setMermasFechaHasta={() => {}}
          fetchAdjustments={fetchAdjustments}
        />

        <InventoryTable 
          loading={loading}
          filteredAdjustments={filteredAdjustments}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          selectedAjuste={selectedAjuste}
          setSelectedAjuste={setSelectedAjuste}
        />
      </main>
    </>
  );
};

export default InventoryTransfers;
