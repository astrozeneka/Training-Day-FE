import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAgenciesViewPage } from './manage-agencies-view.page';

describe('ManageAgenciesViewPage', () => {
  let component: ManageAgenciesViewPage;
  let fixture: ComponentFixture<ManageAgenciesViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageAgenciesViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
