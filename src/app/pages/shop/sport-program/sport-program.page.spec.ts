import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SportProgramPage } from './sport-program.page';

describe('SportProgramPage', () => {
  let component: SportProgramPage;
  let fixture: ComponentFixture<SportProgramPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SportProgramPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
