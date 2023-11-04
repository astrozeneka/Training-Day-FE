import { Injectable } from '@angular/core';
import {ContentService} from "./content.service";
import {ToastController} from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // This is an experimental component of the standard pipeline

  constructor(
    private contentService: ContentService,
    private toastController: ToastController
  ) { }

  register(message:string){
    this.contentService.storage.set('feedbackMessage', message)
  }

  async registerNow(message:string){
    let toast = await this.toastController.create({
      message: message,
      position: 'top',
      duration: 5000
    })
    await toast.present()
  }

  clear(){
    this.contentService.storage.remove('feedbackMessage')
  }

  async fetch() {
    return await this.contentService.storage.get('feedbackMessage')
  }
}
