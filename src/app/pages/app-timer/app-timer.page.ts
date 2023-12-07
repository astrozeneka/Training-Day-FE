import { Component, OnInit } from '@angular/core';
import {interval, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-app-timer',
  templateUrl: './app-timer.page.html',
  styleUrls: ['./app-timer.page.scss'],
})
export class AppTimerPage implements OnInit {
  chronometerValue: string = '00:00';
  chronometerRunning: boolean = false;
  laps: string[] = [];

  private destroy$ = new Subject<void>();
  private startTime: number = 0;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() { }

  ngOnInit() {
  }

  startChronometer() {
    if (!this.chronometerRunning) {
      this.chronometerRunning = true;
      this.startTime = Date.now();

      // Set up a timer that updates the chronometer every 100 milliseconds
      interval(100)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.chronometerRunning) {
            this.updateChronometer();
          }
        });
    }
  }

  pauseChronometer() {
    this.chronometerRunning = false;
  }

  addLap() {
    if (this.chronometerRunning) {
      const lapTime = this.calculateElapsedTime();
      this.laps.push(this.formatTime(lapTime));
    }
  }

  updateChronometer() {
    const elapsedMilliseconds = this.calculateElapsedTime();
    this.chronometerValue = this.formatTime(elapsedMilliseconds);
  }

  calculateElapsedTime(): number {
    return Date.now() - this.startTime;
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }
}
