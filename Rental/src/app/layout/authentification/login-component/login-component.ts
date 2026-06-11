import {Component, signal} from '@angular/core';
import {AuthService} from '../../../services/auth-service';
import {AuthRequest} from '../dto/request/AuthRequest';
import {form, FormField, minLength, pattern, required, submit} from '@angular/forms/signals';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-component',
  imports: [
    FormField,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {

  constructor(private authService:AuthService, private router:Router) {
  }
  loading: boolean = true;
  private phone8DigitsRegex = /^\d{8}$/;
  loginModel = signal<AuthRequest>(
    {
      telephone:'',
      code:''
    }
  );

  loginForm = form(this.loginModel, (fieldPath) => {
    required(fieldPath.telephone, {message: "le numéro est obligatoire"});
    required(fieldPath.code, {message: "le code est obligatoire"});
    minLength(fieldPath.telephone, 8)
  });

  onSubmit(event: SubmitEvent) {
    this.loading = true;
    event.preventDefault();

    submit(this.loginForm, async () => {
      const credentials = this.loginModel();
      this.authService.login(credentials).subscribe({
        next:()=>{ this.loading = false},
        error:(err:Error)=>{
          this.router.navigate([''])
          this.loading = false;
        }
      })

    });
  }
}
