import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview',
  template: `
    <div class="preview-container">
      <div class="preview-workspace">
        
        <!-- Fila superior: Celulares (iPhone y Android) -->
        <div class="mobiles-row">
          <!-- iPhone -->
          <div class="device-iphone">
            <div class="iphone-frame">
              <div class="iphone-dynamic-island"></div>
              <div class="iphone-screen">
                <iframe
                  title="Vista previa iPhone"
                  [srcdoc]="safeHtml()"
                  sandbox="allow-scripts allow-popups allow-same-origin"
                ></iframe>
              </div>
              <div class="iphone-home-indicator"></div>
            </div>
            <div class="device-label">iPhone (iOS)</div>
          </div>

          <!-- Android -->
          <div class="device-android">
            <div class="android-frame">
              <div class="android-camera"></div>
              <div class="android-screen">
                <iframe
                  title="Vista previa Android"
                  [srcdoc]="safeHtml()"
                  sandbox="allow-scripts allow-popups allow-same-origin"
                ></iframe>
              </div>
            </div>
            <div class="device-label">Android Mobile</div>
          </div>
        </div>

        <!-- Fila inferior: Laptop -->
        <div class="device-laptop">
          <div class="laptop-screen">
            <div class="browser-bar">
              <span class="browser-dots"><i></i><i></i><i></i></span>
              <span class="browser-address">localhost:4200/preview</span>
            </div>
            <iframe
              title="Vista previa Laptop"
              [srcdoc]="safeHtml()"
              sandbox="allow-scripts allow-popups allow-same-origin"
            ></iframe>
          </div>
          <div class="laptop-base"></div>
          <div class="device-label">Ordenador / Laptop</div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      margin-top: 1.5rem;
    }

    /* Área de Trabajo */
    .preview-workspace {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
      width: 100%;
    }

    /* Etiquetas de dispositivo */
    .device-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.75rem;
      text-align: center;
      pointer-events: none;
    }

    /* --- Mockup Laptop (PC) --- */
    .device-laptop {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .laptop-screen {
      width: 100%;
      background: #0d0b15;
      border-radius: 16px 16px 0 0;
      padding: 8px 8px 0;
      border: 1px solid var(--border);
      box-shadow: 0 10px 30px rgba(54, 47, 79, 0.05);
    }
    .browser-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--surface-2);
      padding: 6px 14px;
      border-radius: 8px 8px 0 0;
      border-bottom: 1px solid var(--border);
      pointer-events: none;
    }
    .browser-dots {
      display: flex;
      gap: 5px;
    }
    .browser-dots i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--border);
      display: block;
    }
    .browser-address {
      font-size: 10px;
      color: var(--text-dim);
      background: var(--surface-3);
      padding: 2px 18px;
      border-radius: 12px;
      font-family: monospace;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .laptop-screen iframe {
      width: 100%;
      height: 600px;
      border: 0;
      background: #ffffff;
      display: block;
      pointer-events: auto;
    }
    .laptop-base {
      width: 104%;
      height: 12px;
      background: #cbdad8;
      border: 1px solid var(--border);
      border-top: none;
      border-radius: 0 0 16px 16px;
      position: relative;
      box-shadow: 0 10px 20px rgba(54, 47, 79, 0.05);
      pointer-events: none;
    }
    .laptop-base::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 70px;
      height: 4px;
      background: rgba(54, 47, 79, 0.2);
      border-radius: 0 0 4px 4px;
    }

    /* --- Fila Móvil --- */
    .mobiles-row {
      display: flex;
      gap: 3rem;
      justify-content: center;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 100%;
    }

    /* --- Mockup iPhone --- */
    .device-iphone {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .iphone-frame {
      width: 300px;
      height: 560px;
      background: #08060c;
      border: 10px solid #1a1724;
      border-radius: 38px;
      box-shadow: 0 20px 45px rgba(54, 47, 79, 0.08);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .iphone-dynamic-island {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 74px;
      height: 16px;
      background: #000000;
      border-radius: 20px;
      z-index: 10;
      pointer-events: none;
    }
    .iphone-screen {
      flex: 1;
      background: #ffffff;
      border-radius: 28px;
      overflow: hidden;
      position: relative;
    }
    .iphone-screen iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      pointer-events: auto;
    }
    .iphone-home-indicator {
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 90px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 2px;
      z-index: 10;
      pointer-events: none;
    }

    /* --- Mockup Android --- */
    .device-android {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .android-frame {
      width: 310px;
      height: 560px;
      background: #08060c;
      border: 8px solid #1f1b2e;
      border-radius: 24px;
      box-shadow: 0 20px 45px rgba(54, 47, 79, 0.08);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .android-camera {
      position: absolute;
      top: 9px;
      left: 50%;
      transform: translateX(-50%);
      width: 7px;
      height: 7px;
      background: #000000;
      border-radius: 50%;
      z-index: 10;
      pointer-events: none;
    }
    .android-screen {
      flex: 1;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
    }
    .android-screen iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
      pointer-events: auto;
    }
  `],
})
export class PreviewComponent {
  html = input.required<string>();
  private sanitizer = inject(DomSanitizer);

  safeHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.html()),
  );
}
