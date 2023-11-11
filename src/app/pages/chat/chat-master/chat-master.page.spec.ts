import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMasterPage } from './chat-master.page';

describe('ChatMasterPage', () => {
  let component: ChatMasterPage;
  let fixture: ComponentFixture<ChatMasterPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatMasterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
