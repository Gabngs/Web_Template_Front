import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoRoles } from './mantenimiento-roles';

describe('MantenimientoRoles', () => {
  let component: MantenimientoRoles;
  let fixture: ComponentFixture<MantenimientoRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoRoles],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenimientoRoles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
