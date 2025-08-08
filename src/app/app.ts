import {Component, OnDestroy} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {WebSocketService} from './services/web-socket-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {

  constructor(private notificationService: WebSocketService) {
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}
