import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeV2Page } from './home-v2.page';

describe('HomeV2Page', () => {
  let component: HomeV2Page;
  let fixture: ComponentFixture<HomeV2Page>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HomeV2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
