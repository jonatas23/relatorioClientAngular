import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Subject, takeUntil} from 'rxjs';

// PrimeNG Imports
import {ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';
import {Dialog} from 'primeng/dialog';
import {TableModule} from 'primeng/table';
import {Tag} from 'primeng/tag';
import {ProgressBar} from 'primeng/progressbar';
import {Toast} from 'primeng/toast';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';

// Services
import {NotificationService} from '../../services/notification-service';
import {RelatorioService} from '../../services/relatorio-service';

// Interfaces
import {
  NotificacaoStatus,
  RelatorioStatusResponse,
  SolicitacaoRelatorioRequest,
  StatusRelatorio,
  TipoRelatorio
} from '../../model/relatorio.interface';

@Component({
  selector: 'app-relatorio-component',
  imports: [
    CommonModule,
    FormsModule,
    ButtonDirective,
    InputText,
    DatePicker,
    Select,
    Dialog,
    Tag,
    ProgressBar,
    Toast,
    ConfirmDialog,
    TableModule
  ],
  templateUrl: './relatorio-component.html',
  styleUrl: './relatorio-component.css',
  standalone: true,
  providers: [MessageService, ConfirmationService]
})
export class RelatorioComponent implements OnInit, OnDestroy {
  // Propriedades existentes
  usuario: string = '';
  usuarioLogado: boolean = false;
  mostrarModalLogin: boolean = false;
  relatorioSelecionado: TipoRelatorio | null = null;
  dataSelecionada: Date | null = null;

  // Novas propriedades para a lista
  relatorios: RelatorioStatusResponse[] = [];
  loading: boolean = false;
  conectadoWebSocket: boolean = false;
  autoRefresh: boolean = true;

  // Opções de relatórios
  tiposRelatorio = [
    {label: 'Folha de Pagamento', value: TipoRelatorio.FOLHA_PAGAMENTO},
    {label: 'Despesas Orçamentárias', value: TipoRelatorio.DESPESAS_ORCAMENTARIAS},
    {label: 'Receitas Tributárias', value: TipoRelatorio.RECEITAS_TRIBUTARIAS},
    {label: 'Balanço Patrimonial', value: TipoRelatorio.BALANCO_PATRIMONIAL},
    {label: 'Demonstrativo de Resultados', value: TipoRelatorio.DEMONSTRATIVO_RESULTADOS},
    {label: 'Execução Orçamentária', value: TipoRelatorio.EXECUCAO_ORCAMENTARIA},
    {label: 'Posição Financeira', value: TipoRelatorio.POSICAO_FINANCEIRA}
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private relatorioService: RelatorioService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
  }

  ngOnInit(): void {
    this.verificarLoginExistente();
    // this.setupNotificationHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.notificationService.disconnect();
  }

  verificarLoginExistente(): void {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      this.usuario = usuarioSalvo;
      this.usuarioLogado = true;
      this.conectarServicos();
    }
  }

  private conectarServicos(): void {
    // Conectar WebSocket
    this.notificationService.connect(this.usuario);

    this.notificationService.getNotifications().subscribe(msg => {
      console.log('Nova notificação:', msg);
      alert(msg); // ou renderize no componente
      this.messageService.add({
        severity: 'info',
        summary: 'Notificação',
        detail: msg,
        life: 5000
      });
    });

    // Carregar lista inicial
    this.carregarRelatorios();

    // Setup auto-refresh se habilitado
    this.setupAutoRefresh();
  }

  // private setupNotificationHandling(): void {
  //   // Status da conexão WebSocket
  //   this.notificationService.isConnected$
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe(connected => {
  //       this.conectadoWebSocket = connected;
  //       if (connected) {
  //         this.showSuccess('Conectado ao sistema de notificações em tempo real');
  //       }
  //     });
  //
  //   // Processar notificações recebidas
  //   this.notificationService.notifications
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((notification: NotificacaoStatus) => {
  //       this.processarNotificacao(notification);
  //     });
  // }

  private setupAutoRefresh(): void {
    if (this.autoRefresh && this.usuarioLogado) {
      this.relatorioService.watchRelatoriosPorUsuario(this.usuario)
        .pipe(takeUntil(this.destroy$))
        .subscribe(relatorios => {
          this.relatorios = relatorios;
        });
    }
  }

  carregarRelatorios(): void {
    if (!this.usuarioLogado) return;

    this.loading = true;
    this.relatorioService.listarRelatoriosPorUsuario(this.usuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (relatorios) => {
          this.relatorios = relatorios;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar relatórios:', error);
          this.showError('Erro ao carregar lista de relatórios');
          this.loading = false;
        }
      });
  }

  logar(): void {
    if (this.usuario.trim()) {
      try {
        this.usuarioLogado = true;
        this.mostrarModalLogin = false;
        localStorage.setItem('usuario', this.usuario);

        this.conectarServicos();
        this.showSuccess(`Bem-vindo, ${this.usuario}!`);

      } catch (error) {
        console.error('Erro ao fazer login:', error);
        this.showError('Erro ao realizar login');
      }
    }
  }

  deslogar(): void {
    try {
      this.notificationService.disconnect();
      this.usuarioLogado = false;
      this.usuario = '';
      this.relatorioSelecionado = null;
      this.dataSelecionada = null;
      this.relatorios = [];

      localStorage.removeItem('usuario');
      this.showInfo('Logout realizado com sucesso');

    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  cancelarLogin(): void {
    this.mostrarModalLogin = false;
    this.usuario = '';
  }

  gerarRelatorio(): void {
    if (!this.relatorioSelecionado) {
      this.showWarn('Selecione um tipo de relatório');
      return;
    }

    const agendarPara = this.dataSelecionada;

    const request: SolicitacaoRelatorioRequest = {
      tipoRelatorio: this.relatorioSelecionado,
      usuario: this.usuario,
      sistema: 'SIAFIC',
      agendarPara: agendarPara?.toISOString()
    };

    this.relatorioService.solicitarRelatorio(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.showSuccess('Relatório solicitado com sucesso!');
          this.relatorioSelecionado = null;
          this.dataSelecionada = null;

          // Recarregar lista
          setTimeout(() => this.carregarRelatorios(), 1000);
        },
        error: (error) => {
          console.error('Erro ao solicitar relatório:', error);
          this.showError('Erro ao solicitar relatório');
        }
      });
  }

  cancelarRelatorio(relatorio: RelatorioStatusResponse): void {
    this.confirmationService.confirm({
      message: `Deseja cancelar o relatório "${relatorio.tipoRelatorioDescricao}"?`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Cancelar',
      rejectLabel: 'Não',
      accept: () => {
        this.relatorioService.cancelarRelatorio(relatorio.idSolicitacao)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Relatório cancelado com sucesso');
              this.carregarRelatorios();
            },
            error: (error) => {
              console.error('Erro ao cancelar relatório:', error);
              this.showError('Erro ao cancelar relatório');
            }
          });
      }
    });
  }

  excluirRelatorio(relatorio: RelatorioStatusResponse): void {
    this.confirmationService.confirm({
      message: `Deseja excluir permanentemente o relatório "${relatorio.tipoRelatorioDescricao}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-trash',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.relatorioService.excluirRelatorio(relatorio.idSolicitacao)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccess('Relatório excluído com sucesso');
              this.carregarRelatorios();
            },
            error: (error) => {
              console.error('Erro ao excluir relatório:', error);
              this.showError('Erro ao excluir relatório');
            }
          });
      }
    });
  }

  downloadRelatorio(relatorio: RelatorioStatusResponse): void {
    if (!relatorio.caminhoArquivo) {
      this.showWarn('Arquivo não disponível para download');
      return;
    }

    this.relatorioService.downloadRelatorio(relatorio.caminhoArquivo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${relatorio.tipoRelatorio}_${relatorio.idSolicitacao}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.showSuccess('Download iniciado');
        },
        error: (error) => {
          console.error('Erro ao fazer download:', error);
          this.showError('Erro ao fazer download do arquivo');
        }
      });
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;

    if (this.autoRefresh) {
      this.setupAutoRefresh();
      this.showInfo('Atualização automática ativada');
    } else {
      this.showInfo('Atualização automática desativada');
    }
  }

  // Métodos utilitários
  getStatusSeverity(status: StatusRelatorio): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case StatusRelatorio.CONCLUIDO:
        return 'success';
      case StatusRelatorio.EM_EXECUCAO:
        return 'info';
      case StatusRelatorio.AGENDADO:
        return 'warning';
      case StatusRelatorio.FALHA:
      case StatusRelatorio.CANCELADO:
        return 'danger';
      default:
        return 'info';
    }
  }

  canCancel(status: StatusRelatorio): boolean {
    return status === StatusRelatorio.AGENDADO;
  }

  canDelete(status: StatusRelatorio): boolean {
    return status !== StatusRelatorio.EM_EXECUCAO;
  }

  canDownload(relatorio: RelatorioStatusResponse): boolean {
    return relatorio.status === StatusRelatorio.CONCLUIDO && !!relatorio.caminhoArquivo;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  // Métodos de notificação
  private showSuccess(message: string): void {
    this.messageService.add({severity: 'success', summary: 'Sucesso', detail: message});
  }

  private showError(message: string): void {
    this.messageService.add({severity: 'error', summary: 'Erro', detail: message});
  }

  private showWarn(message: string): void {
    this.messageService.add({severity: 'warn', summary: 'Atenção', detail: message});
  }

  private showInfo(message: string): void {
    this.messageService.add({severity: 'info', summary: 'Informação', detail: message});
  }
}
