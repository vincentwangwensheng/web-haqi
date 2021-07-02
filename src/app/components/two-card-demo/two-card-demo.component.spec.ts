import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoCardDemoComponent } from './two-card-demo.component';

describe('TwoCardDemoComponent', () => {
  let component: TwoCardDemoComponent;
  let fixture: ComponentFixture<TwoCardDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoCardDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoCardDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
