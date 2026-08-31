import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoMenus } from './mantenimiento-menus';

describe('MantenimientoMenus', () => {
  let component: MantenimientoMenus;
  let fixture: ComponentFixture<MantenimientoMenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoMenus],
    }).compileComponents();

    fixture = TestBed.createComponent(MantenimientoMenus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
