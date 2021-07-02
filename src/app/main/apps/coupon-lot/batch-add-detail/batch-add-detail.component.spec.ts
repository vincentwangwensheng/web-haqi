import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchAddDetailComponent } from './batch-add-detail.component';

describe('BatchAddDetailComponent', () => {
  let component: BatchAddDetailComponent;
  let fixture: ComponentFixture<BatchAddDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchAddDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchAddDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
