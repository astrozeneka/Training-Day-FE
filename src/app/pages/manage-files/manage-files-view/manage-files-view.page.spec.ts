import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageFilesViewPage } from './manage-files-view.page';

describe('ManageFilesViewPage', () => {
  let component: ManageFilesViewPage;
  let fixture: ComponentFixture<ManageFilesViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageFilesViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
