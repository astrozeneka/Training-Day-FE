import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S8HealthStatusPage } from './s8-health-status.page';

describe('S8HealthStatusPage', () => {
  let component: S8HealthStatusPage;
  let fixture: ComponentFixture<S8HealthStatusPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S8HealthStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
