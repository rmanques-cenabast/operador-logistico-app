import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InventoryWaste: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [mermasFechaDesde, setMermasFechaDesde] = useState<string>('');
  const [mermasFechaHasta, setMermasFechaHasta] = useState<string>('');
  const [inputFechaDesde, setInputFechaDesde] = useState<string>('');
  const [inputFechaHasta, setInputFechaHasta] = useState<string>('');

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
      const tieneMerma = header.detalles.some(d => (d.Cantidad < 0 && !['711', '717'].includes(d.Tipo_Movimiento)) || d.Tipo_Movimiento === '555');
      if (!tieneMerma) return false;

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
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term)) ||
          (d.Motivo && d.Motivo.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  let mermasConFecha = adjustments.flatMap(h =>
    h.detalles
      .filter(d => d.Cantidad < 0 || d.Tipo_Movimiento === '555')
      .map(d => ({ ...d, fechaObj: new Date(h.Fecha_Creacion) }))
  );

  if (mermasFechaDesde) {
    const desde = new Date(mermasFechaDesde);
    desde.setHours(0, 0, 0, 0);
    mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) >= desde);
  }
  if (mermasFechaHasta) {
    const hasta = new Date(mermasFechaHasta);
    hasta.setHours(23, 59, 59, 999);
    mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) <= hasta);
  }

  const salidasStock = mermasConFecha.reduce((sum, d) => sum + Math.abs(d.Cantidad), 0);

  const grouped = mermasConFecha.reduce((acc, curr) => {
    const dateStr = curr.fechaObj.toISOString().split('T')[0];
    acc[dateStr] = (acc[dateStr] || 0) + Math.abs(curr.Cantidad);
    return acc;
  }, {} as Record<string, number>);

  let chartData = [];
  if (mermasFechaDesde || mermasFechaHasta) {
    let start = mermasFechaDesde ? new Date(mermasFechaDesde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let end = mermasFechaHasta ? new Date(mermasFechaHasta) : new Date();

    if (isNaN(start.getTime())) start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (isNaN(end.getTime())) end = new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const diffDays = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    for (let i = 0; i <= Math.min(diffDays, 180); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const qty = grouped[dateStr] || 0;
      chartData.push({
        name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
        Unidades: qty
      });
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const qty = grouped[dateStr] || 0;
      chartData.push({
        name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
        Unidades: qty
      });
    }
  }

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Mermas, Desguaces y Destrucción</h2>
        <p className="page-subtitle">Registro y auditoría de salidas por medicamentos destruidos, dañados o vencidos con Centro de Costos. (SAP 555)</p>

        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Evolución de Destrucción y Desguaces (SAP 555)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tendencia temporal de medicamentos descontados del inventario por bajas o daño.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger-main)', lineHeight: 1 }}>{salidasStock.toLocaleString()} Un.</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Pérdida Total</div>
            </div>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMermasFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger-main)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--danger-main)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.85rem' }}
                    itemStyle={{ color: 'var(--danger-main)', fontWeight: 600 }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}
                    formatter={(value: any) => [`${value ?? 0} Unidades`, 'Pérdida']}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} tickFormatter={(value) => value.toLocaleString('es-CL')} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <Area type="monotone" dataKey="Unidades" stroke="var(--danger-main)" strokeWidth={3} fillOpacity={1} fill="url(#colorMermasFull)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--app-bg)', borderRadius: '6px' }}>
                Sin mermas registradas
              </div>
            )}
          </div>
        </div>

        <InventoryFilters 
          activeTab="mermas"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedTipoMov={selectedTipoMov} setSelectedTipoMov={setSelectedTipoMov}
          selectedTipoStock={selectedTipoStock} setSelectedTipoStock={setSelectedTipoStock}
          inputFechaDesde={inputFechaDesde} setInputFechaDesde={setInputFechaDesde}
          inputFechaHasta={inputFechaHasta} setInputFechaHasta={setInputFechaHasta}
          mermasFechaDesde={mermasFechaDesde} setMermasFechaDesde={setMermasFechaDesde}
          mermasFechaHasta={mermasFechaHasta} setMermasFechaHasta={setMermasFechaHasta}
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

export default InventoryWaste;
