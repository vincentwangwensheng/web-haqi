import { TestBed } from '@angular/core/testing';

import { ActivationService } from './activation.service';

describe('ActivationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActivationService = TestBed.get(ActivationService);
    expect(service).toBeTruthy();
  });
});
