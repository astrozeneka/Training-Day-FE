import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../content.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subscriptions-duration',
  templateUrl: './subscriptions-duration.page.html',
  styleUrls: ['./subscriptions-duration.page.scss'],
})
export class SubscriptionsDurationPage implements OnInit {

  constructor(
    private contentService: ContentService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  clickOption(n_days:number){
    this.contentService.storage.set('subscription_duration', n_days)
    this.router.navigate(['/subscriptions-invoice'])
  }

}
