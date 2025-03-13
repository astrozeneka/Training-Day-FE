import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S3GoalPage } from './s3-goal.page';

describe('S3GoalPage', () => {
  let component: S3GoalPage;
  let fixture: ComponentFixture<S3GoalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S3GoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
