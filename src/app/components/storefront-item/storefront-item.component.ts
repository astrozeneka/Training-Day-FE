import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ContentService } from 'src/app/content.service';
import { Product } from 'src/app/custom-plugins/store.plugin';
import { User } from 'src/app/models/Interfaces';
import { AndroidStoreProduct, iOSStoreProduct } from 'src/app/pages/purchase-invoice/abstract-purchase-invoice';
import { AbstractStoreProductUiAdapter, DisplayableProduct } from 'src/app/pages/purchase-invoice/abstract-store-product-ui-adapter';
import { AndroidStoreProductUIAdapter } from 'src/app/pages/purchase-invoice/android-store-product-ui-adapter';
import { iOSStoreProductUIAdapter } from 'src/app/pages/purchase-invoice/ios-store-product-ui-adapter';

@Component({
  selector: 'app-storefront-item',
  templateUrl: './storefront-item.component.html',
  styleUrls: ['./storefront-item.component.scss'],
})
export class StorefrontItemComponent  implements OnInit, OnChanges {
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Output() action: EventEmitter<any> = new EventEmitter();
  @Input() variant: 'default'|'swipeable' = 'default'
  loggedIn: boolean = false;
  
  // The IAP produc to display
  @Input() product: Product;

  // Managing correctly the display price
  displayPricePrefix = undefined
  displayPrice = undefined
  displayPriceSuffix = undefined
  weeklyPrice = undefined

  // The adapter to use to extract displayable productinformation
  productUiAdapter: AbstractStoreProductUiAdapter<AndroidStoreProduct | iOSStoreProduct> = undefined;

  constructor(
    private cs: ContentService, // Low coupling strategy
    private platform: Platform
  ) { 
    cs.userStorageObservable.gso$().subscribe((user:User) => {
      this.loggedIn = !!user
    })
  }

  ngOnInit() {}

  ngOnChanges(){
    if(this.product){
      let adapterConstructor = this.platform.is('ios') ? iOSStoreProductUIAdapter 
        : this.platform.is('android') ? AndroidStoreProductUIAdapter 
        : null
      if (!adapterConstructor)
        throw new Error("Unsupported platform for StorefrontItemComponent");
      this.productUiAdapter = new adapterConstructor(this.product as (iOSStoreProduct & AndroidStoreProduct))

      // In the home page, the minimal price is displayed
      const minimalPriceproduct: DisplayableProduct = this.productUiAdapter.displayables.reduce((prev, curr) => prev.percentageReduction && curr.percentageReduction && prev.percentageReduction > curr.percentageReduction ? prev : curr)
      console.log("minimalPrice " + JSON.stringify(minimalPriceproduct))
  
      // Extract display price parts

      let displayPrice = this.product.displayPrice
      if(displayPrice.includes("À partir de")){
        this.displayPricePrefix = "À partir de"
        displayPrice = displayPrice.replace("À partir de", "")
      }
      if (displayPrice.includes("/mois")){
        this.displayPriceSuffix = "/mois"
        displayPrice = displayPrice.replace("/mois", "")
      }
      this.displayPrice = displayPrice

      this.weeklyPrice = minimalPriceproduct.weeklyPrice
      
      // Calculate weekly price
      /*const numericPrice = parseFloat(displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(numericPrice)) {
        const weekly = (numericPrice / 4.33).toFixed(2); // Average weeks per month
        this.weeklyPrice = weekly.replace('.', ',');
      }*/
    }
  }

  triggerAction(){
    this.action.emit();
  }

}
