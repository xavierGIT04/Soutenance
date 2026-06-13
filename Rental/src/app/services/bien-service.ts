import {Injectable, signal} from '@angular/core';
import {environment} from '../../environments/environment.development';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BienRequest} from '../layout/profil_classique/biens/dto/request/BienRequest';
import {BienResponse} from '../layout/profil_classique/biens/dto/response/BienResponse';
import {StatutUnite, UniteRequest} from '../layout/profil_classique/biens/dto/request/UniteRequest';
import {UniteResponse} from '../layout/profil_classique/biens/dto/response/UniteResponse';

@Injectable({
  providedIn: 'root',
})
export class BienService {

  private readonly apiUrlB: string = `${environment.ApiUrl}/bien/`;
  private readonly apiUrlU: string = `${environment.ApiUrl}/unite/`;

  constructor(private http: HttpClient) {}

  addBien(bien:BienRequest):Observable<BienResponse>{
    return this.http.post<BienResponse>(`${this.apiUrlB}add`, bien)
  }

  allBien():Observable<BienResponse[]>{
    return this.http.get<BienResponse[]>(`${this.apiUrlB}all`)
  }

  getUnites(uuid:string):Observable<UniteResponse[]>{
    const params = new HttpParams().set('id', uuid);
    return this.http.get<UniteResponse[]>(`${this.apiUrlB}get_unites`, {params})
  }

  updateBien(bien:BienRequest, uuid:string):Observable<BienResponse>{
    const params = new HttpParams().set('id', uuid)
    return this.http.put<BienResponse>(`${this.apiUrlB}update`, bien, {params})
  }


  addUnite(bien:UniteRequest):Observable<UniteResponse>{
    return this.http.post<UniteResponse>(`${this.apiUrlU}add`, bien)
  }

  changeStatut(uuid:string, statut:StatutUnite):Observable<UniteResponse[]>{
    const params = new HttpParams()
      .set('id', uuid)
      .set('statut', statut)
    return this.http.patch<UniteResponse[]>(`${this.apiUrlU}changer_statut`, null,{params})
  }

  updateUnite(bien:UniteRequest, uuid:string):Observable<UniteResponse>{
    const params = new HttpParams().set('id', uuid)
    return this.http.put<UniteResponse>(`${this.apiUrlU}update`, bien, {params})
  }


}
