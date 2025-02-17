import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";

@Component({
  selector: 'app-purchase-verify-complete',
  templateUrl: './purchase-verify-complete.page.html',
  styleUrls: ['./purchase-verify-complete.page.scss'],
})
export class PurchaseVerifyCompletePage implements OnInit {
  subscriptionSlug: string = "";
  subscriptionLabel: string = "";
  subscriptionDays: number = 0;
  subscriptionConsumables: number = 0;
  subscriptionExtraInfo: string = ""; // Duration or quantity
  subscriptionPrice: number = 0;

  subscriptionReference: string = "REF";


  constructor(
    private contentService: ContentService
  ) {
    this.contentService.storage.get('subscription_slug').then((value) => {
      this.subscriptionSlug = value;
    })
    this.contentService.storage.get('subscription_label').then((value) => {
      this.subscriptionLabel = value;
    })
    this.contentService.storage.get('subscription_days').then((value) => {
      this.subscriptionDays = value;
      if(this.subscriptionDays){
        this.subscriptionExtraInfo = this.subscriptionDays + " jours";
      }
    })
    this.contentService.storage.get('subscription_consumable').then((value) => {
      this.subscriptionConsumables = value;
      if(this.subscriptionConsumables){
        this.subscriptionExtraInfo = this.subscriptionConsumables + " séance(s)";
      }
    })
    this.contentService.storage.get('subscription_price').then((value) => {
      this.subscriptionPrice = value;
    })
    this.contentService.storage.get('subscription_reference').then((value) => {
      this.subscriptionReference = value;
    });
  }

  ngOnInit() {
  }

}
