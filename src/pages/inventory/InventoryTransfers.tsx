import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { Hexagon, RefreshCcw, CheckCircle2, AlertCircle, XCircle, } from 'lucide-react';

const InventoryTransfers: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
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

  

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Reubicaciones y Traspasos Internos</h2>
        

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
