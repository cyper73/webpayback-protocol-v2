export interface Translation {
  // Navigation
  webpaybackProtocol: string;
  level280Agents: string;
  syncing: string;
  tokenLive: string;
  
  // Creator Portal
  creatorRegistration: string;
  websiteUrl: string;
  websiteUrlPlaceholder: string;
  contentCategory: string;
  selectCategory: string;
  walletAddress: string;
  walletPlaceholder: string;
  agreeToTerms: string;
  registerForWebpayback: string;
  
  // Recent Rewards
  recentCreatorRewards: string;
  creator: string;
  status: string;
  completed: string;
  pending: string;
  totalRewardsToday: string;
  
  // AI Agents
  multiAgentOrchestration: string;
  live: string;
  
  // Categories
  technology: string;
  finance: string;
  entertainment: string;
  education: string;
  news: string;
  
  // Status
  active: string;
  inactive: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
}

export const translations: Record<string, Translation> = {
  en: {
    webpaybackProtocol: "WebPayback Protocol",
    level280Agents: "Level 280 AI Agents Active",
    syncing: "Syncing...",
    tokenLive: "WPT Token Live",
    
    creatorRegistration: "Creator Registration Portal",
    websiteUrl: "Website URL",
    websiteUrlPlaceholder: "https://your-website.com",
    contentCategory: "Content Category",
    selectCategory: "Select category",
    walletAddress: "Wallet Address",
    walletPlaceholder: "0x...",
    agreeToTerms: "I agree to the WebPayback Protocol Terms",
    registerForWebpayback: "Register for WebPayback",
    
    recentCreatorRewards: "Recent Creator Rewards",
    creator: "Creator",
    status: "Status",
    completed: "completed",
    pending: "pending",
    totalRewardsToday: "Total Rewards Today",
    
    multiAgentOrchestration: "Multi-Agent Orchestration Command Center",
    live: "Live",
    
    technology: "Technology",
    finance: "Finance", 
    entertainment: "Entertainment",
    education: "Education",
    news: "News",
    
    active: "Active",
    inactive: "Inactive",
    
    loading: "Loading...",
    error: "Error",
    success: "Success"
  },
  
  it: {
    webpaybackProtocol: "Protocollo WebPayback",
    level280Agents: "Agenti IA Livello 280 Attivi",
    syncing: "Sincronizzazione...",
    tokenLive: "Token WPT Live",
    
    creatorRegistration: "Portale di Registrazione Creatori",
    websiteUrl: "URL del Sito Web",
    websiteUrlPlaceholder: "https://tuo-sito.com",
    contentCategory: "Categoria Contenuti",
    selectCategory: "Seleziona categoria",
    walletAddress: "Indirizzo Wallet",
    walletPlaceholder: "0x...",
    agreeToTerms: "Accetto i Termini del Protocollo WebPayback",
    registerForWebpayback: "Registrati per WebPayback",
    
    recentCreatorRewards: "Ricompense Recenti per Creatori",
    creator: "Creatore",
    status: "Stato",
    completed: "completato",
    pending: "in sospeso",
    totalRewardsToday: "Ricompense Totali Oggi",
    
    multiAgentOrchestration: "Centro di Comando Orchestrazione Multi-Agente",
    live: "Live",
    
    technology: "Tecnologia",
    finance: "Finanza",
    entertainment: "Intrattenimento", 
    education: "Educazione",
    news: "Notizie",
    
    active: "Attivo",
    inactive: "Inattivo",
    
    loading: "Caricamento...",
    error: "Errore",
    success: "Successo",
    
    antiFraudSystem: "Sistema Anti-Frode",
    fraudAlerts: "Allerte Frode",
    networkSwitcher: "Cambia Rete"
  },
  
  es: {
    webpaybackProtocol: "Protocolo WebPayback",
    level280Agents: "Agentes IA Nivel 280 Activos",
    syncing: "Sincronizando...",
    tokenLive: "Token WPT En Vivo",
    
    creatorRegistration: "Portal de Registro de Creadores",
    websiteUrl: "URL del Sitio Web",
    websiteUrlPlaceholder: "https://tu-sitio.com",
    contentCategory: "Categoría de Contenido",
    selectCategory: "Seleccionar categoría",
    walletAddress: "Dirección de Wallet",
    walletPlaceholder: "0x...",
    agreeToTerms: "Acepto los Términos del Protocolo WebPayback",
    registerForWebpayback: "Registrarse para WebPayback",
    
    recentCreatorRewards: "Recompensas Recientes de Creadores",
    creator: "Creador",
    status: "Estado",
    completed: "completado",
    pending: "pendiente",
    totalRewardsToday: "Recompensas Totales Hoy",
    
    multiAgentOrchestration: "Centro de Comando de Orquestación Multi-Agente",
    live: "En Vivo",
    
    technology: "Tecnología",
    finance: "Finanzas",
    entertainment: "Entretenimiento",
    education: "Educación", 
    news: "Noticias",
    
    active: "Activo",
    inactive: "Inactivo",
    
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    
    antiFraudSystem: "Sistema Anti-Fraude",
    fraudAlerts: "Alertas de Fraude",
    networkSwitcher: "Cambio de Red"
  },
  
  fr: {
    webpaybackProtocol: "Protocole WebPayback",
    level280Agents: "Agents IA Niveau 280 Actifs",
    syncing: "Synchronisation...",
    tokenLive: "Token WPT En Direct",
    
    creatorRegistration: "Portail d'Enregistrement des Créateurs",
    websiteUrl: "URL du Site Web",
    websiteUrlPlaceholder: "https://votre-site.com",
    contentCategory: "Catégorie de Contenu",
    selectCategory: "Sélectionner une catégorie",
    walletAddress: "Adresse du Portefeuille",
    walletPlaceholder: "0x...",
    agreeToTerms: "J'accepte les Termes du Protocole WebPayback",
    registerForWebpayback: "S'inscrire pour WebPayback",
    
    recentCreatorRewards: "Récompenses Récentes des Créateurs",
    creator: "Créateur",
    status: "Statut",
    completed: "terminé",
    pending: "en attente",
    totalRewardsToday: "Récompenses Totales Aujourd'hui",
    
    multiAgentOrchestration: "Centre de Commande d'Orchestration Multi-Agent",
    live: "En Direct",
    
    technology: "Technologie",
    finance: "Finance",
    entertainment: "Divertissement",
    education: "Éducation",
    news: "Actualités",
    
    active: "Actif",
    inactive: "Inactif",
    
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    
    antiFraudSystem: "Système Anti-Fraude",
    fraudAlerts: "Alertes de Fraude",
    networkSwitcher: "Changeur de Réseau"
  },
  
  de: {
    webpaybackProtocol: "WebPayback-Protokoll",
    level280Agents: "Level 280 KI-Agenten Aktiv",
    syncing: "Synchronisierung...",
    tokenLive: "WPT Token Live",
    
    creatorRegistration: "Creator-Registrierungsportal",
    websiteUrl: "Website-URL",
    websiteUrlPlaceholder: "https://ihre-website.com",
    contentCategory: "Inhaltskategorie",
    selectCategory: "Kategorie auswählen",
    walletAddress: "Wallet-Adresse",
    walletPlaceholder: "0x...",
    agreeToTerms: "Ich stimme den WebPayback-Protokoll-Bedingungen zu",
    registerForWebpayback: "Für WebPayback registrieren",
    
    recentCreatorRewards: "Aktuelle Creator-Belohnungen",
    creator: "Creator",
    status: "Status",
    completed: "abgeschlossen",
    pending: "ausstehend",
    totalRewardsToday: "Gesamtbelohnungen Heute",
    
    multiAgentOrchestration: "Multi-Agent-Orchestrierung Kommandozentrale",
    live: "Live",
    
    technology: "Technologie",
    finance: "Finanzen",
    entertainment: "Unterhaltung",
    education: "Bildung",
    news: "Nachrichten",
    
    active: "Aktiv",
    inactive: "Inaktiv",
    
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    
    antiFraudSystem: "Anti-Betrugssystem",
    fraudAlerts: "Betrugsalarme",
    networkSwitcher: "Netzwerk-Umschalter"
  },
  
  pt: {
    webpaybackProtocol: "Protocolo WebPayback",
    level280Agents: "Agentes IA Nível 280 Ativos",
    syncing: "Sincronizando...",
    tokenLive: "Token WPT Ao Vivo",
    
    creatorRegistration: "Portal de Registro de Criadores",
    websiteUrl: "URL do Site",
    websiteUrlPlaceholder: "https://seu-site.com",
    contentCategory: "Categoria de Conteúdo",
    selectCategory: "Selecionar categoria",
    walletAddress: "Endereço da Carteira",
    walletPlaceholder: "0x...",
    agreeToTerms: "Concordo com os Termos do Protocolo WebPayback",
    registerForWebpayback: "Registrar para WebPayback",
    
    recentCreatorRewards: "Recompensas Recentes de Criadores",
    creator: "Criador",
    status: "Status",
    completed: "concluído",
    pending: "pendente",
    totalRewardsToday: "Recompensas Totais Hoje",
    
    multiAgentOrchestration: "Centro de Comando de Orquestração Multi-Agente",
    live: "Ao Vivo",
    
    technology: "Tecnologia",
    finance: "Finanças",
    entertainment: "Entretenimento",
    education: "Educação",
    news: "Notícias",
    
    active: "Ativo",
    inactive: "Inativo",
    
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    
    antiFraudSystem: "Sistema Anti-Fraude",
    fraudAlerts: "Alertas de Fraude",
    networkSwitcher: "Alternador de Rede"
  },
  
  ru: {
    webpaybackProtocol: "Протокол WebPayback",
    level280Agents: "ИИ-Агенты Уровня 280 Активны",
    syncing: "Синхронизация...",
    tokenLive: "Токен WPT Онлайн",
    
    creatorRegistration: "Портал Регистрации Создателей",
    websiteUrl: "URL Сайта",
    websiteUrlPlaceholder: "https://ваш-сайт.com",
    contentCategory: "Категория Контента",
    selectCategory: "Выберите категорию",
    walletAddress: "Адрес Кошелька",
    walletPlaceholder: "0x...",
    agreeToTerms: "Я согласен с Условиями Протокола WebPayback",
    registerForWebpayback: "Зарегистрироваться для WebPayback",
    
    recentCreatorRewards: "Недавние Награды Создателей",
    creator: "Создатель",
    status: "Статус",
    completed: "завершено",
    pending: "в ожидании",
    totalRewardsToday: "Общие Награды Сегодня",
    
    multiAgentOrchestration: "Командный Центр Мульти-Агентной Оркестрации",
    live: "Онлайн",
    
    technology: "Технологии",
    finance: "Финансы",
    entertainment: "Развлечения",
    education: "Образование",
    news: "Новости",
    
    active: "Активный",
    inactive: "Неактивный",
    
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успех",
    
    antiFraudSystem: "Система против мошенничества",
    fraudAlerts: "Предупреждения о мошенничестве",
    networkSwitcher: "Переключатель сети"
  },
  
  zh: {
    webpaybackProtocol: "WebPayback 协议",
    level280Agents: "280级AI代理活跃",
    syncing: "同步中...",
    tokenLive: "WPT代币实时",
    
    creatorRegistration: "创作者注册门户",
    websiteUrl: "网站URL",
    websiteUrlPlaceholder: "https://您的网站.com",
    contentCategory: "内容类别",
    selectCategory: "选择类别",
    walletAddress: "钱包地址",
    walletPlaceholder: "0x...",
    agreeToTerms: "我同意WebPayback协议条款",
    registerForWebpayback: "注册WebPayback",
    
    recentCreatorRewards: "最近创作者奖励",
    creator: "创作者",
    status: "状态",
    completed: "已完成",
    pending: "待处理",
    totalRewardsToday: "今日总奖励",
    
    multiAgentOrchestration: "多代理编排指挥中心",
    live: "实时",
    
    technology: "技术",
    finance: "金融",
    entertainment: "娱乐",
    education: "教育",
    news: "新闻",
    
    active: "活跃",
    inactive: "非活跃",
    
    loading: "加载中...",
    error: "错误",
    success: "成功",
    
    antiFraudSystem: "防欺诈系统",
    fraudAlerts: "欺诈警报",
    networkSwitcher: "网络切换器"
  }
};

export function getTranslation(language: string): Translation {
  return translations[language] || translations.en;
}