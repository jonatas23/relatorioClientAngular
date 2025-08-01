import {Component} from '@angular/core';
import {ButtonDirective} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';
import {Dialog} from 'primeng/dialog';
import {Password} from 'primeng/password';
import {CommonModule} from '@angular/common';
import {NotificationService} from '../../services/notification-service';
import {RelatorioService} from '../../services/relatorio-service';

@Component({
  selector: 'app-relatorio-component',
  imports: [
    CommonModule,
    ButtonDirective,
    InputText,
    FormsModule,
    DatePicker,
    Select,
    Dialog
  ],
  templateUrl: './relatorio-component.html',
  styleUrl: './relatorio-component.css',
  standalone: true
})
export class RelatorioComponent {
  usuario: string = '';
  usuarioLogado: boolean = false;
  mostrarModalLogin: boolean = false;
  relatorioSelecionado: string | null = null;
  dataSelecionada: Date | null = null;

  relatorios = [
    { label: 'Anexo 1', value: 'Anexo 1' },
    { label: 'Anexo 2', value: 'Anexo 2' },
    { label: 'Anexo 3', value: 'Anexo 3' },
    { label: 'Relatório Mensal', value: 'Relatório Mensal' },
    { label: 'Relatório Anual', value: 'Relatório Anual' },
  ];

  constructor(
    private notificationService: NotificationService,
    private relatorio: RelatorioService
  ) {
    // Verificar se o usuário já está logado ao inicializar o componente
    this.verificarLoginExistente();
  }

  verificarLoginExistente() {
    // Aqui você pode verificar se há um token ou sessão ativa
    // Por exemplo, verificando no localStorage ou sessionStorage
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      this.usuario = usuarioSalvo;
      this.usuarioLogado = true;
      this.notificationService.connect(this.usuario);
    }
  }

  logar() {
    if (this.usuario.trim()) {
      // Aqui você pode adicionar validação de credenciais
      // Por enquanto, vamos assumir que qualquer usuário/senha é válido

      try {
        this.notificationService.connect(this.usuario);
        this.usuarioLogado = true;
        this.mostrarModalLogin = false;

        // Salvar usuário logado (opcional)
        localStorage.setItem('usuario', this.usuario);

        console.log('Login realizado com sucesso para:', this.usuario);
      } catch (error) {
        console.error('Erro ao fazer login:', error);
        // Aqui você pode mostrar uma mensagem de erro para o usuário
      }
    }
  }

  deslogar() {
    try {
      this.notificationService.disconnect();
      this.usuarioLogado = false;
      this.usuario = '';
      this.relatorioSelecionado = null;
      this.dataSelecionada = null;

      // Remover usuário salvo
      localStorage.removeItem('usuario');

      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  cancelarLogin() {
    this.mostrarModalLogin = false;
    this.usuario = '';
  }

  gerarRelatorio() {
    if (!this.relatorioSelecionado) {
      console.warn('Relatório ou data não selecionados');
      return;
    }

    console.log('Usuário:', this.usuario);
    console.log('Relatório:', this.relatorioSelecionado);
    console.log('Data:', this.dataSelecionada);

    this.relatorio.solicitarRelatorio({
      codgUsuario: this.usuario,
      nome: this.relatorioSelecionado,
      agendarPara: this.dataSelecionada
    }).subscribe({
      next: (res) => console.log('Relatório solicitado com sucesso', res),
      error: (err) => console.error('Erro ao solicitar relatório', err)
    });
  }
}
