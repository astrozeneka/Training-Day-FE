import { Component, OnInit } from '@angular/core';


interface CalendarEvent {

}
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[]; // Array to hold events for the day
}

@Component({
  selector: 'app-calendar-v2',
  template: `
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>calendar-v2</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">calendar-v2</ion-title>
    </ion-toolbar>
  </ion-header>

  <div class="calendar-v2">
    <!-- Month navigation -->
    <div class="month-navigation">
      <ion-button fill="clear" (click)="previousMonth()">
        <ion-icon name="chevron-back"></ion-icon>
      </ion-button>
      <div class="month-year-display">
        {{ getMonthName(displayedMonth) }} {{ displayedYear }}
      </div>
      <ion-button fill="clear" (click)="nextMonth()">
        <ion-icon name="chevron-forward"></ion-icon>
      </ion-button>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <div class="grid-header">
        <div class="grid-header-item">Sun</div>
        <div class="grid-header-item">Mon</div>
        <div class="grid-header-item">Tue</div>
        <div class="grid-header-item">Wed</div>
        <div class="grid-header-item">Thu</div>
        <div class="grid-header-item">Fri</div>
        <div class="grid-header-item">Sat</div>
      </div>
      <div class="grid-body">
        <div class="grid-cell" 
          *ngFor="let day of calendarDayItems"
          [class.current-month]="day.isCurrentMonth"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday">
          <div class="day-content">
            <span class="day-number">{{ day.date.getDate() }}</span>
            <div class="event-indicator" *ngIf="day.events.length > 0">
              <span class="event-dots" *ngIf="day.events.length <= 3">
                <span class="dot" *ngFor="let event of day.events"></span>
              </span>
              <span class="event-badge" *ngIf="day.events.length > 3">{{ day.events.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {{ currentMonth }} - {{ displayedYear }}
</ion-content>
  `,
styles: [`
.month-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--ion-color-light);
}

.month-year-display {
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  text-align: center; // Might be changed to justify-content: center;
}

.grid-header {
  display: contents;
}

.grid-header-item {
  padding: 8px;
  text-align: center;
  font-weight: bold;
  background-color: var(--ion-color-primary);
}

.grid-body {
  display: contents;
}

.grid-cell {
  padding: 4px;
  height: 60px;
  position: relative;

  & .day-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  & .day-number {
    font-size: 14px;
  }

  & .event-indicator {
    margin-top: 2px;
  }

  & .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--ion-color-primary);
    display: inline-block;
    margin: 0 1px;
  }

  & .event-badge {
    background-color: var(--ion-color-primary);
    color: white;
    border-radius: 8px;
    padding: 1px 4px;
    font-size: 10px;
    font-weight: bold;
  }
}

.grid-cell.current-month {
  color: var(--ion-color-dark);
  font-weight: 500;
}

.grid-cell.other-month {
  color: var(--ion-color-medium);
  font-weight: 300;
}

.grid-cell.today {
  color: var(--ion-color-primary) !important;
  font-weight: bold;
  border: 2px solid var(--ion-color-primary-shade);
}
  `]
})
export class CalendarV2Page implements OnInit {

  // Used to track the page state
  currentDate = new Date();
  currentMonth:number;
  displayedMonth:number;
  displayedYear:number;

  // The UI items
  calendarDayItems: CalendarDay[] = []; // This can changes if the user switch between months


  constructor() {
    this.currentMonth = this.currentDate.getMonth();
    this.displayedMonth = this.currentDate.getMonth(); // Initialize displayedMonth with current month
    this.displayedYear = this.currentDate.getFullYear(); // Initialize displayedYear with current year
   }

  ngOnInit() {
    this.generateCalendar();

    // Add random events (to be removed later)
    let nrandomevents = 10;
    // Add random events within the next 30 days
    let eventTypes = ['Training', 'Nutrition', 'Consultation', 'Follow-up'];// Add random events within the next 30 days
    for (let _i = 0; _i < 60; _i+=0.5) {
      let i = Math.floor(_i);
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + i);
      
      // 30% chance to add an event on each day
      if (Math.random() < 0.3) {
        const event: CalendarEvent = {};
        
        // Find the corresponding day in calendarDayItems
        const dayItem = this.calendarDayItems.find(day => 
          day.date.toDateString() === eventDate.toDateString()
        );
        
        if (dayItem) {
          dayItem.events.push(event);
        }
      }
    }

  }

  _getPreviousMonthDays(currentDate:Date):CalendarDay[] {
    const previousMonthDays: CalendarDay[] = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDOW = firstDayOfMonth.getDay(); // Day of the week (0-6, where 0 is Sunday)

    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPreviousMonth = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate();

    for (let i = daysInPreviousMonth - firstDOW + 1; i <= daysInPreviousMonth; i++) {
      const date = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), i);
      previousMonthDays.push({
        date: date,
        isCurrentMonth: false,
        isToday: date.toDateString() === this.currentDate.toDateString(),
        events: []
      });
    }

    return previousMonthDays;
  }

  _getNextMonthDays(currentDate: Date): CalendarDay[] {
    const nextMonthDays: CalendarDay[] = [];
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const lastDOW = lastDayOfMonth.getDay(); // Day of the week (0-6, where 0 is Sunday)

    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    // Calculate how many days from next month are needed to complete the week
    const daysToAdd = lastDOW === 6 ? 0 : 6 - lastDOW;

    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
      nextMonthDays.push({
        date: date,
        isCurrentMonth: false,
        isToday: date.toDateString() === this.currentDate.toDateString(),
        events: []
      });
    }

    return nextMonthDays;
  }

  _getCurrentMonthDays(currentDate: Date): CalendarDay[] {
    const currentMonthDays: CalendarDay[] = [];
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      currentMonthDays.push({
        date: date,
        isCurrentMonth: true,
        isToday: date.toDateString() === this.currentDate.toDateString(),
        events: []
      });
    }

    return currentMonthDays;
  }

  

  generateCalendar() {
    const firstDay = new Date(this.displayedYear, this.displayedMonth, 1).getDay(); // This indicate the day of the week
    const daysInMonth = new Date(this.displayedYear, this.displayedMonth + 1, 0).getDate();

    // Get the previous month day that belong to the same week as the first day
    const previousMonthDays: CalendarDay[] = this._getPreviousMonthDays(new Date(this.displayedYear, this.displayedMonth, 1));
    const currentMonthDays: CalendarDay[] = this._getCurrentMonthDays(new Date(this.displayedYear, this.displayedMonth, 1));
    const nextMonthDays: CalendarDay[] = this._getNextMonthDays(new Date(this.displayedYear, this.displayedMonth, 1));

    // Combine all days into a single array
    this.calendarDayItems = [
      ...previousMonthDays,
      ...currentMonthDays,
      ...nextMonthDays
    ];
  }

  previousMonth() {
    if (this.displayedMonth === 0) {
      this.displayedMonth = 11;
      this.displayedYear--;
    } else {
      this.displayedMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.displayedMonth === 11) {
      this.displayedMonth = 0;
      this.displayedYear++;
    } else {
      this.displayedMonth++;
    }
    this.generateCalendar();
  }

  getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  }
}
