import { TestBed } from '@angular/core/testing';

import { ChatV3Service } from './chat-v3.service';

describe('ChatV3Service', () => {
  let service: ChatV3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatV3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
