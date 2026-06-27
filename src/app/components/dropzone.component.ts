import { Component, ElementRef, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-dropzone',
  template: `
    <div
      class="dropzone"
      [class.dragging]="dragging()"
      [class.disabled]="disabled"
      (click)="!disabled && fileInput().nativeElement.click()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <input #fileInputEl type="file" accept="application/pdf,.pdf" hidden
             (change)="onSelect($event)" />
      <p class="title">Arrastra tu PDF aquí</p>
      <p class="sub">o haz clic para seleccionarlo · solo PDF con texto</p>
      @if (error()) {
        <p class="err">Error: {{ error() }}</p>
      }
    </div>
  `,
  styles: [`
    .dropzone {
      border: 2px dashed var(--border); border-radius: 18px; padding: 3rem 1.5rem;
      text-align: center; cursor: pointer; transition: .2s; background: var(--surface-2);
    }
    .dropzone:hover { border-color: var(--accent); background: var(--surface-3); }
    .dropzone.dragging { border-color: var(--accent); background: var(--surface-3);
      transform: scale(1.01); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent); }
    .dropzone.disabled { opacity: .5; pointer-events: none; }
    .icon { font-size: 2.6rem; margin-bottom: .6rem; }
    .title { font-size: 1.2rem; font-weight: 700; margin: .2rem 0; }
    .sub { color: var(--text-dim); margin: .2rem 0; font-size: .9rem; }
    .err { color: var(--danger); font-weight: 600; margin-top: .8rem; }
  `],
})
export class DropzoneComponent {
  disabled = false;
  fileSelected = output<File>();

  fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInputEl');
  dragging = signal(false);
  error = signal('');

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled) this.dragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    if (this.disabled) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handle(file);
  }

  onSelect(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handle(file);
    (e.target as HTMLInputElement).value = '';
  }

  private handle(file: File): void {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      this.error.set('Ese archivo no es un PDF.');
      return;
    }
    this.error.set('');
    this.fileSelected.emit(file);
  }
}
