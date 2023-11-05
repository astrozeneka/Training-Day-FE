import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageDayoffViewPage } from './manage-dayoff-view.page';

describe('ManageDayoffViewPage', () => {
  let component: ManageDayoffViewPage;
  let fixture: ComponentFixture<ManageDayoffViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ManageDayoffViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
