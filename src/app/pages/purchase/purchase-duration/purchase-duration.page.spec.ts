import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseDurationPage } from './purchase-duration.page';

describe('PurchaseDurationPage', () => {
  let component: PurchaseDurationPage;
  let fixture: ComponentFixture<PurchaseDurationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PurchaseDurationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
