import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalMapComponent } from './terminal-map.component';

describe('TerminalMapComponent', () => {
  let component: TerminalMapComponent;
  let fixture: ComponentFixture<TerminalMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
