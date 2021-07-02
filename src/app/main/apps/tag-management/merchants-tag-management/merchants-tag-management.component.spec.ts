import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantsTagManagementComponent } from './merchants-tag-management.component';

describe('MerchantsTagManagementComponent', () => {
  let component: MerchantsTagManagementComponent;
  let fixture: ComponentFixture<MerchantsTagManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantsTagManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantsTagManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
