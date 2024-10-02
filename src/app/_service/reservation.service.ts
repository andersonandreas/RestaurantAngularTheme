import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ReservationSlot } from "../_models/reservation-slot";
import { Observable } from "rxjs";
import { ReservationRequest } from "../_models/reservation-request";


@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7110/api/restaurants/1/reservations';

  getAvailableSlots(dateTime: string, guests: number): Observable<ReservationSlot[]> {
    console.log('calling getAvailableSlots reservation service api handler');
    console.log('dateTime: ' + dateTime, 'guests: ' + guests);

    return this.http.get<ReservationSlot[]>(`${this.apiUrl}/available-slots`, {
      params: { date: dateTime, quantity: guests.toString() }
    });
  }

  createReservation(reservation: ReservationRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, reservation);
  }
}
