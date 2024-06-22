import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {PurchaseService} from "../../purchase.service";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {
  user:any = null

  constructor(
    private contentService: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService
  ) {
    this.router.events.subscribe(async (event) => {
      if(event instanceof NavigationEnd && event.url == '/subscriptions'){
        this.user = await this.contentService.storage.get('user')
        console.log(this.user)
      }
    })
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

  testPurchase(productId:string){
    console.log("Click button")
    this.purchaseService.purchase(productId)
  }

}
