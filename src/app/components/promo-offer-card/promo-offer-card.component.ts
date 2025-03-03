import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { ContentService } from 'src/app/content.service';
import { PromoOfferIOS } from 'src/app/custom-plugins/store.plugin';

@Component({
  selector: 'app-promo-offer-card',
  templateUrl: './promo-offer-card.component.html',
  styleUrls: ['./promo-offer-card.component.scss'],
})
export class PromoOfferCardComponent  implements OnInit {
  @Input() promoOffer: PromoOfferIOS; // Required at initialization
  offerSignature: string = undefined
  signatureIsLoading: boolean = false
  @Output() action = new EventEmitter<PromoOfferIOS>()

  constructor(
    private cs: ContentService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Load the purchase signature
    this.signatureIsLoading = true
    this.cs.getOne('/generate-offer-signature', { offer_identifier: this.promoOffer.offerId, product_identifier: this.promoOffer.productId })
      .pipe((
        catchError((err) => {
            console.error('Error getting offer signature', err)
            return throwError((err)=>{throw err})
        }),
        finalize(() => {
          this.signatureIsLoading =  false
        })
      ))
      .subscribe((res: any) => {
        this.promoOffer.signatureInfo = res
        this.offerSignature = res.signature
        this.cdr.detectChanges()
      })
  }

  triggerAction(){
    this.action?.emit(this.promoOffer)
  }

}
