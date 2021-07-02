import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageSubscribeDetailComponent } from './message-subscribe-detail.component';

describe('MessageSubscribeDetailComponent', () => {
  let component: MessageSubscribeDetailComponent;
  let fixture: ComponentFixture<MessageSubscribeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageSubscribeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageSubscribeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
