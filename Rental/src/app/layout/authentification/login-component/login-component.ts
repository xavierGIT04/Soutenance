import {Component, signal} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {AuthRequest} from '../dto/request/AuthRequest';
import {form, FormField, maxLength, required, submit} from '@angular/forms/signals';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [
    FormField,
    RouterLink,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {

  constructor(private authService:AuthService, private router:Router) {
  }
  submitError = signal<string | null>(null);

  loginModel = signal<AuthRequest>(
    {
      telephone:'',
      codeProprietaire:''
    }
  );

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.telephone, {message: "le numéro est obligatoire"});
    required(fieldPath.codeProprietaire, {message: "le code est obligatoire"});
    maxLength(fieldPath.telephone, 8)
    maxLength(fieldPath.codeProprietaire, 5)
  });

  onSubmit(event: SubmitEvent) {

    event.preventDefault();

    submit(this.loginForm, async () => {
      const credentials = this.loginModel();
      this.authService.login(credentials).subscribe({
        next:()=>{},
        error:(err:Error)=>{
          this.router.navigate(['/login'])
          this.submitError.set(err.message || "Une erreur inconnue est survenue.");
        }
      })

    });
  }
}
