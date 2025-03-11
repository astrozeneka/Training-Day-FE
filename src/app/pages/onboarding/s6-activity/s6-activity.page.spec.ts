import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S6ActivityPage } from './s6-activity.page';

describe('S6ActivityPage', () => {
  let component: S6ActivityPage;
  let fixture: ComponentFixture<S6ActivityPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S6ActivityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
