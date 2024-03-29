import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseInvoicePage } from './purchase-invoice.page';

describe('PurchaseInvoicePage', () => {
  let component: PurchaseInvoicePage;
  let fixture: ComponentFixture<PurchaseInvoicePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PurchaseInvoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
