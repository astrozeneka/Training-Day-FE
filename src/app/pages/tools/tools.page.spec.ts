import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolsPage } from './tools.page';

describe('ToolsPage', () => {
  let component: ToolsPage;
  let fixture: ComponentFixture<ToolsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ToolsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
