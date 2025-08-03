import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';

// Interfaces
interface Appointment {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  startTime: Date;
  endTime: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes: string;
  sessionType: string;
  color: string;
  dragging?: boolean;
  duration?: number; // in minutes
  position?: number; // position in pixels from top
  height?: number; // height in pixels
}

interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
  position: number; // position from top in pixels
}

@Component({
  selector: 'app-calendar-admin',
  template: `
  <ion-header class="header">
    <ion-toolbar class="toolbar">
      <ion-title class="title">Gestion des Rendez-vous</ion-title>
      <ion-buttons slot="end">
        <ion-button class="view-button" (click)="toggleView()">
          <ion-icon [name]="getViewIcon()"></ion-icon>
        </ion-button>
        <ion-button class="add-button" (click)="addAppointment()">
          <ion-icon name="add-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <div class="container">
      <!-- Calendar Header Controls -->
      <div class="calendar-controls">
        <div class="nav-controls">
          <ion-button fill="clear" (click)="navigateCalendar(-1)">
            <ion-icon name="chevron-back-outline"></ion-icon>
          </ion-button>
          <h2 class="calendar-title">{{ getCurrentPeriodTitle() }}</h2>
          <ion-button fill="clear" (click)="navigateCalendar(1)">
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </ion-button>
        </div>
        
        <div class="view-selector">
          <ion-segment [(ngModel)]="currentView" (ionChange)="onViewChange()">
            <ion-segment-button value="day">
              <ion-label>Jour</ion-label>
            </ion-segment-button>
            <ion-segment-button value="week">
              <ion-label>Semaine</ion-label>
            </ion-segment-button>
            <ion-segment-button value="month">
              <ion-label>Mois</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
      </div>

      <!-- Back to Month Button (shown when in day view from month selection) -->
      <div *ngIf="showBackToMonth" class="back-navigation">
        <ion-button fill="clear" (click)="backToMonth()">
          <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
          Retour au mois
        </ion-button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ getTodayStats().total }}</div>
            <div class="stat-label">Aujourd'hui</div>
          </div>
          <div class="stat-card confirmed">
            <div class="stat-value">{{ getTodayStats().confirmed }}</div>
            <div class="stat-label">Confirmés</div>
          </div>
          <div class="stat-card pending">
            <div class="stat-value">{{ getTodayStats().pending }}</div>
            <div class="stat-label">En attente</div>
          </div>
        </div>
      </div>

      <!-- Calendar Views -->
      <div class="calendar-container">
        
        <!-- Enhanced Day View with Variable Time Slots -->
        <div *ngIf="currentView === 'day'" class="day-view">
          <div class="day-header">
            <h3>{{ currentDate | date:'EEEE d MMMM yyyy':'fr-FR' }}</h3>
            <div class="day-stats">
              <span class="appointments-count">{{ getDayAppointments().length }} rendez-vous</span>
            </div>
          </div>
          
          <div class="enhanced-time-grid" [style.height.px]="getGridHeight()">
            <!-- Time Labels -->
            <div class="time-labels">
              <div 
                *ngFor="let slot of getTimeSlots()" 
                class="time-label"
                [style.top.px]="slot.position"
              >
                {{ slot.label }}
              </div>
            </div>
            
            <!-- Grid Lines -->
            <div class="grid-lines">
              <div 
                *ngFor="let slot of getTimeSlots()" 
                class="grid-line"
                [style.top.px]="slot.position"
              ></div>
            </div>
            
            <!-- Appointments Container -->
            <div class="appointments-container" (click)="createAppointmentAtPosition($event)">
              <div 
                *ngFor="let appointment of getDayAppointmentsWithPosition()"
                class="flexible-appointment {{ appointment.status }}"
                [style.background-color]="appointment.color"
                [style.top.px]="appointment.position"
                [style.height.px]="appointment.height"
                (click)="viewAppointmentDetails(appointment, $event)"
                draggable="true"
                (dragstart)="onDragStart(appointment, $event)"
                (dragend)="onDragEnd($event)"
              >
                <div class="appointment-header">
                  <div class="appointment-time">
                    {{ appointment.startTime | date:'HH:mm' }} - {{ appointment.endTime | date:'HH:mm' }}
                  </div>
                  <div class="status-indicator">
                    <ion-icon [name]="getStatusIcon(appointment.status)"></ion-icon>
                  </div>
                </div>
                <div class="appointment-title">{{ appointment.title }}</div>
                <div class="appointment-client">{{ appointment.clientName }}</div>
                <div *ngIf="appointment.notes && appointment.height > 80" class="appointment-notes">
                  {{ appointment.notes | slice:0:50 }}{{ appointment.notes.length > 50 ? '...' : '' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Week View (unchanged) -->
        <div *ngIf="currentView === 'week'" class="week-view">
          <div class="week-header">
            <div class="week-day-headers">
              <div class="time-column-header"></div>
              <div 
                *ngFor="let day of getWeekDays()" 
                class="day-header-cell {{ day.isToday ? 'today' : '' }}"
              >
                <div class="day-name">{{ day.date | date:'E':'fr-FR' }}</div>
                <div class="day-number">{{ day.date | date:'d' }}</div>
              </div>
            </div>
          </div>
          
          <div class="week-grid">
            <div *ngFor="let hour of getHours()" class="week-hour-row">
              <div class="hour-label">{{ hour }}:00</div>
              <div 
                *ngFor="let day of getWeekDays()" 
                class="week-day-cell"
                (click)="createAppointmentAtDateTime(day.date, hour)"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event, day.date, hour)"
              >
                <div 
                  *ngFor="let appointment of getAppointmentsForDayHour(day.date, hour)"
                  class="week-appointment {{ appointment.status }}"
                  [style.background-color]="appointment.color"
                  (click)="viewAppointmentDetails(appointment, $event)"
                  draggable="true"
                  (dragstart)="onDragStart(appointment, $event)"
                  (dragend)="onDragEnd($event)"
                >
                  <div class="appointment-title">{{ appointment.title }}</div>
                  <div class="appointment-client">{{ appointment.clientName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Month View -->
        <div *ngIf="currentView === 'month'" class="month-view">
          <div class="month-header">
            <div *ngFor="let dayName of getDayNames()" class="month-day-header">
              {{ dayName }}
            </div>
          </div>
          
          <div class="month-grid">
            <div 
              *ngFor="let day of getMonthDays()" 
              class="month-day-cell {{ day.isToday ? 'today' : '' }} {{ !day.isCurrentMonth ? 'other-month' : '' }}"
              (click)="selectDayInMonth(day.date)"
              (dragover)="onDragOver($event)"
              (drop)="onDropOnDay($event, day.date)"
            >
              <div class="day-number">{{ day.date | date:'d' }}</div>
              <div class="day-appointments">
                <div 
                  *ngFor="let appointment of day.appointments.slice(0, 3)"
                  class="month-appointment {{ appointment.status }}"
                  [style.background-color]="appointment.color"
                  (click)="viewAppointmentDetails(appointment, $event)"
                  draggable="true"
                  (dragstart)="onDragStart(appointment, $event)"
                  (dragend)="onDragEnd($event)"
                >
                  <span class="appointment-time">{{ appointment.startTime | date:'HH:mm' }}</span>
                  <span class="appointment-title">{{ appointment.title }}</span>
                </div>
                <div *ngIf="day.appointments.length > 3" class="more-appointments">
                  +{{ day.appointments.length - 3 }} autres
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <ion-modal [isOpen]="showAppointmentDetailsModal" (didDismiss)="closeAppointmentDetailsModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>Détails du Rendez-vous</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeAppointmentDetailsModal()">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="modal-content">
          <div class="appointment-details">
            <div class="detail-header">
              <div class="status-badge {{ selectedAppointment.status }}">
                <ion-icon [name]="getStatusIcon(selectedAppointment.status)"></ion-icon>
                {{ getStatusLabel(selectedAppointment.status) }}
              </div>
              <div class="appointment-duration">
                {{ getAppointmentDuration(selectedAppointment) }} min
              </div>
            </div>

            <div class="detail-section">
              <h3>{{ selectedAppointment.title }}</h3>
              <p class="session-type">{{ getSessionTypeLabel(selectedAppointment.sessionType) }}</p>
            </div>

            <div class="detail-section">
              <div class="detail-row">
                <ion-icon name="person-outline"></ion-icon>
                <div>
                  <div class="detail-label">Client</div>
                  <div class="detail-value">{{ selectedAppointment.clientName }}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <ion-icon name="mail-outline"></ion-icon>
                <div>
                  <div class="detail-label">Email</div>
                  <div class="detail-value">{{ selectedAppointment.clientEmail }}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <ion-icon name="time-outline"></ion-icon>
                <div>
                  <div class="detail-label">Horaire</div>
                  <div class="detail-value">
                    {{ selectedAppointment.startTime | date:'EEEE d MMMM yyyy':'fr-FR' }}<br>
                    {{ selectedAppointment.startTime | date:'HH:mm' }} - {{ selectedAppointment.endTime | date:'HH:mm' }}
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="selectedAppointment.notes" class="detail-section">
              <div class="detail-label">Notes</div>
              <div class="notes-content">{{ selectedAppointment.notes }}</div>
            </div>
          </div>
          
          <div class="details-actions">
            <ion-button 
              fill="outline" 
              color="primary" 
              (click)="editAppointmentFromDetails()"
            >
              <ion-icon name="create-outline" slot="start"></ion-icon>
              Modifier
            </ion-button>
            <ion-button 
              fill="outline" 
              color="danger" 
              (click)="deleteAppointmentFromDetails()"
            >
              <ion-icon name="trash-outline" slot="start"></ion-icon>
              Supprimer
            </ion-button>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>

    <!-- Appointment Edit Modal -->
    <ion-modal [isOpen]="showAppointmentEditModal" (didDismiss)="closeAppointmentEditModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ isEditMode ? 'Modifier' : 'Nouveau' }} Rendez-vous</ion-title>
            <ion-buttons slot="end">
              <ion-button (click)="closeAppointmentEditModal()">
                <ion-icon name="close"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        
        <ion-content class="modal-content">
          <div class="appointment-form">
            <ion-item>
              <ion-label position="stacked">Titre de la séance</ion-label>
              <ion-input [(ngModel)]="editingAppointment.title" placeholder="Ex: Séance personnelle"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Nom du client</ion-label>
              <ion-input [(ngModel)]="editingAppointment.clientName" placeholder="Nom complet"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Email</ion-label>
              <ion-input [(ngModel)]="editingAppointment.clientEmail" type="email" placeholder="client@email.com"></ion-input>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Type de séance</ion-label>
              <ion-select [(ngModel)]="editingAppointment.sessionType">
                <ion-select-option value="personal">Séance personnelle</ion-select-option>
                <ion-select-option value="group">Séance de groupe</ion-select-option>
                <ion-select-option value="consultation">Consultation</ion-select-option>
                <ion-select-option value="evaluation">Évaluation</ion-select-option>
              </ion-select>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Statut</ion-label>
              <ion-select [(ngModel)]="editingAppointment.status">
                <ion-select-option value="pending">En attente</ion-select-option>
                <ion-select-option value="confirmed">Confirmé</ion-select-option>
                <ion-select-option value="completed">Terminé</ion-select-option>
                <ion-select-option value="cancelled">Annulé</ion-select-option>
              </ion-select>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Date et heure de début</ion-label>
              <ion-datetime 
                [(ngModel)]="editingAppointment.startTime" 
                presentation="date-time"
                [min]="minDate"
              ></ion-datetime>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Date et heure de fin</ion-label>
              <ion-datetime 
                [(ngModel)]="editingAppointment.endTime" 
                presentation="date-time"
                [min]="editingAppointment.startTime"
              ></ion-datetime>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Notes</ion-label>
              <ion-textarea 
                [(ngModel)]="editingAppointment.notes" 
                placeholder="Notes ou commentaires sur la séance..."
                rows="3"
              ></ion-textarea>
            </ion-item>
          </div>
          
          <div class="modal-actions">
            <ion-button 
              fill="outline" 
              (click)="closeAppointmentEditModal()"
            >
              Annuler
            </ion-button>
            <ion-button 
              expand="block" 
              (click)="saveAppointment()"
            >
              <ion-icon name="save-outline" slot="start"></ion-icon>
              {{ isEditMode ? 'Modifier' : 'Créer' }}
            </ion-button>
          </div>
        </ion-content>
      </ng-template>
    </ion-modal>
  </ion-content>`,
  
  styles: [`
    .container {
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .header .toolbar {
      --background: var(--ion-color-primary);
      --color: white;
    }

    .title {
      font-weight: 600;
      font-size: 18px;
    }

    .view-button, .add-button {
      --color: white;
    }

    /* Back Navigation */
    .back-navigation {
      margin-bottom: 16px;
    }

    .back-navigation ion-button {
      --color: var(--ion-color-primary);
    }

    /* Calendar Controls */
    .calendar-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .calendar-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: var(--ion-color-dark);
      min-width: 200px;
      text-align: center;
    }

    .view-selector ion-segment {
      --background: var(--ion-color-light);
    }

    /* Statistics */
    .stats-section {
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }

    .stat-card {
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border-left: 4px solid var(--ion-color-primary);
    }

    .stat-card.confirmed {
      border-left-color: var(--ion-color-success);
    }

    .stat-card.pending {
      border-left-color: var(--ion-color-warning);
    }

    .stat-card.revenue {
      border-left-color: var(--ion-color-secondary);
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-color-dark);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      font-weight: 500;
    }

    /* Calendar Container */
    .calendar-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    /* Enhanced Day View */
    .day-view {
      padding: 16px;
    }

    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .day-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--ion-color-dark);
    }

    .day-stats {
      font-size: 14px;
      color: var(--ion-color-medium);
    }

    .appointments-count {
      background: var(--ion-color-light);
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 500;
    }

    .enhanced-time-grid {
      position: relative;
      background: white;
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 8px;
      overflow: hidden;
      min-height: 600px;
    }

    .time-labels {
      position: absolute;
      left: 0;
      top: 0;
      width: 80px;
      height: 100%;
      background: var(--ion-color-light-tint);
      border-right: 1px solid var(--ion-color-light-shade);
      z-index: 2;
    }

    .time-label {
      position: absolute;
      width: 100%;
      padding: 4px 8px;
      font-size: 12px;
      color: var(--ion-color-medium);
      font-weight: 500;
      transform: translateY(-50%);
      background: var(--ion-color-light-tint);
    }

    .grid-lines {
      position: absolute;
      left: 80px;
      top: 0;
      right: 0;
      height: 100%;
      z-index: 1;
    }

    .grid-line {
      position: absolute;
      width: 100%;
      height: 1px;
      background: var(--ion-color-light-shade);
    }

    .appointments-container {
      position: absolute;
      left: 80px;
      top: 0;
      right: 0;
      height: 100%;
      z-index: 3;
      cursor: pointer;
    }

    .flexible-appointment {
      position: absolute;
      left: 8px;
      right: 8px;
      border-radius: 8px;
      padding: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      min-height: 60px;
    }

    .flexible-appointment:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    .flexible-appointment.pending {
      background: var(--ion-color-warning) !important;
    }

    .flexible-appointment.confirmed {
      background: var(--ion-color-success) !important;
    }

    .flexible-appointment.cancelled {
      background: var(--ion-color-danger) !important;
      opacity: 0.7;
    }

    .flexible-appointment.completed {
      background: var(--ion-color-medium) !important;
    }

    .appointment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .appointment-time {
      font-size: 11px;
      font-weight: 600;
      opacity: 0.9;
    }

    .status-indicator {
      font-size: 14px;
      opacity: 0.8;
    }

    .appointment-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .appointment-client {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 4px;
    }

    .appointment-notes {
      font-size: 11px;
      opacity: 0.8;
      font-style: italic;
      line-height: 1.3;
    }

    /* Week View (unchanged from original) */
    .week-view {
      padding: 16px;
    }

    .week-header {
      margin-bottom: 16px;
    }

    .week-day-headers {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 8px;
    }

    .time-column-header {
      background: var(--ion-color-light);
    }

    .day-header-cell {
      background: var(--ion-color-light);
      padding: 12px 8px;
      text-align: center;
      border-radius: 6px;
    }

    .day-header-cell.today {
      background: var(--ion-color-primary);
      color: white;
    }

    .day-name {
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 2px;
    }

    .day-number {
      font-size: 16px;
      font-weight: 600;
    }

    .week-grid {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .week-hour-row {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      gap: 1px;
      min-height: 50px;
    }

    .hour-label {
      width: 80px;
      padding: 8px;
      font-size: 12px;
      color: var(--ion-color-medium);
      font-weight: 500;
      border-right: 1px solid var(--ion-color-light-shade);
      background: var(--ion-color-light-tint);
    }

    .week-day-cell {
      border: 1px solid var(--ion-color-light-shade);
      padding: 2px;
      position: relative;
      cursor: pointer;
    }

    .week-day-cell:hover {
      background: var(--ion-color-light-tint);
    }

    .week-appointment {
      background: var(--ion-color-primary);
      color: white;
      border-radius: 4px;
      padding: 4px 6px;
      margin: 1px 0;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .week-appointment:hover {
      transform: scale(1.05);
    }

    /* Month View */
    .month-view {
      padding: 16px;
    }

    .month-header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      margin-bottom: 8px;
    }

    .month-day-header {
      background: var(--ion-color-light);
      padding: 12px;
      text-align: center;
      font-weight: 600;
      font-size: 12px;
      color: var(--ion-color-dark);
      text-transform: uppercase;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
    }

    .month-day-cell {
      min-height: 100px;
      border: 1px solid var(--ion-color-light-shade);
      padding: 8px 4px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .month-day-cell:hover {
      background: var(--ion-color-light-tint);
      transform: scale(1.02);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .month-day-cell.today {
      background: var(--ion-color-primary-tint);
      border-color: var(--ion-color-primary);
      box-shadow: inset 0 0 0 2px var(--ion-color-primary);
    }

    .month-day-cell.other-month {
      opacity: 0.3;
    }

    .day-number {
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--ion-color-dark);
    }

    .day-appointments {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .month-appointment {
      background: var(--ion-color-primary);
      color: white;
      border-radius: 3px;
      padding: 2px 4px;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    }

    .month-appointment:hover {
      transform: translateX(2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .more-appointments {
      font-size: 10px;
      color: var(--ion-color-medium);
      text-align: center;
      padding: 2px;
      font-style: italic;
    }

    /* Appointment Details Modal */
    .appointment-details {
      padding: 16px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.confirmed {
      background: var(--ion-color-success-tint);
      color: var(--ion-color-success-shade);
    }

    .status-badge.pending {
      background: var(--ion-color-warning-tint);
      color: var(--ion-color-warning-shade);
    }

    .status-badge.cancelled {
      background: var(--ion-color-danger-tint);
      color: var(--ion-color-danger-shade);
    }

    .status-badge.completed {
      background: var(--ion-color-medium-tint);
      color: var(--ion-color-medium-shade);
    }

    .appointment-duration {
      background: var(--ion-color-light);
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      color: var(--ion-color-dark);
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--ion-color-dark);
    }

    .session-type {
      color: var(--ion-color-medium);
      font-size: 14px;
      margin: 0;
      text-transform: capitalize;
    }

    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail-row ion-icon {
      color: var(--ion-color-primary);
      font-size: 20px;
      margin-top: 2px;
    }

    .detail-label {
      font-size: 12px;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .detail-value {
      font-size: 14px;
      color: var(--ion-color-dark);
      line-height: 1.4;
    }

    .notes-content {
      background: var(--ion-color-light-tint);
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
      color: var(--ion-color-dark);
      border-left: 4px solid var(--ion-color-primary);
    }

    .details-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--ion-color-light-shade);
    }

    .details-actions ion-button {
      flex: 1;
    }

    /* Modal */
    .modal-content {
      padding: 16px;
    }

    .appointment-form {
      margin-bottom: 24px;
    }

    .appointment-form ion-item {
      margin-bottom: 12px;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--ion-color-light-shade);
    }

    .modal-actions ion-button[fill="outline"] {
      flex: 0 0 auto;
    }

    .modal-actions ion-button[expand="block"] {
      flex: 1;
    }

    /* Drag and Drop */
    .flexible-appointment[draggable="true"]:hover {
      cursor: grab;
    }

    .flexible-appointment.dragging {
      opacity: 0.5;
      transform: rotate(2deg);
    }

    .week-day-cell.drag-over,
    .month-day-cell.drag-over {
      background: var(--ion-color-primary-tint);
      border-color: var(--ion-color-primary);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .calendar-controls {
        flex-direction: column;
        gap: 12px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .week-day-headers,
      .week-hour-row {
        grid-template-columns: 60px repeat(7, 1fr);
      }

      .month-day-cell {
        min-height: 80px;
      }

      .calendar-title {
        font-size: 18px;
        min-width: auto;
      }

      .time-labels {
        width: 60px;
      }

      .appointments-container {
        left: 60px;
      }

      .grid-lines {
        left: 60px;
      }

      .details-actions {
        flex-direction: column;
      }

      .modal-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CalendarPage implements OnInit {
  currentView: 'day' | 'week' | 'month' = 'week';
  currentDate: Date = new Date();
  appointments: Appointment[] = [];
  showAppointmentDetailsModal: boolean = false;
  showAppointmentEditModal: boolean = false;
  selectedAppointment: Partial<Appointment> = {};
  editingAppointment: Partial<Appointment> = {};
  isEditMode: boolean = false;
  draggedAppointment: Appointment | null = null;
  minDate: string = new Date().toISOString();
  showBackToMonth: boolean = false;
  previousView: 'day' | 'week' | 'month' = 'month';

  // Constants for time grid
  private readonly PIXELS_PER_MINUTE = 1.5;
  private readonly START_HOUR = 8;
  private readonly END_HOUR = 20;
  private readonly TOTAL_MINUTES = (this.END_HOUR - this.START_HOUR) * 60;

  constructor(
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.generateMockAppointments();
  }

  generateMockAppointments() {
    const today = new Date();
    const mockData = [
      {
        id: '1',
        title: 'Séance personnelle',
        clientName: 'Marie Dubois',
        clientEmail: 'marie.dubois@email.com',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        status: 'confirmed' as const,
        notes: 'Première séance, évaluation des besoins et définition des objectifs à long terme',
        sessionType: 'personal',
        color: '#10dc60'
      },
      {
        id: '2',
        title: 'Consultation nutrition',
        clientName: 'Pierre Martin',
        clientEmail: 'pierre.martin@email.com',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 45),
        status: 'pending' as const,
        notes: 'Demande de plan alimentaire personnalisé pour perte de poids',
        sessionType: 'consultation',
        color: '#ffce00'
      },
      {
        id: '3',
        title: 'Séance de groupe HIIT',
        clientName: 'Groupe fitness',
        clientEmail: 'contact@sallefitness.com',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 18, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 19, 0),
        status: 'confirmed' as const,
        notes: 'Cours de HIIT pour 8 personnes, niveau intermédiaire',
        sessionType: 'group',
        color: '#3880ff'
      },
      {
        id: '4',
        title: 'Évaluation physique complète',
        clientName: 'Sophie Laurent',
        clientEmail: 'sophie.laurent@email.com',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 30),
        status: 'completed' as const,
        notes: 'Tests de condition physique, mesures anthropométriques et plan d\'entraînement',
        sessionType: 'evaluation',
        color: '#92949c'
      },
      {
        id: '5',
        title: 'Suivi personnalisé',
        clientName: 'Jean Dupont',
        clientEmail: 'jean.dupont@email.com',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 16, 30),
        status: 'confirmed' as const,
        notes: 'Suivi hebdomadaire des progrès',
        sessionType: 'personal',
        color: '#10dc60'
      }
    ];

    this.appointments = mockData.map(apt => ({
      ...apt,
      duration: (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60)
    }));
  }

  // Calendar Navigation
  navigateCalendar(direction: number) {
    const newDate = new Date(this.currentDate);
    
    if (this.currentView === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (this.currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (this.currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    
    this.currentDate = newDate;
  }

  getCurrentPeriodTitle(): string {
    if (this.currentView === 'day') {
      return this.currentDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (this.currentView === 'week') {
      const startOfWeek = this.getStartOfWeek(this.currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else {
      return this.currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    }
  }

  getViewIcon(): string {
    switch (this.currentView) {
      case 'day': return 'today-outline';
      case 'week': return 'calendar-outline';
      case 'month': return 'grid-outline';
      default: return 'calendar-outline';
    }
  }

  toggleView() {
    const views: ('day' | 'week' | 'month')[] = ['day', 'week', 'month'];
    const currentIndex = views.indexOf(this.currentView);
    this.currentView = views[(currentIndex + 1) % views.length];
    
    if (this.currentView !== 'day') {
      this.showBackToMonth = false;
    }
  }

  onViewChange() {
    if (this.currentView !== 'day') {
      this.showBackToMonth = false;
    }
  }

  backToMonth() {
    this.currentView = 'month';
    this.showBackToMonth = false;
  }

  // Enhanced Day View Methods
  getGridHeight(): number {
    return this.TOTAL_MINUTES * this.PIXELS_PER_MINUTE;
  }

  getTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    for (let hour = this.START_HOUR; hour <= this.END_HOUR; hour++) {
      const minutes = (hour - this.START_HOUR) * 60;
      const position = minutes * this.PIXELS_PER_MINUTE;
      
      slots.push({
        hour,
        minute: 0,
        label: `${hour.toString().padStart(2, '0')}:00`,
        position
      });
    }
    
    return slots;
  }

  getDayAppointments(): Appointment[] {
    return this.appointments.filter(apt => 
      apt.startTime.toDateString() === this.currentDate.toDateString()
    );
  }

  getDayAppointmentsWithPosition(): Appointment[] {
    const dayAppointments = this.getDayAppointments();
    
    return dayAppointments.map(apt => {
      const startHour = apt.startTime.getHours();
      const startMinute = apt.startTime.getMinutes();
      const totalStartMinutes = (startHour - this.START_HOUR) * 60 + startMinute;
      const position = Math.max(0, totalStartMinutes * this.PIXELS_PER_MINUTE);
      
      const duration = (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60);
      const height = Math.max(60, duration * this.PIXELS_PER_MINUTE);
      
      return {
        ...apt,
        position,
        height,
        duration
      };
    });
  }

  createAppointmentAtPosition(event: MouseEvent) {
    if (event.target !== event.currentTarget) return;
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const minutes = y / this.PIXELS_PER_MINUTE;
    const totalMinutes = Math.round(minutes / 15) * 15; // Round to 15-minute intervals
    
    const startHour = this.START_HOUR + Math.floor(totalMinutes / 60);
    const startMinute = totalMinutes % 60;
    
    const appointmentDate = new Date(this.currentDate);
    appointmentDate.setHours(startHour, startMinute, 0, 0);
    
    this.editingAppointment = {
      title: '',
      clientName: '',
      clientEmail: '',
      startTime: appointmentDate,
      endTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hour default
      status: 'pending',
      notes: '',
      sessionType: 'personal',
      color: '#3880ff'
    };
    this.isEditMode = false;
    this.showAppointmentEditModal = true;
  }

  // Statistics
  getTodayStats() {
    const today = new Date();
    const todayAppointments = this.appointments.filter(apt => 
      apt.startTime.toDateString() === today.toDateString()
    );

    return {
      total: todayAppointments.length,
      confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      pending: todayAppointments.filter(apt => apt.status === 'pending').length
    };
  }

  getRevenue(): number {
    const today = new Date();
    const todayAppointments = this.appointments.filter(apt => 
      apt.startTime.toDateString() === today.toDateString() && 
      apt.status === 'completed'
    );

    return todayAppointments.length * 65;
  }

  // Week View Helpers (unchanged)
  getHours(): number[] {
    return Array.from({ length: 12 }, (_, i) => i + 8);
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  getWeekDays(): { date: Date; isToday: boolean }[] {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        date,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    return days;
  }

  getAppointmentsForDayHour(date: Date, hour: number): Appointment[] {
    return this.appointments.filter(apt => {
      const aptHour = apt.startTime.getHours();
      return aptHour === hour && apt.startTime.toDateString() === date.toDateString();
    });
  }

  // Month View Helpers
  getDayNames(): string[] {
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  }

  getMonthDays(): CalendarDay[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = this.getStartOfWeek(firstDay);
    const days: CalendarDay[] = [];
    const today = new Date();

    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayAppointments = this.appointments.filter(apt => 
        apt.startTime.toDateString() === currentDate.toDateString()
      );

      days.push({
        date: new Date(currentDate),
        appointments: dayAppointments,
        isToday: currentDate.toDateString() === today.toDateString(),
        isCurrentMonth: currentDate.getMonth() === month
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  selectDayInMonth(date: Date) {
    this.previousView = this.currentView;
    this.currentDate = new Date(date);
    this.currentView = 'day';
    this.showBackToMonth = true;
  }

  // Enhanced Appointment Management
  addAppointment() {
    this.editingAppointment = {
      title: '',
      clientName: '',
      clientEmail: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000),
      status: 'pending',
      notes: '',
      sessionType: 'personal',
      color: '#3880ff'
    };
    this.isEditMode = false;
    this.showAppointmentEditModal = true;
  }

  createAppointmentAtDateTime(date: Date, hour: number) {
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hour, 0, 0, 0);
    
    this.editingAppointment = {
      title: '',
      clientName: '',
      clientEmail: '',
      startTime: appointmentDate,
      endTime: new Date(appointmentDate.getTime() + 60 * 60 * 1000),
      status: 'pending',
      notes: '',
      sessionType: 'personal',
      color: '#3880ff'
    };
    this.isEditMode = false;
    this.showAppointmentEditModal = true;
  }

  viewAppointmentDetails(appointment: Appointment, event: Event) {
    event.stopPropagation();
    this.selectedAppointment = { ...appointment };
    this.showAppointmentDetailsModal = true;
  }

  editAppointmentFromDetails() {
    this.editingAppointment = { ...this.selectedAppointment };
    this.isEditMode = true;
    this.showAppointmentDetailsModal = false;
    this.showAppointmentEditModal = true;
  }

  async deleteAppointmentFromDetails() {
    const alert = await this.alertCtrl.create({
      header: 'Supprimer le rendez-vous',
      message: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.appointments = this.appointments.filter(apt => apt.id !== this.selectedAppointment.id);
            this.closeAppointmentDetailsModal();
            this.showToast('Rendez-vous supprimé', 'success');
          }
        }
      ]
    });

    await alert.present();
  }

  async saveAppointment() {
    if (!this.editingAppointment.title || !this.editingAppointment.clientName) {
      await this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const statusColors = {
      pending: '#ffce00',
      confirmed: '#10dc60',
      completed: '#92949c',
      cancelled: '#f04141'
    };

    const duration = this.editingAppointment.endTime && this.editingAppointment.startTime
      ? (this.editingAppointment.endTime.getTime() - this.editingAppointment.startTime.getTime()) / (1000 * 60)
      : 60;

    if (this.isEditMode) {
      const index = this.appointments.findIndex(apt => apt.id === this.editingAppointment.id);
      if (index > -1) {
        this.appointments[index] = {
          ...this.editingAppointment,
          duration,
          color: statusColors[this.editingAppointment.status as keyof typeof statusColors]
        } as Appointment;
      }
    } else {
      const newAppointment: Appointment = {
        ...this.editingAppointment,
        id: Date.now().toString(),
        duration,
        color: statusColors[this.editingAppointment.status as keyof typeof statusColors]
      } as Appointment;
      this.appointments.push(newAppointment);
    }

    this.closeAppointmentEditModal();
    await this.showToast(this.isEditMode ? 'Rendez-vous modifié' : 'Rendez-vous créé', 'success');
  }

  closeAppointmentDetailsModal() {
    this.showAppointmentDetailsModal = false;
    this.selectedAppointment = {};
  }

  closeAppointmentEditModal() {
    this.showAppointmentEditModal = false;
    this.editingAppointment = {};
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'help-circle';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  }

  getSessionTypeLabel(sessionType: string): string {
    switch (sessionType) {
      case 'personal': return 'Séance personnelle';
      case 'group': return 'Séance de groupe';
      case 'consultation': return 'Consultation';
      case 'evaluation': return 'Évaluation';
      default: return sessionType;
    }
  }

  getAppointmentDuration(appointment: any): number {
    if (!appointment.startTime || !appointment.endTime) return 0;
    return Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60));
  }

  // Drag and Drop (enhanced)
  onDragStart(appointment: Appointment, event: DragEvent) {
    this.draggedAppointment = appointment;
    event.dataTransfer?.setData('text/plain', appointment.id);
    appointment.dragging = true;
  }

  onDragEnd(event: DragEvent) {
    if (this.draggedAppointment) {
      this.draggedAppointment.dragging = false;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('drag-over');
  }

  onDrop(event: DragEvent, date: Date, hour: number) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (this.draggedAppointment) {
      const newStartTime = new Date(date);
      newStartTime.setHours(hour, 0, 0, 0);
      
      const duration = this.draggedAppointment.endTime.getTime() - this.draggedAppointment.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      this.draggedAppointment.startTime = newStartTime;
      this.draggedAppointment.endTime = newEndTime;

      this.draggedAppointment = null;
      this.cdr.detectChanges();
    }
  }

  onDropOnDay(event: DragEvent, date: Date) {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('drag-over');

    if (this.draggedAppointment) {
      const newStartTime = new Date(date);
      newStartTime.setHours(this.draggedAppointment.startTime.getHours(), this.draggedAppointment.startTime.getMinutes());
      
      const duration = this.draggedAppointment.endTime.getTime() - this.draggedAppointment.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      this.draggedAppointment.startTime = newStartTime;
      this.draggedAppointment.endTime = newEndTime;

      this.draggedAppointment = null;
      this.cdr.detectChanges();
    }
  }

  // Utility Methods
  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    await toast.present();
  }
}