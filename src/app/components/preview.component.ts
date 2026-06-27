import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  template: `
    <div class="card preview">
      <div class="bar">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="addr">tu-landing.html</span>
      </div>
      <iframe
        title="Vista previa de la landing"
        [srcdoc]="safeHtml()"
        sandbox="allow-scripts allow-popups allow-same-origin"
      ></iframe>
    </div>
  `,
  styles: [`
    .preview { padding: 0; overflow: hidden; }
    .bar { display: flex; align-items: center; gap: .8rem; padding: .6rem .9rem;
      background: var(--surface-3); border-bottom: 1px solid var(--border); }
    .dots { display: flex; gap: .35rem; }
    .dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--border); display: block; }
    .addr { font-size: .8rem; color: var(--text-dim); }
    iframe { width: 100%; height: 70vh; border: 0; background: #fff; display: block; }
  `],
})
export class PreviewComponent {
  html = input.required<string>();
  private sanitizer = inject(DomSanitizer);

  safeHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.html()),
  );
}
