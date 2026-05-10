// VoiceArbiter — Turkish translations
import type { Translations } from './en';

export const tr: Translations = {
  meta: {
    title: 'VoiceArbiter — Sesli AI Tahkim Platformu',
    description:
      'Sesli müzakere ile akıllı sözleşmeler oluşturun. ' +
      'Yapay zeka arabulucusu şartları otomatik belirler, Solana escrow sistemi güvenli ödeme sağlar.',
  },

  nav: {
    subtitle: 'Sesli AI Tahkim Platformu',
    network: 'Devnet',
    reset: 'Sıfırla',
  },

  welcome: {
    title: "VoiceArbiter'a Hoşgeldiniz",
    description:
      'Sesli müzakere ile akıllı sözleşmeler oluşturun. ' +
      'Yapay zeka arabulucusu şartları otomatik belirler, ' +
      'Solana escrow sistemi güvenli ödeme sağlar.',
    feature_voice: 'Sesli Müzakere',
    feature_ai: 'AI Arabulucu',
    feature_escrow: 'Escrow Güvencesi',
  },

  phases: {
    IDLE: 'Başlangıç',
    KAYIT: 'Kayıt',
    MUZAKERE: 'Müzakere',
    ONAY: 'Onay',
    ESCROW_FUNDED: 'Escrow',
    TAMAMLANDI: 'Tamamlandı',
  },

  wallet: {
    panel_title: 'Müşteri — Taraf A',
    address_label: 'Cüzdan Adresi',
    balance_label: 'SOL Bakiyesi',
    connect_button: 'Phantom Cüzdanı Bağla',
    connecting: 'Bağlanıyor...',
    disconnect: 'Bağlantıyı Kes',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    copy_notification_title: 'Kopyalandı',
    copy_notification_msg: 'Adres panoya kopyalandı.',
    connect_notification_title: 'Cüzdan Bağlandı',
    connect_notification_msg: 'adresi başarıyla bağlandı.',
    disconnect_notification_title: 'Cüzdan Bağlantısı Kesildi',
    disconnect_notification_msg: 'Phantom cüzdanı bağlantısı kesildi.',
    not_connected_description: 'Müzakereye başlamak için Phantom cüzdanınızı bağlayın.',
    devnet_notice: 'Yalnızca Devnet — gerçek para kullanılmaz',
  },

  freelancer: {
    panel_title: 'Freelancer — Taraf B',
    badge: 'Otomatik İmzalayıcı',
    public_key_label: 'Genel Anahtar (Solana)',
    network_label: 'Ağ',
    backend_signing_title: 'Arka Uç İmzalama',
    backend_signing_desc:
      'Freelancer imzası sunucu tarafında eklenir. ' +
      'Özel anahtar hiçbir zaman tarayıcıya gönderilmez.',
    keypair_error_title: 'Keypair Yüklenemedi',
    run_hint: 'Lütfen şu komutu çalıştırın:',
    retry: 'Yeniden Dene',
    loading_failed_title: 'Freelancer Bilgisi Yüklenemedi',
    loading_failed_msg: 'freelancer-keypair.json dosyasının mevcut olduğundan emin olun.',
  },

  trust: {
    panel_title: 'Güven Raporu',
    client_panel_title: 'Müşteri Güven Raporu',
    loading: 'Güven puanı hesaplanıyor...',
    load_failed: 'Rapor yüklenemedi',
    retry: 'Yeniden dene',
    no_wallet: 'Güven raporu için cüzdan bağlantısı gereklidir.',
    data_source_label: 'Kaynak',
    calculated_at: 'Hesaplandı',
    categories: {
      age: 'Yaş',
      activity: 'Aktivite',
      balance: 'Bakiye',
      provenance: 'Köken',
    },
    rating: {
      excellent: 'Mükemmel',
      good: 'İyi',
      medium: 'Orta',
      weak: 'Zayıf',
      insufficient: 'Yetersiz',
    },
    overall: {
      high: 'Yüksek Güven — Bu cüzdan güvenilir bir geçmişe sahiptir.',
      medium_high: 'Orta-Yüksek Güven — Kabul edilebilir düzeyde güven sağlanmaktadır.',
      medium: 'Orta Güven — Dikkatli ilerlenmesi tavsiye edilir.',
      low: 'Düşük Güven — Bu cüzdanla işlem yaparken ihtiyatlı olun.',
      very_low: 'Çok Düşük Güven — Bu cüzdan yeterli geçmişe sahip değil; yüksek risk.',
    },
    rationale: {
      age: {
        zero: 'Bu cüzdan çok yeni veya yaşı belirlenemiyor. Güven kaydı bulunmuyor.',
        days_1_6: 'Bu cüzdan yalnızca {days} günlüktür. Henüz güven geçmişi oluşmamıştır.',
        days_7_29: 'Bu cüzdan {days} günlüktür. Kısa sürede faaliyete geçmiş, sınırlı geçmişi vardır.',
        days_30_89: 'Bu cüzdan {days} günlüktür. Orta düzeyde güven sağlamaktadır.',
        days_90_364: 'Bu cüzdan {days} günlüktür. İyi düzeyde güven geçmişine sahiptir.',
        years: 'Bu cüzdan {years} yılı aşkın süredir aktiftir. Güçlü bir geçmişe sahiptir.',
      },
      activity: {
        zero: 'Bu cüzdanda hiç işlem tespit edilmedi. Geçmişi yok.',
        very_low: '{count} işlem tespit edildi. Çok az aktivite bulunuyor.',
        low: '{count} işlem tespit edildi. Düşük düzeyde aktivite bulunuyor.',
        medium: '{count} işlem tespit edildi. Orta düzeyde aktif bir kullanıcı profili.',
        high: '{count} işlem tespit edildi. Aktif kullanıcı profiline uygun.',
        very_high: '{count}+ işlem tespit edildi. Çok aktif ve köklü bir cüzdan.',
      },
      balance: {
        very_low: '{sol} SOL mevcut. Yetersiz bakiye; sözleşme değerini karşılamak için yetersiz.',
        low: '{sol} SOL mevcut. Düşük bakiye; küçük sözleşmeler için yeterli olabilir.',
        medium: '{sol} SOL mevcut. Orta düzeyde bakiye; standart sözleşmeler için yeterli.',
        high: '{sol} SOL mevcut. Sözleşme değerini karşılamak için yeterli.',
        very_high: '{sol} SOL mevcut. Güçlü bakiye; büyük sözleşmeler için uygundur.',
      },
      provenance: {
        unknown: 'İlk fon kaynağı tespit edilemedi. Köken belirsiz, orta düzey güven atandı.',
        exchange: 'İlk fon kaynağı tanınmış bir borsa adresidir. Güvenli köken.',
        individual: 'İlk fon kaynağı bireysel bir cüzdandır ({addr}). Köken doğrulanamadı.',
        suspicious: 'İlk fon kaynağı tanımsız veya şüpheli bir adrestir. Dikkatli olunması önerilir.',
      },
    },
  },

  voice: {
    panel_title_client: 'Müşteri — Ses Kaydı',
    panel_title_freelancer: 'Freelancer — Ses Kaydı',
    panel_title_party: '{party} — Ses Kaydı',
    language_label: 'Dil',
    languages: {
      tr: 'Türkçe',
      en: 'İngilizce',
      es: 'İspanyolca',
      pt: 'Portekizce',
      auto: 'Otomatik',
    },
    hold_to_record: 'Kayıt için basılı tutun',
    recording: 'Kaydediliyor... Bırakmak için parmağınızı kaldırın',
    transcribing: 'Transkripsiyon yapılıyor...',
    mic_error_title: 'Mikrofon Hatası',
    mic_error_msg: 'Ses kaydı için mikrofon izni gereklidir.',
    mic_denied: 'Mikrofon erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.',
    audio_too_short: 'Ses çok kısa veya boş. Lütfen en az 1 saniye konuşun.',
    transcription_error: 'Transkripsiyon hatası: {msg}',
    recorded_title: 'Ses Kaydedildi',
    recorded_msg: 'Transkripsiyon tamamlandı: "{preview}"',
    last_transcript: 'Son Transkript:',
    transcription_error_title: 'Transkripsiyon Hatası',
  },

  mediator: {
    panel_title: 'AI Mediator',
    analyzing: 'Analiz ediliyor...',
    analyze_button: 'Analiz Et',
    empty_state: 'Müzakere başladığında ses transkriptleri burada görünecek.',
    extracted_terms_title: 'Çıkarılan Sözleşme Şartları',
    confidence: 'Güven',
    missing_info_title: 'Eksik Bilgiler:',
    not_specified: 'Belirtilmedi',
    dash: '—',
    labels: {
      amount: 'Tutar',
      deadline: 'Son Tarih',
      scope: 'Kapsam',
      payment: 'Ödeme',
    },
    party_client: 'Müşteri',
    party_freelancer: 'Freelancer',
    terms_extracted_title: 'Şartlar Çıkarıldı',
    terms_extracted_msg: 'AI Mediator sözleşme şartlarını belirledi. Lütfen onaylayın.',
    analysis_error: 'Analiz başarısız',
  },

  escrow: {
    panel_title: 'Escrow Yönetimi',
    contract_summary_title: 'Sözleşme Özeti',
    amount_label: 'Tutar',
    deadline_label: 'Son Tarih',
    scope_label: 'Kapsam',
    payment_conditions_label: 'Ödeme Koşulları',
    no_terms_description:
      'Sözleşme şartları henüz belirlenmedi.\nMüzakere tamamlandığında burada görünecek.',
    tx_confirmed_title: 'İşlem Onaylandı',
    view_explorer: "Explorer'da Görüntüle",
    fund_button: "Escrow'u Fonla — {amount} SOL",
    funding: "Escrow Fonlanıyor...",
    release_button: "Escrow'u Serbest Bırak (Freelancer)",
    releasing: 'İşleniyor...',
    completed_label: 'Sözleşme Tamamlandı!',
    missing_info_notification_title: 'Eksik Bilgi',
    missing_info_notification_msg: 'Escrow fonlamak için tüm bilgiler gereklidir.',
    invalid_amount_title: 'Geçersiz Tutar',
    invalid_amount_msg: 'Sözleşme tutarı belirtilmemiş veya geçersiz.',
    funded_title: 'Escrow Fonlandı!',
    funded_msg: "{amount} SOL başarıyla escrow'a aktarıldı.",
    escrow_error: 'Escrow Hatası',
    server_unreachable: 'İmzalama sunucusuna ulaşılamadı',
    signing_failed: 'İmzalama başarısız',
    completed_title: 'Sözleşme Tamamlandı!',
    completed_msg: 'Escrow serbest bırakıldı ve sözleşme başarıyla tamamlandı.',
  },

  negotiation: {
    start_prompt: 'Kimlikler doğrulandı. Müzakereye başlamaya hazır mısınız?',
    start_button: 'Müzakereyi Başlat',
    completed_title: 'Sözleşme Başarıyla Tamamlandı!',
    completed_desc: 'Escrow serbest bırakıldı ve ödeme gerçekleştirildi.',
    new_contract: 'Yeni Sözleşme Başlat',
  },

  notifications: {
    dismiss: '✕',
  },
};
