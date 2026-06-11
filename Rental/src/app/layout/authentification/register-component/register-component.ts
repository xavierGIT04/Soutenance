import {Component, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/auth-service';
import {PROFIL, ROLE, UserRequest} from '../dto/request/UserRequest';
import {form, FormField, maxLength, required, submit} from '@angular/forms/signals';

@Component({
  selector: 'app-register-component',
  imports: [
    RouterLink,
    FormField
  ],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent  {

  profilOptions = [
    { value: PROFIL.classique, label: 'Location Classique' },
    { value: PROFIL.airbn, label: 'Airbnb / Court séjour' }
  ];
  submitError = signal<string | null>(null);

  loading:boolean = false;

  constructor(private authService:AuthService, private router:Router) {
  }

  registerModel = signal<UserRequest>({
    code: '',
    nom: '',
    telephone: '',
    profil: PROFIL.classique,
    role: ROLE.Propritaire,
  });

  registerForm = form(this.registerModel, (fieldPath)=>{
    required(fieldPath.nom, {message:"le nom est obligatoire"});
    required(fieldPath.code, {message:"le code est obligatoire"});
    maxLength(fieldPath.code, 5);
    required(fieldPath.telephone, {message:"le numéro est obligatoire"});
    maxLength(fieldPath.telephone, 8);
  })

  OnSubmit(event: SubmitEvent) {
    event.preventDefault();
    submit(this.registerForm, async()=>{
      this.authService.register(this.registerModel()).subscribe({
        next:()=>{},
        error:(err:Error)=>{
          console.log(err.message);
          this.submitError.set(err.message || "Une erreur inconnue est survenue.");
        }
      })
    } )
  }


}
