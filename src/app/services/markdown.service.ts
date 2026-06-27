import { Injectable } from '@angular/core';
import { ExtractionResult, Span } from './models';

interface Line {
  page: number;
  y: number;
  maxFontSize: number;
  anyBold: boolean;
  anyItalic: boolean;
  text: string;
}

/**
 * Etapa 3 — Conversión a Markdown mediante un árbol de reglas por umbrales.
 * Reconstruye líneas a partir de los spans (por coordenadas), infiere la
 * jerarquía a partir del tamaño de fuente relativo al cuerpo, detecta listas
 * y saltos de párrafo. El resultado es compacto y preserva la semántica.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  toMarkdown(extraction: ExtractionResult): string {
    const lines = this.buildLines(extraction.spans);
    if (lines.length === 0) return '';

    const bodySize = this.bodyFontSize(lines);
    const out: string[] = [];
    let prevLine: Line | null = null;

    for (const line of lines) {
      // Salto de párrafo: cambio de página o hueco vertical grande.
      if (prevLine) {
        const sameColumnGap = prevLine.y - line.y;
        const newPage = line.page !== prevLine.page;
        if (newPage || sameColumnGap > bodySize * 1.6) {
          out.push('');
        }
      }

      out.push(this.renderLine(line, bodySize));
      prevLine = line;
    }

    let md = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();

    // Anexar enlaces detectados (CTAs / redes / mapa).
    if (extraction.links.length > 0) {
      md += '\n\n## Enlaces\n';
      for (const link of extraction.links) {
        md += `\n- [${link.text}](${link.url})`;
      }
    }

    return md;
  }

  /** Agrupa spans en líneas según página y proximidad vertical. */
  private buildLines(spans: Span[]): Line[] {
    if (spans.length === 0) return [];

    // Orden de lectura: página asc, Y desc (arriba primero), X asc.
    const sorted = [...spans].sort((a, b) => {
      if (a.page !== b.page) return a.page - b.page;
      if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
      return a.x - b.x;
    });

    const lines: Line[] = [];
    let current: { page: number; y: number; spans: Span[] } | null = null;

    for (const span of sorted) {
      const sameLine =
        current &&
        current.page === span.page &&
        Math.abs(current.y - span.y) <= Math.max(3, span.fontSize * 0.5);

      if (sameLine) {
        current!.spans.push(span);
      } else {
        if (current) lines.push(this.collapseLine(current.spans, current.page, current.y));
        current = { page: span.page, y: span.y, spans: [span] };
      }
    }
    if (current) lines.push(this.collapseLine(current.spans, current.page, current.y));

    return lines.filter((l) => l.text.trim().length > 0);
  }

  private collapseLine(spans: Span[], page: number, y: number): Line {
    const ordered = [...spans].sort((a, b) => a.x - b.x);
    const text = ordered
      .map((s) => s.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      page,
      y,
      maxFontSize: Math.max(...spans.map((s) => s.fontSize)),
      anyBold: spans.some((s) => s.bold),
      anyItalic: spans.some((s) => s.italic),
      text,
    };
  }

  /** Tamaño de fuente del cuerpo = el más frecuente entre las líneas. */
  private bodyFontSize(lines: Line[]): number {
    const freq = new Map<number, number>();
    for (const l of lines) {
      freq.set(l.maxFontSize, (freq.get(l.maxFontSize) ?? 0) + l.text.length);
    }
    let best = 12;
    let bestCount = -1;
    for (const [size, count] of freq) {
      if (count > bestCount) {
        best = size;
        bestCount = count;
      }
    }
    return best || 12;
  }

  private renderLine(line: Line, bodySize: number): string {
    let text = line.text;

    // Listas: viñeta explícita o guion al inicio.
    const bulletMatch = text.match(/^[•·▪◦‣*\-–]\s+(.*)$/);
    if (bulletMatch) {
      return `- ${this.emphasize(bulletMatch[1], line)}`;
    }

    // Jerarquía por tamaño relativo (umbrales tipo árbol de decisión).
    if (line.maxFontSize >= bodySize * 1.8 || line.maxFontSize > 20) {
      return `# ${text}`;
    }
    if (line.maxFontSize >= bodySize * 1.35 || line.maxFontSize > 14) {
      return `## ${text}`;
    }
    if (line.maxFontSize >= bodySize * 1.15) {
      return `### ${text}`;
    }

    return this.emphasize(text, line);
  }

  private emphasize(text: string, line: Line): string {
    if (line.anyBold) return `**${text}**`;
    if (line.anyItalic) return `*${text}*`;
    return text;
  }
}
