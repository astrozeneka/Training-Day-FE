import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTimerPage } from './app-timer.page';

describe('AppTimerPage', () => {
  let component: AppTimerPage;
  let fixture: ComponentFixture<AppTimerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppTimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
