import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CambiarPasswordDialog } from './cambiar-password-dialog';

describe('CambiarPasswordDialog', () => {
  let component: CambiarPasswordDialog;
  let fixture: ComponentFixture<CambiarPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarPasswordDialog],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CambiarPasswordDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
