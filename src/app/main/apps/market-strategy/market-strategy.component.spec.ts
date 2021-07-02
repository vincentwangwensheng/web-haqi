import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketStrategyComponent } from './market-strategy.component';

describe('MarketingStrategyComponent', () => {
  let component: MarketStrategyComponent;
  let fixture: ComponentFixture<MarketStrategyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketStrategyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
