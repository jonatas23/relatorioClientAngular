import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {RelatorioDTO} from '../model/relatorioDTO';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = 'http://localhost:8081/api/relatorios';

  constructor(private http: HttpClient) {}

  solicitarRelatorio(request: RelatorioDTO): Observable<string> {
    return this.http.post<string>(this.apiUrl, request);
  }
}
