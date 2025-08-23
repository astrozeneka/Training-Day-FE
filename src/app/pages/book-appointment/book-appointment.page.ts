import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContentService } from '../../content.service';
import { from, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-book-appointment',
  template: `
<ion-header>
    <ion-toolbar>
        <ion-buttons slot="start">
            <app-back-button></app-back-button>
            <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Prendre rendez-vous</ion-title>
    </ion-toolbar>
</ion-header>

<ion-content>
    <div class="ion-padding-horizontal">
        <div class="title">
            Réservez votre rendez-vous
        </div>
        <div class="subtitle">
            Choisissez votre créneau et réservez facilement votre rendez-vous personnalisé.
        </div>
    </div>
    
    <div class="appointment-counter" (click)="openDateModal()">
      <ion-icon name="calendar-outline" class="counter-icon"></ion-icon>
      <div class="counter-content">
        <p class="cta-text">Réserver une séance</p>
        <p class="remaining-sessions">Vous avez {{ availableAppointments }} séances disponibles</p>
      </div>
    </div>

    <div class="booked-events-section">
      <div class="section-title">Mes rendez-vous</div>
      
      <div class="loader-container" *ngIf="isLoadingEvents">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <p class="loader-text">Chargement des rendez-vous...</p>
      </div>

      <div class="events-list" *ngIf="!isLoadingEvents && bookedEvents.length > 0">
        <div class="event-item" *ngFor="let event of bookedEvents">
          <div class="event-date">
            <p class="event-day">{{ formatEventDate(event.start_datetime) }}</p>
            <p class="event-time">{{ formatEventTime(event.start_datetime) }}</p>
          </div>
          <div class="event-details">
            <p class="event-title">{{ event.title }}</p>
            <p class="event-status" [class]="'status-' + event.status">{{ event.status }}</p>
          </div>
        </div>
      </div>

      <div class="no-events" *ngIf="!isLoadingEvents && bookedEvents.length === 0">
        <ion-icon name="calendar-clear-outline" class="no-events-icon"></ion-icon>
        <p class="no-events-text">Aucun rendez-vous programmé</p>
      </div>
    </div>

    <ion-modal [isOpen]="isModalOpen" (didDismiss)="closeModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Choisir une date</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeModal()">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="modal-content" *ngIf="!isLoadingTimeSlots">
            <div class="dates-list">
              <div 
                class="date-item" 
                *ngFor="let date of availableDates" 
                (click)="selectDate(date)"
              >
                <div class="date-info">
                  <p class="date-line">{{ date.day }} {{ date.fullDate }}</p>
                </div>
                <p class="slots-count">
                  {{ date.timeSlots.length }} créneau{{ date.timeSlots.length > 1 ? 'x' : '' }} disponible{{ date.timeSlots.length > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="loader-container" *ngIf="isLoadingTimeSlots">
            <div class="loader-content">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
              <p class="loader-text">Chargement des créneaux...</p>
            </div>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <ion-modal [isOpen]="isTimeSlotsModalOpen" (didDismiss)="closeTimeSlotsModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ selectedDate?.day }} {{ selectedDate?.fullDate }}</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeTimeSlotsModal()">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="modal-content" *ngIf="!isLoadingTimeSlots">
            <div class="time-slots-list">
              <div 
                class="time-slot-item" 
                *ngFor="let timeSlot of selectedDate?.timeSlots"
                (click)="selectTimeSlot(timeSlot)"
              >
                <p class="time-slot-text">{{ timeSlot }}</p>
              </div>
            </div>
          </div>
          
          <div class="loader-container" *ngIf="isLoadingTimeSlots">
            <div class="loader-content">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
              <p class="loader-text">Chargement des créneaux...</p>
            </div>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <ion-modal [isOpen]="isConfirmationModalOpen" (didDismiss)="closeConfirmationModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Confirmer le rendez-vous</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeConfirmationModal()">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="modal-content">
            <div class="confirmation-details">
              <p class="confirmation-text">Confirmer le rendez-vous pour :</p>
              <p class="confirmation-date">{{ selectedDate?.day }} {{ selectedDate?.fullDate }}</p>
              <p class="confirmation-time">{{ selectedTimeSlot }}</p>
            </div>
            <div class="confirmation-buttons">
              <app-ux-button 
                expand="block" 
                shape="round" 
                [loading]="isBookingInProgress"
                (click)="confirmBooking()"
              >
                Confirmer
              </app-ux-button>
              <app-ux-button 
                expand="block" 
                fill="outline" 
                shape="round"
                [disabled]="isBookingInProgress"
                (click)="closeConfirmationModal()"
              >
                Annuler
              </app-ux-button>
            </div>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <div class="feedback-overlay" *ngIf="showSuccessMessage || showErrorMessage" (click)="closeFeedback()">
      <div class="feedback-message" [class.success]="showSuccessMessage" [class.error]="showErrorMessage">
        <ion-icon [name]="showSuccessMessage ? 'checkmark-circle' : 'close-circle'" class="feedback-icon"></ion-icon>
        <p class="feedback-text">{{ feedbackMessage }}</p>
      </div>
    </div>


</ion-content>
`,
  styles: [`
.title {
    font-size: 24px;
    font-weight: 400;
    text-align: center;
    padding-top: 32px;
    margin-top: 0px;
}

.subtitle {
    font-size: 16px;
    font-weight: 400;
    line-height: 133%;
    text-align: center;
    margin-top: 20px;
    margin-bottom: 25px;
}

.appointment-counter {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background: var(--ion-color-light);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--ion-color-light-shade);
    margin: 0 22px;
}

.counter-icon {
    font-size: 24px;
    margin-right: 12px;
    color: var(--ion-color-dark);
}

.counter-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.cta-text {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.remaining-sessions {
    margin: 4px 0 0 0;
    font-size: 12px;
    font-weight: 400;
    color: var(--ion-color-medium);
}

ion-content {
    --background: var(--ion-color-light);
}

.modal-content {
    padding: 20px;
}

.dates-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.date-item {
    background: var(--ion-color-light);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--ion-color-light-shade);
}

.date-info {
    margin-bottom: 12px;
}

.date-line {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.slots-count {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--ion-color-primary);
}

.time-slots-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.time-slot-item {
    background: var(--ion-color-light);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--ion-color-light-shade);
    text-align: center;
}

.time-slot-text {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.loader-content {
    text-align: center;
}

.loader-text {
    margin: 16px 0 0 0;
    font-size: 16px;
    font-weight: 400;
    color: var(--ion-color-medium);
}

.confirmation-details {
    padding: 20px;
    text-align: center;
}

.confirmation-text {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 400;
    color: var(--ion-color-medium);
}

.confirmation-date {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.confirmation-time {
    margin: 0 0 24px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--ion-color-primary);
}

.confirmation-buttons {
    padding: 0 20px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.feedback-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
}

.feedback-message {
    background: var(--ion-color-light);
    border-radius: 12px;
    padding: 24px;
    margin: 20px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.feedback-message.success {
    border: 2px solid var(--ion-color-success);
}

.feedback-message.error {
    border: 2px solid var(--ion-color-danger);
}

.feedback-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.feedback-message.success .feedback-icon {
    color: var(--ion-color-success);
}

.feedback-message.error .feedback-icon {
    color: var(--ion-color-danger);
}

.feedback-text {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--ion-color-dark);
}

.booked-events-section {
    margin: 32px 22px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--ion-color-dark);
    margin-bottom: 20px;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.event-item {
    background: var(--ion-color-light);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--ion-color-light-shade);
    display: flex;
    align-items: center;
    gap: 16px;
}

.event-date {
    text-align: center;
    min-width: 80px;
}

.event-day {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ion-color-primary);
}

.event-time {
    margin: 4px 0 0 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--ion-color-dark);
}

.event-details {
    flex: 1;
}

.event-title {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--ion-color-dark);
}

.event-status {
    margin: 4px 0 0 0;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
}

.status-pending {
    color: var(--ion-color-warning);
}

.status-confirmed {
    color: var(--ion-color-success);
}

.status-cancelled {
    color: var(--ion-color-danger);
}

.no-events {
    text-align: center;
    padding: 40px 20px;
}

.no-events-icon {
    font-size: 48px;
    color: var(--ion-color-medium);
    margin-bottom: 16px;
}

.no-events-text {
    margin: 0;
    font-size: 16px;
    color: var(--ion-color-medium);
}
  `]
})
export class BookAppointmentPage implements OnInit {

