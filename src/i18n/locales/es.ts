// VoiceArbiter — Spanish translations
import type { Translations } from './en';

export const es: Translations = {
  meta: {
    title: 'VoiceArbiter — Plataforma de Arbitraje con IA por Voz',
    description:
      'Crea contratos inteligentes a través de negociación por voz. ' +
      'El mediador IA determina los términos automáticamente, el escrow de Solana garantiza el pago seguro.',
  },

  nav: {
    subtitle: 'Plataforma de Arbitraje IA por Voz',
    network: 'Devnet',
    reset: 'Reiniciar',
  },

  welcome: {
    title: 'Bienvenido a VoiceArbiter',
    description:
      'Crea contratos inteligentes a través de negociación por voz. ' +
      'El mediador IA determina los términos automáticamente ' +
      'y el escrow de Solana garantiza el pago seguro.',
    feature_voice: 'Negociación por Voz',
    feature_ai: 'Mediador IA',
    feature_escrow: 'Garantía Escrow',
  },

  phases: {
    IDLE: 'Inactivo',
    KAYIT: 'Registro',
    MUZAKERE: 'Negociando',
    ONAY: 'Confirmación',
    ESCROW_FUNDED: 'Escrow',
    TAMAMLANDI: 'Completado',
  },

  wallet: {
    panel_title: 'Cliente — Parte A',
    address_label: 'Dirección de Billetera',
    balance_label: 'Saldo SOL',
    connect_button: 'Conectar Billetera Phantom',
    connecting: 'Conectando...',
    disconnect: 'Desconectar',
    copy: 'Copiar',
    copied: 'Copiado',
    copy_notification_title: 'Copiado',
    copy_notification_msg: 'Dirección copiada al portapapeles.',
    connect_notification_title: 'Billetera Conectada',
    connect_notification_msg: 'dirección conectada exitosamente.',
    disconnect_notification_title: 'Billetera Desconectada',
    disconnect_notification_msg: 'Billetera Phantom desconectada.',
    not_connected_description: 'Conecta tu billetera Phantom para comenzar a negociar.',
    devnet_notice: 'Solo Devnet — no se usan fondos reales',
  },

  freelancer: {
    panel_title: 'Freelancer — Parte B',
    badge: 'Firmante Automático',
    public_key_label: 'Clave Pública (Solana)',
    network_label: 'Red',
    backend_signing_title: 'Firma en Backend',
    backend_signing_desc:
      'La firma del freelancer se añade del lado del servidor. ' +
      'La clave privada nunca se envía al navegador.',
    keypair_error_title: 'Error al Cargar Keypair',
    run_hint: 'Por favor ejecuta:',
    retry: 'Reintentar',
    loading_failed_title: 'Error al Cargar Información del Freelancer',
    loading_failed_msg: 'Asegúrate de que el archivo freelancer-keypair.json exista.',
  },

  trust: {
    panel_title: 'Reporte de Confianza',
    client_panel_title: 'Reporte de Confianza del Cliente',
    loading: 'Calculando puntuación de confianza...',
    load_failed: 'No se pudo cargar el reporte',
    retry: 'Reintentar',
    no_wallet: 'Se requiere conexión de billetera para el reporte de confianza.',
    data_source_label: 'Fuente',
    calculated_at: 'Calculado el',
    categories: {
      age: 'Antigüedad',
      activity: 'Actividad',
      balance: 'Saldo',
      provenance: 'Procedencia',
    },
    rating: {
      excellent: 'Excelente',
      good: 'Bueno',
      medium: 'Medio',
      weak: 'Débil',
      insufficient: 'Insuficiente',
    },
    overall: {
      high: 'Alta Confianza — Esta billetera tiene un historial confiable.',
      medium_high: 'Confianza Media-Alta — Nivel aceptable de confianza.',
      medium: 'Confianza Media — Se recomienda proceder con precaución.',
      low: 'Baja Confianza — Ten cuidado al operar con esta billetera.',
      very_low: 'Confianza Muy Baja — Historial insuficiente; alto riesgo.',
    },
    rationale: {
      age: {
        zero: 'Esta billetera es muy nueva o su antigüedad no puede determinarse. Sin historial de confianza.',
        days_1_6: 'Esta billetera tiene solo {days} día(s). Aún no tiene historial de confianza establecido.',
        days_7_29: 'Esta billetera tiene {days} días. Historial corto, confianza limitada.',
        days_30_89: 'Esta billetera tiene {days} días. Nivel moderado de confianza establecido.',
        days_90_364: 'Esta billetera tiene {days} días. Buen historial de confianza.',
        years: 'Esta billetera ha estado activa por más de {years} año(s). Historial sólido.',
      },
      activity: {
        zero: 'No se detectaron transacciones en esta billetera. Sin historial.',
        very_low: 'Se detectaron {count} transacción(es). Actividad muy baja.',
        low: 'Se detectaron {count} transacciones. Bajo nivel de actividad.',
        medium: 'Se detectaron {count} transacciones. Actividad media — perfil adecuado.',
        high: 'Se detectaron {count} transacciones. Coincide con el perfil de usuario activo.',
        very_high: 'Se detectaron {count}+ transacciones. Billetera muy activa y establecida.',
      },
      balance: {
        very_low: '{sol} SOL disponibles. Saldo insuficiente para cubrir el valor del contrato.',
        low: '{sol} SOL disponibles. Saldo bajo; puede ser suficiente para contratos pequeños.',
        medium: '{sol} SOL disponibles. Saldo suficiente para contratos estándar.',
        high: '{sol} SOL disponibles. Suficiente para cubrir el valor del contrato.',
        very_high: '{sol} SOL disponibles. Saldo sólido; adecuado para contratos grandes.',
      },
      provenance: {
        unknown: 'No se pudo identificar la fuente del primer fondo. Origen incierto; confianza media asignada.',
        exchange: 'La fuente del primer fondo es una dirección de exchange conocida. Origen de confianza.',
        individual: 'La fuente del primer fondo es una billetera individual ({addr}). Origen no verificado.',
        suspicious: 'La fuente del primer fondo es desconocida o sospechosa. Se recomienda precaución.',
      },
    },
  },

  voice: {
    panel_title_client: 'Cliente — Grabación de Voz',
    panel_title_freelancer: 'Freelancer — Grabación de Voz',
    panel_title_party: '{party} — Grabación de Voz',
    language_label: 'Idioma',
    languages: {
      tr: 'Turco',
      en: 'Inglés',
      es: 'Español',
      pt: 'Portugués',
      auto: 'Automático',
    },
    hold_to_record: 'Mantén presionado para grabar',
    recording: 'Grabando... Suelta para enviar',
    transcribing: 'Transcribiendo...',
    mic_error_title: 'Error de Micrófono',
    mic_error_msg: 'Se requiere acceso al micrófono para la grabación de voz.',
    mic_denied: 'Acceso al micrófono denegado. Por favor verifica los permisos del navegador.',
    audio_too_short: 'La grabación es demasiado corta o vacía. Por favor habla por al menos 1 segundo.',
    transcription_error: 'Error de transcripción: {msg}',
    recorded_title: 'Voz Grabada',
    recorded_msg: 'Transcripción completa: "{preview}"',
    last_transcript: 'Última Transcripción:',
    transcription_error_title: 'Error de Transcripción',
  },

  mediator: {
    panel_title: 'Mediador IA',
    analyzing: 'Analizando...',
    analyze_button: 'Analizar',
    empty_state: 'Las transcripciones de voz aparecerán aquí cuando comience la negociación.',
    extracted_terms_title: 'Términos del Contrato Extraídos',
    confidence: 'Confianza',
    missing_info_title: 'Información Faltante:',
    not_specified: 'No especificado',
    dash: '—',
    labels: {
      amount: 'Monto',
      deadline: 'Fecha Límite',
      scope: 'Alcance',
      payment: 'Pago',
    },
    party_client: 'Cliente',
    party_freelancer: 'Freelancer',
    terms_extracted_title: 'Términos Extraídos',
    terms_extracted_msg: 'El Mediador IA ha determinado los términos del contrato. Por favor confirma.',
    analysis_error: 'Análisis fallido',
  },

  escrow: {
    panel_title: 'Gestión de Escrow',
    contract_summary_title: 'Resumen del Contrato',
    amount_label: 'Monto',
    deadline_label: 'Fecha Límite',
    scope_label: 'Alcance',
    payment_conditions_label: 'Condiciones de Pago',
    no_terms_description:
      'Los términos del contrato aún no han sido determinados.\nAparecerán aquí cuando la negociación esté completa.',
    tx_confirmed_title: 'Transacción Confirmada',
    view_explorer: 'Ver en Explorer',
    fund_button: 'Financiar Escrow — {amount} SOL',
    funding: 'Financiando Escrow...',
    release_button: 'Liberar Escrow (Freelancer)',
    releasing: 'Procesando...',
    completed_label: '¡Contrato Completado!',
    missing_info_notification_title: 'Información Faltante',
    missing_info_notification_msg: 'Se requiere toda la información para financiar el escrow.',
    invalid_amount_title: 'Monto Inválido',
    invalid_amount_msg: 'El monto del contrato no está especificado o es inválido.',
    funded_title: '¡Escrow Financiado!',
    funded_msg: '{amount} SOL transferidos exitosamente al escrow.',
    escrow_error: 'Error de Escrow',
    server_unreachable: 'No se pudo contactar el servidor de firma',
    signing_failed: 'Firma fallida',
    completed_title: '¡Contrato Completado!',
    completed_msg: 'Escrow liberado y contrato completado exitosamente.',
  },

  negotiation: {
    start_prompt: '¿Identidades verificadas. ¿Listo para comenzar la negociación?',
    start_button: 'Iniciar Negociación',
    completed_title: '¡Contrato Completado Exitosamente!',
    completed_desc: 'El escrow fue liberado y el pago procesado.',
    new_contract: 'Iniciar Nuevo Contrato',
  },

  notifications: {
    dismiss: '✕',
  },
};
