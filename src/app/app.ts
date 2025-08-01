import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Subject} from 'rxjs';
import {NotificationService} from './services/notification-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {

  constructor(private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    // const codgUsuario = '123'; // pegue da sessão/localStorage
    // this.notificationService.connect(codgUsuario);

    this.notificationService.getNotifications().subscribe(msg => {
      console.log('Nova notificação:', msg);
      alert(msg); // ou renderize no componente
    });
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}
