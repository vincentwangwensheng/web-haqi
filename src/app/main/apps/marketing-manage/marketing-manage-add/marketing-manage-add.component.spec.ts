import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingManageAddComponent } from './marketing-manage-add.component';

describe('MarketingManageAddComponent', () => {
  let component: MarketingManageAddComponent;
  let fixture: ComponentFixture<MarketingManageAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingManageAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingManageAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
