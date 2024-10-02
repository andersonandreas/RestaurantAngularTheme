import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReservationComponent } from "./reservation/reservation.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReservationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'RestaurantAngularTheme';
}
