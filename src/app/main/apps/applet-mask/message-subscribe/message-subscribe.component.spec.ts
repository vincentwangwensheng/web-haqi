import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageSubscribeComponent } from './message-subscribe.component';

describe('MessageSubscribeComponent', () => {
  let component: MessageSubscribeComponent;
  let fixture: ComponentFixture<MessageSubscribeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageSubscribeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
