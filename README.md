# Operador Logístico - App (Frontend)

Este es el frontend de la plataforma del Operador Logístico, una aplicación web moderna diseñada para gestionar y visualizar las operaciones de inventario, traspasos, mermas y movimientos de stock integrados con SAP.

## Tecnologías Utilizadas

- **React.js** - Librería principal para la construcción de interfaces de usuario.
- **Vite** - Herramienta de compilación rápida y empaquetado.
- **TypeScript** - Superconjunto de JavaScript que añade tipado estático.
- **Recharts** - Librería para la visualización de datos y gráficos interactivos.
- **Lucide React** - Set de íconos modernos y ligeros.

## Características Principales

- **Gestión de Inventario (Movimientos Generales):** Visualización completa de los registros de stock.
- **Reubicaciones y Traspasos (311, 343, 344):** Control específico de traspasos físicos y cambios de estado (Bloqueos, Liberaciones).
- **Mermas, Conteos y Muestras:** Segmentación de las operaciones del almacén a través de diferentes vistas y pestañas.
- **Gráficos Analíticos:** Seguimiento visual del flujo de materiales y las cantidades operadas a lo largo de los días (ej: últimos 7, 14 o 30 días).
- **Integración con SAP:** Visibilidad sobre el estado de cada movimiento respecto a su sincronización con SAP (Pendientes, Errores y Procesados con éxito).

## Requisitos Previos

Asegúrate de tener instalado en tu máquina local:
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- npm o yarn

## Instalación y Uso Local

1. Clona este repositorio:
   ```bash
   git clone https://github.com/rmanques-cenabast/operador-logistico-app.git
   ```

2. Navega al directorio del proyecto:
   ```bash
   cd operador-logistico-app
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación (el puerto podría variar dependiendo de Vite).

## Estructura del Proyecto

El código fuente principal se encuentra en la carpeta `/src`, donde destacan los siguientes directorios:
- `/src/pages/`: Contiene las vistas principales (por ejemplo, `Inventory.tsx`).
- `/src/components/`: Componentes modulares reutilizables a lo largo de la app (Modales, Headers, Tablas, etc.).

## Notas de Desarrollo

- Si utilizas variables de entorno, asegúrate de crear tu archivo `.env.local` y no subirlo al repositorio.
- Este proyecto se conecta a la API Backend de `operador-logistico-api`. Para un funcionamiento completo, asegúrate de tener el backend corriendo en el puerto `3000`.

---
*Desarrollado para la gestión logística avanzada.*
