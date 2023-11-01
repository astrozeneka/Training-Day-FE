import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageAgenciesAddPage } from './manage-agencies-add.page';

describe('ManageAgenciesAddPage', () => {
  let component: ManageAgenciesAddPage;
  let fixture: ComponentFixture<ManageAgenciesAddPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageAgenciesAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
