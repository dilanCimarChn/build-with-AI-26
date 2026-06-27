import { Component, computed, input } from '@angular/core';
import { TokenStats } from '../services/models';

@Component({
  selector: 'app-stats-panel',
  template: `
    <div class="card stats">
      <h3>⚡ Ahorro de tokens</h3>
      <div class="grid">
        <div class="stat raw">
          <span class="label">PDF directo</span>
          <span class="value">{{ format(stats().originalTokens) }}</span>
          <span class="unit">tokens</span>
        </div>
        <div class="arrow">→</div>
        <div class="stat md">
          <span class="label">Markdown</span>
          <span class="value">{{ format(stats().mdTokens) }}</span>
          <span class="unit">tokens</span>
        </div>
      </div>
      <div class="savings">
        <div class="bar"><div class="fill" [style.width.%]="stats().savingsPct"></div></div>
        <span class="pct">{{ stats().savingsPct }}% menos</span>
      </div>
      <p class="note">Enviamos solo el Markdown al modelo: más rápido y económico.</p>
    </div>
  `,
  styles: [`
    .stats h3 { margin: 0 0 1rem; }
    .grid { display: flex; align-items: center; gap: 1rem; justify-content: center; }
    .stat { display: flex; flex-direction: column; align-items: center; flex: 1;
      padding: 1rem; border-radius: 12px; }
    .stat.raw { background: color-mix(in srgb, var(--danger) 14%, transparent); }
    .stat.md { background: color-mix(in srgb, var(--success) 16%, transparent); }
    .label { font-size: .8rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .04em; }
    .value { font-size: 1.7rem; font-weight: 800; line-height: 1.1; }
    .unit { font-size: .78rem; color: var(--text-dim); }
    .arrow { font-size: 1.6rem; color: var(--text-dim); }
    .savings { margin-top: 1.1rem; display: flex; align-items: center; gap: .8rem; }
    .bar { flex: 1; height: 10px; background: var(--surface-3); border-radius: 999px; overflow: hidden; }
    .fill { height: 100%; background: linear-gradient(90deg, var(--success), var(--accent));
      border-radius: 999px; transition: width .6s ease; }
    .pct { font-weight: 800; color: var(--success); white-space: nowrap; }
    .note { font-size: .82rem; color: var(--text-dim); margin: .9rem 0 0; }
  `],
})
export class StatsPanelComponent {
  stats = input.required<TokenStats>();

  format(n: number): string {
    return n.toLocaleString('es-ES');
  }
}
