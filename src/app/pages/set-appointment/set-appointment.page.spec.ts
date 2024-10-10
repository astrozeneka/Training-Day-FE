import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetAppointmentPage } from './set-appointment.page';

describe('SetAppointmentPage', () => {
  let component: SetAppointmentPage;
  let fixture: ComponentFixture<SetAppointmentPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SetAppointmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
