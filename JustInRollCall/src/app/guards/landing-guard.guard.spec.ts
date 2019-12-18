import { TestBed, async, inject } from '@angular/core/testing';

import { LandingGuardGuard } from './landing-guard.guard';

describe('LandingGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LandingGuardGuard]
    });
  });

  it('should ...', inject([LandingGuardGuard], (guard: LandingGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
