import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SitePopPage } from './site-pop.page';

describe('SitePopPage', () => {
  let component: SitePopPage;
  let fixture: ComponentFixture<SitePopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SitePopPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SitePopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
