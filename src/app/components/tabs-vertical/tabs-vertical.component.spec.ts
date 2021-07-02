import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsVerticalComponent } from './tabs-vertical.component';

describe('TabsVerticalComponent', () => {
  let component: TabsVerticalComponent;
  let fixture: ComponentFixture<TabsVerticalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsVerticalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
