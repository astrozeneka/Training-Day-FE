import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface StaffAppointment {
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
  selector: 'app-appointment-list',
  template: `
<div class="appointments-section" *ngIf="!isLoadingAppointments">
    <div class="appointments-list" *ngIf="appointments.length > 0">
      <div 
        class="appointment-item" 
        *ngFor="let appointment of appointments"
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

    <div class="no-appointments" *ngIf="appointments.length === 0">
      <ion-icon name="calendar-clear-outline" class="no-appointments-icon"></ion-icon>
      <p class="no-appointments-text">Aucun rendez-vous prévu</p>
      <p class="no-appointments-subtitle">Vos rendez-vous confirmés apparaîtront ici</p>
    </div>
  </div>`,
  styles: [`

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

    `]
})
export class AppointmentListComponent  implements OnInit {
  @Input() appointments: StaffAppointment[] = [];
  @Input() isLoadingAppointments: boolean = true;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {}

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
}
