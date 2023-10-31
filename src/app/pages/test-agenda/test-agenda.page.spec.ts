import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestAgendaPage } from './test-agenda.page';

describe('TestAgendaPage', () => {
  let component: TestAgendaPage;
  let fixture: ComponentFixture<TestAgendaPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestAgendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
