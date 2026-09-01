import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { X, CheckCircle, Package, Calendar, Search, UploadCloud, Eye } from 'lucide-react';
import UploadPreaviso from './UploadPreaviso';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface PreAvisoLine {
  preAvisoId: string;
  provider: string;
  lineNo: number;
  poNumber: string;
  productCode: string;
  batch: string;
  expDate: string;
  receptionDate: string;
  qty: number;
  qtyExpected: number;
  qtyReceived: number;
  uom: string;
  status: string;
  badge: string;
  estadoFisico: string;
}

const Inbound: React.FC = () => {
  const [preAvisoLines, setPreAvisoLines] = useState<PreAvisoLine[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState('TODOS');
  const [filterYear, setFilterYear] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const lineaNegocio = user?.role === 'intermediacion' ? 'INT' : 'FP';

  const loadData = () => {
    // if (!silent) setIsLoading(true);
    Promise.all([
      fetch(`${API_URL}/ol/inbound/pending?lineaNegocio=${lineaNegocio}`).then(res => res.json()),
      fetch(`${API_URL}/ol/inbound/completed?lineaNegocio=${lineaNegocio}`).then(res => res.json())
    ])
      .then(([pendingData, completedData]) => {
        let combinedData: any[] = [];
        
        if (pendingData.status === 'success') {
          combinedData = [...combinedData, ...pendingData.data];
        }
        if (completedData.status === 'success') {
          combinedData = [...combinedData, ...completedData.data];
        }

        // Aplanar el JSON jerárquico devuelto por el backend
        const flatData: any[] = [];
        combinedData.forEach((cab: any) => {
          if (cab.lineas && cab.lineas.length > 0) {
            cab.lineas.forEach((lin: any) => {
              flatData.push({ ...cab, ...lin });
            });
          } else {
            flatData.push({ ...cab });
          }
        });

        const mappedData = flatData.map((item: any) => {
          let badge = 'info';
          let status = item.estadoRecepcion;

          if (status === 'RECEPCION_CONFORME' || status === 'COMPLETADO' || status === 'APROBADO OL' || status === 'CONFIRMADO_OL_PENDIENTE_SAP') {
            status = 'APROBADO OL';
            badge = 'success';
          } else if (item.cantidad <= 0) {
            status = 'APROBADO OL';
            badge = 'success';
          }
          
          const formatDate = (dateString: string) => {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ');
          };

          return {
            preAvisoId: item.numeroPreAviso,
            provider: item.rutProveedor,
            lineNo: item.posicionPedidoCompra,
            poNumber: item.numeroPedidoCompra,
            productCode: item.codigoProducto,
            batch: item.lote || 'N/A',
            expDate: formatDate(item.fechaExpiracion),
            receptionDate: formatDate(item.fechaRecepcionEst),
            qty: item.cantidad !== undefined ? item.cantidad : (item.cantidadPendiente !== undefined ? item.cantidadPendiente : Math.max(0, (item.cantidadEsperada || 0) - (item.cantidadRecibida || 0))),
            qtyExpected: item.cantidadEsperada || 0,
            qtyReceived: item.cantidadRecibida || 0,
            uom: 'Un.',
            status: status,
            badge: badge,
            estadoFisico: item.estadoFisico
          };
        });
        setPreAvisoLines(mappedData);
      })
      .catch(err => console.error("Error fetching preavisos:", err));
      // .finally(() => {
      //   if (!silent) setIsLoading(false);
      // });
  };

  useEffect(() => {
    loadData();
    const intervalId = setInterval(() => loadData(), 3000);
    return () => clearInterval(intervalId);
  }, [lineaNegocio]);

  const uniqueProviders = Array.from(new Set(preAvisoLines.map(l => l.provider)));
  
  // --- CÁLCULO DE MÉTRICAS REALES ---
  const uniquePreAvisos = Array.from(new Set(preAvisoLines.map(l => l.preAvisoId)));
  const totalActivos = uniquePreAvisos.length;
  const pendientesOL = Array.from(new Set(preAvisoLines.filter(l => l.status === 'PENDIENTE' || l.status === 'NOTIFICADO').map(l => l.preAvisoId))).length;

  return (
    <>
      <Header showSearch={false} />
      <div className="split-page">
        <main className="main-column">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 className="page-title" style={{ fontSize: '1.4rem', marginBottom: '6px', letterSpacing: '-0.5px' }}>PRE AVISO</h2>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ESTADOS:</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge info" style={{ padding: '2px 6px' }}>PENDIENTE</span></span>
                  <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge success" style={{ padding: '2px 6px' }}>APROBADO OL</span></span>
                </div>
              </div>
              <button 
                onClick={() => setIsUploadOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'white', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-main)', 
                  padding: '8px 16px', 
                  fontSize: '0.85rem',
                  fontWeight: 400,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <UploadCloud size={18} /> Subir Pre-Aviso
              </button>
            </div>
          </div>

          <div className="metrics-container" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="metric-card" style={{ padding: '16px 24px', minHeight: 'unset', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px', minWidth: '240px', flex: '0 1 auto' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem' }}>PRE AVISOS TOTALES</div>
              <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{totalActivos < 10 ? `0${totalActivos}` : totalActivos}</div>
            </div>
            <div className="metric-card" style={{ padding: '16px 24px', minHeight: 'unset', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px', minWidth: '240px', flex: '0 1 auto' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem' }}>PENDIENTE APROBACIÓN OL</div>
              <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{pendientesOL < 10 ? `0${pendientesOL}` : pendientesOL}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            
            <div className="search-bar" style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Buscar Pre Avisos, OC..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-color)', background: 'var(--app-bg)', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s' }} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-main)'; }}
                onBlur={(e) => { e.currentTarget.style.background = 'var(--app-bg)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              />
            </div>

            <div className="filters" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
                PROVEEDOR:
                <select className="filter-select" value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', maxWidth: '140px', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
                ESTADO:
                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem' }}>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="TODOS">TODOS</option>
                  <option value="APROBADO OL">APROBADO OL</option>
                </select>
              </div>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
                MES ESTIMADO:
                <select className="filter-select" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  <option value="ene">Enero</option>
                  <option value="feb">Febrero</option>
                  <option value="mar">Marzo</option>
                  <option value="abr">Abril</option>
                  <option value="may">Mayo</option>
                  <option value="jun">Junio</option>
                  <option value="jul">Julio</option>
                  <option value="ago">Agosto</option>
                  <option value="sep">Septiembre</option>
                  <option value="oct">Octubre</option>
                  <option value="nov">Noviembre</option>
                  <option value="dic">Diciembre</option>
                </select>
              </div>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
                AÑO ESTIMADO:
                <select className="filter-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>
          </div>

          {/* handleOpenPanel se define aquí abajo para no estorbar arriba */}
          {(() => {
            const handleOpenPanel = (paId: string) => {
              setSelectedPA(paId);
              setIsPanelOpen(true);
            };
            return (
          <div className="data-table-container">
            <table style={{ width: '100%', minWidth: '900px' }}>
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>PRE AVISO</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>RUT PROV.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>P. COMPRA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>LOTE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>MATERIAL</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>FECHA RECEP.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>RECEPCIÓN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set(preAvisoLines.map(l => l.preAvisoId))).filter(paId => {
                  const firstLine = preAvisoLines.find(l => l.preAvisoId === paId)!;
                  const dateStr = firstLine.receptionDate.toLowerCase();
                  if (filterMonth !== 'TODOS' && !dateStr.includes(filterMonth)) return false;
                  if (filterYear !== 'TODOS' && !dateStr.includes(filterYear)) return false;
                  if (filterProvider !== 'TODOS' && firstLine.provider !== filterProvider) return false;
                  if (filterStatus !== 'TODOS') {
                    if (filterStatus === 'PENDIENTE') {
                      if (firstLine.status !== 'PENDIENTE' && firstLine.status !== 'NOTIFICADO') return false;
                    } else if (firstLine.status !== filterStatus) {
                      return false;
                    }
                  }
                  
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    const lineMatch = preAvisoLines.some(l => 
                      l.preAvisoId === paId && 
                      (l.productCode.toLowerCase().includes(term) || (l.batch && l.batch.toLowerCase().includes(term)))
                    );
                    
                    return (
                      firstLine.preAvisoId.toLowerCase().includes(term) ||
                      firstLine.poNumber.toLowerCase().includes(term) ||
                      firstLine.provider.toLowerCase().includes(term) ||
                      lineMatch
                    );
                  }
                  
                  return true;
                }).map((paId, i) => {
                  const lines = preAvisoLines.filter(l => l.preAvisoId === paId);
                  const firstLine = lines[0];
                  
                  return (
                    <tr key={i} style={{ background: selectedPA === paId ? 'var(--draft-bg)' : 'transparent' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="sku-code" style={{ fontWeight: 400 }}>{paId}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span className="sku-desc" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{firstLine.provider}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}>
                        {(() => {
                          const uniquePOs = Array.from(new Set(lines.map(l => l.poNumber)));
                          if (uniquePOs.length === 1) return <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{uniquePOs[0]}</span>;
                          return <span style={{ color: 'var(--primary-main)', fontWeight: 400 }}>Múltiples OCs ({uniquePOs.length})</span>;
                        })()}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}>
                        {(() => {
                          const uniqueBatches = Array.from(new Set(lines.map(l => l.batch).filter(b => b && b !== 'N/A')));
                          if (uniqueBatches.length === 0) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
                          if (uniqueBatches.length === 1) return uniqueBatches[0];
                          return <span style={{ color: 'var(--primary-main)', fontWeight: 400 }}>Múltiples ({uniqueBatches.length})</span>;
                        })()}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', textAlign: 'center' }}>
                        {(() => {
                          const uniqueMats = Array.from(new Set(lines.map(l => l.productCode)));
                          if (uniqueMats.length === 1) return uniqueMats[0];
                          return <span style={{ color: 'var(--primary-main)', fontWeight: 400 }}>Múltiples ({uniqueMats.length})</span>;
                        })()}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 400, color: 'var(--text-main)', textAlign: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-secondary)" />
                          {firstLine.receptionDate}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge ${firstLine.estadoFisico === 'Completa' ? 'success' : (firstLine.estadoFisico === 'Parcial' ? 'warning' : 'draft')}`}>
                          {firstLine.estadoFisico}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleOpenPanel(paId)}>
                        <Eye size={18} style={{ color: 'var(--primary-main)' }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="table-footer">
              <span>Mostrando {Array.from(new Set(preAvisoLines.map(l => l.preAvisoId))).filter(paId => {
                  const firstLine = preAvisoLines.find(l => l.preAvisoId === paId)!;
                  const dateStr = firstLine.receptionDate.toLowerCase();
                  if (filterMonth !== 'TODOS' && !dateStr.includes(filterMonth)) return false;
                  if (filterYear !== 'TODOS' && !dateStr.includes(filterYear)) return false;
                  if (filterProvider !== 'TODOS' && firstLine.provider !== filterProvider) return false;
                  if (filterStatus !== 'TODOS' && firstLine.status !== filterStatus) return false;
                  return true;
              }).length} registros filtrados</span>
              <div className="pagination">
                <button className="pagination-btn" disabled>&lt;</button>
                <button className="pagination-btn" style={{ background: 'var(--primary)', fontWeight: 'bold' }}>1</button>
                <button className="pagination-btn" disabled>&gt;</button>
              </div>
            </div>
          </div>
            );
          })()}
        </main>

        {isPanelOpen && (
          <div className="modal-overlay" onClick={() => setIsPanelOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ width: '1050px', maxWidth: '95vw' }}>
              <div className="panel-header">
                Detalle PRE AVISO - {selectedPA?.replace('PRE-', '')}
                <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsPanelOpen(false)} />
              </div>
              <div className="panel-content">
                {(() => {
                  const activePA = preAvisoLines.find(l => l.preAvisoId === selectedPA);

                  return (
                    <>
                      <div className="panel-section-title" style={{ marginTop: '0', textAlign: 'center', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', letterSpacing: '1px' }}>ESTADO DEL PEDIDO</div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '72px', marginTop: '24px', padding: '0 70px' }}>
                        {/* Step 1 */}
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div className={activePA?.estadoFisico === 'Pendiente' ? 'active-step-primary' : ''} style={{ width: '36px', height: '36px', borderRadius: '50%', background: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2, transition: 'all 0.5s ease' }}>
                            <CheckCircle size={20} />
                          </div>
                          <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', width: '160px', textAlign: 'center', transition: 'color 0.5s ease' }}>PENDIENTE RECEPCIÓN</div>
                        </div>

                        {/* Line 1 */}
                        <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
                          <div className={activePA?.estadoFisico === 'Pendiente' ? 'loading-line-active' : ''} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: activePA?.estadoFisico !== 'Pendiente' ? '100%' : '0%', background: activePA?.estadoFisico !== 'Pendiente' ? 'var(--success-main)' : 'var(--primary-main)', transition: 'all 0.5s ease', borderRadius: '2px' }}></div>
                          {activePA?.estadoFisico === 'Pendiente' && (
                            <div className="pulse-dot loading-dot-active"></div>
                          )}
                        </div>

                        {/* Step 1.5 (Parcial) - Solo visible si es Parcial */}
                        {activePA?.estadoFisico === 'Parcial' && (
                          <>
                            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="active-step-warning" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--warning-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2, transition: 'all 0.5s ease' }}>
                                <CheckCircle size={20} />
                              </div>
                              <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: 'var(--warning-main)', width: '160px', whiteSpace: 'nowrap', textAlign: 'center', transition: 'color 0.5s ease' }}>RECEPCIÓN PARCIAL</div>
                            </div>
                            {/* Line 2 */}
                            <div style={{ flex: 1, height: '4px', background: 'var(--border-color)', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
                              <div className="loading-line-warning" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '0%', background: 'var(--warning-main)', transition: 'all 0.5s ease', borderRadius: '2px' }}></div>
                              <div className="pulse-dot-warning loading-dot-active" style={{ background: 'var(--warning-main)', boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.7)' }}></div>
                            </div>
                          </>
                        )}

                        {/* Step 2 (Final) */}
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div className={activePA?.estadoFisico === 'Completa' ? 'active-step-success' : ''} style={{ width: '36px', height: '36px', borderRadius: '50%', background: activePA?.estadoFisico === 'Completa' ? 'var(--success-main)' : 'var(--bg-color)', border: activePA?.estadoFisico === 'Completa' ? 'none' : '2px solid var(--border-color)', color: activePA?.estadoFisico === 'Completa' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2, transition: 'all 0.5s ease' }}>
                            {activePA?.estadoFisico === 'Completa' ? <CheckCircle size={20} /> : (activePA?.estadoFisico === 'Parcial' ? '3' : '2')}
                          </div>
                          <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 400, color: activePA?.estadoFisico === 'Completa' ? 'var(--success-main)' : 'var(--text-muted)', width: '120px', textAlign: 'center', transition: 'color 0.5s ease' }}>RECIBIDO EN OL</div>
                        </div>
                      </div>

                      <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Package size={16} />
                        RESUMEN DE PRODUCTOS DECLARADOS
                      </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--sidebar-bg)' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Posición</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Pedido Compra</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Material</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Lote</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>F. Vencimiento</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Cant. Orig.</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Recibido</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>Pendiente</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>Recepción OL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preAvisoLines.filter(line => line.preAvisoId === selectedPA).map((line, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>0{line.lineNo}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}><span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{line.poNumber}</span></td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontWeight: 400 }}>{line.productCode}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontFamily: 'monospace' }}>{line.batch}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>{line.expDate}</td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400 }}>
                            {line.qtyExpected} {line.uom}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400, color: line.qtyReceived > 0 ? 'var(--success-main)' : 'inherit' }}>
                            {line.qtyReceived} {line.uom}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: 400, color: (line.qty > 0) ? 'var(--warning-main)' : 'var(--text-muted)' }}>
                            {line.qty ?? 0} {line.uom}
                          </td>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                            {(line.qty <= 0 || (line.qtyReceived >= line.qtyExpected && line.qtyExpected > 0)) ? (
                              <span style={{ fontSize: '0.65rem', background: 'var(--success-bg)', color: 'var(--success-text)', padding: '4px 8px', borderRadius: '4px', fontWeight: 400, letterSpacing: '0.5px' }}>
                                RECIBIDO EN OL
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.65rem', background: 'var(--warning-bg)', color: 'var(--warning-text)', padding: '4px 8px', borderRadius: '4px', fontWeight: 400, letterSpacing: '0.5px' }}>
                                PENDIENTE
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>



                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {isUploadOpen && (
          <div className="modal-overlay" onClick={() => setIsUploadOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw', padding: 0, borderRadius: '8px', overflow: 'hidden' }}>
              <div className="panel-header" style={{ borderBottom: 'none', padding: '24px 24px 16px 24px', fontWeight: 400, fontSize: '1.1rem', color: '#0f172a' }}>
                Subir Nuevo Pre-Aviso
                <X size={20} color="#64748b" style={{ cursor: 'pointer' }} onClick={() => setIsUploadOpen(false)} />
              </div>
              <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <UploadPreaviso onSuccess={() => {
                  setIsUploadOpen(false);
                  loadData(); // Refrescar la tabla
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Inbound;
