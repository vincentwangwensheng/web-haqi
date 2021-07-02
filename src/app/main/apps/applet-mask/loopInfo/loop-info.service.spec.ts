import { TestBed } from '@angular/core/testing';

import { LoopInfoService } from './loop-info.service';

describe('LoopInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoopInfoService = TestBed.get(LoopInfoService);
    expect(service).toBeTruthy();
  });
});
