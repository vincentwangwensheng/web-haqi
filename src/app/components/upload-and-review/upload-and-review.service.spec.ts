import { TestBed } from '@angular/core/testing';

import { UploadAndReviewService } from './upload-and-review.service';

describe('UploadAndReviewService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadAndReviewService = TestBed.get(UploadAndReviewService);
    expect(service).toBeTruthy();
  });
});
