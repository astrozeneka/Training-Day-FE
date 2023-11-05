import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAppointmentsViewPage } from './manage-appointments-view.page';

describe('ManageAppointmentsViewPage', () => {
  let component: ManageAppointmentsViewPage;
  let fixture: ComponentFixture<ManageAppointmentsViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageAppointmentsViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
