import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BonusPointRulesComponent } from './bonus-point-rules.component';

describe('BonusPointRulesComponent', () => {
  let component: BonusPointRulesComponent;
  let fixture: ComponentFixture<BonusPointRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BonusPointRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BonusPointRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
