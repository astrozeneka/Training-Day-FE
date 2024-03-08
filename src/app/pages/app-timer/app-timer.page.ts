import { Component, OnInit } from '@angular/core';
import {interval, Subject, takeUntil} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NativeAudio} from "@capacitor-community/native-audio";
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {NavigationStart, Router} from "@angular/router";

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

  constructor(
    private router: Router,
  ) {
    router.events.subscribe((event:any)=>{
      if(event instanceof NavigationStart && this.router.url == '/app-timer'){
        this.stop_round();
        this.form.reset();
      }
    })
    this.form.controls.round_number.valueChanges.subscribe((value) => {
      this.updateTotalTime()
    })
    this.form.controls.work_duration.valueChanges.subscribe((value) => {
      if(value == null) return
      let minutes = parseInt(value.split(":")[0])
      let seconds = parseInt(value.split(":")[1])
      this.work_duration = minutes * 60 + seconds
      this.updateTotalTime()
    })
    this.form.controls.rest_duration.valueChanges.subscribe((value) => {
      if(value == null) return
      let minutes = parseInt(value.split(":")[0])
      let seconds = parseInt(value.split(":")[1])
      this.rest_duration = minutes * 60 + seconds
      this.updateTotalTime()
    })
  }

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
    round_number: new FormControl(3, Validators.required),
    //work_duration: new FormControl(30, Validators.required),
    work_duration: new FormControl<any>('00:30', []),
    //rest_duration: new FormControl(10, Validators.required),
    rest_duration: new FormControl<any>('00:10', []),
    alert_mode: new FormControl('sound', Validators.required),
    train_total_time: new FormControl('02:00', Validators.required)
  })
  work_duration:any = 30
  rest_duration:any = 10

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
        if (this.work_or_rest_time == this.work_duration) {
          this.train_status = "rest";
          this.vibrate()
          this.work_or_rest_time = 0;
          this.sound_or_vibrate_pause();
        }
        // Set the progress bar
        this.set_progress(this.work_or_rest_time / this.work_duration)
      } else {
        if (this.work_or_rest_time == this.rest_duration) {
          this.train_status = "work";
          this.vibrate()
          this.work_or_rest_time = 0;
          this.round_number += 1;
        }
        // run before the next step begin, fetch audio length
        // the -1 is important because the step begin 1 second before the audio end
        if (parseInt(this.work_or_rest_time + this.audio_work.duration) - 1 == this.rest_duration && this.round_number +1 <= parseInt(this.form.value.round_number as any)) {
          this.sound_or_vibrate_work()
        }
        // Set the progress bar
        this.set_progress(this.work_or_rest_time / parseInt(this.rest_duration as any))
      }
    }, 1000);
  }
  async start_round() {
    this.sound_or_vibrate_work();
    await wait(3000); // The audio is supposed to be 4 seconds long, but the step begin 1 second before the audio end
    this.vibrate()
    this.round_number = 1
    this.round_started = true;
    this.round_paused = false;
    this.train_status = "work";
    this.launch_interval()
    this.set_progress(0.0)
  }

  pause_round() {
    this.round_paused = true;
    clearInterval(this.interval);
  }

  async resume_round() {
    this.sound_or_vibrate_work()
    await wait(4000);
    this.round_paused = false;
    this.launch_interval()
  }

  finish_training(){
    this.sound_or_vibrate_finish()
    this.stop_round();
  }

  // The audios used
  audio_work: any = undefined
  audio_rest: any = undefined
  audio_finish: any = undefined

  load_audios = () => {
    // For the web
    try{
      this.audio_work = new Audio()
      this.audio_work.src = "../../assets/audio/race-start-beeps-125125.mp3";
      this.audio_rest = new Audio()
      this.audio_rest.src = "../../assets/audio/dream-99404.mp3"
      this.audio_finish = new Audio()
      this.audio_finish.src = "../../assets/audio/success-1-6297.mp3"
    }catch(e){
    }
    // For the native device
    try{
      NativeAudio.preload({
        assetId: "race-start-beeps-125125.mp3",
        assetPath: "public/assets/audio/race-start-beeps-125125.mp3",
        audioChannelNum: 1,
        isUrl: false
      })
    }catch (e) {
    }

    try{
      NativeAudio.preload({
        assetId: "dream-99404.mp3",
        assetPath: "public/assets/audio/dream-99404.mp3",
        audioChannelNum: 1,
        isUrl: false
      })
    }catch (e) {
    }

    try{
      NativeAudio.preload({
        assetId: "success-1-6297.mp3",
        assetPath: "public/assets/audio/success-1-6297.mp3",
        audioChannelNum: 1,
        isUrl: false
      })
    }catch (e) {
    }
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
    // Play audio when start
    NativeAudio.play({
      assetId: "race-start-beeps-125125.mp3"
    }).catch((e)=>{
      this.audio_work.play();
    });
  }

  sound_or_vibrate_pause() {
    // Play audio when the "pause" session begin
    NativeAudio.play({
      assetId: "dream-99404.mp3"
    }).catch((e)=>{
      this.audio_rest.play();
    });
  }

  sound_or_vibrate_finish() {
    // Play audio when the training is finished
    NativeAudio.play({
      assetId: "success-1-6297.mp3"
    }).catch((e)=>{
      this.audio_finish.play();
    });
  }

  progress = 0.0;
  set_progress = (value: number) => {
    this.progress = value
    // Set the style of the progress bar
    //document.querySelector('.progress-bar')!.setAttribute('style', `background: radial-gradient(closest-side, var(--ion-background-color, #fff) 79%, transparent 80% 100%), conic-gradient(var(--ion-color-primary) 55%, gray 0)`);
  }

  protected readonly Math = Math;

  vibrate () {
    // Vibrate when the session begin
    Haptics.vibrate();
  }

  increment_duration(delta:number, slug:string){
    let duration:any
    if(slug == 'work_duration')
      duration = this.form.controls?.work_duration
    else if(slug == 'rest_duration')
      duration = this.form.controls?.rest_duration
    else
      return
    duration = duration.value
    let minutes = parseInt(duration.split(":")[0])
    let seconds = parseInt(duration.split(":")[1])
    let total_seconds = minutes * 60 + seconds
    total_seconds += delta
    if (total_seconds < 10) total_seconds = 10
    minutes = Math.floor(total_seconds / 60)
    seconds = total_seconds % 60
    duration = this.padZero(minutes) + ":" + this.padZero(seconds)
    if (slug == 'work_duration')
      this.form.patchValue({work_duration: duration})
    else if(slug == 'rest_duration')
      this.form.patchValue({rest_duration: duration})
  }

  increment_round(delta:number){
    let round:any = this.form.controls?.round_number
    round = round.value
    round = parseInt(round) + delta
    if (round < 1) round = 1
    this.form.patchValue({round_number: round})
  }

  updateTotalTime(){
    let minutes = parseInt(this.form.controls?.work_duration.value.split(":")[0]) + parseInt(this.form.controls?.rest_duration.value.split(":")[0])
    let seconds = parseInt(this.form.controls?.work_duration.value.split(":")[1]) + parseInt(this.form.controls?.rest_duration.value.split(":")[1])
    let total_seconds = (minutes * 60 + seconds) * (this.form.controls?.round_number.value as any)
    // Convert to mm:ss format
    this.form.patchValue({train_total_time: this.padZero(Math.floor(total_seconds / 60)) + ":" + this.padZero(total_seconds % 60)})
  }


}
