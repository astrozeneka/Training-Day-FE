import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S7DoSportRegularlyPage } from './s7-do-sport-regularly.page';

describe('S7DoSportRegularlyPage', () => {
  let component: S7DoSportRegularlyPage;
  let fixture: ComponentFixture<S7DoSportRegularlyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S7DoSportRegularlyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
