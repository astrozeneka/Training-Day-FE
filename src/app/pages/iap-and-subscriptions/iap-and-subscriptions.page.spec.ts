import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IapAndSubscriptionsPage } from './iap-and-subscriptions.page';

describe('IapAndSubscriptionsPage', () => {
  let component: IapAndSubscriptionsPage;
  let fixture: ComponentFixture<IapAndSubscriptionsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(IapAndSubscriptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
