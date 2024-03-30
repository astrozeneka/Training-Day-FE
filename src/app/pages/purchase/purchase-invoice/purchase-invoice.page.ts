import { Component, OnInit } from '@angular/core';
import {ContentService} from "../../../content.service";
import {FormControl} from "@angular/forms";
import {Router} from "@angular/router";

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.page.html',
  styleUrls: ['./purchase-invoice.page.scss'],
})
export class PurchaseInvoicePage implements OnInit {
  subscriptionSlug: string = "";
  subscriptionLabel: string = "";
  subscriptionDays: number = 0;
  subscriptionConsumables: number = 0;
  subscriptionExtraInfo: string = ""; // Duration or quantity
  subscriptionPrice: number = 0;

  acceptConditions: FormControl = new FormControl(false);

  constructor(
    private contentService: ContentService,
    private router: Router
  ) {
    this.contentService.storage.get('subscription_slug').then((value) => {
      this.subscriptionSlug = value;
    });
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
        this.subscriptionExtraInfo = this.subscriptionConsumables + " séance(s)";
      }
    });
    this.contentService.storage.get('subscription_price').then((value) => {
      this.subscriptionPrice = value;
    });
  }

  ngOnInit() {
  }

  continueToPayment(){
    this.router.navigate(['/purchase-payment'])
  }

}
