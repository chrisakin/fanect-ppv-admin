export enum StreamingDeviceType {
  MOBILE = 'Mobile',
  NOTMOBILE = 'Not Mobile',
}

export enum Currency {
    USD = 'USD',
    NGN = 'NGN',
    EUR = 'EUR',
    GBP = 'GBP',
    CAD = 'CAD',
    AUD = "AUD", // Australian Dollar
    JPY = "JPY", // Japanese Yen
    CNY = "CNY", // Chinese Yuan
    INR = "INR", // Indian Rupee
    BRL = "BRL", // Brazilian Real
    MXN = "MXN", // Mexican Peso
    RUB = "RUB", // Russian Ruble
    KRW = "KRW", // South Korean Won
    TRY = "TRY", // Turkish Lira
    ARS = "ARS", // Argentine Peso
    CLP = "CLP", // Chilean Peso
    COP = "COP", // Colombian Peso
    PEN = "PEN", // Peruvian Sol
    PHP = "PHP", // Philippine Peso 
    MYR = "MYR", // Malaysian Ringgit
    SGD = "SGD", // Singapore Dollar
    IDR = "IDR", // Indonesian Rupiah
    THB = "THB", // Thai Baht
    VND = "VND", // Vietnamese Dong
    AED = "AED", // United Arab Emirates Dirham
    SAR = "SAR", // Saudi Riyal
    QAR = "QAR", // Qatari Riyal
    KWD = "KWD", // Kuwaiti Dinar
    OMR = "OMR", // Omani Rial
    BHD = "BHD", // Bahraini Dinar
    JOD = "JOD", // Jordanian Dinar
    LBP = "LBP", // Lebanese Pound 
    ILS = "ILS", // Israeli New Shekel
    PKR = "PKR", // Pakistani Rupee
    BDT = "BDT", // Bangladeshi Taka
    LKR = "LKR", // Sri Lankan Rupee
    MUR = "MUR", // Mauritian Rupee
    TND = "TND", // Tunisian Dinar
    DZD = "DZD", // Algerian Dinar
  ZAR = "ZAR", // South African Rand
  GHS = "GHS", // Ghanaian Cedi
  KES = "KES", // Kenyan Shilling
  UGX = "UGX", // Ugandan Shilling
  TZS = "TZS", // Tanzanian Shilling
  RWF = "RWF", // Rwandan Franc
  ZMW = "ZMW", // Zambian Kwacha
  XOF = "XOF", // West African CFA Franc
  XAF = "XAF", // Central African CFA Franc
  EGP = "EGP", // Egyptian Pound
  MAD = "MAD", // Moroccan Dirham
  ETB = "ETB", // Ethiopian Birr
  MWK = "MWK", // Malawian Kwacha
  SLL = "SLL", // Sierra Leonean Leone
  LRD = "LRD", // Liberian Dollar
  CVE = "CVE", // Cape Verdean Escudo
  GMD = "GMD", // Gambian Dalasi
  GNF = "GNF", // Guinean Franc
  MRU = "MRU", // Mauritanian Ouguiya
  STN = "STN",
  NONE = "NONE",
}

export interface IPrice {
  currency: Currency;
  amount: number;
  _id?: string;
}