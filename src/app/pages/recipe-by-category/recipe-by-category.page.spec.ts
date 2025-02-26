import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeByCategoryPage } from './recipe-by-category.page';

describe('RecipeByCategoryPage', () => {
  let component: RecipeByCategoryPage;
  let fixture: ComponentFixture<RecipeByCategoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RecipeByCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
