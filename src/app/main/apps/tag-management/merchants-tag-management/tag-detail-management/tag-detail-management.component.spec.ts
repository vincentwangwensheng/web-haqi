import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDetailManagementComponent } from './tag-detail-management.component';

describe('TagDetailManagementComponent', () => {
  let component: TagDetailManagementComponent;
  let fixture: ComponentFixture<TagDetailManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagDetailManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDetailManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
