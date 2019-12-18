import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InAppReportParamsPage } from './in-app-report-params.page';

describe('InAppReportParamsPage', () => {
  let component: InAppReportParamsPage;
  let fixture: ComponentFixture<InAppReportParamsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InAppReportParamsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InAppReportParamsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
