import { TestBed } from '@angular/core/testing';

import { MessageSubscribeService } from './message-subscribe.service';

describe('MessageSubscribeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageSubscribeService = TestBed.get(MessageSubscribeService);
    expect(service).toBeTruthy();
  });
});
