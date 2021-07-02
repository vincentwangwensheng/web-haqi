import { TestBed } from '@angular/core/testing';

import { MessageTemplateService } from './message-template.service';

describe('MessageTemplateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MessageTemplateService = TestBed.get(MessageTemplateService);
    expect(service).toBeTruthy();
  });
});
