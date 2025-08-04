import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private static socketInstance: Socket | null = null;
  private socket: Socket;

  constructor() {
    if (!SocketService.socketInstance) {
      SocketService.socketInstance = io('http://localhost:3000', {
        transports: ['websocket'], // force websocket, optional but helps in some environments
        autoConnect: true
      });
    }
    this.socket = SocketService.socketInstance;
  }

  // Emit an event to the server
  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  // Listen for events from the server
  on(eventName: string): Observable<any> {
    return new Observable((observer) => {
      const handler = (data: any) => {
        observer.next(data);
      };
      this.socket.on(eventName, handler);

      // Clean up the listener on unsubscribe
      return () => {
        this.socket.off(eventName, handler);
      };
    });
  }
}