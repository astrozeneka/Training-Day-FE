import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController, AlertController } from '@ionic/angular';

// Interfaces for type safety
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  selected: boolean;
  date: Date;
}

@Component({
  selector: 'app-calendar-booking',
  template: `
  <!-- Header -->
  <ion-header class="header">
    <ion-toolbar class="toolbar">
      <ion-buttons slot="start">
        <ion-button class="back-button" (click)="goBack()">
          <ion-icon name="arrow-back-outline" class="back-icon"></ion-icon>
        </ion-button>
      </ion-buttons>
      <ion-title class="title">Réservation</ion-title>
      <ion-buttons slot="end" *ngIf="selectedSlot">
        <ion-button class="clear-button" (click)="clearSelection()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div class="container">
      <!-- Date Selection -->
      <div class="date-section">
        <h2 class="section-title">Choisir une date</h2>
        <div class="date-slider">
          <div 
            *ngFor="let date of availableDates"
            class="date-item {{selectedDate === date.dateString ? 'selected' : ''}}"
            (click)="selectDate(date.dateString)"
          >
            <div class="date-day">{{date.dayName}}</div>
            <div class="date-number">{{date.dayNumber}}</div>
            <div class="date-month">{{date.monthName}}</div>
          </div>
        </div>
      </div>

      <!-- Loading Shimmer Effect -->
      <div class="shimmer-container" *ngIf="isLoadingSlots">
        <div *ngFor="let i of [1,2,3,4]" class="shimmer-item">
          <div class="shimmer-content">
            <div class="shimmer-time-block"></div>
            <div class="shimmer-time-block"></div>
            <div class="shimmer-time-block"></div>
          </div>
        </div>
      </div>

      <!-- Time Slots -->
      <div class="time-slots-section" *ngIf="selectedDate && !isLoadingSlots">
        <h2 class="section-title">Créneaux disponibles</h2>
        
        <div class="time-slots-grid" *ngIf="timeSlots.length > 0; else noSlotsAvailable">
          <div 
            *ngFor="let slot of timeSlots"
            class="time-slot {{slot.available ? 'available' : 'unavailable'}} {{slot.selected ? 'selected' : ''}}"
            (click)="selectTimeSlot(slot)"
            [class.disabled]="!slot.available"
          >
            <span class="slot-time">{{slot.time}}</span>
            <ion-icon 
              *ngIf="slot.selected" 
              name="checkmark-circle" 
              class="selected-icon"
            ></ion-icon>
          </div>
        </div>

        <!-- No slots available -->
        <ng-template #noSlotsAvailable>
          <div class="empty-state">
            <ion-icon name="calendar-outline" class="empty-icon"></ion-icon>
            <h3 class="empty-title">Aucun créneau disponible</h3>
            <p class="empty-subtitle">
              Veuillez sélectionner une autre date.
            </p>
          </div>
        </ng-template>
      </div>

      <!-- Booking Summary -->
      <div class="booking-summary" *ngIf="selectedSlot">
        <div class="summary-content">
          <h3 class="summary-title">Récapitulatif</h3>
          <div class="summary-details">
            <div class="summary-item">
              <span class="summary-label">Date:</span>
              <span class="summary-value">{{getFormattedSelectedDate()}}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Heure:</span>
              <span class="summary-value">{{selectedSlot.time}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ion-content>

  <!-- Floating Action Button -->
  <ion-fab 
    vertical="bottom" 
    horizontal="end" 
    slot="fixed"
    *ngIf="selectedSlot"
  >
    <ion-fab-button 
      class="booking-fab"
      (click)="confirmBooking()"
      [disabled]="isBooking"
    >
      <ion-icon 
        name="checkmark-outline" 
        *ngIf="!isBooking"
      ></ion-icon>
      <ion-spinner 
        name="crescent" 
        *ngIf="isBooking"
      ></ion-spinner>
    </ion-fab-button>
  </ion-fab>`,
  styles: [`
    .container {
      padding: 16px;
      padding-bottom: 100px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 16px 0;
      color: var(--ion-color-dark);
    }

    /* Date Selection */
    .date-section {
      margin-bottom: 24px;
    }

    .date-slider {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 8px 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    .date-slider::-webkit-scrollbar {
      display: none;
    }

    .date-item {
      min-width: 70px;
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 16px 8px;
      text-align: center;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .date-item.selected {
      border-color: var(--ion-color-primary);
      background: var(--ion-color-primary-tint);
    }

    .date-day {
      font-size: 10px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      font-weight: 500;
    }

    .date-number {
      font-size: 18px;
      font-weight: 600;
      margin: 4px 0;
      color: var(--ion-color-dark);
    }

    .date-month {
      font-size: 10px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
    }

    /* Time Slots */
    .time-slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .time-slot {
      background: var(--ion-color-light);
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
      border: 2px solid transparent;
      position: relative;
      transition: all 0.3s ease;
      cursor: pointer;
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-slot.available:hover {
      background: var(--ion-color-primary-tint);
      border-color: var(--ion-color-primary);
    }

    .time-slot.selected {
      background: var(--ion-color-primary);
      border-color: var(--ion-color-primary);
    }

    .time-slot.unavailable {
      background: var(--ion-color-light-shade);
      opacity: 0.5;
      cursor: not-allowed;
    }

    .slot-time {
      font-size: 14px;
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .time-slot.selected .slot-time {
      color: white;
    }

    .selected-icon {
      position: absolute;
      top: 4px;
      right: 4px;
      color: white;
      font-size: 16px;
    }

    /* Booking Summary */
    .booking-summary {
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 20px;
      margin-top: 24px;
      border: 1px solid var(--ion-color-light-shade);
    }

    .summary-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: var(--ion-color-dark);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 8px 0;
    }

    .summary-label {
      color: var(--ion-color-medium);
      font-size: 14px;
    }

    .summary-value {
      color: var(--ion-color-dark);
      font-weight: 500;
      font-size: 14px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 64px;
      color: var(--ion-color-light-shade);
      margin-bottom: 16px;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--ion-color-dark);
    }

    .empty-subtitle {
      font-size: 14px;
      color: var(--ion-color-medium);
      margin: 0;
      line-height: 1.4;
    }

    /* Shimmer Effect */
    .shimmer-container {
      margin-top: 24px;
    }

    .shimmer-item {
      margin-bottom: 16px;
    }

    .shimmer-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .shimmer-time-block {
      height: 50px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }

    /* Floating Action Button */
    .booking-fab {
      --background: var(--ion-color-success);
      --color: white;
      --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    /* Header styling */
    .header .toolbar {
      --background: var(--ion-color-primary);
      --color: white;
    }

    .title {
      font-weight: 600;
      font-size: 18px;
    }

    .back-button, .clear-button {
      --color: white;
    }

    .back-icon {
      font-size: 24px;
    }
  `]
})
export class CalendarBookingPage implements OnInit {
  selectedDate: string = '';
  selectedSlot: TimeSlot | null = null;
  isLoadingSlots: boolean = false;
  isBooking: boolean = false;

