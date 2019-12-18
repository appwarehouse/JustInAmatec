import { TestBed, async, inject } from '@angular/core/testing';

import { FirebaseGuardGuard } from './firebase-guard.guard';

describe('FirebaseGuardGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FirebaseGuardGuard]
    });
  });

  it('should ...', inject([FirebaseGuardGuard], (guard: FirebaseGuardGuard) => {
    expect(guard).toBeTruthy();
  }));
});
