/**
 * Settings Event Service
 * Broadcasts configuration changes to other services
 */
import { BaseEventService, EventListenerConfig } from '../../shared/events/BaseEventService';
import { EventPayload } from '../../shared/events/types';

export type SettingsEventType = 
  | 'settings.updated'
  | 'settings.tax.updated'
  | 'settings.currency.updated'
  | 'settings.company.updated';

export class SettingsEventService extends BaseEventService {
  constructor() { super('settings-service'); }

  protected getEventListeners(): EventListenerConfig[] {
    return [
      // Settings service primarily emits, listens to admin events
    ];
  }

  emitSettingsUpdated(payload: { category: string; changes: Record<string, any> }): void {
    this.emit('settings.updated' as any, payload);
  }

  emitTaxSettingsUpdated(payload: { tax_rate: number; tax_inclusive: boolean }): void {
    this.emit('settings.tax.updated' as any, payload);
  }

  emitCurrencyUpdated(payload: { currency_code: string; symbol: string }): void {
    this.emit('settings.currency.updated' as any, payload);
  }

  emitCompanyUpdated(payload: { company_name: string; [key: string]: any }): void {
    this.emit('settings.company.updated' as any, payload);
  }
}

export const settingsEventService = new SettingsEventService();
