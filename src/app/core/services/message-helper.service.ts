import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class MessageHelperService {
  constructor(private readonly messageService: MessageService) {}

  success(message: string, summary = 'Éxito'): void {
    this._add('success', summary, message);
  }

  error(message: string, summary = 'Error'): void {
    this._add('error', summary, message);
  }

  warning(message: string, summary = 'Advertencia'): void {
    this._add('warn', summary, message);
  }

  info(message: string, summary = 'Información'): void {
    this._add('info', summary, message);
  }

  clear(): void {
    this.messageService.clear();
  }

  private _add(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail, life: 3000 });
  }
}
