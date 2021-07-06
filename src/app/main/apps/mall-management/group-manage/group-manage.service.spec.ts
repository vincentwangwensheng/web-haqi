import { TestBed } from '@angular/core/testing';

import { GroupManageService } from './group-manage.service';

describe('GroupManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupManageService = TestBed.get(GroupManageService);
    expect(service).toBeTruthy();
  });
});
