import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppImcPage } from './app-imc.page';

describe('AppImcPage', () => {
  let component: AppImcPage;
  let fixture: ComponentFixture<AppImcPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppImcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
