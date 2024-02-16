import {Component, NgZone} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "./content.service";
import {FeedbackService} from "./feedback.service";
import {ToastController} from "@ionic/angular";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  user: any = null;
  constructor(
    private router:Router,
    private zone: NgZone,
    private contentService: ContentService,
    private feedbackService: FeedbackService,
    private toastController: ToastController
  ) {
    router.events.subscribe((event)=>{
      if (event instanceof NavigationEnd) {
        this.zone.run(() => {
          // Execute your callback function here
          this.onRouteChange();
        });
      }
      // Old code is below
      this.contentService.storage.get('user')
        .then((u)=>{
          this.user = u;
        })
    })
  }

  private onRouteChange(){
    this.contentService.reloadUserData()

    // Check if there is some message from the feedback service
    this.feedbackService.fetch().then((feedback)=>{

      if(feedback.message){
        let toast = this.toastController.create({
          message: feedback.message,
          position: 'bottom',
          duration: 5000,
          color: feedback.color
        })
        toast.then((toast)=>{
          toast.present()
        })
        this.feedbackService.clear()
      }
    })

    // We also update the user information from the database
    this.contentService.reloadUserData()
  }
}
