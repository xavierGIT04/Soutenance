import {PROFIL, ROLE} from '../request/UserRequest';

export interface UserInfo {
  role: ROLE;
  profil: PROFIL;
  nom: string;
  telephone: string;
}
