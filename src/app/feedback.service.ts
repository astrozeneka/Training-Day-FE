import { Injectable } from '@angular/core';
import {ContentService} from "./content.service";
import {ModalController, ToastController} from "@ionic/angular";
import {environment} from "../environments/environment";
import {FeedbackModalComponent} from "./components/feedback-modal/feedback-modal.component";
import { Router } from '@angular/router';

// log levels
export const DEBUG = 0
export const INFO = 1

export interface FeedbackOptions {
  type: string | null // toast, alert or modal
  buttonText?: string | null // text for the Button (only for modals)

  modalTitle: string | null // (only for modal)
  modalContent: string | null // (only for modal)
  modalImage: string | null // image to display (only for modals)

  primaryButtonText?: string | null // (only for alerts)
  secondaryButtonText?: string | null // (only for alerts)
  primaryButtonAction?: string | null // (only for alerts)
  secondaryButtonAction?: string | null // (only for alerts)
  
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // This is an experimental component of the standard pipeline

  constructor(
    private contentService: ContentService,
    private toastController: ToastController,
    private modalController: ModalController,
    private router: Router
  ) { }

  register(message:string, color:string = 'secondary', options:FeedbackOptions={type: 'toast', buttonText: null, modalTitle: null, modalContent: null, modalImage: null}){
    this.contentService.storage.set('feedbackMessage', message)
    this.contentService.storage.set('feedbackColor', color)
    this.contentService.storage.set('feedbackOptions', options)
  }

  async displayFeedback(message:string, color:string = 'secondary', logLevel:number = INFO, options:FeedbackOptions){
    console.log("DisplayFeedback", message, color, logLevel, options)
    if (options.type == 'toast') {
      let toast = await this.toastController.create({
        message: message,
        position: 'bottom',
        duration: 5000,
        color: color
      })
      await toast.present() // Unused
    } else if (options.type == 'modal') {
      // Display message using modalController
      let modal = await this.modalController.create({
        component: FeedbackModalComponent,
        componentProps: {
          message: message,
          color: color,
          options: options
        }
      })
      let result = await modal.present() // sometimes the result is a deep-link where the user should be redirected
      const { data, role } = await modal.onWillDismiss();
      if (data != null) {
        console.log("Navigate to : ", data)
        this.router.navigate([data])
      }
    }
  }

  async registerNow(message:string, color:string = 'secondary', logLevel:number = INFO, options:FeedbackOptions={type: 'toast', buttonText: null, modalTitle: null, modalContent: null, modalImage: null}){
    this.displayFeedback(message, color, logLevel, options)
  }

  clear(){
    this.contentService.storage.remove('feedbackMessage')
    this.contentService.storage.remove('feedbackColor')
    this.contentService.storage.remove('feedbackOptions')
  }

  async fetch() {
    let message = await this.contentService.storage.get('feedbackMessage')
    let color = await this.contentService.storage.get('feedbackColor')
    let options = await this.contentService.storage.get('feedbackOptions')
    return {
      message: message,
      color: color,
      options: options
    }
  }
}
