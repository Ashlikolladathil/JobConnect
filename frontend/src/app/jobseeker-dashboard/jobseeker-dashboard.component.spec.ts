import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobseekerDashboardComponent } from './jobseeker-dashboard.component';

describe('JobseekerDashboardComponent', () => {
  let component: JobseekerDashboardComponent;
  let fixture: ComponentFixture<JobseekerDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobseekerDashboardComponent]
    });
    fixture = TestBed.createComponent(JobseekerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
