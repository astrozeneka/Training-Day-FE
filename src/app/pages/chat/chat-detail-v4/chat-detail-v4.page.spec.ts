import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatDetailV4Page } from './chat-detail-v4.page';

describe('ChatDetailV4Page', () => {
  let component: ChatDetailV4Page;
  let fixture: ComponentFixture<ChatDetailV4Page>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatDetailV4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
