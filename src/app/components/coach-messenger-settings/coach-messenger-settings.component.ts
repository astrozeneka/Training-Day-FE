import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, debounceTime, from, map, merge, Observable, of, share, shareReplay, startWith, Subject, Subscription, switchMap } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { User, UserSettings } from 'src/app/models/Interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-coach-messenger-settings',
  template: `
    <!-- Status & Availability Section -->
    <div class="availability-section" *ngIf="userSettings$ | async">
      <div class="availability-container">
        <div class="status-indicator">
          <ion-badge class="status-badge {{isAvailable ? 'available' : 'unavailable'}}">
            {{isAvailable ? 'Disponible' : 'Non disponible'}}
          </ion-badge>
        </div>
        <div class="toggle-container">
          <span class="toggle-label" *ngIf="scheduledAvailable">Je ne suis pas disponible</span>
          <span class="toggle-label" *ngIf="!scheduledAvailable">Je suis disponible</span>
          <ion-toggle [checked]="toggleActivated" (ionChange)="toggleAvailability($event)" color="success"></ion-toggle>
        </div>
      </div>
    </div>`,
  styles: [`

// Import mixins
// Mixins
@mixin flex($direction: row, $justify: flex-start, $align: center) {
  display: flex;
  flex-direction: $direction;
  justify-content: $justify;
  align-items: $align;
}
$success-color: #2dd36f;
$medium-color: #92949c;
$text-secondary: #4b5563;

// Availability section
.availability-section {
  padding: 0.75rem 1rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.availability-container {
  @include flex(row, space-between);
}

.status-indicator {
  @include flex;
  gap: 0.5rem;
}

.status-badge {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  
  &.available {
    background-color: $success-color;
  }
  
  &.unavailable {
    background-color: $medium-color;
  }
}

.toggle-container {
  @include flex;
}

.toggle-label {
  color: $text-secondary;
  margin-right: 0.5rem;
  font-size: 0.875rem;
}
  
// Dark mode support
@media (prefers-color-scheme: dark) {
  .availability-section {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .status-badge {
    &.available {
      background-color: $success-color;
    }
    
    &.unavailable {
      background-color: #4b5563;
    }
  }
  
  .toggle-label {
    color: #d1d5db;
  }
}
  `]
})
export class CoachMessengerSettingsComponent implements OnInit {

  bearerToken$: Observable<string>;
  userSettings$: Observable<UserSettings>;
  refreshSettings$ = new Subject<void>()

  /*user$: Observable<User>
  user: User | null = null;*/
  userId$: Observable<number>;
  isAvailable: boolean = false; // Computed based on user settings and toggle state
  scheduledAvailable: boolean = false; // Depending on the settings
  toggleActivated: boolean = false; // The toggle state

  private subscriptions: Subscription = new Subscription();

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    // The bearer token
    // The token$ is used to get the token from the content service
    this.bearerToken$ = from(this.contentService.storage.get('token')).pipe(
      shareReplay(1) // cache and share the latest emitted value of an observable with multiple subscribers.
    );

    // The user settings
    this.userSettings$ = merge(
      this.refreshSettings$.pipe(startWith(undefined))
    )
      .pipe(
        switchMap(() => this.bearerToken$),
        switchMap(bearer => {
          let headers = {
            'Authorization': `Bearer ${bearer}`,
            'Content-Type': 'application/json'
          };
          console.log("Fetching /user-settings");
          return this.http.get(`${environment.apiEndpoint}/user-settings`, { headers }) as Observable<UserSettings>;
        }),
        shareReplay(1)
      )

