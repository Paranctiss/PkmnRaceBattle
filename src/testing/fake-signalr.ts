import {Provider} from '@angular/core';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {SignalRService} from '../app/core/services/SignalR/signal-r.service';

export interface Invocation {
  method: string;
  args: any[];
}

// Remplace la HubConnection SignalR : enregistre les appels au serveur et permet de simuler ses événements
export class FakeHubConnection {
  readonly handlers = new Map<string, ((...args: any[]) => void)[]>();
  readonly invocations: Invocation[] = [];

  on(eventName: string, callback: (...args: any[]) => void): void {
    const list = this.handlers.get(eventName) ?? [];
    list.push(callback);
    this.handlers.set(eventName, list);
  }

  // Comme HubConnection.off : sans callback, retire tous les écouteurs de l'événement
  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!callback) {
      this.handlers.delete(eventName);
      return;
    }
    this.handlers.set(eventName, (this.handlers.get(eventName) ?? []).filter(h => h !== callback));
  }

  invoke(method: string, ...args: any[]): Promise<any> {
    this.invocations.push({method, args});
    return Promise.resolve();
  }

  // Simule un message du serveur (Clients.Caller.SendAsync(eventName, ...args))
  emit(eventName: string, ...args: any[]): void {
    (this.handlers.get(eventName) ?? []).forEach(handler => handler(...args));
  }

  listens(eventName: string): boolean {
    return (this.handlers.get(eventName)?.length ?? 0) > 0;
  }

  invoked(method: string): Invocation[] {
    return this.invocations.filter(i => i.method === method);
  }

  lastInvocation(method: string): Invocation | undefined {
    const calls = this.invoked(method);
    return calls[calls.length - 1];
  }
}

export class FakeSignalRService {
  readonly connection = new FakeHubConnection();
}

// Fournisseurs communs à tous les tests de composants : faux SignalR, HttpClient de test, routeur, animations désactivées
export function provideTestingDefaults(fake: FakeSignalRService = new FakeSignalRService()): Provider[] {
  return [
    {provide: SignalRService, useValue: fake},
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
    provideNoopAnimations(),
  ] as Provider[];
}
