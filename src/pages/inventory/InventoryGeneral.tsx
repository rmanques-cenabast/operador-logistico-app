import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';

const InventoryGeneral: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData(undefined, 25);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
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
          (header.Centro && header.Centro.toLowerCase().includes(term)) ||
          (header.Linea_Negocio && header.Linea_Negocio.toLowerCase().includes(term)) ||
          (header.Documento_SAP_Ref && header.Documento_SAP_Ref.toLowerCase().includes(term)) ||
          (header.Estado_SAP && header.Estado_SAP.toLowerCase().includes(term));

        const matchDetail = header.detalles.some(d =>
          (d.Codigo_Material && d.Codigo_Material.toLowerCase().includes(term)) ||
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term)) ||
          (d.Numero_OC && d.Numero_OC.toLowerCase().includes(term)) ||
          (d.Motivo && d.Motivo.toLowerCase().includes(term)) ||
          (d.Almacen_Origen && d.Almacen_Origen.toLowerCase().includes(term)) ||
          (d.Almacen_Destino && d.Almacen_Destino.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title" style={{ marginBottom: '24px' }}>Registros y movimientos generales</h2>

        <InventoryFilters 
          activeTab="generales"
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

export default InventoryGeneral;
