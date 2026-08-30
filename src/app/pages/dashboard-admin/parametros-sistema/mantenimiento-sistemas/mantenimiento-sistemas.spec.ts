import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoSistemas } from './mantenimiento-sistemas';

describe('MantenimientoSistemas', () => {
  let component: MantenimientoSistemas;
  let fixture: ComponentFixture<MantenimientoSistemas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoSistemas],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenimientoSistemas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
