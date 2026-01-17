import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodProgramMasterPage } from './food-program-master.page';

describe('FoodProgramMasterPage', () => {
  let component: FoodProgramMasterPage;
  let fixture: ComponentFixture<FoodProgramMasterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FoodProgramMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
