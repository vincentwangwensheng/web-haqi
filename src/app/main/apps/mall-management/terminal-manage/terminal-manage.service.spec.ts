import { TestBed } from '@angular/core/testing';

import { TerminalManageService } from './terminal-manage.service';

describe('TerminalManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TerminalManageService = TestBed.get(TerminalManageService);
    expect(service).toBeTruthy();
  });
});
