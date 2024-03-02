import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";

@Component({
  selector: 'app-subscriptions-verify-complete',
  templateUrl: './subscriptions-verify-complete.page.html',
  styleUrls: ['./subscriptions-verify-complete.page.scss'],
})
export class SubscriptionsVerifyCompletePage implements OnInit {
  subscription_duration = 0
  subscription_price = 0
  subscription_option = ""
  subscription_reference = ""

  constructor(
    private router:Router,
    private contentService:ContentService,
  ) {
    this.router.events.subscribe(async (event)=>{
      if(this.router.url == '/subscriptions-verify-complete'){
        this.subscription_duration = await this.contentService.storage.get('subscription_duration')
        this.subscription_price = await this.contentService.storage.get('subscription_price')
        this.subscription_option = await this.contentService.storage.get('subscription_option')
        this.subscription_reference = await this.contentService.storage.get('subscription_reference')
      }
    })
  }

  ngOnInit() {

  }

}
