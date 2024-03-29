import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchasePaymentPage } from './purchase-payment.page';

describe('PurchasePaymentPage', () => {
  let component: PurchasePaymentPage;
  let fixture: ComponentFixture<PurchasePaymentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PurchasePaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
