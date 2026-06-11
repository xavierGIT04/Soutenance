import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordAirbnComponent } from './dashbord-airbn-component';

describe('DashbordAirbnComponent', () => {
  let component: DashbordAirbnComponent;
  let fixture: ComponentFixture<DashbordAirbnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordAirbnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashbordAirbnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
