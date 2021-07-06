import { TestBed } from '@angular/core/testing';

import { ContentManageService } from './content-manage.service';

describe('ContentManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContentManageService = TestBed.get(ContentManageService);
    expect(service).toBeTruthy();
  });
});
