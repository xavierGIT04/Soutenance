import { Injectable } from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AirbnRequest} from '../layout/profil_airbn/airbn/dto/AirbnRequest';
import {AirbnResponse} from '../layout/profil_airbn/airbn/dto/AirbnResponse';
import {StatutUnite, UniteRequest} from '../layout/profil_classique/biens/dto/request/UniteRequest';
import {UniteResponse} from '../layout/profil_classique/biens/dto/response/UniteResponse';

@Injectable({
  providedIn: 'root',
})
export class AirbnService {
  private readonly apiUrl: string = `${environment.ApiUrl}/airbn/`;

  constructor(private http: HttpClient) {}

  add_airbn(airbn:AirbnRequest):Observable<AirbnResponse>{
    return this.http.post<AirbnResponse>(`${this.apiUrl}add_airbn`,airbn)
  }

  all_airbn():Observable<AirbnResponse[]>{
    return this.http.get<AirbnResponse[]>(`${this.apiUrl}all_airbns`)
  }

  one_airbn(uuid:string):Observable<AirbnResponse>{
    const params = new HttpParams().set('id', uuid);
    return this.http.get<AirbnResponse>(`${this.apiUrl}one_airbn`, {params})
  }

  changer_statut(uuid:string, statut:StatutUnite):Observable<AirbnResponse>{
    const params = new HttpParams()
      .set('id', uuid)
      .set('statut', statut)
    return this.http.patch<AirbnResponse>(`${this.apiUrl}changer_statut`,null, {params})
  }

  update(bien:AirbnRequest, uuidbien:string):Observable<AirbnResponse>{
    const params = new HttpParams().set('id', uuidbien)
    return this.http.put<AirbnResponse>(`${this.apiUrl}update`, bien, {params})
  }

}
