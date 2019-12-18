import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesPopPage } from './schedules-pop.page';

describe('SchedulesPopPage', () => {
  let component: SchedulesPopPage;
  let fixture: ComponentFixture<SchedulesPopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulesPopPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulesPopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
