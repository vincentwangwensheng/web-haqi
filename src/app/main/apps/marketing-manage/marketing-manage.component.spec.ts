import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingManageComponent } from './marketing-manage.component';

describe('MarketingManageComponent', () => {
  let component: MarketingManageComponent;
  let fixture: ComponentFixture<MarketingManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
