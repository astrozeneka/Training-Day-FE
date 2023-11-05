import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagePaymentsViewPage } from './manage-payments-view.page';

describe('ManagePaymentsViewPage', () => {
  let component: ManagePaymentsViewPage;
  let fixture: ComponentFixture<ManagePaymentsViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManagePaymentsViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
