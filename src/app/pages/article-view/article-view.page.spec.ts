import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleViewPage } from './article-view.page';

describe('ArticleViewPage', () => {
  let component: ArticleViewPage;
  let fixture: ComponentFixture<ArticleViewPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ArticleViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
