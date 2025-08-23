import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContentService } from '../../content.service';
import { from, shareReplay, switchMap } from 'rxjs';

interface StaffAppointment {
  id: number;
  user_id: number;
  staff_id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  notes?: string;
  timezone: string;
  google_calendar_event_id?: string;
  sync_status: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: number;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
  sync_conflicts?: any;
  conflict_resolution?: any;
  renewal_id?: number;
  counted_towards_limit: number;
  billing_period_month: string;
  user: {
    id: number;
    name: string;
    email: string;
    firstname: string;
    lastname: string;
    thumbnail64?: string;
    trial_is_active: boolean;
    user_settings: {
      disable_coach_messages: string;
      disable_nutritionist_messages: string;
    };
    privileges: any[];
    isAvailable: boolean;
    profile_image?: any;
    perishables: any[];
  };
}

@Component({
  selector: 'app-staff-appointment',
  template: `
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <app-back-button></app-back-button>
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>Mes rendez-vous</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="ion-padding-horizontal">
    <div class="title">
      Planning des rendez-vous
    </div>
    <div class="subtitle">
      Consultez et gérez vos rendez-vous confirmés.
    </div>
  </div>

  <div class="loader-container" *ngIf="isLoadingAppointments">
    <ion-spinner name="crescent" color="primary"></ion-spinner>
    <p class="loader-text">Chargement des rendez-vous...</p>
  </div>

  <div class="appointments-section" *ngIf="!isLoadingAppointments">
    <div class="appointments-list" *ngIf="staffAppointments.length > 0">
      <div 
        class="appointment-item" 
        *ngFor="let appointment of staffAppointments"
        (click)="openAppointmentDetails(appointment)"
      >
        <div class="appointment-info">
          <div class="client-name">{{ getClientName(appointment) }}</div>
          <div class="appointment-details">
            <span class="appointment-date">{{ formatDate(appointment.start_datetime) }}</span>
            <span class="appointment-time">{{ formatTimeRange(appointment.start_datetime, appointment.end_datetime) }}</span>
          </div>
          <div class="session-type">{{ appointment.title }}</div>
          <div class="notes" *ngIf="appointment.notes">{{ appointment.notes }}</div>
        </div>
        <div class="appointment-status">
          <div class="status-badge" [class]="'status-' + appointment.status">
            {{ getStatusLabel(appointment.status) }}
          </div>
        </div>
      </div>
    </div>

    <div class="no-appointments" *ngIf="staffAppointments.length === 0">
      <ion-icon name="calendar-clear-outline" class="no-appointments-icon"></ion-icon>
      <p class="no-appointments-text">Aucun rendez-vous prévu</p>
      <p class="no-appointments-subtitle">Vos rendez-vous confirmés apparaîtront ici</p>
    </div>
  </div>

  <div class="feedback-overlay" *ngIf="showErrorMessage" (click)="closeFeedback()">
    <div class="feedback-message error">
      <ion-icon name="close-circle" class="feedback-icon"></ion-icon>
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

ion-content {
  --background: var(--ion-color-light);
}

.loader-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loader-text {
  margin: 16px 0 0 0;
  font-size: 16px;
  font-weight: 400;
  color: var(--ion-color-medium);
}

.appointments-section {
  margin: 0 22px;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.appointment-item {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ion-color-light-shade);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.appointment-info {
  flex: 1;
}

.client-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 8px;
}

.appointment-details {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.appointment-date {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-primary);
}

.appointment-time {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.session-type {
  font-size: 12px;
  font-weight: 400;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.notes {
  font-size: 12px;
  font-weight: 400;
  color: var(--ion-color-medium);
  font-style: italic;
}

.appointment-status {
  display: flex;
  align-items: center;
}

.status-badge {
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(var(--ion-color-warning-rgb), 0.2);
  color: var(--ion-color-warning-shade);
}

.status-confirmed {
  background: rgba(var(--ion-color-success-rgb), 0.2);
  color: var(--ion-color-success-shade);
}

.status-rejected {
  background: rgba(var(--ion-color-danger-rgb), 0.2);
  color: var(--ion-color-danger-shade);
}

.status-cancelled {
  background: rgba(var(--ion-color-medium-tint-rgb), 0.2);
  color: var(--ion-color-medium-shade);
}

.no-appointments {
  text-align: center;
  padding: 60px 20px;
}

.no-appointments-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.no-appointments-text {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.no-appointments-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
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

.feedback-message.error {
  border: 2px solid var(--ion-color-danger);
}

.feedback-icon {
  font-size: 48px;
  margin-bottom: 16px;
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
export class StaffAppointmentPage implements OnInit {

  staffAppointments: StaffAppointment[] = [];
  isLoadingAppointments: boolean = false;
  showErrorMessage: boolean = false;
  feedbackMessage: string = '';

  bearerToken$ = from(this.contentService.storage.get('token')).pipe(
    shareReplay(1)
  );

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient,
    private contentService: ContentService
  ) { }

  ngOnInit() {
    this.loadStaffAppointments();
  }

  loadStaffAppointments() {
    this.isLoadingAppointments = true;
    
    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.get<any>(`${environment.apiEndpoint}/calendar/events`, { headers });
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingAppointments = false;
        if (response.status === 'success') {
          this.staffAppointments = response.data;
        }
      },
      error: (error) => {
        this.isLoadingAppointments = false;
        console.error('Error loading staff appointments:', error);
        this.staffAppointments = [];
        this.feedbackMessage = 'Erreur lors du chargement des rendez-vous.';
        this.showErrorMessage = true;
        setTimeout(() => this.closeFeedback(), 3000);
      }
    });
  }

  closeFeedback() {
    this.showErrorMessage = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName} ${day} ${month} ${year}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'rejected': return 'Refusé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  }

  getClientName(appointment: StaffAppointment): string {
    return `${appointment.user.firstname} ${appointment.user.lastname}`;
  }

  formatTimeRange(startDateTime: string, endDateTime: string): string {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    const startTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);
    return `${startTime} - ${endTime}`;
  }

  openAppointmentDetails(appointment: StaffAppointment) {
    // Logic to open appointment details
    if (appointment.status == "pending") {
      // Navigate to the confirm-appointment page
      this.router.navigate(['/confirm-appointment'], { queryParams: { appointmentId: appointment.id } });
    }
  }

}
