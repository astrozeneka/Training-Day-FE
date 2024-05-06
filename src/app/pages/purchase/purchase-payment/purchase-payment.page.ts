import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {ContentService} from "../../../content.service";
import {FeedbackService} from "../../../feedback.service";
import {catchError, throwError} from "rxjs";
import {Browser} from "@capacitor/browser";

@Component({
  selector: 'app-purchase-payment',
  templateUrl: './purchase-payment.page.html',
  styleUrls: ['./purchase-payment.page.scss'],
})
export class PurchasePaymentPage implements OnInit {
  validated: boolean = false;
  amount: number = 0;

  reference: string = ""
  receipt_url = ""

  constructor(
    private router:Router,
    private contentService:ContentService,
    private feedbackService:FeedbackService
  ) {
    this.router.events.subscribe(async (event)=>{
      if(event instanceof NavigationEnd && this.router.url == '/purchase-payment'){
        let subscription_slug = await this.contentService.storage.get('subscription_slug')
        let subscription_label = await this.contentService.storage.get('subscription_label')
        let subscription_days = await this.contentService.storage.get('subscription_days')
        let subscription_consumable = await this.contentService.storage.get('subscription_consumable')
        let subscription_price = await this.contentService.storage.get('subscription_price')
        if(!subscription_slug || !subscription_label || !subscription_price) {
          this.router.navigate(['/purchase-details'])
          return
        }
        // Request the payment intent url from the backend
        this.contentService.getOne('/payment-intent?amount='+subscription_price, {})
          .pipe(catchError((error)=>{
            return throwError(error)
          }))
          .subscribe(async (response:any)=>{
            let url = response.url
            this.reference = response.reference
            console.log(this.reference)
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
      'subscription_slug': await this.contentService.storage.get('subscription_slug'),
      'subscription_label': await this.contentService.storage.get('subscription_label'),
      'subscription_days': await this.contentService.storage.get('subscription_days'),
      'subscription_consumables': await this.contentService.storage.get('subscription_consumable'), // !! ATTENTION: Typo in the key name
      'subscription_price': await this.contentService.storage.get('subscription_price'),
      'reference': this.reference
    }
    this.contentService.post('/verify-payment-2', data)
      .subscribe((res:any)=>{
        this.verifying = false
        console.log(res)
        this.contentService.storage.set('subscription_reference', res.reference)
        if(res.id){
          this.receipt_url = res.receipt_url
          this.amount = res.amount
          this.validated = true
        }else{
          this.feedbackService.registerNow("Une erreur s'est produite lors de la validation du paiement", "danger")
        }
      })
  }

  download_receipt(){
    Browser.open({url: this.receipt_url})
  }

  async next(){
    this.router.navigate(['/purchase-verify-complete'])

  }

}
