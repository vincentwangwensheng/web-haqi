import { TestBed } from '@angular/core/testing';

import { RoleManageService } from './role-manage.service';

describe('RoleManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoleManageService = TestBed.get(RoleManageService);
    expect(service).toBeTruthy();
  });
});
