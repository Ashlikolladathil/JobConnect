import { TestBed } from '@angular/core/testing';

import { AdminApplicationsService } from './admin-applications.service';

describe('AdminApplicationsService', () => {
  let service: AdminApplicationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminApplicationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
