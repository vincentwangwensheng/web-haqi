import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengersTagManagementComponent } from './passengers-tag-management.component';

describe('PassengersTagManagementComponent', () => {
  let component: PassengersTagManagementComponent;
  let fixture: ComponentFixture<PassengersTagManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PassengersTagManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PassengersTagManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
