import { TestBed } from '@angular/core/testing';

import { ManageJobsService } from './manage-jobs.service';

describe('ManageJobsService', () => {
  let service: ManageJobsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageJobsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
