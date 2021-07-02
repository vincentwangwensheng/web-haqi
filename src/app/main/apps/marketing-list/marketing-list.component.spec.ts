import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingListComponent } from './marketing-list.component';

describe('MarketingListComponent', () => {
  let component: MarketingListComponent;
  let fixture: ComponentFixture<MarketingListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
