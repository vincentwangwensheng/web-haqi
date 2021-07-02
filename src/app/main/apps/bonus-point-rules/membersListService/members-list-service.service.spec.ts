import { TestBed } from '@angular/core/testing';

import { MembersListServiceService } from './members-list-service.service';

describe('MembersListServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MembersListServiceService = TestBed.get(MembersListServiceService);
    expect(service).toBeTruthy();
  });
});
