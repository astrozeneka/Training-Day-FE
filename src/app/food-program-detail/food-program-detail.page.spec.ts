import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodProgramDetailPage } from './food-program-detail.page';

describe('FoodProgramDetailPage', () => {
  let component: FoodProgramDetailPage;
  let fixture: ComponentFixture<FoodProgramDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FoodProgramDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
