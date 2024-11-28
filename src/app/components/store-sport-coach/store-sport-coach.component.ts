import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContentService } from 'src/app/content.service';
import { Product } from 'src/app/custom-plugins/store.plugin';
import { FeedbackService } from 'src/app/feedback.service';
import { User } from 'src/app/models/Interfaces';
import { PurchaseService } from 'src/app/purchase.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-sport-coach',
  templateUrl: './store-sport-coach.component.html',
  styleUrls: ['./store-sport-coach.component.scss'],
})
export class StoreSportCoachComponent  implements OnInit {

  user: User|null = null
  productList: { [key: string]: Product } = {}
  
  constructor(
    private cs: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService
  ) { }

  ngOnInit() {
    // 1. Load user
    this.cs.getUserFromLocalStorage().then(user => {
      this.user = user;
    })
    
    // 2. Load and prepare product list from the store
    this.purchaseService.getProducts('inapp').then((d)=>{
      let productList:Product[] = d.products
      this.productList = productList.reduce((acc, product) => { acc[product.id] = product; return acc }, {});
    })

  }


  async clickSportCoachOption(productId:string) {
    let user = await this.cs.storage.get('user')
    if (!user) {
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    } else {
      if (environment.paymentMethod == 'stripe') {
        this.feedbackService.registerNow('Stripe payment method is not supported', 'method')
      } else if (environment.paymentMethod === 'inAppPurchase') {
        await this.cs.storage.set('productId', productId)
      }
      this.router.navigate(['/purchase-invoice'])
    }
  }
}
