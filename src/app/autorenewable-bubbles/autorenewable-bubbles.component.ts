import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EntitlementReady } from '../abstract-components/EntitlementReady';
import { AndroidSubscription, Product } from '../custom-plugins/store.plugin';
import { User } from '../models/Interfaces';
import { ContentService } from '../content.service';
import { Router } from '@angular/router';
import { FeedbackService } from '../feedback.service';
import { PurchaseService } from '../purchase.service';
import { Platform } from '@ionic/angular';

import { register } from 'swiper/element/bundle';
import SwiperCore, { Swiper } from 'swiper';
import StorePlugin from 'src/app/custom-plugins/store.plugin';

type IOSSubscription = Product  // Same as in store-auto-renewables
type Subscription = IOSSubscription|AndroidSubscription // Same as in store-auto-renewables

@Component({
  selector: 'app-autorenewable-bubbles',
  templateUrl: './autorenewable-bubbles.component.html',
  styleUrls: ['./autorenewable-bubbles.component.scss'],
})
export class AutorenewableBubblesComponent extends EntitlementReady implements OnInit, AfterViewInit {
  @Input() productList: { [key: string]: Product } = {}
  user: User = null
  os: 'android'|'ios' = null

  selectedTab: 'tab1' | 'tab2' | 'tab3' = 'tab1';
  @ViewChild('swiperEl') swiperEl: ElementRef | null = null as any

  constructor(
    private cdr: ChangeDetectorRef,
    private cs: ContentService,
    private router: Router,
    private feedbackService: FeedbackService,
    private purchaseService: PurchaseService,
    private platform: Platform
  ) {
    super()
    register()
  }

  ngOnInit() {

    // 1. Load the user (same as in store-auto-renewables)
    this.cs.getUserFromLocalStorage().then(user => {
      this.user = user;
    })

    // 2. Load product list from the purchase service
    let products: Promise<{products: IOSSubscription[]|AndroidSubscription[]}>
    if (this.platform.is('capacitor') && this.platform.is('ios')){
      try {
        // Load from IOS
        products = StorePlugin.getProducts({})
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    } else if ((this.platform.is('capacitor') || true) && this.platform.is('android')) {
      try {
        // Load from Android
        products = this.purchaseService.getProducts('subs')
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from native plugin ' + error.toString(), 'danger');
      }
    } else {
      try {
        // Load dummy data for debugging
        products = StorePlugin.getProducts({})
      } catch (error) {
        this.feedbackService.registerNow('Failed to load products from web', 'danger');
      }
    }
    products.then(({products}) => {
      this.productList = (products as Subscription[]).reduce((acc, product) => {
        acc[(product as IOSSubscription).id || (product as AndroidSubscription).productId] = product
        return acc
      }, {} as any)
      console.log("Load products", this.productList)
    })

    // 3. The platform
    if (this.platform.is('capacitor'))
      this.os = this.platform.is('android') ? 'android' : 'ios'
  }

  ngAfterViewInit(): void {
    // Initializing swiperParams
    const swiperParams = {
      on: {
        slideChange: this.onSlideChange,
        reachEnd: this.onReachEnd,
      }
    }
    Object.assign(this.swiperEl?.nativeElement, swiperParams)
  }

  swipeToIndex(index) {
    let swiper = this.swiperEl?.nativeElement.swiper
    console.log(swiper)
    swiper?.slideTo(index)
  }

  onSwiper(param) {
    console.log(param);
  }

  onSlideChange = (param: Swiper | any) => {
    // Slide change event
    let index = param.activeIndex
    this.selectedTab = `tab${index + 1}` as any
    this.cdr.detectChanges()
  }

  onReachEnd(param) {
    // Unused
  }

  /**
   * Handle the click event from a storefront item
   * @param productId The product id to be purchased
   */
  async clickSubscriptionOption(productId: string){
    if(!this.user){
      this.router.navigate(['/login'])
      this.feedbackService.registerNow('Pour continuer, veuillez créer un compte ou vous connecter.')
    }else{
      await this.cs.storage.set('productId', productId)
        if(this.platform.is('android')){ // Android subscription need to pass the offerToken
          let offerToken = (this.productList[productId] as any as AndroidSubscription).androidOfferToken
          console.log("Offer token is : " + offerToken)
          await this.cs.storage.set('offerToken', offerToken)
        }
        if (this.os === 'android'){
          this.router.navigate(['/android-purchase-invoice'])
        }else{
          this.router.navigate(['/ios-purchase-invoice'])
        }
    }
  }
}
