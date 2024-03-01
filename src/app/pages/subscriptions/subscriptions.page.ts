import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ContentService} from "../../content.service";

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.page.html',
  styleUrls: ['./subscriptions.page.scss'],
})
export class SubscriptionsPage implements OnInit {

  constructor(
    private contentService: ContentService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  clickOption(option: string){
    this.contentService.storage.set('subscription_option', option)
    this.router.navigate(['/subscriptions-duration'])

  }

}
