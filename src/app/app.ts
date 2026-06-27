import { Component, computed, inject, signal } from '@angular/core';
import { DropzoneComponent } from './components/dropzone.component';
import { StatsPanelComponent } from './components/stats-panel.component';
import { PreviewComponent } from './components/preview.component';
import { ResultActionsComponent } from './components/result-actions.component';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { MarkdownService } from './services/markdown.service';
import { GeminiService } from './services/gemini.service';
import { TokenService } from './services/token.service';
import { DeployService } from './services/deploy.service';
import { TokenStats } from './services/models';

type Phase = 'idle' | 'extracting' | 'generating' | 'done' | 'error';
type PublishState = 'idle' | 'publishing' | 'published' | 'failed';

@Component({
  selector: 'app-root',
  imports: [
    DropzoneComponent,
    StatsPanelComponent,
    PreviewComponent,
    ResultActionsComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private extractor = inject(PdfExtractorService);
  private markdownSvc = inject(MarkdownService);
  private gemini = inject(GeminiService);
  private tokens = inject(TokenService);
  private deployer = inject(DeployService);

  phase = signal<Phase>('idle');
  fileName = signal('');
  errorMsg = signal('');

  markdown = signal('');
  stats = signal<TokenStats | null>(null);
  html = signal('');
  showMarkdown = signal(false);

  // Despliegue automático.
  publishState = signal<PublishState>('idle');
  liveUrl = signal('');
  publishMsg = signal('');

  busy = computed(() => this.phase() === 'extracting' || this.phase() === 'generating');
  statusText = computed(() => {
    switch (this.phase()) {
      case 'extracting': return 'Extrayendo texto y estructura del PDF…';
      case 'generating': return 'Generando la landing con Gemini…';
      default: return '';
    }
  });

  async onFile(file: File): Promise<void> {
    this.reset();
    this.fileName.set(file.name);

    try {
      // Etapas 2 y 3: extracción + Markdown (en el navegador).
      this.phase.set('extracting');
      const extraction = await this.extractor.extract(file);
      const md = this.markdownSvc.toMarkdown(extraction);

      if (!md.trim()) {
        this.fail('No se encontró texto en el PDF. ¿Es un PDF escaneado? Necesita capa de texto.');
        return;
      }

      this.markdown.set(md);
      this.stats.set(this.tokens.buildStats(extraction.fileSize, md));

      // Etapa 4: generación con IA.
      this.phase.set('generating');
      const html = await this.gemini.generateLanding(md);
      this.html.set(html);
      this.phase.set('done');

      // Etapa 6: despliegue automático (no bloquea la vista previa).
      void this.publish(html, md);
    } catch (e: any) {
      this.fail(e?.message ?? 'Ocurrió un error inesperado.');
    }
  }

  /** Sube la landing a GitHub Pages y expone la URL pública. */
  private async publish(html: string, markdown: string): Promise<void> {
    this.publishState.set('publishing');
    this.publishMsg.set('');
    try {
      const title = markdown.split('\n').find((l) => l.startsWith('#')) ?? 'landing';
      const url = await this.deployer.deploy(html, title);
      this.liveUrl.set(url);
      this.publishState.set('published');
    } catch (e: any) {
      this.publishMsg.set(e?.message ?? 'No se pudo publicar.');
      this.publishState.set('failed');
    }
  }

  /** Reintenta el despliegue manualmente. */
  republish(): void {
    if (this.html()) void this.publish(this.html(), this.markdown());
  }

  startOver(): void {
    this.reset();
    this.fileName.set('');
  }

  private reset(): void {
    this.phase.set('idle');
    this.errorMsg.set('');
    this.markdown.set('');
    this.stats.set(null);
    this.html.set('');
    this.showMarkdown.set(false);
    this.publishState.set('idle');
    this.liveUrl.set('');
    this.publishMsg.set('');
  }

  private fail(msg: string): void {
    this.errorMsg.set(msg);
    this.phase.set('error');
  }
}
