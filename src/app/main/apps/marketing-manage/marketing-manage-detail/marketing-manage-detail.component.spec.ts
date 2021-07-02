import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingManageDetailComponent } from './marketing-manage-detail.component';

describe('MarketingManageDetailComponent', () => {
  let component: MarketingManageDetailComponent;
  let fixture: ComponentFixture<MarketingManageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingManageDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingManageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
