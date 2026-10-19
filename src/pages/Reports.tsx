import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useInventoryData } from '../hooks/useInventoryData';
import { useAuth } from '../contexts/AuthContext';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { BarChart2, Route, Box, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { extractUniqueOptions, calculateDashboardMetrics } from '../utils/reportsLogic';

const getTodayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getDaysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const Reports: React.FC = () => {
  const { adjustments } = useInventoryData();
  const { lineaNegocio, lineaNegocioLabel } = useAuth();
  
  // Línea de negocio activa según el Visor seleccionado en cabecera
  const activeLoB = lineaNegocio;
  
  // Dashboard Filters
  const [originFilter, setOriginFilter] = useState('TODOS');
  const [destFilter, setDestFilter] = useState('TODOS');
  const [materialFilter, setMaterialFilter] = useState('TODOS');
  // Rango de fechas seleccionable mediante CustomDatePicker (por defecto 90 días)
  const [startDate, setStartDate] = useState<string>(() => getDaysAgoStr(90));
  const [endDate, setEndDate] = useState<string>(() => getTodayStr());

  // Reiniciar filtros al cambiar de visor (Farmacias Privadas / Intermediación)
  useEffect(() => {
    setOriginFilter('TODOS');
    setDestFilter('TODOS');
    setMaterialFilter('TODOS');
  }, [lineaNegocio]);

  // Extract available options dynamically based on active profile
  const { origins, destinations, materials } = useMemo(() => 
    extractUniqueOptions(adjustments, activeLoB), 
  [adjustments, activeLoB]);

  // Calculate metrics based on current filters
  const { totalUnits, topMaterial, topRoute, topRoutes, chartData } = useMemo(() => 
    calculateDashboardMetrics(adjustments, {
      activeLoB,
      origin: originFilter,
      destination: destFilter,
      material: materialFilter,
      startDate,
      endDate
    }),
  [adjustments, activeLoB, originFilter, destFilter, materialFilter, startDate, endDate]);

  const chartColor = lineaNegocio === 'INT' ? '#059669' : '#2563eb';

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Central de Reportes</h2>
        <p className="page-subtitle" style={{ marginBottom: '24px' }}>
          Análisis de flujo de materiales y rutas de almacén ({lineaNegocioLabel}).
        </p>

        {/* Filters Bar */}
        <div style={{ background: 'white', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>ALMACÉN ORIGEN</label>
            <select value={originFilter} onChange={e => setOriginFilter(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <option value="TODOS">Todos los Orígenes</option>
              {origins.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>ALMACÉN DESTINO</label>
            <select value={destFilter} onChange={e => setDestFilter(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <option value="TODOS">Todos los Destinos</option>
              {destinations.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>TIPO DE MATERIAL / SKU</label>
            <input 
              list="material-options"
              placeholder="Todas las Categorías..."
              value={materialFilter === 'TODOS' ? '' : materialFilter} 
              onChange={e => {
                const val = e.target.value;
                setMaterialFilter(val.trim() === '' ? 'TODOS' : val);
              }} 
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }} 
            />
            <datalist id="material-options">
              {materials.map(m => <option key={m} value={m} />)}
            </datalist>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <CustomDatePicker
              label="FECHA DESDE"
              placeholder="dd/mm/aaaa"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <CustomDatePicker
              label="FECHA HASTA"
              placeholder="dd/mm/aaaa"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          </div>
          <div>
            <button 
              type="button"
              onClick={() => { 
                setOriginFilter('TODOS'); 
                setDestFilter('TODOS'); 
                setMaterialFilter('TODOS');
                setStartDate(getDaysAgoStr(90));
                setEndDate(getTodayStr());
              }} 
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#f8fafc', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>UNIDADES MOVIDAS (TOTAL)</span>
              <Box size={16} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalUnits.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>MATERIAL MÁS MOVIDO</span>
              <TrendingUp size={16} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{topMaterial.sku !== '-' ? topMaterial.sku : 'N/A'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{topMaterial.count.toLocaleString()} unidades</div>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>RUTA DE MAYOR TRÁFICO</span>
              <Route size={16} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{topRoute.route !== '-' ? topRoute.route.split('|').slice(0,2).join(' -> ') : '-'}</div><div style={{ fontSize: '0.7rem', color: 'var(--primary-main)', fontWeight: 600 }}>{topRoute.route !== '-' ? topRoute.route.split('|')[2] + ' (' + topRoute.route.split('|')[3] + ')' : ''}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{topRoute.count > 0 ? (topRoute.count / totalUnits * 100).toFixed(1) : 0}% del volumen total</div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <BarChart2 size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>EVOLUCIÓN DE FLUJO VOLUMÉTRICO</span>
          </div>
          <div style={{ height: 300, width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: chartColor, fontWeight: 600 }}
                    formatter={(value: any) => [value + ' Un.', 'Volumen']}
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={0} width={40} />
                  <Area type="monotone" dataKey="Unidades" stroke={chartColor} strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No hay datos para mostrar con los filtros seleccionados
              </div>
            )}
          </div>
        </div>

        {/* Top Routes Matrix */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <Route size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>MATRIZ DE FLUJO DE MATERIALES (TOP RUTAS)</span>
          </div>
          
          {topRoutes.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0 8px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>Origen</th>
                  <th style={{ padding: '0 8px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>Destino</th>
                  <th style={{ padding: '0 8px 12px', textAlign: 'center', fontWeight: 700, letterSpacing: '0.5px' }}>Cód. Op.</th>
                  <th style={{ padding: '0 8px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>Tipo Movimiento</th>
                  <th style={{ padding: '0 8px 12px', textAlign: 'right', fontWeight: 700, letterSpacing: '0.5px' }}>Volumen</th>
                  <th style={{ padding: '0 8px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.5px' }}>Proporción (100%)</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.slice(0, 5).map((r, i) => {
                  const parts = r.route.split('|');
                  const origin = parts[0] || '-';
                  const dest = parts[1] || '-';
                  const action = parts[2] || '-';
                  const cod = parts[3] || 'N/A';
                  const percentage = ((r.count / totalUnits) * 100).toFixed(1);
                  return (
                    <tr key={i} style={{ borderBottom: i < Math.min(topRoutes.length, 5) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      <td style={{ padding: '12px 8px', width: '10%' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>{origin}</span>
                      </td>
                      <td style={{ padding: '12px 8px', width: '10%' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>{dest}</span>
                      </td>
                      <td style={{ padding: '12px 8px', width: '10%', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-main)', background: '#eff6ff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #bfdbfe' }}>{cod}</span>
                      </td>
                      <td style={{ padding: '12px 8px', width: '20%' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{action}</span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', width: '20%' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.count.toLocaleString()} unds</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{percentage}%</div>
                      </td>
                      <td style={{ padding: '12px 8px', width: '30%' }}>
                        <div style={{ width: '100%', background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                          <div style={{ width: percentage + '%', background: chartColor, height: '100%', borderRadius: '5px' }}></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No hay rutas registradas en el rango seleccionado
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Reports;