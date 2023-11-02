import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageFilesAddPage } from './manage-files-add.page';

describe('ManageFilesAddPage', () => {
  let component: ManageFilesAddPage;
  let fixture: ComponentFixture<ManageFilesAddPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageFilesAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
