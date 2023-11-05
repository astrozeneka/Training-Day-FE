import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageUsersViewPage } from './manage-users-view.page';

describe('ManageUsersViewPage', () => {
  let component: ManageUsersViewPage;
  let fixture: ComponentFixture<ManageUsersViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageUsersViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
