# DestinAI 🌐

Convierte un **PDF** (folleto, guía turística, catálogo) en una **landing page
profesional** lista para descargar — sin escribir nada. Solo arrastras el PDF.

Hecho con **Angular** + **Gemini**. 100 % en el navegador, sin backend.

> Hackathon GDG La Paz — Build with AI 2026

---

## ✨ Qué hace

1. **Arrastras un PDF** con capa de texto (no escaneado).
2. La app lo lee con **pdf.js** y reconstruye su estructura (títulos, párrafos,
   listas, enlaces) a **Markdown**.
3. Muestra el **ahorro de tokens**: PDF crudo → Markdown (normalmente >90 %).
4. Envía solo el Markdown a **Gemini**, que genera una landing page HTML
   autocontenida con **paleta de colores temática** según el contenido.
5. **Previsualizas** la landing en un iframe y la **descargas** como `index.html`
   o **copias** el código.

El diferenciador: convertir a Markdown antes de llamar a la IA reduce
drásticamente los tokens → más rápido y más barato.

---

## 🚀 Cómo ejecutar

Requisitos: **Node 18+** (probado con Node 22).

```bash
cd pdf2landing
npm install
npm start          # = ng serve
```

Abre **http://localhost:4200**.

### Build de producción

```bash
npm run build      # genera dist/pdf2landing/browser  (sitio estático)
```

Despliega esa carpeta en Vercel, Netlify o GitHub Pages.

---

## 🔑 API key de Gemini

No hay backend, así que la key se pega **en la propia interfaz**:

1. Consíguela gratis en https://aistudio.google.com/apikey
2. Pégala en el campo **“API key de Gemini”** (puedes marcar *Recordar* para
   guardarla en `localStorage`).

> La key solo se usa desde tu navegador hacia la API de Gemini. Para una demo
> está bien; para producción conviene un backend que oculte la key.

El modelo por defecto es `gemini-2.5-flash`. Para cambiarlo, edita
`defaultModel` en [`src/app/services/gemini.service.ts`](src/app/services/gemini.service.ts).

---

## 🧱 Arquitectura

```
src/app/
├── app.ts / app.html / app.css        # Página única + orquestación del pipeline
├── components/
│   ├── api-key.component.ts            # Campo de API key (+ recordar)
│   ├── dropzone.component.ts           # Arrastrar/seleccionar PDF
│   ├── stats-panel.component.ts        # Panel de ahorro de tokens
│   ├── preview.component.ts            # Vista previa en iframe (srcdoc)
│   └── result-actions.component.ts     # Descargar / copiar HTML
└── services/
    ├── pdf-extractor.service.ts        # Etapa 2: pdf.js → spans estructurados
    ├── markdown.service.ts             # Etapa 3: reglas → Markdown
    ├── gemini.service.ts               # Etapa 4: llamada a Gemini
    ├── token.service.ts               # Estimación de tokens / ahorro
    ├── prompt.ts                       # System prompt de generación
    └── models.ts                       # Tipos compartidos
```

### Pipeline

| Etapa | Dónde | Qué hace |
|-------|-------|----------|
| 2. Extracción | `pdf-extractor.service` | Texto + tamaño de fuente + negrita/itálica + coordenadas + enlaces |
| 3. Markdown | `markdown.service` | Árbol de reglas por umbrales → `#`, `##`, listas, párrafos, `[texto](url)` |
| 4. IA | `gemini.service` | Markdown + system prompt → HTML autocontenido |
| 5. Entrega | `preview` / `result-actions` | Iframe, descarga, copiar |

---

## ⚠️ Limitaciones

- **Solo PDFs con capa de texto.** Los escaneados (imágenes) no funcionan; harían
  falta OCR.
- La detección de **negrita/itálica** es heurística (según el nombre de la fuente
  embebida); la jerarquía por **tamaño de fuente** es lo más fiable.
- La key vive en el navegador (apropiado para demo, no para producción).
