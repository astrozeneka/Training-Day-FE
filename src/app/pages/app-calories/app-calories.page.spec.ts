import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppCaloriesPage } from './app-calories.page';

describe('AppCaloriesPage', () => {
  let component: AppCaloriesPage;
  let fixture: ComponentFixture<AppCaloriesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppCaloriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
