import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTemplateDetailComponent } from './message-template-detail.component';

describe('MessageTemplateDetailComponent', () => {
  let component: MessageTemplateDetailComponent;
  let fixture: ComponentFixture<MessageTemplateDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageTemplateDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageTemplateDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
