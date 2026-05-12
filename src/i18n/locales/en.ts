// VoiceArbiter — English translations
export const en = {
  meta: {
    title: 'VoiceArbiter — Voice-Mediated AI Arbitration Platform',
    description:
      'Create smart contracts through voice negotiation. ' +
      'AI mediator automatically determines terms, Solana escrow ensures secure payment.',
  },

  // ─── Navigation / Header ──────────────────────────────────────────────────
  nav: {
    subtitle: 'Voice AI Arbitration Platform',
    network: 'Devnet',
    reset: 'Reset',
  },

  // ─── Welcome screen ──────────────────────────────────────────────────────
  welcome: {
    title: 'Welcome to VoiceArbiter',
    description:
      'Create smart contracts through voice negotiation. ' +
      'The AI mediator automatically determines terms, ' +
      'and the Solana escrow system ensures secure payment.',
    feature_voice: 'Voice Negotiation',
    feature_ai: 'AI Mediator',
    feature_escrow: 'Escrow Security',
  },

  // ─── Contract phases ─────────────────────────────────────────────────────
  phases: {
    IDLE: 'Idle',
    KAYIT: 'Registration',
    MUZAKERE: 'Negotiating',
    ONAY: 'Confirmation',
    ESCROW_FUNDED: 'Escrow',
    TAMAMLANDI: 'Completed',
  },

  // ─── Wallet connection (Client) ───────────────────────────────────────────
  wallet: {
    panel_title: 'Client — Party A',
    address_label: 'Wallet Address',
    balance_label: 'SOL Balance',
    connect_button: 'Connect Phantom Wallet',
    connecting: 'Connecting...',
    disconnect: 'Disconnect',
    copy: 'Copy',
    copied: 'Copied',
    copy_notification_title: 'Copied',
    copy_notification_msg: 'Address copied to clipboard.',
    connect_notification_title: 'Wallet Connected',
    connect_notification_msg: 'address successfully connected.',
    disconnect_notification_title: 'Wallet Disconnected',
    disconnect_notification_msg: 'Phantom wallet disconnected.',
    not_connected_description: 'Connect your Phantom wallet to start negotiating.',
    devnet_notice: 'Devnet only — no real funds used',
  },

  // ─── Freelancer identity panel ────────────────────────────────────────────
  freelancer: {
    panel_title: 'Freelancer — Party B',
    badge: 'Auto-Signer',
    public_key_label: 'Public Key (Solana)',
    network_label: 'Network',
    backend_signing_title: 'Backend Signing',
    backend_signing_desc:
      'Freelancer signature is added server-side. ' +
      'The private key is never sent to the browser.',
    keypair_error_title: 'Keypair Failed to Load',
    run_hint: 'Please run:',
    retry: 'Retry',
    loading_failed_title: 'Freelancer Info Failed to Load',
    loading_failed_msg: 'Make sure the freelancer-keypair.json file exists.',
  },

  // ─── Trust score report ───────────────────────────────────────────────────
  trust: {
    panel_title: 'Trust Report',
    client_panel_title: 'Client Trust Report',
    loading: 'Calculating trust score...',
    load_failed: 'Report failed to load',
    retry: 'Retry',
    no_wallet: 'A wallet connection is required for the trust report.',
    data_source_label: 'Source',
    calculated_at: 'Calculated at',
    categories: {
      age: 'Age',
      activity: 'Activity',
      balance: 'Balance',
      provenance: 'Provenance',
    },
    rating: {
      excellent: 'Excellent',
      good: 'Good',
      medium: 'Medium',
      weak: 'Weak',
      insufficient: 'Insufficient',
    },
    overall: {
      high: 'High Trust — This wallet has a reliable history.',
      medium_high: 'Medium-High Trust — Acceptable level of trust.',
      medium: 'Medium Trust — Proceed with caution.',
      low: 'Low Trust — Be careful when transacting with this wallet.',
      very_low: 'Very Low Trust — Insufficient history; high risk.',
    },
    rationale: {
      age: {
        zero: 'This wallet is very new or its age cannot be determined. No trust history.',
        days_1_6: 'This wallet is only {days} day(s) old. No trust history established yet.',
        days_7_29: 'This wallet is {days} days old. Short history, limited trust.',
        days_30_89: 'This wallet is {days} days old. Moderate level of trust established.',
        days_90_364: 'This wallet is {days} days old. Good trust history.',
        years: 'This wallet has been active for over {years} year(s). Strong history.',
      },
      activity: {
        zero: 'No transactions detected on this wallet. No history.',
        very_low: '{count} transaction(s) detected. Very low activity.',
        low: '{count} transactions detected. Low activity level.',
        medium: '{count} transactions detected. Medium activity — suitable profile.',
        high: '{count} transactions detected. Matches an active user profile.',
        very_high: '{count}+ transactions detected. Highly active and established wallet.',
      },
      balance: {
        very_low: '{sol} SOL available. Insufficient balance for contract value.',
        low: '{sol} SOL available. Low balance; may be sufficient for small contracts.',
        medium: '{sol} SOL available. Sufficient balance for standard contracts.',
        high: '{sol} SOL available. Sufficient to cover contract value.',
        very_high: '{sol} SOL available. Strong balance; suitable for large contracts.',
      },
      provenance: {
        unknown: 'First funding source could not be identified. Origin is unclear; medium trust assigned.',
        exchange: 'First funding source is a known exchange address. Trusted origin.',
        individual: 'First funding source is an individual wallet ({addr}). Origin could not be verified.',
        suspicious: 'First funding source is unrecognized or suspicious. Caution recommended.',
      },
    },
  },

  // ─── Voice recording ──────────────────────────────────────────────────────
  voice: {
    panel_title_client: 'Client — Voice Recording',
    panel_title_freelancer: 'Freelancer — Voice Recording',
    panel_title_party: '{party} — Voice Recording',
    language_label: 'Language',
    languages: {
      tr: 'Turkish',
      en: 'English',
      es: 'Spanish',
      pt: 'Portuguese',
      auto: 'Auto',
    },
    hold_to_record: 'Hold to record',
    recording: 'Recording... Release to send',
    transcribing: 'Transcribing...',
    mic_error_title: 'Microphone Error',
    mic_error_msg: 'Microphone access is required for voice recording.',
    mic_denied: 'Microphone access denied. Please check your browser permissions.',
    audio_too_short: 'Recording is too short or empty. Please speak for at least 1 second.',
    transcription_error: 'Transcription error: {msg}',
    recorded_title: 'Voice Recorded',
    recorded_msg: 'Transcription complete: "{preview}"',
    last_transcript: 'Last Transcript:',
    transcription_error_title: 'Transcription Error',
  },

  // ─── AI Mediator ──────────────────────────────────────────────────────────
  mediator: {
    panel_title: 'AI Mediator',
    analyzing: 'Analyzing...',
    analyze_button: 'Analyze',
    empty_state: 'Voice transcripts will appear here when negotiation begins.',
    extracted_terms_title: 'Extracted Contract Terms',
    confidence: 'Confidence',
    missing_info_title: 'Missing Information:',
    not_specified: 'Not specified',
    dash: '—',
    labels: {
      amount: 'Amount',
      deadline: 'Deadline',
      scope: 'Scope',
      payment: 'Payment',
    },
    party_client: 'Client',
    party_freelancer: 'Freelancer',
    terms_extracted_title: 'Terms Extracted',
    terms_extracted_msg: 'AI Mediator has determined contract terms. Please confirm.',
    analysis_error: 'Analysis failed',
  },

  // ─── Escrow management ────────────────────────────────────────────────────
  escrow: {
    panel_title: 'Escrow Management',
    contract_summary_title: 'Contract Summary',
    amount_label: 'Amount',
    deadline_label: 'Deadline',
    scope_label: 'Scope',
    payment_conditions_label: 'Payment Terms',
    no_terms_description:
      'Contract terms have not been determined yet.\nThey will appear here when negotiation is complete.',
    tx_confirmed_title: 'Transaction Confirmed',
    view_explorer: 'View on Explorer',
    fund_button: "Fund Escrow — {amount} SOL",
    funding: 'Funding Escrow...',
    release_button: "Release Escrow (Freelancer)",
    releasing: 'Processing...',
    completed_label: 'Contract Completed!',
    missing_info_notification_title: 'Missing Information',
    missing_info_notification_msg: 'All information is required to fund escrow.',
    invalid_amount_title: 'Invalid Amount',
    invalid_amount_msg: 'Contract amount is not specified or invalid.',
    funded_title: 'Escrow Funded!',
    funded_msg: '{amount} SOL successfully transferred to escrow.',
    escrow_error: 'Escrow Error',
    server_unreachable: 'Signing server could not be reached',
    signing_failed: 'Signing failed',
    completed_title: 'Contract Completed!',
    completed_msg: 'Escrow released and contract successfully completed.',
  },

  // ─── Negotiation interface ────────────────────────────────────────────────
  negotiation: {
    start_prompt: 'Identities verified. Ready to start negotiation?',
    start_button: 'Start Negotiation',
    completed_title: 'Contract Successfully Completed!',
    completed_desc: 'Escrow was released and payment was processed.',
    new_contract: 'Start New Contract',
  },

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: {
    dismiss: '✕',
  },
} as const;

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
    ? DeepStringify<T[K]>
    : T[K];
};

export type Translations = DeepStringify<typeof en>;
