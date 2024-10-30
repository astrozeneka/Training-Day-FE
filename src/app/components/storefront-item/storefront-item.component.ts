import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/custom-plugins/store.plugin';

@Component({
  selector: 'app-storefront-item',
  templateUrl: './storefront-item.component.html',
  styleUrls: ['./storefront-item.component.scss'],
})
export class StorefrontItemComponent  implements OnInit {
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Output() action: EventEmitter<any> = new EventEmitter();
  
  // The IAP produc to display
  @Input() product: Product;

  constructor() { }

  ngOnInit() {}

  triggerAction(){
    this.action.emit();
  }

}
