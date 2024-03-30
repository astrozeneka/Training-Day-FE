import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {Router} from "@angular/router";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-purchase-details',
  templateUrl: './purchase-details.page.html',
  styleUrls: ['./purchase-details.page.scss'],
})
export class PurchaseDetailsPage implements OnInit {
  subscriptionLabel: string = "";
  subscriptionDays: number = 0;
  subscriptionConsumables: number = 0;
  subscriptionExtraInfo: string = ""; // Duration or quantity

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {
    this.contentService.storage.get('subscription_label').then((value) => {
      this.subscriptionLabel = value;
    });
    this.contentService.storage.get('subscription_days').then((value) => {
      this.subscriptionDays = value;
      if(this.subscriptionDays){
        this.subscriptionExtraInfo = this.subscriptionDays + " jours";
      }
    });
    this.contentService.storage.get('subscription_consumable').then((value) => {
      this.subscriptionConsumables = value;
      if(this.subscriptionConsumables){
        this.subscriptionExtraInfo = this.subscriptionConsumables + " séances";
      }
    });
  }

  ngOnInit() {
  }

  continue(){
    this.router.navigate(['/purchase-invoice'])
  }

}
