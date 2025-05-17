import { TestBed } from '@angular/core/testing';

import { MsgAttachmentService } from './msg-attachment.service';

describe('MsgAttachmentService', () => {
  let service: MsgAttachmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsgAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
