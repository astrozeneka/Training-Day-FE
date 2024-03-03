import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ) {
  }

  ngOnInit() {
  }

  async clickOption(option: string){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      this.contentService.storage.set('subscription_option', option)
      this.router.navigate(['/subscriptions-duration'])
    }

  }

}
