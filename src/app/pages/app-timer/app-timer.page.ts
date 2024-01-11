import { Component, OnInit } from '@angular/core';
import {interval, Subject, takeUntil} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NativeAudio} from "@capacitor-community/native-audio";

async function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}


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
    // Load audio
    this.load_audios();
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


  // The required attributes for the work-rest mode
  form = new FormGroup({
    round_number: new FormControl(1, Validators.required),
    work_duration: new FormControl(30, Validators.required),
    rest_duration: new FormControl(10, Validators.required),
    alert_mode: new FormControl('sound', Validators.required),
  })

  round_started = false;
  round_paused = false;
  interval: any = undefined; // The interval object used to run the timer
  train_status = ""
  train_total_time = 0 // The total running time
  work_or_rest_time = 0 // The time in the current interval (work or rest)
  round_number:number = 0;

  launch_interval(){
    // Create the interval object, every 1 second
    this.interval = setInterval(() => {
      // If the number of round is reached
      if (this.round_number > parseInt(this.form.value.round_number as any)) {
        this.finish_training()
      }
      this.train_total_time += 1;
      this.work_or_rest_time += 1;

      if (this.train_status == "work") {
        if (this.work_or_rest_time == this.form.value.work_duration) {
          this.train_status = "rest";
          this.work_or_rest_time = 0;
          this.audio_rest.play();
          NativeAudio.play({
            assetId: "dream-99404.mp3"
          })
        }
        // Set the progress bar
        this.set_progress(this.work_or_rest_time / parseInt(this.form.value.work_duration as any))
      } else {
        if (this.work_or_rest_time == this.form.value.rest_duration) {
          this.train_status = "work";
          this.work_or_rest_time = 0;
          this.round_number += 1;
        }
        // run before the next step begin, fetch audio length
        if (parseInt(this.work_or_rest_time + this.audio_work.duration) == this.form.value.rest_duration && this.round_number +1 <= parseInt(this.form.value.round_number as any)) {
          // Play the work audio
          this.audio_work.play();
          NativeAudio.play({
            assetId: "race-start-beeps-125125.mp3"
          })
        }
        // Set the progress bar
        this.set_progress(this.work_or_rest_time / parseInt(this.form.value.rest_duration as any))
      }
    }, 1000);
  }
  async start_round() {
    // Play audio when start
    this.audio_work.play();
    NativeAudio.play({
      assetId: "race-start-beeps-125125.mp3"
    })
    await wait(4000);

    this.round_number = 1
    this.round_started = true;
    this.round_paused = false;
    this.train_status = "work";
    this.launch_interval()

    this.set_progress(0.5)
  }

  pause_round() {
    this.round_paused = true;
    clearInterval(this.interval);
  }

  async resume_round() {
    this.audio_work.play();
    NativeAudio.play({
      assetId: "race-start-beeps-125125.mp3"
    })
    await wait(4000);
    this.round_paused = false;
    this.launch_interval()
  }

  finish_training(){
    this.audio_finish.play();
    NativeAudio.play({
      assetId: "success-1-6297.mp3"
    })
    this.stop_round();
  }

  // The audios used
  audio_work: any = undefined
  audio_rest: any = undefined
  audio_finish: any = undefined

  load_audios = () => {
    // For the web
    this.audio_work = new Audio()
    this.audio_work.src = "../../assets/audio/race-start-beeps-125125.mp3";
    this.audio_rest = new Audio()
    this.audio_rest.src = "../../assets/audio/dream-99404.mp3"
    this.audio_finish = new Audio()
    this.audio_finish.src = "../../assets/audio/success-1-6297.mp3"

    // For the native device
    NativeAudio.preload({
      assetId: "race-start-beeps-125125.mp3",
      assetPath: "public/assets/assets/audio/race-start-beeps-125125.mp3",
      audioChannelNum: 1,
      isUrl: false
    })
    NativeAudio.preload({
      assetId: "dream-99404.mp3",
      assetPath: "public/assets/assets/audio/dream-99404.mp3",
      audioChannelNum: 1,
      isUrl: false
    })
    NativeAudio.preload({
      assetId: "success-1-6297.mp3",
      assetPath: "public/assets/assets/audio/success-1-6297.mp3",
      audioChannelNum: 1,
      isUrl: false
    })
  }

  stop_round() {
    this.round_started = false;
    this.round_paused = false;
    this.train_status = "";
    this.train_total_time = 0;
    this.work_or_rest_time = 0;
    this.round_number = 0;
    clearInterval(this.interval);
  }

  sound_or_vibrate_work() {
    // Play sound
    this.audio_work.play();
  }

  sound_or_vibrate_pause() {

  }

  progress = 0.0;
  set_progress = (value: number) => {
    this.progress = value
    // Set the style of the progress bar
    //document.querySelector('.progress-bar')!.setAttribute('style', `background: radial-gradient(closest-side, var(--ion-background-color, #fff) 79%, transparent 80% 100%), conic-gradient(var(--ion-color-primary) 55%, gray 0)`);
  }

  protected readonly Math = Math;
}
