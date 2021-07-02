import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingTagManagementComponent } from './marketing-tag-management.component';

describe('MarketingTagManagementComponent', () => {
  let component: MarketingTagManagementComponent;
  let fixture: ComponentFixture<MarketingTagManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingTagManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingTagManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
