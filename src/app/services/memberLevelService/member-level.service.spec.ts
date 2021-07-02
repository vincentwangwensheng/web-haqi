import { TestBed } from '@angular/core/testing';

import { MemberLevelService } from './member-level.service';

describe('MemberLevelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MemberLevelService = TestBed.get(MemberLevelService);
    expect(service).toBeTruthy();
  });
});
