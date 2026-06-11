import {PROFIL, ROLE} from '../request/UserRequest';

export interface UserResponse {
  uuid: string;
  token: string;
  refreshToken: string;
  role: ROLE;
  profil: PROFIL;
  nom: string;
  telephone: string;
}