  availableAppointments: number = 3;
  isModalOpen: boolean = false;
  isTimeSlotsModalOpen: boolean = false;
  isLoadingTimeSlots: boolean = false;
  isConfirmationModalOpen: boolean = false;
  isBookingInProgress: boolean = false;
  selectedDate: any = null;
  selectedTimeSlot: string = '';
  availableDates: any[] = [];
  bookedEvents: any[] = [];
  isLoadingEvents: boolean = false;
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  feedbackMessage: string = '';
  
  bearerToken$ = from(this.contentService.storage.get('token')).pipe(
    shareReplay(1)
  );

  constructor(private http: HttpClient, private contentService: ContentService) { }

  ngOnInit() {
    this.loadAvailableSlots();
    this.loadBookedEvents();
  }

  loadAvailableSlots() {
    const body = {
      staff_id: environment.coachId,
      n_days: 7
    };

    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.post<any>(`${environment.apiEndpoint}/calendar/available-slots`, body, { headers });
      })
    )
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.transformApiData(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading slots:', error);
        }
      });
  }

  transformApiData(apiData: any) {
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    this.availableDates = Object.keys(apiData).map(dateKey => {
      const date = new Date(dateKey);
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();

      const timeSlots = apiData[dateKey].map((slot: any) => slot.start_time.slice(0, 5));

      return {
        day: dayName,
        fullDate: `${day} ${month} ${year}`,
        timeSlots: timeSlots,
        date: dateKey
      };
    });
  }

  loadBookedEvents() {
    this.isLoadingEvents = true;

    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.get<any>(`${environment.apiEndpoint}/calendar/booked-events`, { headers });
      })
    )
      .subscribe({
        next: (response) => {
          this.isLoadingEvents = false;
          if (response.status === 'success' || response.data) {
            this.bookedEvents = response.data || response;
          }
        },
        error: (error) => {
          this.isLoadingEvents = false;
          console.log('Error loading events:', error);
          this.bookedEvents = [];
        }
      });
  }


  openDateModal() {
    this.isLoadingTimeSlots = true;
    this.isModalOpen = true;
    
    setTimeout(() => {
      this.isLoadingTimeSlots = false;
    }, 1500);
  }

  closeModal() {
    this.isModalOpen = false;
  }

  selectDate(date: any) {
    this.selectedDate = date;
    this.closeModal();
    this.openTimeSlotsModal();
  }

  openTimeSlotsModal() {
    this.isTimeSlotsModalOpen = true;
  }

  closeTimeSlotsModal() {
    this.isTimeSlotsModalOpen = false;
  }

  selectTimeSlot(timeSlot: string) {
    this.selectedTimeSlot = timeSlot;
    this.closeTimeSlotsModal();
    this.isConfirmationModalOpen = true;
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
    this.selectedDate = null;
    this.selectedTimeSlot = '';
  }

  confirmBooking() {
    const selectedDate = this.selectedDate;
    const selectedTimeSlot = this.selectedTimeSlot;
    
    this.isBookingInProgress = true;

    const startDateTime = `${selectedDate.date} ${selectedTimeSlot}:00`;
    const startTime = new Date(startDateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
    
    const body = {
      staff_id: environment.coachId,
      title: 'Séance de coaching',
      start_datetime: startDateTime,
      end_datetime: `${selectedDate.date} ${endTime.toTimeString().slice(0, 8)}`,
      timezone: 'Europe/Paris'
    };

    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.post<any>(`${environment.apiEndpoint}/calendar/book-event`, body, { headers });
      })
    ) // WE ARE HERE
      .subscribe({
        next: (response) => {
          this.isBookingInProgress = false;
          this.closeConfirmationModal();
          
          if (response.status === 'success') {
            this.feedbackMessage = 'Rendez-vous confirmé avec succès !';
            this.showSuccessMessage = true;
          } else {
            this.feedbackMessage = 'Erreur lors de la réservation. Veuillez réessayer.';
            this.showErrorMessage = true;
          }
          setTimeout(() => this.closeFeedback(), 3000);
        },
        error: (error) => {
          this.isBookingInProgress = false;
          this.closeConfirmationModal();
          
          let errorMessage = 'Erreur lors de la réservation. Veuillez réessayer.';
          
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            const firstError = Object.values(error.error.errors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
          
          this.feedbackMessage = errorMessage;
          this.showErrorMessage = true;
          setTimeout(() => this.closeFeedback(), 3000);
        }
      });
  }

  closeFeedback() {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }

  formatEventDate(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${day}/${month}`;
  }

  formatEventTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toTimeString().slice(0, 5);
  }

}
