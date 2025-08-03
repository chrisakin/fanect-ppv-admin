export const countryToCurrency: Record<string, string> = {
  // Nigerian Naira
  NG: 'NGN',

  // US Dollar
  US: 'USD',
  GU: 'USD', // Guam
  AS: 'USD', // American Samoa
  MP: 'USD', // Northern Mariana Islands
  UM: 'USD', // U.S. Minor Outlying Islands
  VI: 'USD', // U.S. Virgin Islands
  PR: 'USD', // Puerto Rico
  FM: 'USD', // Micronesia
  PW: 'USD', // Palau
  MH: 'USD', // Marshall Islands
  EC: 'USD', // Ecuador
  SV: 'USD', // El Salvador
  TL: 'USD', // Timor-Leste
  ZW: 'USD', // Zimbabwe (multi-currency)
  PA: 'USD', // Panama

  // Canadian Dollar
  CA: 'CAD',

  // Euro
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', PT: 'EUR',
  IE: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR', CY: 'EUR',
  EE: 'EUR', LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', SI: 'EUR',
  SK: 'EUR', ME: 'EUR', XK: 'EUR', AD: 'EUR', MC: 'EUR', SM: 'EUR',
  VA: 'EUR',

  // British Pound
  GB: 'GBP', GG: 'GBP', IM: 'GBP', JE: 'GBP',

  // Australian Dollar
  AU: 'AUD', CX: 'AUD', CC: 'AUD', NF: 'AUD',

  // Japanese Yen
  JP: 'JPY',

  // Chinese Yuan
  CN: 'CNY',

  // Indian Rupee
  IN: 'INR',

  // Brazilian Real
  BR: 'BRL',

  // Mexican Peso
  MX: 'MXN',

  // Russian Ruble
  RU: 'RUB',

  // South Korean Won
  KR: 'KRW',

  // Turkish Lira
  TR: 'TRY',

  // Argentine Peso
  AR: 'ARS',

  // Chilean Peso
  CL: 'CLP',

  // Colombian Peso
  CO: 'COP',

  // Peruvian Sol
  PE: 'PEN',

  // Philippine Peso
  PH: 'PHP',

  // Malaysian Ringgit
  MY: 'MYR',

  // Singapore Dollar
  SG: 'SGD',

  // Indonesian Rupiah
  ID: 'IDR',

  // Thai Baht
  TH: 'THB',

  // Vietnamese Dong
  VN: 'VND',

  // UAE Dirham
  AE: 'AED',

  // Saudi Riyal
  SA: 'SAR',

  // Qatari Riyal
  QA: 'QAR',

  // Kuwaiti Dinar
  KW: 'KWD',

  // Omani Rial
  OM: 'OMR',

  // Bahraini Dinar
  BH: 'BHD',

  // Jordanian Dinar
  JO: 'JOD',

  // Lebanese Pound
  LB: 'LBP',

  // Israeli New Shekel
  IL: 'ILS',

  // Pakistani Rupee
  PK: 'PKR',

  // Bangladeshi Taka
  BD: 'BDT',

  // Sri Lankan Rupee
  LK: 'LKR',

  // Mauritian Rupee
  MU: 'MUR',

  // Tunisian Dinar
  TN: 'TND',

  // Algerian Dinar
  DZ: 'DZD',

  // South African Rand
  ZA: 'ZAR',

  // Ghanaian Cedi
  GH: 'GHS',

  // Kenyan Shilling
  KE: 'KES',

  // Ugandan Shilling
  UG: 'UGX',

  // Tanzanian Shilling
  TZ: 'TZS',

  // Rwandan Franc
  RW: 'RWF',

  // Zambian Kwacha
  ZM: 'ZMW',

  // West African CFA Franc
  BJ: 'XOF', BF: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF', NE: 'XOF', SN: 'XOF', TG: 'XOF',

  // Central African CFA Franc
  CM: 'XAF', CF: 'XAF', TD: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',

  // Egyptian Pound
  EG: 'EGP',

  // Moroccan Dirham
  MA: 'MAD',

  // Ethiopian Birr
  ET: 'ETB',

  // Malawian Kwacha
  MW: 'MWK',

  // Sierra Leonean Leone
  SL: 'SLL',

  // Liberian Dollar
  LR: 'LRD',

  // Cape Verdean Escudo
  CV: 'CVE',

  // Gambian Dalasi
  GM: 'GMD',

  // Guinean Franc
  GN: 'GNF',

  // Mauritanian Ouguiya
  MR: 'MRU',

  // São Tomé and Príncipe Dobra
  ST: 'STN',
};

// Get unique currencies from the mapping
export const availableCurrencies = Array.from(new Set(Object.values(countryToCurrency))).sort();

// Currency display names
export const currencyNames: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  NGN: 'Nigerian Naira',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  RUB: 'Russian Ruble',
  KRW: 'South Korean Won',
  TRY: 'Turkish Lira',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  PHP: 'Philippine Peso',
  MYR: 'Malaysian Ringgit',
  SGD: 'Singapore Dollar',
  IDR: 'Indonesian Rupiah',
  THB: 'Thai Baht',
  VND: 'Vietnamese Dong',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar',
  OMR: 'Omani Rial',
  BHD: 'Bahraini Dinar',
  JOD: 'Jordanian Dinar',
  LBP: 'Lebanese Pound',
  ILS: 'Israeli New Shekel',
  PKR: 'Pakistani Rupee',
  BDT: 'Bangladeshi Taka',
  LKR: 'Sri Lankan Rupee',
  MUR: 'Mauritian Rupee',
  TND: 'Tunisian Dinar',
  DZD: 'Algerian Dinar',
  ZAR: 'South African Rand',
  GHS: 'Ghanaian Cedi',
  KES: 'Kenyan Shilling',
  UGX: 'Ugandan Shilling',
  TZS: 'Tanzanian Shilling',
  RWF: 'Rwandan Franc',
  ZMW: 'Zambian Kwacha',
  XOF: 'West African CFA Franc',
  XAF: 'Central African CFA Franc',
  EGP: 'Egyptian Pound',
  MAD: 'Moroccan Dirham',
  ETB: 'Ethiopian Birr',
  MWK: 'Malawian Kwacha',
  SLL: 'Sierra Leonean Leone',
  LRD: 'Liberian Dollar',
  CVE: 'Cape Verdean Escudo',
  GMD: 'Gambian Dalasi',
  GNF: 'Guinean Franc',
  MRU: 'Mauritanian Ouguiya',
  STN: 'São Tomé and Príncipe Dobra',
};