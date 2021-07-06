import { TestBed } from '@angular/core/testing';

import { TerminalMapService } from './terminal-map.service';

describe('TerminalMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TerminalMapService = TestBed.get(TerminalMapService);
    expect(service).toBeTruthy();
  });
});
