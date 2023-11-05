import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageCommunitiesViewPage } from './manage-communities-view.page';

describe('ManageCommunitiesViewPage', () => {
  let component: ManageCommunitiesViewPage;
  let fixture: ComponentFixture<ManageCommunitiesViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageCommunitiesViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
