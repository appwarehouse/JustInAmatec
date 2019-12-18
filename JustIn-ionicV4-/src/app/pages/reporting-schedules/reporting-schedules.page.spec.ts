import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingSchedulesPage } from './reporting-schedules.page';

describe('ReportingSchedulesPage', () => {
  let component: ReportingSchedulesPage;
  let fixture: ComponentFixture<ReportingSchedulesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingSchedulesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingSchedulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
