import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ReservationSlot } from "../_models/reservation-slot";
import { catchError, map, Observable, of, tap } from "rxjs";
import { ReservationRequest } from "../_models/reservation-request";


@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7110/api/restaurants/1/reservations';




  getAvailableSlots(dateTime: string, guests: number): Observable<ReservationSlot[]> {

    return this.http.get<ReservationSlot[]>(`${this.apiUrl}/available-slots`, {
      params: { date: dateTime, quantity: guests.toString() }
    });
  }


  createReservation(reservation: ReservationRequest): Observable<boolean> {
    return this.http.post(this.apiUrl, reservation, { observe: 'response' }).pipe(
      map(response => response.status === 201),
      catchError(error => {
        console.error('Error creating reservation:', error);
        return of(false);
      })
    );
  }


}