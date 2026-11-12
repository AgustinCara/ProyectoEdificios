# InmoView

Visualizador interactivo de inventario inmobiliario: el comprador recorre la fachada del edificio
(o el masterplan del loteo), entra a cada planta, ve precio y disponibilidad de cada unidad,
simula la financiación y reserva o consulta por WhatsApp.

## Funcionalidades

- **Fachada interactiva**: cada piso muestra su precio "desde" y lleva a su planta.
- **Planta / masterplan** con unidades coloreadas por estado (disponible, reservado, vendido).
  Zoom y desplazamiento con mouse o con los dedos (pellizcar para ampliar).
- **Filtros** por estado, ambientes y orden por precio o superficie.
- **Ficha de unidad** con precio por m², especificaciones y **simulador de financiación**
  (anticipo + cuotas, con o sin interés).
- **Reserva online** con formulario y aviso por WhatsApp al equipo de ventas.
- **Links para compartir**: `?proyecto=torre-mirador&unidad=4A` abre directo esa unidad.
- Diseño adaptado a celular.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
npm run dev:host   # además lo expone en la red local, para probar desde el celular
npm run build      # genera la versión de producción en dist/
npm run lint
```

Para probar en el celular: `npm run dev:host`, y con el teléfono en el mismo wifi abrir la
dirección `Network` que muestra la terminal.

### Herramientas internas

Agregando `?admin` a la URL aparecen el **Mapeador** (para trazar polígonos sobre planos y
renders), **Reset** de datos y **Simulación** de cambios de estado en tiempo real.

## Variables de entorno

| Variable | Para qué |
|---|---|
| `VITE_SITE_URL` | URL pública del sitio, sin barra final (ej: `https://inmoview.com.ar`). Se usa para la imagen de vista previa al compartir el link en WhatsApp y redes, que necesita una dirección absoluta. |

Se configura en el hosting o en un archivo `.env.production.local` (no se sube al repositorio).

## Estructura

```
src/
  components/   Header, FacadeViewer, Viewer (planta), Sidebar, UnitDrawer,
                FinancingCalculator, ReservationModal, PolygonMapper (admin)
  data/         Datos de ejemplo: proyectos, unidades, fachadas y planos
  hooks/        useInventory (datos + filtros), usePanZoom (zoom y desplazamiento)
  services/     realEstateService: acceso a datos (hoy en memoria, preparado para una API)
  types/        Modelo de datos (Project, Unit, FacadeMap, VectorMapDef, FinancingPlan…)
  utils/        Formato de precios, links/WhatsApp, cálculo de financiación
  styles/       CSS por área + responsive.css para pantallas chicas
```

### Agregar un proyecto

Todo se define en `src/data/`: el proyecto en `mockProjects.ts` con sus unidades, su plano
(`floorPlan`, ver `vectorMaps.ts`), su fachada opcional (`facade`, ver `facadeMaps.ts`) y sus
condiciones de financiación (`financing`). Cada unidad se vincula a su polígono del plano por
`graphicId`.

## Estado actual

Los datos son de ejemplo y viven en memoria: las reservas se pierden al recargar la página.
El próximo paso es conectar un backend que guarde las reservas como solicitudes a confirmar
por un asesor.
