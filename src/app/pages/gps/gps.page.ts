import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import {interval, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-gps',
  templateUrl: './gps.page.html',
  styleUrls: ['./gps.page.scss'],
})
export class GpsPage implements OnInit {
  previousCoords:any = null
  distance = 0.0

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
    // The chronometer
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.chronometerRunning) {
          this.elapsedTime++;
          this.updateChronometer();
          this.updateHistory();
        }
      });
  }

  tracking = false;
  watch: any = null;
  async startTracking(){
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
        console.log(delta)
      }
      this.previousCoords = {latitude, longitude}
      console.log(this.previousCoords)
    });
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
