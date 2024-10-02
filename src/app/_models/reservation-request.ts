export interface ReservationRequest {

  restaurantId: number;
  at: string;
  guests: number;
  name: string;
  email: string;
  tableCapacity: number;
}
