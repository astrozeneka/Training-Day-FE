import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../../feedback.service";

@Component({
  selector: 'app-personal-trainer',
  templateUrl: './personal-trainer.page.html',
  styleUrls: ['./personal-trainer.page.scss'],
})
export class PersonalTrainerPage implements OnInit {

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) { }

  ngOnInit() {
  }

  async clickCoachingOption(coachingNumber:number, price:number){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      await this.contentService.storage.set('subscription_consumable', coachingNumber)
      await this.contentService.storage.set('subscription_price', price)
      await this.contentService.storage.set('subscription_slug', 'personal-trainer')
      await this.contentService.storage.set('subscription_label', 'Personal trainer')
      this.router.navigate(['/purchase-details'])
    }
  }

}
