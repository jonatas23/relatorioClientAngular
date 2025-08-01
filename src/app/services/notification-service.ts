import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient!: Client;
  private notificationSubject = new Subject<string>();

  connect(codgUsuario: string): void {
    const socket = new SockJS('http://localhost:8082/ws-notifications');
    this.stompClient = Stomp.over(socket);
    this.stompClient.reconnectDelay = 5000;

    this.stompClient.onConnect = () => {
      // Registra o usuário no backend
      this.stompClient.publish({
        destination: '/app/register',
        body: codgUsuario
      });

      // Inscreve no canal do usuário
      this.stompClient.subscribe(`/topic/usuario/${codgUsuario}`, (message: IMessage) => {
        this.notificationSubject.next(message.body);
      });
    };

    this.stompClient.activate();
  }

  getNotifications(): Observable<string> {
    return this.notificationSubject.asObservable();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.deactivate();
    }
  }
}
