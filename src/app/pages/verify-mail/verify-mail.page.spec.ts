import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyMailPage } from './verify-mail.page';

describe('VerifyMailPage', () => {
  let component: VerifyMailPage;
  let fixture: ComponentFixture<VerifyMailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VerifyMailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
