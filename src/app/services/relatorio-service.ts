import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, startWith, switchMap, timer} from 'rxjs';
import {
  RelatorioStatusResponse,
  SolicitacaoRelatorioRequest,
  SolicitacaoRelatorioResponse
} from '../model/relatorio.interface';

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = 'http://localhost:8081/api/relatorios';
  private readonly refreshInterval$ = new BehaviorSubject<number>(5000); // 30 segundos

  constructor(private http: HttpClient) {}

  // solicitarRelatorio(request: RelatorioDTO): Observable<string> {
  //   return this.http.post<string>(this.apiUrl, request);
  // }

  solicitarRelatorio(request: SolicitacaoRelatorioRequest): Observable<SolicitacaoRelatorioResponse> {
    return this.http.post<SolicitacaoRelatorioResponse>(
      this.apiUrl,
      request
    );
  }

  buscarRelatorio(idSolicitacao: string): Observable<RelatorioStatusResponse> {
    return this.http.get<RelatorioStatusResponse>(
      `${this.apiUrl}/${idSolicitacao}`
    );
  }

  listarRelatoriosPorUsuario(usuario: string): Observable<RelatorioStatusResponse[]> {
    return this.http.get<RelatorioStatusResponse[]>(
      `${this.apiUrl}`,
      {
        params: { usuario }
      }
    );
  }

  // Polling automático das solicitações
  watchRelatoriosPorUsuario(usuario: string): Observable<RelatorioStatusResponse[]> {
    return this.refreshInterval$.pipe(
      switchMap(intervalMs => {
        if (intervalMs === 0) {
          // No polling: just fetch once
          return this.listarRelatoriosPorUsuario(usuario);
        } else {
          // Poll every `intervalMs` milliseconds, starting immediately
          return timer(0, intervalMs).pipe(
            startWith(0), // Ensures immediate first emission
            switchMap(() => this.listarRelatoriosPorUsuario(usuario))
          );
        }
      }),
      catchError(error => {
        console.error('Erro ao buscar relatórios:', error);
        return of([]); // ✅ Return empty array as observable
      })
    );
  }
  cancelarRelatorio(idSolicitacao: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${idSolicitacao}/cancelar`,
      {}
    );
  }

  excluirRelatorio(idSolicitacao: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${idSolicitacao}`
    );
  }

  downloadRelatorio(caminhoArquivo: string): Observable<Blob> {
    return this.http.get(caminhoArquivo, {
      responseType: 'blob'
    });
  }

  setRefreshInterval(milliseconds: number): void {
    this.refreshInterval$.next(milliseconds);
  }
}
