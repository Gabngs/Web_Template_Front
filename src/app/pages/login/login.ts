import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Password } from 'primeng/password';
import { AuthService } from '@services/api/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, Button, InputText, FloatLabel, Password],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly appName = environment.appName;

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async submit() {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos.');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err) {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 422)) {
        this.error.set('Credenciales incorrectas.');
      } else if (err instanceof HttpErrorResponse && err.status === 429) {
        this.error.set('Demasiados intentos. Intenta de nuevo en unos minutos.');
      } else {
        this.error.set('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
