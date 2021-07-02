import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTerminalComponent } from './edit-terminal.component';

describe('EditTerminalComponent', () => {
  let component: EditTerminalComponent;
  let fixture: ComponentFixture<EditTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
