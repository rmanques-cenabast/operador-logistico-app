# 🏥 Visor de Operaciones Logísticas - CENABAST (Frontend)

<p align="left">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SAP-MM%20Integration-008FD3?logo=sap&logoColor=white" alt="SAP" />
</p>

> **Plataforma Web Interna de Auditoría, Control y Sincronización SAP**  
> *Uso exclusivo para equipos de Abastecimiento, Operaciones, Logística y Control de Calidad de CENABAST.*

---

## 📌 1. Propósito y Alcance del Sistema

Este aplicativo web es una **herramienta interna institucional de CENABAST** diseñada para monitorear, auditar y gestionar en tiempo real todas las transacciones físicas y documentales reportadas por los **Operadores Logísticos externos (3PL como Chilexpress, etc.)**.

El visor permite a los equipos internos supervisar el ciclo de vida completo de los medicamentos e insumos médicos: desde la llegada de un preaviso y la recepción física en bodega, hasta la validación de facturas y la contabilización automática en el **ERP SAP**.

```
  [ Operador Logístico Externo (WMS) ]
                 │
                 ▼ (Envío de datos vía API)
┌────────────────────────────────────────────────────────┐
│             API OPERADOR LOGÍSTICO (Node.js)           │
└────────────────────────┬───────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌────────────────────────┐      ┌────────────────────────┐
│   🖥️ VISOR CENABAST    │      │  ⚙️ WORKERS BAPI SAP   │
│  (Este Proyecto Web)   │      │  (Sincronización .NET) │
│ - Auditoría Inbound    │      └───────────┬────────────┘
│ - Control Inventario   │                  │
│ - Liberación a SAP     │                  ▼
│ - Gestión Documental   │      ┌────────────────────────┐
└────────────────────────┘      │     🏥 SAP CENABAST    │
                                └────────────────────────┘
```

---

## ✨ 2. Módulos y Funcionalidades Principales

### 📥 A. Entrada de Mercadería (Inbound)
- **Preavisos de Entrega:** Monitoreo de órdenes de compra (OC), cantidades esperadas vs. recibidas, lotes y fechas de vencimiento.
- **Carga de Preavisos por Perfil:** Carga masiva de planillas segmentando automáticamente por canal (*Intermediación / Línea 22* o *Farmacias Privadas*).
- **Recepciones y Entregas Parciales:** Trazabilidad de cada entrega parcial realizada en la bodega del operador.
- **Gestión Documental Tributaria:** Visualización y descarga de facturas tributarias adjuntas, con enlace directo al documento de material en SAP.
- **Liberación Controlada a SAP:** Flujo de aprobación para compras de Intermediación que requieren visto bueno antes de contabilizar en SAP.

### 📦 B. Ajustes y Movimientos de Inventario
- **Registros Históricos:** Trazabilidad de todas las reclasificaciones y movimientos físicos de stock reportados por el operador.
- **Tipos de Movimientos Soportados:**
  - **Traspasos entre Bodegas (`311`):** Movimiento entre almacenes del mismo centro.
  - **Cambios de Estado de Calidad (`321`, `322`):** Traspaso de Inspección de Calidad a Libre Utilización o viceversa.
  - **Bloqueos y Desbloqueos (`343`, `344`):** Bloqueo preventivo por cuarentena o control de calidad.
  - **Mermas y Ajustes por Inventario (`711`, `712`, `555`):** Diferencias de conteo y bajas operativas.
  - **Muestreos ISP (`331`, `332`):** Destino de unidades para ensayos de laboratorio del Instituto de Salud Pública.
- **Flujo Visual de Stock:** Ilustración gráfica que detalla el paso de unidades entre *Stock Origen (Libre/Calidad)* y *Stock Destino (Bloqueado/Libre)*.

### 🔍 C. Auditoría y Trazabilidad SAP
- **Estado de Sincronización en Tiempo Real:** Identificación de registros *Sincronizados (Doc. Material generado)*, *Pendientes* o *En Supervisión / Error*.
- **Visor de Logs Transaccionales:** Acceso al payload exacto enviado a SAP y a la respuesta devuelta por las BAPIs de SAP MM.
- **Control por Operario:** Identificación del usuario y marca de tiempo exacta de cada movimiento.

---

## 🛠️ 3. Stack Tecnológico

| Capa / Herramienta | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Framework UI** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Construcción modular con tipado estático estricto |
| **Empaquetador** | [Vite 8](https://vite.dev/) | Compilación ultrarrápida y Hot Module Replacement (HMR) |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) + CSS Custom | Diseño moderno, responsivo y adaptado al estándar Cenabast |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Set de íconos vectoriales livianos y consistentes |
| **Gráficos y Métricas** | [Recharts](https://recharts.org/) | Visualización interactiva de movimientos y volúmenes |
| **Enrutamiento** | [React Router 7](https://reactrouter.com/) | Gestión de rutas y navegación en SPA |

---

## ⚙️ 4. Variables de Entorno

Crea un archivo `.env` o `.env.local` en la raíz del proyecto para definir la conexión con la API:

```ini
# URL base de la API Backend (Local o Servidor)
VITE_API_BASE_URL=http://localhost:3000

# Clave de autenticación API Key
VITE_API_KEY=tu_api_key_aqui
```

| Variable | Descripción | Ejemplo Local | Ejemplo Servidor |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | URL base del backend | `http://localhost:3000` | `/operador-logistico-api` |
| `VITE_API_KEY` | Clave de acceso autorizada | `tu_api_key_local` | *(Inyectada en servidor)* |

> **Nota:** Por defecto en desarrollo local (`npm run dev`), si no se especifica `.env`, la aplicación se conecta automáticamente a `http://localhost:3000`.

---

## 🚀 5. Instalación y Ejecución Local

### Prerrequisitos:
- **Node.js** (Versión 18 o superior recomendada)
- **npm** o **yarn**
- Backend (`operador-logistico-api`) activo.

### Pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-organizacion/operador-logistico-app.git
   cd operador-logistico-app
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Genera los archivos estáticos optimizados en el directorio `dist/` para su despliegue en servidores web.

---

## 🔒 6. Seguridad y Buenas Prácticas

- **Cero exposición de credenciales SAP:** El frontend nunca se comunica directamente con SAP; todas las solicitudes viajan autenticadas a la API Express intermediaria.
- **Trazabilidad de Acciones:** Todas las liberaciones de pedidos y descargas de documentos registran el usuario ejecutor.
- **Validación de Integridad:** Se asegura la coherencia de datos entre lo registrado por el operador y lo contabilizado en las tablas maestras de CENABAST.

---

<div align="center">
  <sub>Desarrollado para el Departamento de Tecnologías de la Información y Logística — <b>CENABAST</b></sub>
</div>
