import {PROFIL, ROLE} from '../request/UserRequest';

export interface UserInfo {
  uuid:string;
  role: ROLE;
  profil: PROFIL;
  nom: string;
  telephone: string;
  avatar: string;
}
