import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordClassiqueComponent } from './dashbord-classique-component';

describe('DashbordClassiqueComponent', () => {
  let component: DashbordClassiqueComponent;
  let fixture: ComponentFixture<DashbordClassiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordClassiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashbordClassiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
