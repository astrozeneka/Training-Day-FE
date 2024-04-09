import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {catchError, interval, Subject, takeUntil, throwError} from "rxjs";
import {registerPlugin} from "@capacitor/core";
import {BackgroundGeolocationPlugin} from "@capacitor-community/background-geolocation";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {NavigationEnd, NavigationStart, Router} from "@angular/router";
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");



@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
})
export class GpsPage implements OnInit {
  previousCoords:any = null
  distance = 0.0
  steps:any[] = [] // Update, the new distance is programmatically calculated
  running = false

  chronometerRunning = false
  chronometerValue = "00:00"
  private destroy$ = new Subject<void>();

  elapsedTime = 0

  // Stats
  per_kilometer: number[] = []
  per_kilometer_duration:number[] = [] // An array that show the history for each kilometer
  per_kilometer_distance:number[] = [] // It is normally an array of 1, except for the last item
  per_kilometer_speed:number[] = [] // It is normally an array of 1, except for the last item

  overall_distance = 0
  per_kilometer_stats:any[] = []
  current_km_time = 0
  current_km_distance = 0
  overall_time = 0
  interval:any = null

  constructor(
    private contentService:ContentService,
    private feedbackService:FeedbackService,
    private router: Router,
  ) {
    this.router.events.subscribe(async(event:any)=>{
      if (event instanceof NavigationEnd && event.url == '/app-gps') {
        this.interval = setInterval(()=>{
          // Convert the chronometerValue to Seconds
          if(this.running){
            let s:any = this.chronometerValue.split(":")
            s = parseInt(s[0])*60 + parseInt(s[1])
            s += 1
            this.chronometerValue = `${String(Math.floor(s/60)).padStart(2, '0')}:${String(Math.floor(s%60)).padStart(2, '0')}`;
          }
        }, 1000)
      }
      if(event instanceof NavigationStart){
        clearInterval(this.interval)
      }
      //
    })
  }

  ngOnInit() {



    // Register the background geolocation
    // The chronometer
    /*interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.chronometerRunning) {
          this.elapsedTime++;
          this.updateChronometer();
          this.updateHistory();
        }
      });*/
  }

  calculateODO(){
    // This will use the steps array to calculate the overall distance
    // And also, calculate the per_kilometer time (and speed)
    this.overall_distance = 0
    this.per_kilometer_stats = []
    this.current_km_time = 0
    this.current_km_distance = 0
    this.overall_time = 0

    for(let i = 1; i < this.steps.length; i++){
      let A = this.steps[i-1]
      let B = this.steps[i]
      let AB_dist = this.calculateDistance(A.latitude, A.longitude, B.latitude, B.longitude)
      let AB_time = B.timestamp - A.timestamp
      this.overall_distance += AB_dist
      this.overall_time += AB_time

      this.current_km_distance += AB_dist
      this.current_km_time += AB_time
      if(this.current_km_distance >= 1){
        console.log(this.current_km_time)
        console.log(this.current_km_distance)

        // Calculated the time for one kilometer (need to use interpolation because the current_km_distance is a little bit above 1)
        let d = {
          index: this.per_kilometer_stats.length,
          distance: 1,
          time: this.current_km_time*1/this.current_km_distance, // in ms
          speed: 0.0, // in km/ms
          speed_kmh: 0.0
        }
        d.speed = d.distance / d.time
        d.speed_kmh = d.speed * 3600000
        this.per_kilometer_stats.push(d)
        this.current_km_distance -= d.distance
        this.current_km_time -= d.time
      }
    }

    // Convert the overall_time to s
    this.overall_time /= 1000
    // Convert to mm:ss
    this.chronometerValue = `${String(Math.floor(this.overall_time/60)).padStart(2, '0')}:${String(Math.floor(this.overall_time%60)).padStart(2, '0')}`;
  }

