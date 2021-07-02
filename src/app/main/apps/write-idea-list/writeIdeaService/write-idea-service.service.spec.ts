import { TestBed } from '@angular/core/testing';

import { WriteIdeaServiceService } from './write-idea-service.service';

describe('WriteIdeaServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WriteIdeaServiceService = TestBed.get(WriteIdeaServiceService);
    expect(service).toBeTruthy();
  });
});
