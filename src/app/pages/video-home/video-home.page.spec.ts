import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoHomePage } from './video-home.page';

describe('VideoHomePage', () => {
  let component: VideoHomePage;
  let fixture: ComponentFixture<VideoHomePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VideoHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
