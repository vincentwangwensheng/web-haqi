import { TestBed } from '@angular/core/testing';

import { OpenLoginService } from './open-login.service';

describe('OpenLoginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenLoginService = TestBed.get(OpenLoginService);
    expect(service).toBeTruthy();
  });
});
