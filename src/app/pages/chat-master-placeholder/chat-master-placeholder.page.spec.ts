import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMasterPlaceholderPage } from './chat-master-placeholder.page';

describe('ChatMasterPlaceholderPage', () => {
  let component: ChatMasterPlaceholderPage;
  let fixture: ComponentFixture<ChatMasterPlaceholderPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatMasterPlaceholderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