  availableDates: any[] = [];
  timeSlots: TimeSlot[] = [];

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.generateAvailableDates();
  }

  generateAvailableDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip Sundays for this example
      if (date.getDay() !== 0) {
        dates.push({
          dateString: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          dayNumber: date.getDate(),
          monthName: date.toLocaleDateString('fr-FR', { month: 'short' })
        });
      }
    }
    
    this.availableDates = dates;
  }

  selectDate(dateString: string) {
    this.selectedDate = dateString;
    this.selectedSlot = null;
    this.loadTimeSlots();
  }

  loadTimeSlots() {
    this.isLoadingSlots = true;
    
    // Simulate API call
    setTimeout(() => {
      this.generateTimeSlots();
      this.isLoadingSlots = false;
      this.cdr.detectChanges();
    }, 800);
  }

  generateTimeSlots() {
    const slots: TimeSlot[] = [];
    const selectedDateObj = new Date(this.selectedDate + 'T00:00:00');
    
    // Generate slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(selectedDateObj);
        slotDate.setHours(hour, minute);
        
        // Randomly make some slots unavailable for realism
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          id: `${this.selectedDate}-${time}`,
          time,
          available: isAvailable,
          selected: false,
          date: slotDate
        });
      }
    }
    
    this.timeSlots = slots;
  }

  selectTimeSlot(slot: TimeSlot) {
    if (!slot.available) return;

    // Clear previous selection
    if (this.selectedSlot) {
      this.selectedSlot.selected = false;
    }

    // Select new slot
    this.selectedSlot = slot;
    slot.selected = true;
  }

  clearSelection() {
    if (this.selectedSlot) {
      this.selectedSlot.selected = false;
      this.selectedSlot = null;
    }
  }

  getFormattedSelectedDate(): string {
    const date = new Date(this.selectedDate + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  async confirmBooking() {
    if (!this.selectedSlot) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmer la réservation',
      message: `Voulez-vous confirmer votre réservation pour ${this.selectedSlot.time} le ${this.getFormattedSelectedDate()}?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.processBooking();
          }
        }
      ]
    });

    await alert.present();
  }

  async processBooking() {
    if (!this.selectedSlot) return;

    this.isBooking = true;

    // Prepare booking data
    const bookingDetails = {
      selectedDate: this.selectedDate,
      formattedDate: this.getFormattedSelectedDate(),
      timeSlot: {
        id: this.selectedSlot.id,
        time: this.selectedSlot.time,
        date: this.selectedSlot.date
      },
      bookingTimestamp: new Date().toISOString()
    };

    /*
      {
          "selectedDate": "2025-08-01",
          "formattedDate": "vendredi 1 août 2025",
          "timeSlot": {
              "id": "2025-08-01-10:00",
              "time": "10:00",
              "date": "2025-08-01T03:00:00.000Z"
          },
          "bookingTimestamp": "2025-07-28T05:30:49.141Z"
    }
    */

    console.log('Booking Details:', bookingDetails);

    // Simulate API call
    setTimeout(async () => {
      // Mock response
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        await this.showSuccessToast();
        // Navigate back or to confirmation page
        this.navCtrl.back();
      } else {
        await this.showErrorToast();
      }

      this.isBooking = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  async showSuccessToast() {
    const toast = await this.toastCtrl.create({
      message: '✅ Réservation confirmée avec succès!',
      duration: 3000,
      position: 'top',
      color: 'success',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async showErrorToast() {
    const toast = await this.toastCtrl.create({
      message: '❌ Erreur lors de la réservation. Veuillez réessayer.',
      duration: 3000,
      position: 'top',
      color: 'danger',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  goBack() {
    this.navCtrl.back();
  }
}