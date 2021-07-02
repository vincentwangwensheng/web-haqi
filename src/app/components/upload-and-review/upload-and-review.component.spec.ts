import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAndReviewComponent } from './upload-and-review.component';

describe('UploadAndReviewComponent', () => {
  let component: UploadAndReviewComponent;
  let fixture: ComponentFixture<UploadAndReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAndReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAndReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
