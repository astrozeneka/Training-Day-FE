import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../content.service";
import {catchError, throwError} from "rxjs";
import {Browser} from "@capacitor/browser";
import {FeedbackService} from "../../feedback.service";

@Component({
  selector: 'app-subscriptions-verify-payment',
  templateUrl: './subscriptions-verify-payment.page.html',
  styleUrls: ['./subscriptions-verify-payment.page.scss'],
})
export class SubscriptionsVerifyPaymentPage implements OnInit {
  validated = false;
  amount = undefined;
  intentId: string = "" // unused
  reference: string = ""
  receipt_url = ""


  constructor(
    private router:Router,
    private contentService:ContentService,
    private feedbackService:FeedbackService
  ) {
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url == '/subscriptions-verify-payment'){
        let subscription_duration = await this.contentService.storage.get('subscription_duration')
        let subscription_price = await this.contentService.storage.get('subscription_price')
        if(!subscription_duration || !subscription_price) {
          this.router.navigate(['/subscriptions-duration'])
          return
        }
        // Request the payment intent url from the backend
        this.contentService.getOne('/payment-intent?amount='+subscription_price, {})
          .pipe(catchError((error)=>{
            return throwError(error)
          }))
          .subscribe(async (response:any)=>{
            console.log(response)
            let url = response.url
            this.intentId = response.intent_id
            this.reference = response.reference
            await Browser.open({url: url})
          })
      }
    })
  }

  ngOnInit() {
  }

  verifying = false
  async clickVerify(){
    this.verifying = true
    let data = {
      'subscription_option': await this.contentService.storage.get('subscription_option'),
      'subscription_duration': await this.contentService.storage.get('subscription_duration'),
      'subscription_price': await this.contentService.storage.get('subscription_price'),
      'intent_id': this.intentId,
      'reference': this.reference
    }
    this.contentService.post('/verify-payment', data)
      .subscribe((res:any)=>{
        this.verifying = false
        console.log(res)
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
