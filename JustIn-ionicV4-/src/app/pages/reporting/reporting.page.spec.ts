import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingPage } from './reporting.page';

describe('ReportingPage', () => {
  let component: ReportingPage;
  let fixture: ComponentFixture<ReportingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
