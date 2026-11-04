import { TestBed } from '@angular/core/testing';

import { RecruiterApplicationsService } from './recruiter-applications.service';

describe('RecruiterApplicationsService', () => {
  let service: RecruiterApplicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecruiterApplicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
