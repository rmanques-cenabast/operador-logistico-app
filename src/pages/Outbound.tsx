import React from 'react';
import Header from '../components/Header';
import { Maximize2, CheckCircle } from 'lucide-react';

interface OutboundOrder {
  id: string;
  recipient: string;
  location: string;
  carrier: string;
  items: number;
  status: string;
  badge: string;
}

const outboundOrders: OutboundOrder[] = [
  { id: 'SHP-9021', recipient: 'Global Retail Corp', location: 'Chicago Hub #2', carrier: 'FedEx Express', items: 14, status: 'EMPACADO', badge: 'warning' },
  { id: 'SHP-8842', recipient: 'TechVantage Solutions', location: 'Austin Annex', carrier: 'DHL Global', items: 3, status: 'PICKING', badge: 'info' },
  { id: 'SHP-9110', recipient: 'Prime Logistics', location: 'Main Dock B', carrier: 'UPS Freight', items: 22, status: 'ENVIADO', badge: 'success' },
  { id: 'SHP-7721', recipient: 'Blue Star Retail', location: 'North Warehouse', carrier: 'Internal Fleet', items: 8, status: 'BORRADOR', badge: 'draft' },
  { id: 'SHP-9083', recipient: 'Zenco Manufacturing', location: 'Detroit Plant', carrier: 'Old Dominion', items: 41, status: 'RETENIDO', badge: 'danger' },
];

const Outbound: React.FC = () => {
  return (
    <>
      <Header searchPlaceholder="Buscar ID de envío, SKU o transportista..." />
      <div className="split-page">
        <main className="main-column">
          <h2 className="page-title">Envíos de Salida</h2>
          <p className="page-subtitle">Órdenes de despacho activas para hoy.</p>

          <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            <div className="metric-card">
              <div className="metric-title">PENDIENTE DE PICKING</div>
              <div className="metric-value">12</div>
              <div className="metric-trend" style={{color: 'var(--info-text)'}}>⏱ 8 urgentes</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">ETAPA DE EMPAQUE</div>
              <div className="metric-value">05</div>
              <div className="metric-trend" style={{color: 'var(--text-muted)'}}>☑ Listo para QC</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">DESPACHADOS (HOY)</div>
              <div className="metric-value">84</div>
              <div className="metric-trend trend-down">↗ +12% vs ayer</div>
            </div>
          </div>

          <div className="data-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RECIPIENTE</th>
                  <th>TRANSPORTISTA</th>
                  <th>ARTÍCULOS</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {outboundOrders.map((item, i) => (
                  <tr key={i}>
                    <td style={{fontWeight: 600}}>{item.id}</td>
                    <td>
                      <div className="sku-info">
                        <span className="sku-code">{item.recipient}</span>
                        <span className="sku-desc">{item.location}</span>
                      </div>
                    </td>
                    <td>{item.carrier}</td>
                    <td>{item.items < 10 ? `0${item.items}` : item.items}</td>
                    <td><span className={`badge ${item.badge}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

        <aside className="side-panel">
          <div className="panel-header" style={{justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <span>Detalles del Despacho</span>
            </div>
            <span style={{background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace', color: '#374151'}}>SHP-9021</span>
          </div>
          
          <div className="panel-content">
            <div className="panel-section-title" style={{display: 'flex', justifyContent: 'space-between', margin: '0 0 16px 0'}}>
              FLUJO DE DESPACHO
              <Maximize2 size={14} />
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative'}}>
              <div style={{position: 'absolute', top: '12px', left: '12px', right: '12px', height: '2px', background: 'var(--border-color)', zIndex: 0}}></div>
              <div style={{position: 'absolute', top: '12px', left: '12px', width: '50%', height: '2px', background: 'var(--text-main)', zIndex: 0}}></div>
              
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px'}}>
                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--text-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'}}>1</div>
                <div style={{fontSize: '0.65rem', fontFamily: 'monospace'}}>RECOGIDO</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px'}}>
                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--text-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'}}>2</div>
                <div style={{fontSize: '0.65rem', fontFamily: 'monospace'}}>EMPACADO</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px'}}>
                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--info-bg)', color: 'var(--info-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold'}}>3</div>
                <div style={{fontSize: '0.65rem', fontFamily: 'monospace'}}>STAGING</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px'}}>
                <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem'}}>4</div>
                <div style={{fontSize: '0.65rem', fontFamily: 'monospace'}}>SALIDA</div>
              </div>
            </div>

            <div className="panel-section-title">DESTINO</div>
            <div style={{border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', marginBottom: '24px'}}>
              <div style={{fontWeight: 700, fontSize: '1rem', marginBottom: '4px'}}>Global Retail Corp</div>
              <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>4200 Industrial Pkwy, Bldg 4<br/>Chicago, IL 60609</div>
            </div>

            <div className="panel-section-title">LISTA DE PICKING (14 UNIDADES)</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px'}}>
              <div style={{border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '40px', height: '40px', background: '#333', borderRadius: '4px'}}></div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: '0.85rem'}}>Módulo Sensor X-1</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace'}}>SKU: IND-293-A</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 600, fontSize: '0.85rem'}}>6 / 6</div>
                  <CheckCircle size={14} color="var(--success-text)" />
                </div>
              </div>
              
              <div style={{border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '40px', height: '40px', background: '#333', borderRadius: '4px'}}></div>
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, fontSize: '0.85rem'}}>Fiber Link Pro</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace'}}>SKU: FL-441-X</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 600, fontSize: '0.85rem'}}>8 / 8</div>
                  <CheckCircle size={14} color="var(--success-text)" />
                </div>
              </div>
            </div>

            <div className="panel-section-title">VERIFICACIÓN DE QC</div>
            <div style={{background: 'var(--draft-bg)', padding: '16px', borderRadius: '6px', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)'}}>
              "Peso verificado en 12.4kg. Empaque reforzado para electrónica frágil. Etiqueta aplicada." - J. Doe (Empacador)
            </div>

          </div>

          <div style={{padding: '24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-color)'}}>
            <button style={{width: '100%', padding: '12px', background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px'}}>
              Imprimir Manifiesto
            </button>
            <div style={{background: '#333', color: 'white', padding: '16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem'}}>
              <CheckCircle size={20} />
              Envío SHP-9021 Seleccionado
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Outbound;
