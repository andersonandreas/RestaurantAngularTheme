import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationSlot } from '../_models/reservation-slot';
import { ReservationService } from '../_service/reservation.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReservationRequest } from '../_models/reservation-request';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule

  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})
export class ReservationComponent {

  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private snackBar = inject(MatSnackBar);


  availableSlots: ReservationSlot[] = [];
  selectedSlot: ReservationSlot | null = null;
  confirmationMessage = '';
  timeOptions: string[] = [];
  guestOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  reservationForm = this.fb.nonNullable.group({
    date: ['', Validators.required],
    time: ['', Validators.required],
    guests: ['', [Validators.required, Validators.min(1)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });





  ngOnInit() {
    this.generateTimeOptions();
  }


  generateTimeOptions() {

    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {

        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(time);
      }
    }
  }


  loadAvailableSlots() {

    const date = this.reservationForm.controls.date.value;
    const time = this.reservationForm.controls.time.value;
    const guests = this.reservationForm.controls.guests.value;

    if (date && time && guests) {

      const dateTime = this.formatDateTime(date, time);
      this.reservationService.getAvailableSlots(dateTime, parseInt(guests, 10)).subscribe({
        next: (slots) => {
          console.log(slots);
          this.availableSlots = slots;
          this.selectedSlot = null;
        },
        error: (error) => console.error('Error loading reservation slots:', error)
      });
    }
  }


  selectSlot(slot: ReservationSlot) {
    this.selectedSlot = slot;
  }


  onSubmit() {

    if (this.reservationForm.valid && this.selectedSlot) {

      const formValue = this.reservationForm.getRawValue();
      const [date, time] = this.selectedSlot.at.split('T');

      const reservation: ReservationRequest = {

        at: this.formatDateTime(date, time.substring(0, 5)),
        name: formValue.name,
        email: formValue.email,
        quantity: parseInt(formValue.guests, 10),
      };

      console.log(reservation);

      this.reservationService.createReservation(reservation).subscribe({
        next: (success) => {
          if (success) {
            this.showSuccessAndRedirect();
          } else {
            this.showErrorMessage('Failed to create reservation. Try again.');
          }
        },
        error: (error) => {
          console.error('Error creating reservation:', error);
          this.showErrorMessage('An error while creating the reservation.');
        }
      });
    }
  }


  getAvailableTablesCount(slot: ReservationSlot): number {

    return slot.tables
      .filter(table => table.remainingSeats > 0).length;
  }


  getAvailableTableCapacity(slot: ReservationSlot): number {

    return Math
      .max(...slot.tables
        .filter(table => table.remainingSeats > 0)
        .map(table => table.capacity));
  }





  private formatDateTime(date: string, time: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${time}`;
  }


  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }


  private showSuccessAndRedirect(): void {
    const snackBarRef = this.snackBar.open('Booking complete. Returning to home...', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });

    snackBarRef.afterDismissed().subscribe(() => {
      const mvcClientUrl = 'https://localhost:7277';
      window.location.href = mvcClientUrl;
    });
  }

}