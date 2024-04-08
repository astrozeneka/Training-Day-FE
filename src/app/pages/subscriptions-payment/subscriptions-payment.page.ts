import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {FeedbackService} from "../../feedback.service";
import {catchError, throwError} from "rxjs";
import {Browser} from "@capacitor/browser";

@Component({
  selector: 'app-subscriptions-payment',
  templateUrl: './subscriptions-payment.page.html',
  styleUrls: ['./subscriptions-payment.page.scss'],
})
export class SubscriptionsPaymentPage implements OnInit {
  validated = false
  amount = undefined
  reference = ""
  receipt_url = ""

  constructor(
    private router:Router,
    private contentService:ContentService,
    private feedbackService:FeedbackService
  ) {
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd && this.router.url == '/subscriptions-payment') {
        let subscription_option = 'pack-hoylt' // TODO update
        let subscription_duration = await this.contentService.storage.get('subscription_duration')
        let subscription_price = await this.contentService.storage.get('subscription_price')
        if (!subscription_option || !subscription_duration || !subscription_price) {
          this.router.navigate(['/subscriptions-duration'])
          return
        }

        // Request the payment intent url from the backend
        let uri = `/payment-intent-subscription?option=${subscription_option}&duration=${subscription_duration}&price=${subscription_price}`
        this.contentService.getOne(uri, {})
          .pipe(catchError((error) => {
            return throwError(error)
          }))
          .subscribe(async (response: any) => {
            console.log(response)
            let url = response.url
            this.reference = response.reference
            await Browser.open({url: url})
          })
      }
    })
  }

  ngOnInit() {
  }

  async clickVerify(){
    let data = {
      'subscription_option': 'pack-hoylt', // TODO update
      'subscription_duration': await this.contentService.storage.get('subscription_duration'),
      'subscription_price': await this.contentService.storage.get('subscription_price'),
      'reference': this.reference
    }
    this.contentService.post('/verify-payment', data)
      .subscribe(async (res: any) => {
        if(res.id){
          this.receipt_url = res.receipt_url
          this.validated = true
        }else{
          this.feedbackService.registerNow("Erreur lors de la vérification du paiement, veuillez réessayer", 'danger')
        }
      })


  }

  download_receipt(){
    Browser.open({url: this.receipt_url})
  }

  async next(){
    await this.contentService.storage.set('subscription_reference', this.reference)
    this.router.navigate(['/subscriptions-verify-complete'])
  }


}
