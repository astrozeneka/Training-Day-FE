import { TestBed } from '@angular/core/testing';

import { ChatV4Service } from './chat-v4.service';

describe('ChatV4Service', () => {
  let service: ChatV4Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatV4Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
