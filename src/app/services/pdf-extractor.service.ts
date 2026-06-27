import { Injectable } from '@angular/core';
import { ExtractionResult, PdfLink, Span } from './models';

// pdf.js (equivalente en navegador a PyMuPDF/fitz para la Etapa 2).
import * as pdfjsLib from 'pdfjs-dist';

// El worker se copia a la raíz del build (ver angular.json -> assets).
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdf.worker.min.mjs',
  document.baseURI,
).toString();

/**
 * Etapa 2 — Extracción estructurada.
 * Recorre cada página del PDF y obtiene, por cada fragmento (span):
 *  - texto
 *  - tamaño de fuente (jerarquía)
 *  - estilo negrita/itálica (heurística por nombre de fuente)
 *  - coordenadas X/Y (orden de lectura)
 * Además extrae los hipervínculos de las anotaciones.
 */
@Injectable({ providedIn: 'root' })
export class PdfExtractorService {
  async extract(file: File): Promise<ExtractionResult> {
    const buffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
      .promise;

    const spans: Span[] = [];
    const links: PdfLink[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);

      // --- Texto + estilos ---
      const content = await page.getTextContent();
      const styles: Record<string, { fontFamily?: string }> =
        content.styles as any;

      for (const item of content.items as any[]) {
        const text: string = item.str ?? '';
        if (!text.trim()) continue;

        const tr = item.transform as number[]; // [a, b, c, d, e, f]
        const fontSize = Math.round(Math.hypot(tr[2], tr[3]));
        const fontFamily = (styles[item.fontName]?.fontFamily ?? '').toLowerCase();
        const fontName = (item.fontName ?? '').toLowerCase();
        const styleHint = fontFamily + ' ' + fontName;

        spans.push({
          text,
          fontSize,
          bold: /bold|black|heavy|semibold|600|700|800|900/.test(styleHint),
          italic: /italic|oblique/.test(styleHint),
          x: tr[4],
          y: tr[5],
          page: pageNum,
        });
      }

      // --- Hipervínculos (anotaciones) ---
      try {
        const annotations = await page.getAnnotations();
        for (const ann of annotations as any[]) {
          if (ann.subtype === 'Link' && ann.url) {
            links.push({ text: ann.url, url: ann.url });
          }
        }
      } catch {
        // Anotaciones opcionales; ignorar si fallan.
      }

      page.cleanup();
    }

    return {
      spans,
      links: this.dedupeLinks(links),
      fileSize: file.size,
      pageCount: doc.numPages,
    };
  }

  private dedupeLinks(links: PdfLink[]): PdfLink[] {
    const seen = new Set<string>();
    return links.filter((l) => {
      if (seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });
  }
}
