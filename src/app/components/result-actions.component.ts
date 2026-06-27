import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-result-actions',
  template: `
    <div class="actions">
      <button class="primary" (click)="download()">Descargar HTML</button>
      <button class="secondary" (click)="copy()">
        {{ copied() ? 'Copiado' : 'Copiar código' }}
      </button>
    </div>
  `,
  styles: [`
    .actions { display: flex; flex-direction: column; gap: .75rem; width: 100%; }
    button { width: 100%; padding: .8rem 1.3rem; border-radius: 12px; font-weight: 700;
      font-size: .95rem; cursor: pointer; border: 1px solid var(--border); transition: .15s; text-align: center; }
    button:hover { transform: translateY(-1px); }
    .primary { background: var(--accent); color: #fff; border-color: transparent; }
    .secondary { background: var(--surface-2); color: var(--text); }
  `],
})
export class ResultActionsComponent {
  html = input.required<string>();
  copied = signal(false);

  download(): void {
    const blob = new Blob([this.html()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.html());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.copied.set(false);
    }
  }
}
