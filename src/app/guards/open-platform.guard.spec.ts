import { TestBed, async, inject } from '@angular/core/testing';

import { OpenPlatformGuard } from './open-platform.guard';

describe('OpenPlatformGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenPlatformGuard]
    });
  });

  it('should ...', inject([OpenPlatformGuard], (guard: OpenPlatformGuard) => {
    expect(guard).toBeTruthy();
  }));
});
