import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ContentService } from 'src/app/content.service';
import { Product } from 'src/app/custom-plugins/store.plugin';
import { User } from 'src/app/models/Interfaces';

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

  constructor(
    private cs: ContentService // Low coupling strategy
  ) { 
    cs.userStorageObservable.gso$().subscribe((user:User) => {
      this.loggedIn = !!user
    })
  }

  ngOnInit() {}

  ngOnChanges(){
    if(this.product){
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
      
      // Calculate weekly price
      const numericPrice = parseFloat(displayPrice.replace(/[^0-9.,]/g, '').replace(',', '.'));
      if (!isNaN(numericPrice)) {
        const weekly = (numericPrice / 4.33).toFixed(2); // Average weeks per month
        this.weeklyPrice = weekly.replace('.', ',');
      }
    }
  }

  triggerAction(){
    this.action.emit();
  }

}
