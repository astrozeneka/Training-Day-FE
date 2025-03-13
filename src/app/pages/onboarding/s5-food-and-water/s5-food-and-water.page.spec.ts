import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S5FoodAndWaterPage } from './s5-food-and-water.page';

describe('S5FoodAndWaterPage', () => {
  let component: S5FoodAndWaterPage;
  let fixture: ComponentFixture<S5FoodAndWaterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S5FoodAndWaterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
