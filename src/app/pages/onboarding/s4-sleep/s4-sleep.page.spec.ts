import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S4SleepPage } from './s4-sleep.page';

describe('S4SleepPage', () => {
  let component: S4SleepPage;
  let fixture: ComponentFixture<S4SleepPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S4SleepPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
