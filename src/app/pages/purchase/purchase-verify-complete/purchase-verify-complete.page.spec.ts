import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseVerifyCompletePage } from './purchase-verify-complete.page';

describe('PurchaseVerifyCompletePage', () => {
  let component: PurchaseVerifyCompletePage;
  let fixture: ComponentFixture<PurchaseVerifyCompletePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PurchaseVerifyCompletePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
