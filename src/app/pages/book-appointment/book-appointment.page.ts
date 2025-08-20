import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
              <ion-button expand="block" (click)="confirmBooking()" color="primary">
                Confirmer
              </ion-button>
              <ion-button expand="block" fill="outline" (click)="closeConfirmationModal()">
                Annuler
              </ion-button>
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
  `]
})
export class BookAppointmentPage implements OnInit {

  availableAppointments: number = 3;
  isModalOpen: boolean = false;
  isTimeSlotsModalOpen: boolean = false;
  isLoadingTimeSlots: boolean = false;
  isConfirmationModalOpen: boolean = false;
  selectedDate: any = null;
  selectedTimeSlot: string = '';
  availableDates: any[] = [];
  showSuccessMessage: boolean = false;
  showErrorMessage: boolean = false;
  feedbackMessage: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadAvailableSlots();
  }

  loadAvailableSlots() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer 2936|xu7W3kUg6zRIkHjj8b68T2lnoML3k2oVJpq2T2tnddab6688',
      'Content-Type': 'application/json'
    });

    const body = {
      staff_id: 113,
      n_days: 7
    };

    this.http.post<any>('http://localhost:8080/api/calendar/available-slots', body, { headers })
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
    
    this.closeConfirmationModal();
    
    const headers = new HttpHeaders({
      'Authorization': 'Bearer 2936|xu7W3kUg6zRIkHjj8b68T2lnoML3k2oVJpq2T2tnddab6688',
      'Content-Type': 'application/json'
    });

    const body = {
      staff_id: 113,
      date: selectedDate.date,
      time: selectedTimeSlot
    };

    // Simulate booking API call
    setTimeout(() => {
      // Randomly simulate success or error for testing
      const isSuccess = Math.random() > 0.3; // 70% success rate
      
      if (isSuccess) {
        this.feedbackMessage = 'Rendez-vous confirmé avec succès !';
        this.showSuccessMessage = true;
      } else {
        this.feedbackMessage = 'Erreur lors de la réservation. Veuillez réessayer.';
        this.showErrorMessage = true;
      }
      
      setTimeout(() => this.closeFeedback(), 3000);
    }, 1000);
  }

  closeFeedback() {
    this.showSuccessMessage = false;
    this.showErrorMessage = false;
  }

}