  export_json(){
    // Send the steps array to the server
    let data = {
      'mail': 'ryanrasoarahona@gmail.com',
      'data': JSON.stringify(this.steps)
    }
    this.contentService.post('/export-json', data)
      .pipe(catchError((error)=>{
        this.feedbackService.registerNow("Error while exporting", "danger")
        return throwError(error)
      }))
      .subscribe((response:any)=>{
        this.feedbackService.registerNow("Exported", "success")
      })
  }

  tracking = false;
  watch: any = null;
  watcherId: any = null
  async startTracking(){
    this.running = true

    BackgroundGeolocation.addWatcher({
      backgroundMessage: "Cancel to prevent battery drain.",
      backgroundTitle: "Tracking You.",
      requestPermissions: true,
      stale: false,
      distanceFilter: 5 // Minimum number of meter between two notification
    }, (location, error)=>{
      if (error) {
        if (error.code === "NOT_AUTHORIZED") {
          if (window.confirm(
            "This app needs your location, " +
            "but does not have permission.\n\n" +
            "Open settings now?"
          )) {
            BackgroundGeolocation.openSettings();
          }
        }
        return console.error(error);
      }
      /*{"accuracy":39.07406129257284,"altitudeAccuracy":20.20559310913086,"simulated":false,"speed":null,"bearing":null,"latitude":13.83881753587838,"longitude":100.57199800941332,"time":1709994738018,"altitude":8.1845121383667}*/
      let step:any = location
      //if(this.running){
      if(true){
        step.timestamp = new Date().getTime()
        this.steps.push(step)
        this.calculateODO()
        /*
        longitude,
        latitude,
        timestamp
         */
      }
      return console.log(location)
    }).then((watcher_id)=>{
      console.log("Watcher added, id is ", watcher_id)
      this.watcherId = watcher_id
      // This should be called when the user stops the tracking
      /*BackgroundGeolocation.removeWatcher({
        id: watcher_id
      })*/
    })

    /*
    this.elapsedTime = 0
    this.chronometerRunning = true
    this.tracking = true;
    // const coordinates = await Geolocation.getCurrentPosition();
    // console.log('Current position: ', coordinates)
    this.watch = Geolocation.watchPosition({
      enableHighAccuracy: true,
    }, (position:any)=>{
      const { latitude, longitude } = position.coords;
      if (this.previousCoords) {
        const delta = this.calculateDistance(this.previousCoords.latitude, this.previousCoords.longitude, latitude, longitude);
        this.distance += delta
      }
      this.previousCoords = {latitude, longitude}
    });*/
  }

  async stopTracking(){
    this.running = false
    BackgroundGeolocation.removeWatcher({
      id: this.watcherId
    })

    /*
    this.chronometerRunning = false
    if (this.watch) {
      Geolocation.clearWatch(this.watch)
      this.watch = null
      this.tracking = false;
    }

     */
  }

  updateHistory() {
    let km_index = Math.floor(this.distance)
    if (this.per_kilometer_duration[km_index] == undefined){
      this.per_kilometer_duration[km_index] = 0
      this.per_kilometer_distance[km_index] = 0
      this.per_kilometer.push(km_index)
    }
    this.per_kilometer_duration[km_index] += 1
    this.per_kilometer_distance[km_index] = this.distance - this.sumArray(this.per_kilometer_distance.slice(0, km_index-1))
    this.per_kilometer_speed[km_index] = this.per_kilometer_distance[km_index] / this.per_kilometer_duration[km_index]
  }

  _add_100m(){
    this.distance += 0.1
  }

  calculateDistance(lat1:number, lon1:number, lat2:number, lon2:number) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  }

  deg2rad(deg:number) {
    return deg * (Math.PI / 180);
  }

  updateChronometer() {
    // Parse the current chronometer value and increment by 1 second
    const timeParts = this.chronometerValue.split(':');
    let minutes = parseInt(timeParts[0], 10);
    let seconds = parseInt(timeParts[1], 10);

    seconds++;

    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }

    // Format the updated values as 'mm:ss'
    this.chronometerValue = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  padZero(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  sumArray(arr: number[]) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }

  protected readonly Math = Math;
}
