import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSecuritiesRulesComponent } from './edit-securities-rules.component';

describe('EditSecuritiesRulesComponent', () => {
  let component: EditSecuritiesRulesComponent;
  let fixture: ComponentFixture<EditSecuritiesRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSecuritiesRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSecuritiesRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
