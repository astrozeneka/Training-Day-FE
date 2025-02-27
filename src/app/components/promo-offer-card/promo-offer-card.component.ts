import { Component, Input, OnInit } from '@angular/core';
import { PromoOfferIOS } from 'src/app/custom-plugins/store.plugin';

@Component({
  selector: 'app-promo-offer-card',
  templateUrl: './promo-offer-card.component.html',
  styleUrls: ['./promo-offer-card.component.scss'],
})
export class PromoOfferCardComponent  implements OnInit {
  @Input() promoOffer: PromoOfferIOS;

  constructor() { }

  ngOnInit() {}

}
