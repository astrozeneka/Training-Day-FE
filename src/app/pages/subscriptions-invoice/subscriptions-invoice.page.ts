import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FormControl, Validators} from "@angular/forms";
import {FeedbackService} from "../../feedback.service";


function capitalize(string:any) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

@Component({
  selector: 'app-subscriptions-invoice',
  templateUrl: './subscriptions-invoice.page.html',
  styleUrls: ['./subscriptions-invoice.page.scss'],
})
export class SubscriptionsInvoicePage implements OnInit {
  invoice:any = []
  invoice_total = 0

  acceptConditions = new FormControl(false, [Validators.requiredTrue])

  constructor(
    private router: Router,
    private contentService: ContentService,
    private feedbackService: FeedbackService
  ) {
    this.router.events.subscribe(async (event) => {
      if(event instanceof NavigationEnd){
        let price = await this.contentService.storage.get('subscription_price') / 100
        let packageName = (await this.contentService.storage.get('subscription_option')).replace('pack-', '')
        this.invoice = [{
          'id': 1,
          'title': "Abonnement Pack " + capitalize(packageName)+ ' ' + await this.contentService.storage.get('subscription_duration') + " jours",
          'price': price,
        }]
        this.invoice_total = price
      }
    })
  }

  ngOnInit() {
  }

  goToPayment(){
    // Expect to have checked the conditions
    if(this.acceptConditions.valid){
      this.router.navigate(['subscriptions-payment'])
    }else{
      this.feedbackService.registerNow("Vous devez accepter les conditions", "danger")
    }
  }
}
