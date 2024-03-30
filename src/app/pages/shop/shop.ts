import {ContentService} from "../../content.service";
import {Router} from "@angular/router";
import {FeedbackService} from "../../feedback.service";

export class Shop{
  subscriptionSlug:string = "";
  subscriptionLabel:string = "";

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService
  ){
  }

  async clickOption(days:number, price:number){
    let user = await this.contentService.storage.get('user')
    if(!user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      await this.contentService.storage.set('subscription_days', days)
      await this.contentService.storage.set('subscription_price', price)
      await this.contentService.storage.set('subscription_slug', this.subscriptionSlug)
      await this.contentService.storage.set('subscription_label', this.subscriptionLabel)
      this.router.navigate(['/purchase-details'])
    }
  }
}