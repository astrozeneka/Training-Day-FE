import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoAwsTestPage } from './video-aws-test.page';

describe('VideoAwsTestPage', () => {
  let component: VideoAwsTestPage;
  let fixture: ComponentFixture<VideoAwsTestPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VideoAwsTestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
