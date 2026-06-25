import { TestBed } from '@angular/core/testing';

import { UserFlow } from './user-flow';

describe('UserFlow', () => {
  let service: UserFlow;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserFlow);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
