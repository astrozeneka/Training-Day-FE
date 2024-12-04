import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChatMasterDiscussionListComponent } from './chat-master-discussion-list.component';

describe('ChatMasterDiscussionListComponent', () => {
  let component: ChatMasterDiscussionListComponent;
  let fixture: ComponentFixture<ChatMasterDiscussionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatMasterDiscussionListComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMasterDiscussionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
