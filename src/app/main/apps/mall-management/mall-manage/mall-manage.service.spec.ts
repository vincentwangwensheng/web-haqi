import { TestBed } from '@angular/core/testing';

import { MallManageService } from './mall-manage.service';

describe('MallManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MallManageService = TestBed.get(MallManageService);
    expect(service).toBeTruthy();
  });
});
