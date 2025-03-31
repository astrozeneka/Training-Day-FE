import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoSubmenuPage } from './video-submenu.page';

describe('VideoSubmenuPage', () => {
  let component: VideoSubmenuPage;
  let fixture: ComponentFixture<VideoSubmenuPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VideoSubmenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
