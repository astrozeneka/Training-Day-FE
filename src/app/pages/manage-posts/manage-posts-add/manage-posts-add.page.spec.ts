import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagePostsAddPage } from './manage-posts-add.page';

describe('ManagePostsAddPage', () => {
  let component: ManagePostsAddPage;
  let fixture: ComponentFixture<ManagePostsAddPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManagePostsAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
