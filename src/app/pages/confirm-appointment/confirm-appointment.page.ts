import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContentService } from '../../content.service';
import { from, shareReplay, switchMap } from 'rxjs';

interface PendingAppointment {
  id: number;
  user_id: number;
  staff_id: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'confirmed' | 'rejected';
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
  selector: 'app-confirm-appointment',
  template: `
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <app-back-button></app-back-button>
      <ion-menu-button></ion-menu-button>
    </ion-buttons>
    <ion-title>Demandes de rendez-vous</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <div class="ion-padding-horizontal">
    <div class="title">
      Demandes en attente
    </div>
    <div class="subtitle">
      Gérez les demandes de rendez-vous de vos clients.
    </div>
  </div>

  <div class="loader-container" *ngIf="isLoadingAppointments">
    <ion-spinner name="crescent" color="primary"></ion-spinner>
    <p class="loader-text">Chargement des demandes...</p>
  </div>

  <div class="appointments-section" *ngIf="!isLoadingAppointments">
    <div class="appointments-list" *ngIf="pendingAppointments.length > 0">
      <div 
        class="appointment-item" 
        *ngFor="let appointment of pendingAppointments"
        (click)="openAppointmentModal(appointment)"
      >
        <div class="appointment-info">
          <div class="client-name">{{ getClientName(appointment) }}</div>
          <div class="appointment-details">
            <span class="appointment-date">{{ formatDate(appointment.start_datetime) }}</span>
            <span class="appointment-time">{{ formatTimeRange(appointment.start_datetime, appointment.end_datetime) }}</span>
          </div>
          <div class="session-type">{{ appointment.title }}</div>
          <div class="requested-at">Demandé {{ formatRelativeTime(appointment.created_at) }}</div>
        </div>
        <div class="appointment-status">
          <div class="status-badge" [class]="'status-' + appointment.status">
            {{ getStatusLabel(appointment.status) }}
          </div>
          <ion-icon name="chevron-forward-outline" class="chevron-icon"></ion-icon>
        </div>
      </div>
    </div>

    <div class="no-appointments" *ngIf="pendingAppointments.length === 0">
      <ion-icon name="calendar-clear-outline" class="no-appointments-icon"></ion-icon>
      <p class="no-appointments-text">Aucune demande en attente</p>
      <p class="no-appointments-subtitle">Les nouvelles demandes apparaîtront ici</p>
    </div>
  </div>

  <ion-modal [isOpen]="isModalOpen" (didDismiss)="closeModal()">
    <ng-template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Confirmer le rendez-vous</ion-title>
          <ion-buttons slot="end">
            <ion-button (click)="closeModal()">
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <div class="modal-content" *ngIf="selectedAppointment">
          <div class="appointment-details">
            <div class="detail-card">
              <div class="detail-header">
                <ion-icon name="person-outline" class="detail-icon"></ion-icon>
                <div class="detail-content">
                  <p class="detail-label">Client</p>
                  <p class="detail-value">{{ getClientName(selectedAppointment) }}</p>
                </div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-header">
                <ion-icon name="calendar-outline" class="detail-icon"></ion-icon>
                <div class="detail-content">
                  <p class="detail-label">Date</p>
                  <p class="detail-value">{{ formatDate(selectedAppointment.start_datetime) }}</p>
                </div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-header">
                <ion-icon name="time-outline" class="detail-icon"></ion-icon>
                <div class="detail-content">
                  <p class="detail-label">Heure</p>
                  <p class="detail-value">{{ formatTimeRange(selectedAppointment.start_datetime, selectedAppointment.end_datetime) }}</p>
                </div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-header">
                <ion-icon name="fitness-outline" class="detail-icon"></ion-icon>
                <div class="detail-content">
                  <p class="detail-label">Type de séance</p>
                  <p class="detail-value">{{ selectedAppointment.title }}</p>
                </div>
              </div>
            </div>

            <div class="detail-card" *ngIf="selectedAppointment.notes">
              <div class="detail-header">
                <ion-icon name="document-text-outline" class="detail-icon"></ion-icon>
                <div class="detail-content">
                  <p class="detail-label">Notes</p>
                  <p class="detail-value">{{ selectedAppointment.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <app-ux-button 
              expand="block" 
              shape="round" 
              [loading]="isProcessing"
              (click)="confirmAppointment()"
            >
              Confirmer le rendez-vous
            </app-ux-button>
            
            <app-ux-button 
              expand="block" 
              fill="outline" 
              shape="round"
              color="danger"
              [disabled]="isProcessing"
              (click)="rejectAppointment()"
            >
              Refuser
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
  cursor: pointer;
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

.requested-at {
  font-size: 10px;
  font-weight: 400;
  color: var(--ion-color-light-shade);
}

.appointment-status {
  display: flex;
  align-items: center;
  gap: 8px;
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
  background: var(--ion-color-warning-tint);
  color: var(--ion-color-warning-shade);
}

.status-confirmed {
  background: var(--ion-color-success-tint);
  color: var(--ion-color-success-shade);
}

.status-rejected {
  background: var(--ion-color-danger-tint);
  color: var(--ion-color-danger-shade);
}

.chevron-icon {
  font-size: 16px;
  color: var(--ion-color-medium);
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

.modal-content {
  padding: 20px;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.detail-card {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ion-color-light-shade);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.detail-content {
  flex: 1;
}

.detail-label {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.action-buttons {
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
  `],
})
export class ConfirmAppointmentPage implements OnInit {

