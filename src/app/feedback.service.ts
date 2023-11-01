import { Injectable } from '@angular/core';
import {ContentService} from "./content.service";

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // This is an experimental component of the standard pipeline

  constructor(
    private contentService: ContentService
  ) { }

  register(message:string){
    this.contentService.storage.set('feedbackMessage', message)
  }

  clear(){
    this.contentService.storage.remove('feedbackMessage')
  }

  async fetch() {
    return await this.contentService.storage.get('feedbackMessage')
  }
}
