import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface InventoryFiltersProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedTipoMov: string;
  setSelectedTipoMov: (val: string) => void;
  selectedTipoStock: string;
  setSelectedTipoStock: (val: string) => void;
  inputFechaDesde: string;
  setInputFechaDesde: (val: string) => void;
  inputFechaHasta: string;
  setInputFechaHasta: (val: string) => void;
  mermasFechaDesde: string;
  setMermasFechaDesde: (val: string) => void;
  mermasFechaHasta: string;
  setMermasFechaHasta: (val: string) => void;
  fetchAdjustments: (silent?: boolean) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  selectedTipoMov,
  setSelectedTipoMov,
  selectedTipoStock,
  setSelectedTipoStock,
  inputFechaDesde,
  setInputFechaDesde,
  inputFechaHasta,
  setInputFechaHasta,
  mermasFechaDesde,
  setMermasFechaDesde,
  mermasFechaHasta,
  setMermasFechaHasta,
  fetchAdjustments
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
      <div className="search-bar" style={{ width: '100%', maxWidth: '360px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="BUSCAR FOLIO, ZCEN, LOTE, DOC. SAP..."
          style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-color)', background: 'var(--app-bg)', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s' }}
          onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-main)'; }}
          onBlur={(e) => { e.currentTarget.style.background = 'var(--app-bg)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        />
      </div>

      <div className="filters" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

        {activeTab === 'generales' && (
          <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
            OPERACIÓN SAP:
            <select
              value={selectedTipoMov}
              onChange={(e) => setSelectedTipoMov(e.target.value)}
              className="filter-select"
              style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="TODOS">TODAS LAS OPERACIONES</option>
              <option value="311">TRASPASOS (311)</option>
              <option value="555">MERMAS / DESGUACE (555)</option>
              <option value="711">FALTANTE CONTEO (711)</option>
              <option value="712">SOBRANTE CONTEO (712)</option>
              <option value="331">MUESTREO ISP (331)</option>
              <option value="511">ENTRADA SIN OC (511)</option>
            </select>
          </div>
        )}

        {activeTab === 'mermas' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>DESDE:</span>
            <input type="date" value={inputFechaDesde} onChange={(e) => setInputFechaDesde(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', background: 'white', outline: 'none' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>HASTA:</span>
            <input type="date" value={inputFechaHasta} onChange={(e) => setInputFechaHasta(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', background: 'white', outline: 'none' }} />
            <button
              onClick={() => { setMermasFechaDesde(inputFechaDesde); setMermasFechaHasta(inputFechaHasta); }}
              style={{ background: 'var(--primary-main)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              FILTRAR
            </button>
            {(mermasFechaDesde || mermasFechaHasta || inputFechaDesde || inputFechaHasta) && (
              <button onClick={() => { setInputFechaDesde(''); setInputFechaHasta(''); setMermasFechaDesde(''); setMermasFechaHasta(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0 4px' }}>LIMPIAR</button>
            )}
          </div>
        )}

        <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
          TIPO STOCK:
          <select
            value={selectedTipoStock}
            onChange={(e) => setSelectedTipoStock(e.target.value)}
            className="filter-select"
            style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="TODOS">TODOS</option>
            <option value="L.UTILIZACION">LIBRE UTILIZACIÓN</option>
            <option value="C.CALIDAD">CONTROL CALIDAD</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }}></div>
        <button
          onClick={() => fetchAdjustments(false)}
          className="btn"
          title="RECARGAR DATOS"
          style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}
        >
          <RefreshCw size={14} /> REFRESCAR
        </button>
      </div>
    </div>
  );
};
