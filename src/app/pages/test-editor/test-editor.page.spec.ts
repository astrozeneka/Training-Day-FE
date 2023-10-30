import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestEditorPage } from './test-editor.page';

describe('TestEditorPage', () => {
  let component: TestEditorPage;
  let fixture: ComponentFixture<TestEditorPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
