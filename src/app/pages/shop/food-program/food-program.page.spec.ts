import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodProgramPage } from './food-program.page';

describe('FoodProgramPage', () => {
  let component: FoodProgramPage;
  let fixture: ComponentFixture<FoodProgramPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FoodProgramPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
