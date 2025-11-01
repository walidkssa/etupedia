/**
 * Multilingual translations for Wikipedia reference section titles
 * Used to identify and extract reference sections across all 343 Wikipedia language editions
 *
 * All detected sections will be displayed under "References" in English on Etupedia
 * This ensures consistent UX while supporting content from any Wikipedia language
 */
export const REFERENCE_SECTION_TRANSLATIONS: Record<string, string[]> = {
  // English (default)
  "en": ["Notes", "References", "Citations", "Sources", "Sources used", "Bibliography", "Further reading", "External links", "See also"],

  // Major European languages
  "fr": ["Notes", "Références", "Citations", "Sources", "Bibliographie", "Lectures complémentaires", "Pour en savoir plus", "Liens externes", "Voir aussi", "Articles connexes"],
  "de": ["Anmerkungen", "Einzelnachweise", "Referenzen", "Literatur", "Quellen", "Weblinks", "Siehe auch", "Weiterführende Literatur"],
  "es": ["Notas", "Referencias", "Citas", "Fuentes", "Bibliografía", "Lectura adicional", "Enlaces externos", "Véase también"],
  "it": ["Note", "Riferimenti", "Citazioni", "Fonti", "Bibliografia", "Letture ulteriori", "Collegamenti esterni", "Vedi anche"],
  "pt": ["Notas", "Referências", "Citações", "Fontes", "Bibliografia", "Leitura adicional", "Ligações externas", "Ver também"],
  "ru": ["Примечания", "Сноски", "Ссылки", "Источники", "Литература", "Библиография", "Внешние ссылки", "См. также"],
  "nl": ["Noten", "Referenties", "Bronnen", "Literatuur", "Bibliografie", "Externe links", "Zie ook"],
  "pl": ["Przypisy", "Uwagi", "Bibliografia", "Źródła", "Linki zewnętrzne", "Zobacz też"],
  "sv": ["Noter", "Referenser", "Källor", "Litteratur", "Externa länkar", "Se även"],
  "cs": ["Poznámky", "Reference", "Literatura", "Externí odkazy", "Související články"],
  "hu": ["Jegyzetek", "Hivatkozások", "Források", "Irodalom", "Külső hivatkozások", "Lásd még"],
  "fi": ["Viitteet", "Lähteet", "Kirjallisuutta", "Aiheesta muualla", "Katso myös"],
  "da": ["Noter", "Referencer", "Kilder", "Litteratur", "Eksterne links", "Se også"],
  "no": ["Notater", "Referanser", "Kilder", "Litteratur", "Eksterne lenker", "Se også"],
  "ro": ["Note", "Referințe", "Bibliografie", "Legături externe", "Vezi și"],
  "el": ["Σημειώσεις", "Παραπομπές", "Βιβλιογραφία", "Εξωτερικοί σύνδεσμοι", "Δείτε επίσης"],
  "bg": ["Бележки", "Източници", "Литература", "Външни препратки", "Вижте също"],
  "hr": ["Bilješke", "Reference", "Literatura", "Vanjske poveznice", "Također pogledajte"],
  "sk": ["Poznámky", "Referencie", "Literatúra", "Externé odkazy", "Pozri aj"],
  "sr": ["Напомене", "Референце", "Литература", "Спољашње везе", "Такође погледајте"],
  "sl": ["Opombe", "Sklici", "Literatura", "Zunanje povezave", "Glej tudi"],
  "lt": ["Pastabos", "Šaltiniai", "Nuorodos", "Literatūra", "Taip pat skaitykite"],
  "lv": ["Piezīmes", "Atsauces", "Literatūra", "Ārējās saites", "Skatīt arī"],
  "et": ["Märkused", "Viited", "Kirjandus", "Välislingid", "Vaata ka"],

  // Asian languages
  "ja": ["注釈", "脚注", "出典", "参考文献", "関連項目", "外部リンク"],
  "zh": ["注释", "註釋", "参考文献", "參考文獻", "来源", "參考資料", "外部链接", "外部連結", "参见", "參見", "相关条目"],
  "ko": ["주석", "각주", "참고 문헌", "참고자료", "외부 링크", "같이 보기"],
  "ar": ["ملاحظات", "مراجع", "المراجع", "مصادر", "المصادر", "ببليوغرافيا", "وصلات خارجية", "انظر أيضا", "انظر أيضًا"],
  "th": ["หมายเหตุ", "อ้างอิง", "บรรณานุกรม", "แหล่งข้อมูลอื่น", "ดูเพิ่ม"],
  "vi": ["Chú thích", "Tham khảo", "Nguồn", "Thư mục", "Liên kết ngoài", "Xem thêm"],
  "id": ["Catatan", "Referensi", "Daftar pustaka", "Pranala luar", "Lihat pula"],
  "fa": ["یادداشت‌ها", "منابع", "پانویس", "کتابنامه", "پیوند به بیرون", "جستارهای وابسته"],
  "he": ["הערות", "הערות שוליים", "קישורים חיצוניים", "ראו גם", "ביבליוגרפיה"],
  "hi": ["टिप्पणी", "सन्दर्भ", "ग्रन्थसूची", "बाहरी कड़ियाँ", "इन्हें भी देखें"],
  "bn": ["টীকা", "তথ্যসূত্র", "গ্রন্থপঞ্জি", "বহিঃসংযোগ", "আরও দেখুন"],
  "ta": ["குறிப்புகள்", "மேற்கோள்கள்", "நூற்பட்டியல்", "வெளி இணைப்புகள்", "மேலும் காண்க"],
  "te": ["గమనికలు", "ఉల్లేఖనాలు", "గ్రంథ పట్టిక", "బయటి లింకులు", "ఇవి కూడా చూడండి"],
  "ml": ["കുറിപ്പുകൾ", "അവലംബം", "ഗ്രന്ഥസൂചി", "പുറത്തേയ്ക്കുള്ള കണ്ണികൾ", "ഇതും കാണുക"],
  "ur": ["نوٹ", "حوالہ جات", "کتابیات", "بیرونی روابط", "مزید دیکھیے"],

  // Regional European languages
  "ca": ["Notes", "Referències", "Bibliografia", "Enllaços externs", "Vegeu també"],
  "eu": ["Oharrak", "Erreferentziak", "Bibliografia", "Kanpo estekak", "Ikus ere"],
  "gl": ["Notas", "Referencias", "Bibliografía", "Ligazóns externas", "Véxase tamén"],
  "cy": ["Nodiadau", "Cyfeiriadau", "Llyfryddiaeth", "Dolenni allanol", "Gweler hefyd"],
  "af": ["Notas", "Verwysings", "Bibliografie", "Eksterne skakels", "Sien ook"],
  "ms": ["Nota", "Rujukan", "Bibliografi", "Pautan luar", "Lihat juga"],
  "sw": ["Maelezo", "Marejeo", "Viungo vya nje", "Tazama pia"],
  "tr": ["Notlar", "Kaynakça", "Dipnotlar", "Referanslar", "Dış bağlantılar", "Ayrıca bakınız"],
  "uk": ["Примітки", "Посилання", "Джерела", "Література", "Бібліографія", "Зовнішні посилання", "Див. також"],

  // Central/Eastern European
  "be": ["Заўвагі", "Спасылкі", "Крыніцы", "Літаратура", "Вонкавыя спасылкі", "Гл. таксама"],
  "bs": ["Bilješke", "Reference", "Literatura", "Vanjske poveznice", "Također pogledajte"],
  "mk": ["Белешки", "Наводи", "Литература", "Надворешни врски", "Поврзано"],

  // Nordic languages
  "is": ["Tilvísanir", "Heimildir", "Tenglar", "Sjá einnig"],
  "nn": ["Kjelder", "Referansar", "Litteratur", "Eksterne lenkjer", "Sjå òg"],

  // Others - use English as fallback for languages not explicitly listed
  "_default": ["Notes", "References", "Citations", "Sources", "Bibliography", "Further reading", "External links", "See also"]
};

/**
 * Get reference section titles for a specific language
 * @param languageCode - Wikipedia language code (e.g., 'en', 'fr', 'de')
 * @returns Array of section titles to search for
 */
export function getReferenceSectionTitles(languageCode: string): string[] {
  return REFERENCE_SECTION_TRANSLATIONS[languageCode] || REFERENCE_SECTION_TRANSLATIONS["_default"];
}
