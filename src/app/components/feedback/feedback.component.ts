import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {ToastController} from "@ionic/angular";
import {FeedbackService} from "../../feedback.service";
import {refresh} from "ionicons/icons";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent  implements OnInit {

  constructor(
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private toastController: ToastController,
    private route: ActivatedRoute
  ) {
    route.params.subscribe(()=>{
      this.refresh()
    })
  }

  async ngOnInit() {
    this.refresh()
  }

  async refresh(){
    if(await this.feedbackService.fetch() != undefined){
      console.log("Fetch message")
      let toast = await this.toastController.create({
        message: await this.feedbackService.fetch(),
        position: 'top',
        duration: 5000
      })
      toast.present()
      this.feedbackService.clear()
    }
  }

}
