import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {interval, Subject, takeUntil} from "rxjs";
import {registerPlugin} from "@capacitor/core";
import {BackgroundGeolocationPlugin} from "@capacitor-community/background-geolocation";
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
  per_kilometer: number[] = []
  per_kilometer_duration:number[] = [] // An array that show the history for each kilometer
  per_kilometer_distance:number[] = [] // It is normally an array of 1, except for the last item
  per_kilometer_speed:number[] = [] // It is normally an array of 1, except for the last item

  constructor(
  ) { }

  ngOnInit() {
    BackgroundGeolocation.addWatcher({
      backgroundMessage: "Cancel to prevent battery drain.",
      backgroundTitle: "Tracking You.",
      requestPermissions: true,
      stale: false,
      distanceFilter: 50
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
      }
      return console.log(location)
    }).then(function after_the_watcher_has_been_added(watcher_id){
      // This should be called when the user stops the tracking
      /*BackgroundGeolocation.removeWatcher({
        id: watcher_id
      })*/
    })


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

  tracking = false;
  watch: any = null;
  async startTracking(){
    this.running = true
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
    this.chronometerRunning = false
    if (this.watch) {
      Geolocation.clearWatch(this.watch)
      this.watch = null
      this.tracking = false;
    }
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
