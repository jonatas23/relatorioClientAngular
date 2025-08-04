import {Component, OnDestroy} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NotificationService} from './services/notification-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {

  constructor(private notificationService: NotificationService) {
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}
