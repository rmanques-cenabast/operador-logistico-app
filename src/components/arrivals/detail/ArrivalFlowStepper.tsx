import React from 'react';
import { CheckCircle } from 'lucide-react';

export const ArrivalFlowStepper: React.FC = () => {
  return (
    <>
      <div 
        className="panel-section-title" 
        style={{ marginTop: '0', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#475569', letterSpacing: '1px' }}
      >
        ESTADO DEL FLUJO DE INGRESO
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '56px', marginTop: '20px', padding: '0 70px' }}>
        {/* Step 1 */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
            <CheckCircle size={20} />
          </div>
          <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 600, color: '#059669', width: '160px', textAlign: 'center' }}>
            PENDIENTE RECEPCIÓN
          </div>
        </div>

        {/* Line 1 */}
        <div style={{ flex: 1, height: '4px', background: '#e2e8f0', margin: '0 8px', position: 'relative', borderRadius: '2px' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', background: '#10b981', borderRadius: '2px' }}></div>
        </div>

        {/* Step 2 (Final) */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 2 }}>
            <CheckCircle size={20} />
          </div>
          <div style={{ position: 'absolute', top: '44px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', fontWeight: 600, color: '#059669', width: '120px', textAlign: 'center' }}>
            RECIBIDO EN OL
          </div>
        </div>
      </div>
    </>
  );
};
