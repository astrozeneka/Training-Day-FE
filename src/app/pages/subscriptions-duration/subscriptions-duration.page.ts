import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-subscriptions-duration',
  templateUrl: './subscriptions-duration.page.html',
  styleUrls: ['./subscriptions-duration.page.scss'],
})
export class SubscriptionsDurationPage implements OnInit {
  subscription_option = ""

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd && this.router.url == '/subscriptions-duration') {
        this.subscription_option = await this.contentService.storage.get('subscription_option')
      }
    })
  }

  ngOnInit() {
  }

  clickOption(n_days:number, price:number){
    this.contentService.storage.set('subscription_duration', n_days)
    this.contentService.storage.set('subscription_price', price)
    this.router.navigate(['/subscriptions-invoice'])
  }

}
