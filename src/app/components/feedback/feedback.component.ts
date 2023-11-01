import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {ToastController} from "@ionic/angular";
import {FeedbackService} from "../../feedback.service";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent  implements OnInit {

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    console.log("Here")
    if(await this.feedbackService.fetch() != undefined){
      let toast = await this.toastController.create({
        message: await this.feedbackService.fetch(),
        position: 'bottom',
        duration: 5000
      })
      toast.present()
      this.feedbackService.clear()
    }
  }

}
