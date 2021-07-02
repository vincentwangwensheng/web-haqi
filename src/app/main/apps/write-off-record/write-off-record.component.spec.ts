import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteOffRecordComponent } from './write-off-record.component';

describe('WriteOffRecordComponent', () => {
  let component: WriteOffRecordComponent;
  let fixture: ComponentFixture<WriteOffRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteOffRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOffRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
