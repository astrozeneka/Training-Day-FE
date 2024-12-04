import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMasterV4Page } from './chat-master-v4.page';

describe('ChatMasterV4Page', () => {
  let component: ChatMasterV4Page;
  let fixture: ComponentFixture<ChatMasterV4Page>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatMasterV4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
