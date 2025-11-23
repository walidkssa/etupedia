"use client";

import { BottomSheet } from "@/components/bottom-sheet";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  coverImage?: string;
}

// Top 20 most spoken languages first
const POPULAR_LANGUAGES = [
  { code: "en", label: "T", name: "English" },
  { code: "zh", label: "字", name: "中文" },
  { code: "hi", label: "अ", name: "हिन्दी" },
  { code: "es", label: "E", name: "Español" },
  { code: "fr", label: "F", name: "Français" },
  { code: "ar", label: "ع", name: "العربية" },
  { code: "bn", label: "অ", name: "বাংলা" },
  { code: "pt", label: "P", name: "Português" },
  { code: "ru", label: "Р", name: "Русский" },
  { code: "ja", label: "あ", name: "日本語" },
  { code: "de", label: "D", name: "Deutsch" },
  { code: "ko", label: "가", name: "한국어" },
  { code: "tr", label: "T", name: "Türkçe" },
  { code: "it", label: "I", name: "Italiano" },
  { code: "th", label: "ก", name: "ไทย" },
  { code: "vi", label: "V", name: "Tiếng Việt" },
  { code: "pl", label: "P", name: "Polski" },
  { code: "uk", label: "У", name: "Українська" },
  { code: "nl", label: "N", name: "Nederlands" },
  { code: "id", label: "I", name: "Indonesia" },
];

