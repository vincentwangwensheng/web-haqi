import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingTagDetailComponent } from './marketing-tag-detail.component';

describe('MarketingTagDetailComponent', () => {
  let component: MarketingTagDetailComponent;
  let fixture: ComponentFixture<MarketingTagDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingTagDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingTagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
