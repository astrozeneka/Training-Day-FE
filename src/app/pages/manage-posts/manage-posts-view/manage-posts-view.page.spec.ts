import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagePostsViewPage } from './manage-posts-view.page';

describe('ManagePostsViewPage', () => {
  let component: ManagePostsViewPage;
  let fixture: ComponentFixture<ManagePostsViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManagePostsViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