// All other Wikipedia languages (sorted alphabetically)
const OTHER_LANGUAGES = [
  { code: "af", label: "A", name: "Afrikaans" },
  { code: "als", label: "A", name: "Alemannisch" },
  { code: "am", label: "አ", name: "አማርኛ" },
  { code: "an", label: "A", name: "Aragonés" },
  { code: "ang", label: "Æ", name: "Ænglisc" },
  { code: "as", label: "অ", name: "অসমীয়া" },
  { code: "ast", label: "A", name: "Asturianu" },
  { code: "av", label: "А", name: "Авар" },
  { code: "ay", label: "A", name: "Aymar" },
  { code: "az", label: "A", name: "Azərbaycanca" },
  { code: "azb", label: "آ", name: "تۆرکجه" },
  { code: "ba", label: "Б", name: "Башҡортса" },
  { code: "bar", label: "B", name: "Boarisch" },
  { code: "be", label: "Б", name: "Беларуская" },
  { code: "bg", label: "Б", name: "Български" },
  { code: "bh", label: "भ", name: "भोजपुरी" },
  { code: "bo", label: "བ", name: "བོད་ཡིག" },
  { code: "br", label: "B", name: "Brezhoneg" },
  { code: "bs", label: "B", name: "Bosanski" },
  { code: "ca", label: "C", name: "Català" },
  { code: "ce", label: "Н", name: "Нохчийн" },
  { code: "ceb", label: "C", name: "Cebuano" },
  { code: "ckb", label: "س", name: "سۆرانی" },
  { code: "co", label: "C", name: "Corsu" },
  { code: "cs", label: "Č", name: "Čeština" },
  { code: "cv", label: "Ч", name: "Чӑвашла" },
  { code: "cy", label: "C", name: "Cymraeg" },
  { code: "da", label: "D", name: "Dansk" },
  { code: "el", label: "Ε", name: "Ελληνικά" },
  { code: "eo", label: "E", name: "Esperanto" },
  { code: "et", label: "E", name: "Eesti" },
  { code: "eu", label: "E", name: "Euskara" },
  { code: "fa", label: "ف", name: "فارسی" },
  { code: "fi", label: "S", name: "Suomi" },
  { code: "fj", label: "F", name: "Na Vosa Vakaviti" },
  { code: "fo", label: "F", name: "Føroyskt" },
  { code: "fy", label: "F", name: "Frysk" },
  { code: "ga", label: "G", name: "Gaeilge" },
  { code: "gd", label: "G", name: "Gàidhlig" },
  { code: "gl", label: "G", name: "Galego" },
  { code: "gn", label: "G", name: "Avañe'ẽ" },
  { code: "gu", label: "ગ", name: "ગુજરાતી" },
  { code: "ha", label: "H", name: "Hausa" },
  { code: "hak", label: "H", name: "客家語" },
  { code: "haw", label: "H", name: "Hawaiʻi" },
  { code: "he", label: "ע", name: "עברית" },
  { code: "hr", label: "H", name: "Hrvatski" },
  { code: "hsb", label: "H", name: "Hornjoserbsce" },
  { code: "ht", label: "K", name: "Kreyòl" },
  { code: "hu", label: "M", name: "Magyar" },
  { code: "hy", label: "Հ", name: "Հայերեն" },
  { code: "ia", label: "I", name: "Interlingua" },
  { code: "ig", label: "I", name: "Igbo" },
  { code: "ilo", label: "I", name: "Ilokano" },
  { code: "io", label: "I", name: "Ido" },
  { code: "is", label: "Í", name: "Íslenska" },
  { code: "jv", label: "J", name: "Jawa" },
  { code: "ka", label: "ქ", name: "ქართული" },
  { code: "kk", label: "Қ", name: "Қазақша" },
  { code: "km", label: "ខ", name: "ភាសាខ្មែរ" },
  { code: "kn", label: "ಕ", name: "ಕನ್ನಡ" },
  { code: "ku", label: "K", name: "Kurdî" },
  { code: "ky", label: "К", name: "Кыргызча" },
  { code: "la", label: "L", name: "Latina" },
  { code: "lb", label: "L", name: "Lëtzebuergesch" },
  { code: "li", label: "L", name: "Limburgs" },
  { code: "lmo", label: "L", name: "Lombard" },
  { code: "ln", label: "L", name: "Lingála" },
  { code: "lo", label: "ລ", name: "ລາວ" },
  { code: "lt", label: "L", name: "Lietuvių" },
  { code: "lv", label: "L", name: "Latviešu" },
  { code: "mg", label: "M", name: "Malagasy" },
  { code: "mi", label: "M", name: "Māori" },
  { code: "mk", label: "М", name: "Македонски" },
  { code: "ml", label: "മ", name: "മലയാളം" },
  { code: "mn", label: "М", name: "Монгол" },
  { code: "mr", label: "म", name: "मराठी" },
  { code: "ms", label: "M", name: "Melayu" },
  { code: "mt", label: "M", name: "Malti" },
  { code: "my", label: "မ", name: "မြန်မာဘာသာ" },
  { code: "mzn", label: "م", name: "مازِرونی" },
  { code: "nap", label: "N", name: "Napulitano" },
  { code: "nds", label: "P", name: "Plattdüütsch" },
  { code: "ne", label: "न", name: "नेपाली" },
  { code: "new", label: "न", name: "नेपाल भाषा" },
  { code: "nn", label: "N", name: "Norsk nynorsk" },
  { code: "no", label: "N", name: "Norsk bokmål" },
  { code: "oc", label: "O", name: "Occitan" },
  { code: "or", label: "ଓ", name: "ଓଡ଼ିଆ" },
  { code: "os", label: "И", name: "Ирон" },
  { code: "pa", label: "ਪ", name: "ਪੰਜਾਬੀ" },
  { code: "pam", label: "K", name: "Kapampangan" },
  { code: "pms", label: "P", name: "Piemontèis" },
  { code: "pnb", label: "پ", name: "پنجابی" },
  { code: "ps", label: "پ", name: "پښتو" },
  { code: "qu", label: "Q", name: "Runa Simi" },
  { code: "rm", label: "R", name: "Rumantsch" },
  { code: "ro", label: "R", name: "Română" },
  { code: "sa", label: "स", name: "संस्कृतम्" },
  { code: "sah", label: "С", name: "Саха тыла" },
  { code: "scn", label: "S", name: "Sicilianu" },
  { code: "sco", label: "S", name: "Scots" },
  { code: "sd", label: "س", name: "سنڌي" },
  { code: "sh", label: "S", name: "Srpskohrvatski" },
  { code: "si", label: "ස", name: "සිංහල" },
  { code: "sk", label: "S", name: "Slovenčina" },
  { code: "sl", label: "S", name: "Slovenščina" },
  { code: "sq", label: "S", name: "Shqip" },
  { code: "sr", label: "С", name: "Српски" },
  { code: "su", label: "S", name: "Sunda" },
  { code: "sv", label: "S", name: "Svenska" },
  { code: "sw", label: "S", name: "Kiswahili" },
  { code: "ta", label: "த", name: "தமிழ்" },
  { code: "te", label: "త", name: "తెలుగు" },
  { code: "tg", label: "Т", name: "Тоҷикӣ" },
  { code: "tl", label: "T", name: "Tagalog" },
  { code: "tt", label: "Т", name: "Татарча" },
  { code: "ug", label: "ئ", name: "ئۇيغۇرچە" },
  { code: "ur", label: "ا", name: "اردو" },
  { code: "uz", label: "O", name: "Oʻzbekcha" },
  { code: "vec", label: "V", name: "Vèneto" },
  { code: "wa", label: "W", name: "Walon" },
  { code: "war", label: "W", name: "Winaray" },
  { code: "wuu", label: "吴", name: "吴语" },
  { code: "xmf", label: "მ", name: "მარგალური" },
  { code: "yi", label: "י", name: "ייִדיש" },
  { code: "yo", label: "È", name: "Yorùbá" },
  { code: "yue", label: "粵", name: "粵語" },
  { code: "zh-classical", label: "文", name: "文言" },
  { code: "zh-min-nan", label: "閩", name: "閩南語" },
  { code: "zh-yue", label: "粵", name: "粵語" },
];

const ALL_LANGUAGES = [...POPULAR_LANGUAGES, ...OTHER_LANGUAGES];

export function LanguageModalV2({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  coverImage,
}: LanguageModalProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Change Language"
      coverImage={coverImage}
      height="75vh"
      hideCloseButton
    >
      <div className="max-w-md mx-auto space-y-6">
        {/* Popular Languages Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Popular Languages
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {POPULAR_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                  currentLanguage === lang.code
                    ? "border-2 border-dashed border-foreground bg-accent"
                    : "border-2 border-solid border-foreground/30 bg-background hover:bg-accent/50"
                }`}
              >
                <span className="text-2xl mb-1">{lang.label}</span>
                <span className="text-[10px] text-foreground/70 text-center">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* All Languages Section */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            All Languages
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {OTHER_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onLanguageChange(lang.code);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                  currentLanguage === lang.code
                    ? "border-2 border-dashed border-foreground bg-accent"
                    : "border-2 border-solid border-foreground/30 bg-background hover:bg-accent/50"
                }`}
              >
                <span className="text-2xl mb-1">{lang.label}</span>
                <span className="text-[10px] text-foreground/70 text-center line-clamp-1">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={onClose}
          className="w-full py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors sticky bottom-0"
        >
          Apply
        </button>
      </div>
    </BottomSheet>
  );
}
