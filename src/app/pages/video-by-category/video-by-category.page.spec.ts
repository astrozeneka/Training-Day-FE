import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoByCategoryPage } from './video-by-category.page';

describe('VideoByCategoryPage', () => {
  let component: VideoByCategoryPage;
  let fixture: ComponentFixture<VideoByCategoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VideoByCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
