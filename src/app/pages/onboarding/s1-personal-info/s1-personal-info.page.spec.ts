import { ComponentFixture, TestBed } from '@angular/core/testing';
import { S1PersonalInfoPage } from './s1-personal-info.page';

describe('S1PersonalInfoPage', () => {
  let component: S1PersonalInfoPage;
  let fixture: ComponentFixture<S1PersonalInfoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(S1PersonalInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