    // The user id
    this.userId$ = this.contentService.userStorageObservable.gso$().pipe(
      map(user => user.id),
      shareReplay(1)
    );

  }

  ngOnInit() {
    // Subscribe to user observable
    this.computeAvailabilityStatus();

    /*const userSub = this.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.computeAvailabilityStatus();
      }
    });

    this.subscriptions.add(userSub);*/
  }

  ngOnDestroy() {
    // Clean up subscriptions
    // this.subscriptions.unsubscribe();
  }

  /**
   * Calculates if the user is available based on:
   * 1. Manual availability settings
   * 2. Schedule settings (active hours and pause days)
   */
  private computeAvailabilityStatus(): void {
    this.userSettings$.subscribe((userSettings) => {

      // const userSettings = this.user.user_settings || {} as UserSettings;

      // Check manual availability setting
      const manuallyAvailable = userSettings.available === true && userSettings.unavailable !== true;

      // Check schedule-based availability
      let scheduledAvailable = true;

      if (userSettings.activeFrom && userSettings.activeTo && userSettings.pauseDays) {
        const now = new Date();
        const pauseDays = userSettings.pauseDays;
        const [fromHours, fromMinutes] = userSettings.activeFrom.split(':').map(Number);
        const [toHours, toMinutes] = userSettings.activeTo.split(':').map(Number);

        // Check if today is a pause day
        const isPauseDay = pauseDays.includes(now.getDay());

        // Check if current time is within active hours
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        const isAfterActiveFrom =
          currentHours > fromHours ||
          (currentHours === fromHours && currentMinutes >= fromMinutes);

        const isBeforeActiveTo =
          currentHours < toHours ||
          (currentHours === toHours && currentMinutes < toMinutes);

        scheduledAvailable = !isPauseDay && isAfterActiveFrom && isBeforeActiveTo;
      }

      /*console.log('Scheduled available:', scheduledAvailable);
      console.log("Settings available:", userSettings.available); // Not instantly updated
      console.log("Settings unavailable:", userSettings.unavailable);*/
      // User is available if both manual and schedule conditions are met
      if (scheduledAvailable) {
        if (userSettings.unavailable) {
          this.isAvailable = false;
        } else {
        this.isAvailable = true;}
      }
      if (!scheduledAvailable) {
        if (userSettings.available) {
          this.isAvailable = true;
          console.log("===>", this.isAvailable);
        } else {
          this.isAvailable = false;
        }
      }
      this.scheduledAvailable = scheduledAvailable;
      this.cdr.detectChanges();
    });
  }

  /**
   * Handles the availability toggle change event
   * @param event The toggle change event
   */
  toggleAvailability(event: any): void {
    
    this.userId$.subscribe((userId) => {
    
      const isChecked = event.detail.checked;
      const updatePayload = {
        user_id: userId,
        key: this.scheduledAvailable ? 'unavailable' : 'available',
        value: isChecked
      };

      this.contentService.put('/user-settings', updatePayload)
        .pipe(
          catchError(error => {
            console.error('Error updating availability:', error);
            this.isAvailable = !isChecked;
            return of(null);
          })
        )
        .subscribe(()=>{
          // Refresh the user settings
          this.refreshSettings$.next();
        });
    })


    /*if (!this.user) return;

    const isChecked = event.detail.checked;

    // Update the user settings
    const updatePayload = {
      user_id: this.user.id,
      key: this.scheduledAvailable ? 'unavailable' : 'available',
      value: isChecked
    };
    console.log(updatePayload);
    
    // Send update to server
    this.contentService.put('/user-settings', updatePayload)
      .pipe(
        debounceTime(300),
        catchError(error => {
          console.error('Error updating availability:', error);
          // Revert UI state on error
          this.isAvailable = !isChecked;
          return of(null);
        })
      )
      .subscribe(() => {
        // Update local user object
        if (this.user) {
          this.user.user_settings = {
            ...this.user.user_settings,
            [isChecked ? 'available' : 'unavailable']: isChecked
          };

          // Update storage
          // this.contentService.userStorageObservable.updateStorage(this.user);
          this.contentService.userStorageObservable.gso$()
            .subscribe((user)=>{
              console.log("user", user);
              this.user = user
            })

          // Recompute availability status
          this.computeAvailabilityStatus();
        }
      });*/
  }
}
