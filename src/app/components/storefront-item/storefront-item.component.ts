import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContentService } from 'src/app/content.service';
import { Product } from 'src/app/custom-plugins/store.plugin';
import { User } from 'src/app/models/Interfaces';

@Component({
  selector: 'app-storefront-item',
  templateUrl: './storefront-item.component.html',
  styleUrls: ['./storefront-item.component.scss'],
})
export class StorefrontItemComponent  implements OnInit {
  @Input() color: string = 'primary';
  @Input() disabled: boolean = false;
  @Output() action: EventEmitter<any> = new EventEmitter();
  loggedIn: boolean = false;
  
  // The IAP produc to display
  @Input() product: Product;

  constructor(
    private cs: ContentService // Low coupling strategy
  ) { 
    cs.userStorageObservable.gso$().subscribe((user:User) => {
      this.loggedIn = !!user
    })
  }

  ngOnInit() {}

  triggerAction(){
    this.action.emit();
  }

}
