import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ContentService } from '../../content.service';
import { delay, from, shareReplay, switchMap } from 'rxjs';
import { StaffAppointment } from 'src/app/components/appointment-list/appointment-list.component';



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

  <app-appointment-list [appointments]="staffAppointments" [isLoadingAppointments]="isLoadingAppointments"></app-appointment-list>

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
}
