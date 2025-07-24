export enum Currency {
  NONE = "NONE",
  USD = "USD",
  NGN = "NGN",
  EUR = "EUR",
  GBP = "GBP",
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
  STN = "STN", // São Tomé and Príncipe Dobra
}

export interface IPrice {
  currency: Currency;
  amount: number;
  _id?: string;
}