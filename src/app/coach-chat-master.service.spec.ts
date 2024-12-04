import { TestBed } from '@angular/core/testing';

import { CoachChatMasterService } from './coach-chat-master.service';

describe('CoachChatMasterService', () => {
  let service: CoachChatMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoachChatMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
