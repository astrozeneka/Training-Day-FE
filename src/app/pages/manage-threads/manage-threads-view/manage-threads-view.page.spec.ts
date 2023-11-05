import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageThreadsViewPage } from './manage-threads-view.page';

describe('ManageThreadsViewPage', () => {
  let component: ManageThreadsViewPage;
  let fixture: ComponentFixture<ManageThreadsViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageThreadsViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
