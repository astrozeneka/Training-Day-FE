import { Injectable } from '@angular/core';
import {ContentService} from "./content.service";
import {ToastController} from "@ionic/angular";
import {environment} from "../environments/environment";

// log levels
export const DEBUG = 0
export const INFO = 1

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // This is an experimental component of the standard pipeline

  constructor(
    private contentService: ContentService,
    private toastController: ToastController
  ) { }

  register(message:string, color:string = 'secondary'){
    this.contentService.storage.set('feedbackMessage', message)
    this.contentService.storage.set('feedbackColor', color)
  }

  async registerNow(message:string, color:string = 'secondary', logLevel:number = INFO){
    if(logLevel == INFO || (environment.production == false && logLevel == DEBUG)) {
      let toast = await this.toastController.create({
        message: message,
        position: 'bottom',
        duration: 5000,
        color: color
      })
      await toast.present()
    }
  }

  clear(){
    this.contentService.storage.remove('feedbackMessage')
    this.contentService.storage.remove('feedbackColor')
  }

  async fetch() {
    let message = await this.contentService.storage.get('feedbackMessage')
    let color = await this.contentService.storage.get('feedbackColor')
    return {
      message: message,
      color: color
    }
  }
}
