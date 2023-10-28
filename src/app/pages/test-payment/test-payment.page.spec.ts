import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestPaymentPage } from './test-payment.page';

describe('TestPaymentPage', () => {
  let component: TestPaymentPage;
  let fixture: ComponentFixture<TestPaymentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