  pendingAppointments: PendingAppointment[] = [];
  selectedAppointment: PendingAppointment | null = null;
  isLoadingAppointments: boolean = false;
  isModalOpen: boolean = false;
  isProcessing: boolean = false;
  showSuccessMessage: boolean = false;
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
    this.loadPendingAppointments();
    this.checkUrlParameters();
  }

  checkUrlParameters() {
    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        const appointmentId = parseInt(params['appointmentId']);
        const appointment = this.pendingAppointments.find(app => app.id === appointmentId);
        if (appointment) {
          this.openAppointmentModal(appointment);
        }
      }
    });
  }

  loadPendingAppointments() {
    this.isLoadingAppointments = true;
    
    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        return this.http.get<any>(`${environment.apiEndpoint}/calendar/pending-events`, { headers });
      })
    ).subscribe({
      next: (response) => {
        this.isLoadingAppointments = false;
        if (response.status === 'success') {
          this.pendingAppointments = response.data;
        }
      },
      error: (error) => {
        this.isLoadingAppointments = false;
        console.error('Error loading pending appointments:', error);
        this.pendingAppointments = [];
      }
    });
  }

  openAppointmentModal(appointment: PendingAppointment) {
    this.selectedAppointment = appointment;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedAppointment = null;
    this.router.navigate([], { 
      queryParams: {}, 
      relativeTo: this.route 
    });
  }

  confirmAppointment() {
    if (!this.selectedAppointment) return;

    this.isProcessing = true;
    
    // TODO: Replace with actual API call when endpoint is available
    // Expected endpoint: POST /calendar/events/{id}/confirm
    
    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        
        // Simulating API call for now
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ status: 'success', message: 'Appointment confirmed' });
          }, 2000);
        });
      })
    ).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        if (this.selectedAppointment) {
          this.selectedAppointment.status = 'confirmed';
          this.updateAppointmentInList();
          this.closeModal();
          this.feedbackMessage = 'Rendez-vous confirmé avec succès !';
          this.showSuccessMessage = true;
          setTimeout(() => this.closeFeedback(), 3000);
        }
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error confirming appointment:', error);
        this.feedbackMessage = 'Erreur lors de la confirmation.';
        this.showErrorMessage = true;
        setTimeout(() => this.closeFeedback(), 3000);
      }
    });
  }

  rejectAppointment() {
    if (!this.selectedAppointment) return;

    this.isProcessing = true;
    
    // TODO: Replace with actual API call when endpoint is available
    // Expected endpoint: POST /calendar/events/{id}/reject
    
    this.bearerToken$.pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
        
        // Simulating API call for now
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ status: 'success', message: 'Appointment rejected' });
          }, 1000);
        });
      })
    ).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        if (this.selectedAppointment) {
          this.selectedAppointment.status = 'rejected';
          this.updateAppointmentInList();
          this.closeModal();
          this.feedbackMessage = 'Rendez-vous refusé.';
          this.showErrorMessage = true;
          setTimeout(() => this.closeFeedback(), 3000);
        }
      },
      error: (error) => {
        this.isProcessing = false;
        console.error('Error rejecting appointment:', error);
        this.feedbackMessage = 'Erreur lors du refus.';
        this.showErrorMessage = true;
        setTimeout(() => this.closeFeedback(), 3000);
      }
    });
  }

  updateAppointmentInList() {
    if (this.selectedAppointment) {
      const index = this.pendingAppointments.findIndex(app => app.id === this.selectedAppointment!.id);
      if (index !== -1) {
        this.pendingAppointments[index] = { ...this.selectedAppointment };
      }
    }
  }

  closeFeedback() {
    this.showSuccessMessage = false;
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

  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'hier';
    } else {
      return `il y a ${diffDays} jours`;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'rejected': return 'Refusé';
      default: return status;
    }
  }

  getClientName(appointment: PendingAppointment): string {
    return `${appointment.user.firstname} ${appointment.user.lastname}`;
  }

  formatTimeRange(startDateTime: string, endDateTime: string): string {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    const startTime = startDate.toTimeString().slice(0, 5);
    const endTime = endDate.toTimeString().slice(0, 5);
    return `${startTime} - ${endTime}`;
  }

}
