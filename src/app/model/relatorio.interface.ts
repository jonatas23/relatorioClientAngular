export interface SolicitacaoRelatorioRequest {
  tipoRelatorio: TipoRelatorio;
  usuario: string;
  sistema: string;
  agendarPara?: string; // ISO string format
}

export interface SolicitacaoRelatorioResponse {
  idSolicitacao: string;
  mensagem: string;
  status: string;
}

export interface RelatorioStatusResponse {
  idSolicitacao: string;
  tipoRelatorio: TipoRelatorio;
  tipoRelatorioDescricao: string;
  usuario: string;
  sistema: string;
  agendarPara: string;
  status: StatusRelatorio;
  statusDescricao: string;
  dataSolicitacao: string;
  dataInicioExecucao?: string;
  dataConclusao?: string;
  progresso: number;
  mensagemStatus?: string;
  caminhoArquivo?: string;
  tamanhoArquivo?: number;
  tamanhoArquivoFormatado?: string;
  duracaoExecucaoMinutos?: number;
}

export enum TipoRelatorio {
  FOLHA_PAGAMENTO = 'FOLHA_PAGAMENTO',
  DESPESAS_ORCAMENTARIAS = 'DESPESAS_ORCAMENTARIAS',
  RECEITAS_TRIBUTARIAS = 'RECEITAS_TRIBUTARIAS',
  BALANCO_PATRIMONIAL = 'BALANCO_PATRIMONIAL',
  DEMONSTRATIVO_RESULTADOS = 'DEMONSTRATIVO_RESULTADOS',
  EXECUCAO_ORCAMENTARIA = 'EXECUCAO_ORCAMENTARIA',
  POSICAO_FINANCEIRA = 'POSICAO_FINANCEIRA'
}

export enum StatusRelatorio {
  AGENDADO = 'AGENDADO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  CONCLUIDO = 'CONCLUIDO',
  FALHA = 'FALHA',
  CANCELADO = 'CANCELADO'
}

export interface NotificacaoStatus {
  reportId: string;
  userId: string;
  status: StatusRelatorio;
  progress: number;
  message: string;
  timestamp: string;
}
