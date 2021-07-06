import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStrategyComponent } from './edit-strategy.component';

describe('EditStrategyComponent', () => {
  let component: EditStrategyComponent;
  let fixture: ComponentFixture<EditStrategyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStrategyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStrategyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
