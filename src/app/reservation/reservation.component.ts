import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationSlot } from '../_models/reservation-slot';
import { Table } from '../_models/table';
import { ReservationService } from '../_service/reservation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ReservationRequest } from '../_models/reservation-request';
import { MatCardModule } from '@angular/material/card';

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
    email: ['', [Validators.required, Validators.email]],
    tableCapacity: ['', Validators.required]
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
      const formattedDate = this.formatDate(date);
      console.log("Form")
      console.log("Date: " + date);
      console.log("Time: " + time);
      console.log("Guests: " + guests);
      console.log("Formatted Date: " + formattedDate);



      const dateTime = `${formattedDate} ${time}`;
      this.reservationService.getAvailableSlots(dateTime, parseInt(guests, 10)).subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          if (slots.length > 0) {
            this.onSlotSelect(slots[0]);
          }
        },
        error: (error) => console.error('Error loading slots:', error)
      });
    }
  }


  onSlotSelect(slot: ReservationSlot) {
    this.selectedSlot = slot;
    const largestTable = slot.tables.reduce((prev, current) =>
      (prev.capacity > current.capacity) ? prev : current
    );
    this.reservationForm.patchValue({ tableCapacity: largestTable.capacity.toString() });
  }


  onSubmit() {
    if (this.reservationForm.valid && this.selectedSlot) {
      const formValue = this.reservationForm.getRawValue();
      const reservation: ReservationRequest = {
        restaurantId: 1, // fox put in the anuglar enverionment later..
        at: this.selectedSlot.at,
        guests: parseInt(formValue.guests, 10),
        name: formValue.name,
        email: formValue.email,
        tableCapacity: parseInt(formValue.tableCapacity, 10)
      };


      this.reservationService.createReservation(reservation).subscribe({
        next: (response) => {
          this.confirmationMessage = `Reservation confirmed with ID: ${response.id}`;
          this.reservationForm.reset();
          this.availableSlots = [];
          this.selectedSlot = null;
        },
        error: (error) => console.error('Error creating reservation:', error)
      });
    }
  }


  getAvailableTablesCount(slot: ReservationSlot): number {
    return slot.tables.filter(table => table.remainingSeats > 0).length;
  }


  private formatDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
