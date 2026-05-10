// VoiceArbiter — Portuguese translations
import type { Translations } from './en';

export const pt: Translations = {
  meta: {
    title: 'VoiceArbiter — Plataforma de Arbitragem IA por Voz',
    description:
      'Crie contratos inteligentes por meio de negociação por voz. ' +
      'O mediador IA determina os termos automaticamente, o escrow da Solana garante o pagamento seguro.',
  },

  nav: {
    subtitle: 'Plataforma de Arbitragem IA por Voz',
    network: 'Devnet',
    reset: 'Reiniciar',
  },

  welcome: {
    title: 'Bem-vindo ao VoiceArbiter',
    description:
      'Crie contratos inteligentes por meio de negociação por voz. ' +
      'O mediador IA determina os termos automaticamente ' +
      'e o escrow da Solana garante o pagamento seguro.',
    feature_voice: 'Negociação por Voz',
    feature_ai: 'Mediador IA',
    feature_escrow: 'Garantia Escrow',
  },

  phases: {
    IDLE: 'Inativo',
    KAYIT: 'Registro',
    MUZAKERE: 'Negociando',
    ONAY: 'Confirmação',
    ESCROW_FUNDED: 'Escrow',
    TAMAMLANDI: 'Concluído',
  },

  wallet: {
    panel_title: 'Cliente — Parte A',
    address_label: 'Endereço da Carteira',
    balance_label: 'Saldo SOL',
    connect_button: 'Conectar Carteira Phantom',
    connecting: 'Conectando...',
    disconnect: 'Desconectar',
    copy: 'Copiar',
    copied: 'Copiado',
    copy_notification_title: 'Copiado',
    copy_notification_msg: 'Endereço copiado para a área de transferência.',
    connect_notification_title: 'Carteira Conectada',
    connect_notification_msg: 'endereço conectado com sucesso.',
    disconnect_notification_title: 'Carteira Desconectada',
    disconnect_notification_msg: 'Carteira Phantom desconectada.',
    not_connected_description: 'Conecte sua carteira Phantom para começar a negociar.',
    devnet_notice: 'Apenas Devnet — sem fundos reais',
  },

  freelancer: {
    panel_title: 'Freelancer — Parte B',
    badge: 'Assinante Automático',
    public_key_label: 'Chave Pública (Solana)',
    network_label: 'Rede',
    backend_signing_title: 'Assinatura no Backend',
    backend_signing_desc:
      'A assinatura do freelancer é adicionada no lado do servidor. ' +
      'A chave privada nunca é enviada ao navegador.',
    keypair_error_title: 'Falha ao Carregar Keypair',
    run_hint: 'Por favor execute:',
    retry: 'Tentar Novamente',
    loading_failed_title: 'Falha ao Carregar Informações do Freelancer',
    loading_failed_msg: 'Certifique-se de que o arquivo freelancer-keypair.json existe.',
  },

  trust: {
    panel_title: 'Relatório de Confiança',
    client_panel_title: 'Relatório de Confiança do Cliente',
    loading: 'Calculando pontuação de confiança...',
    load_failed: 'Falha ao carregar o relatório',
    retry: 'Tentar novamente',
    no_wallet: 'É necessária uma conexão de carteira para o relatório de confiança.',
    data_source_label: 'Fonte',
    calculated_at: 'Calculado em',
    categories: {
      age: 'Idade',
      activity: 'Atividade',
      balance: 'Saldo',
      provenance: 'Procedência',
    },
    rating: {
      excellent: 'Excelente',
      good: 'Bom',
      medium: 'Médio',
      weak: 'Fraco',
      insufficient: 'Insuficiente',
    },
    overall: {
      high: 'Alta Confiança — Esta carteira tem um histórico confiável.',
      medium_high: 'Confiança Média-Alta — Nível aceitável de confiança.',
      medium: 'Confiança Média — Recomenda-se proceder com cautela.',
      low: 'Baixa Confiança — Tenha cuidado ao operar com esta carteira.',
      very_low: 'Confiança Muito Baixa — Histórico insuficiente; alto risco.',
    },
    rationale: {
      age: {
        zero: 'Esta carteira é muito nova ou sua idade não pode ser determinada. Sem histórico de confiança.',
        days_1_6: 'Esta carteira tem apenas {days} dia(s). Ainda não tem histórico de confiança estabelecido.',
        days_7_29: 'Esta carteira tem {days} dias. Histórico curto, confiança limitada.',
        days_30_89: 'Esta carteira tem {days} dias. Nível moderado de confiança estabelecido.',
        days_90_364: 'Esta carteira tem {days} dias. Bom histórico de confiança.',
        years: 'Esta carteira está ativa há mais de {years} ano(s). Histórico sólido.',
      },
      activity: {
        zero: 'Nenhuma transação detectada nesta carteira. Sem histórico.',
        very_low: '{count} transação(ões) detectada(s). Atividade muito baixa.',
        low: '{count} transações detectadas. Baixo nível de atividade.',
        medium: '{count} transações detectadas. Atividade média — perfil adequado.',
        high: '{count} transações detectadas. Corresponde ao perfil de usuário ativo.',
        very_high: '{count}+ transações detectadas. Carteira muito ativa e estabelecida.',
      },
      balance: {
        very_low: '{sol} SOL disponíveis. Saldo insuficiente para cobrir o valor do contrato.',
        low: '{sol} SOL disponíveis. Saldo baixo; pode ser suficiente para contratos pequenos.',
        medium: '{sol} SOL disponíveis. Saldo suficiente para contratos padrão.',
        high: '{sol} SOL disponíveis. Suficiente para cobrir o valor do contrato.',
        very_high: '{sol} SOL disponíveis. Saldo sólido; adequado para contratos grandes.',
      },
      provenance: {
        unknown: 'Não foi possível identificar a fonte do primeiro fundo. Origem incerta; confiança média atribuída.',
        exchange: 'A fonte do primeiro fundo é um endereço de exchange conhecido. Origem confiável.',
        individual: 'A fonte do primeiro fundo é uma carteira individual ({addr}). Origem não verificada.',
        suspicious: 'A fonte do primeiro fundo é desconhecida ou suspeita. Recomenda-se cautela.',
      },
    },
  },

  voice: {
    panel_title_client: 'Cliente — Gravação de Voz',
    panel_title_freelancer: 'Freelancer — Gravação de Voz',
    panel_title_party: '{party} — Gravação de Voz',
    language_label: 'Idioma',
    languages: {
      tr: 'Turco',
      en: 'Inglês',
      es: 'Espanhol',
      pt: 'Português',
      auto: 'Automático',
    },
    hold_to_record: 'Pressione e segure para gravar',
    recording: 'Gravando... Solte para enviar',
    transcribing: 'Transcrevendo...',
    mic_error_title: 'Erro de Microfone',
    mic_error_msg: 'É necessário acesso ao microfone para a gravação de voz.',
    mic_denied: 'Acesso ao microfone negado. Por favor verifique as permissões do navegador.',
    audio_too_short: 'A gravação é muito curta ou vazia. Por favor fale por pelo menos 1 segundo.',
    transcription_error: 'Erro de transcrição: {msg}',
    recorded_title: 'Voz Gravada',
    recorded_msg: 'Transcrição completa: "{preview}"',
    last_transcript: 'Última Transcrição:',
    transcription_error_title: 'Erro de Transcrição',
  },

  mediator: {
    panel_title: 'Mediador IA',
    analyzing: 'Analisando...',
    analyze_button: 'Analisar',
    empty_state: 'As transcrições de voz aparecerão aqui quando a negociação começar.',
    extracted_terms_title: 'Termos do Contrato Extraídos',
    confidence: 'Confiança',
    missing_info_title: 'Informações Faltantes:',
    not_specified: 'Não especificado',
    dash: '—',
    labels: {
      amount: 'Valor',
      deadline: 'Prazo',
      scope: 'Escopo',
      payment: 'Pagamento',
    },
    party_client: 'Cliente',
    party_freelancer: 'Freelancer',
    terms_extracted_title: 'Termos Extraídos',
    terms_extracted_msg: 'O Mediador IA determinou os termos do contrato. Por favor confirme.',
    analysis_error: 'Análise falhou',
  },

  escrow: {
    panel_title: 'Gestão de Escrow',
    contract_summary_title: 'Resumo do Contrato',
    amount_label: 'Valor',
    deadline_label: 'Prazo',
    scope_label: 'Escopo',
    payment_conditions_label: 'Condições de Pagamento',
    no_terms_description:
      'Os termos do contrato ainda não foram determinados.\nAparecerão aqui quando a negociação estiver completa.',
    tx_confirmed_title: 'Transação Confirmada',
    view_explorer: 'Ver no Explorer',
    fund_button: 'Financiar Escrow — {amount} SOL',
    funding: 'Financiando Escrow...',
    release_button: 'Liberar Escrow (Freelancer)',
    releasing: 'Processando...',
    completed_label: 'Contrato Concluído!',
    missing_info_notification_title: 'Informação Faltante',
    missing_info_notification_msg: 'Todas as informações são necessárias para financiar o escrow.',
    invalid_amount_title: 'Valor Inválido',
    invalid_amount_msg: 'O valor do contrato não está especificado ou é inválido.',
    funded_title: 'Escrow Financiado!',
    funded_msg: '{amount} SOL transferidos com sucesso para o escrow.',
    escrow_error: 'Erro de Escrow',
    server_unreachable: 'Não foi possível contactar o servidor de assinatura',
    signing_failed: 'Assinatura falhou',
    completed_title: 'Contrato Concluído!',
    completed_msg: 'Escrow liberado e contrato concluído com sucesso.',
  },

  negotiation: {
    start_prompt: 'Identidades verificadas. Pronto para iniciar a negociação?',
    start_button: 'Iniciar Negociação',
    completed_title: 'Contrato Concluído com Sucesso!',
    completed_desc: 'O escrow foi liberado e o pagamento processado.',
    new_contract: 'Iniciar Novo Contrato',
  },

  notifications: {
    dismiss: '✕',
  },
};
