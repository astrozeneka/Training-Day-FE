import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromoCodeAndroidPage } from './promo-code-android.page';

describe('PromoCodeAndroidPage', () => {
  let component: PromoCodeAndroidPage;
  let fixture: ComponentFixture<PromoCodeAndroidPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PromoCodeAndroidPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
