export interface WikipediaLanguage {
  code: string;
  name: string;
  nativeName: string;
  dir?: 'rtl' | 'ltr';
}

/**
 * Complete list of all 343 active Wikipedia language editions
 * Data sourced from Wikimedia API sitematrix
 * Last updated: 2025-01
 */
export const WIKIPEDIA_LANGUAGES: WikipediaLanguage[] = [
  {
    "code": "en",
    "name": "English",
    "nativeName": "English"
  },
  {
    "code": "zh",
    "name": "Chinese",
    "nativeName": "中文"
  },
  {
    "code": "es",
    "name": "Spanish",
    "nativeName": "español"
  },
  {
    "code": "fr",
    "name": "French",
    "nativeName": "français"
  },
  {
    "code": "de",
    "name": "German",
    "nativeName": "Deutsch"
  },
  {
    "code": "ru",
    "name": "Russian",
    "nativeName": "русский"
  },
  {
    "code": "ja",
    "name": "Japanese",
    "nativeName": "日本語"
  },
  {
    "code": "pt",
    "name": "Portuguese",
    "nativeName": "português"
  },
  {
    "code": "it",
    "name": "Italian",
    "nativeName": "italiano"
  },
  {
    "code": "ar",
    "name": "Arabic",
    "nativeName": "العربية",
    "dir": "rtl"
  },
  {
    "code": "ko",
    "name": "Korean",
    "nativeName": "한국어"
  },
  {
    "code": "hi",
    "name": "Hindi",
    "nativeName": "हिन्दी"
  },
  {
    "code": "nl",
    "name": "Dutch",
    "nativeName": "Nederlands"
  },
  {
    "code": "tr",
    "name": "Turkish",
    "nativeName": "Türkçe"
  },
  {
    "code": "pl",
    "name": "Polish",
    "nativeName": "polski"
  },
  {
    "code": "sv",
    "name": "Swedish",
    "nativeName": "svenska"
  },
  {
    "code": "id",
    "name": "Indonesian",
    "nativeName": "Bahasa Indonesia"
  },
  {
    "code": "uk",
    "name": "Ukrainian",
    "nativeName": "українська"
  },
  {
    "code": "vi",
    "name": "Vietnamese",
    "nativeName": "Tiếng Việt"
  },
  {
    "code": "fa",
    "name": "Persian",
    "nativeName": "فارسی",
    "dir": "rtl"
  },
  {
    "code": "ab",
    "name": "Abkhazian",
    "nativeName": "аԥсшәа"
  },
  {
    "code": "ace",
    "name": "Acehnese",
    "nativeName": "Acèh"
  },
  {
    "code": "ady",
    "name": "Adyghe",
    "nativeName": "адыгабзэ"
  },
  {
    "code": "af",
    "name": "Afrikaans",
    "nativeName": "Afrikaans"
  },
  {
    "code": "alt",
    "name": "Southern Altai",
    "nativeName": "алтай тил"
  },
  {
    "code": "am",
    "name": "Amharic",
    "nativeName": "አማርኛ"
  },
  {
    "code": "ami",
    "name": "Amis",
    "nativeName": "Pangcah"
  },
  {
    "code": "an",
    "name": "Aragonese",
    "nativeName": "aragonés"
  },
  {
    "code": "ang",
    "name": "Old English",
    "nativeName": "Ænglisc"
  },
  {
    "code": "ann",
    "name": "Obolo",
    "nativeName": "Obolo"
  },
  {
    "code": "anp",
    "name": "Angika",
    "nativeName": "अंगिका"
  },
  {
    "code": "arc",
    "name": "Aramaic",
    "nativeName": "ܐܪܡܝܐ",
    "dir": "rtl"
  },
  {
    "code": "ary",
    "name": "Moroccan Arabic",
    "nativeName": "الدارجة",
    "dir": "rtl"
  },
  {
    "code": "arz",
    "name": "Egyptian Arabic",
    "nativeName": "مصرى",
    "dir": "rtl"
  },
  {
    "code": "as",
    "name": "Assamese",
    "nativeName": "অসমীয়া"
  },
  {
    "code": "ast",
    "name": "Asturian",
    "nativeName": "asturianu"
  },
  {
    "code": "atj",
    "name": "Atikamekw",
    "nativeName": "Atikamekw"
  },
  {
    "code": "av",
    "name": "Avaric",
    "nativeName": "авар"
  },
  {
    "code": "avk",
    "name": "Kotava",
    "nativeName": "Kotava"
  },
  {
    "code": "awa",
    "name": "Awadhi",
    "nativeName": "अवधी"
  },
  {
    "code": "ay",
    "name": "Aymara",
    "nativeName": "Aymar aru"
  },
  {
    "code": "az",
    "name": "Azerbaijani",
    "nativeName": "azərbaycanca"
  },
  {
    "code": "azb",
    "name": "South Azerbaijani",
    "nativeName": "تۆرکجه",
    "dir": "rtl"
  },
  {
    "code": "ba",
    "name": "Bashkir",
    "nativeName": "башҡортса"
  },
  {
    "code": "ban",
    "name": "Balinese",
    "nativeName": "Basa Bali"
  },
  {
    "code": "bar",
    "name": "Bavarian",
    "nativeName": "Boarisch"
  },
  {
    "code": "bbc",
    "name": "Batak Toba",
    "nativeName": "Batak Toba"
  },
  {
    "code": "bcl",
    "name": "Central Bikol",
    "nativeName": "Bikol Central"
  },
  {
    "code": "bdr",
    "name": "West Coast Bajau",
    "nativeName": "Bajau Sama"
  },
  {
    "code": "be",
    "name": "Belarusian",
    "nativeName": "беларуская"
  },
  {
    "code": "be-tarask",
    "name": "Belarusian (Taraškievica orthography)",
    "nativeName": "беларуская (тарашкевіца)"
  },
  {
    "code": "bew",
    "name": "Betawi",
    "nativeName": "Betawi"
  },
  {
    "code": "bg",
    "name": "Bulgarian",
    "nativeName": "български"
  },
  {
    "code": "bh",
    "name": "Bhojpuri",
    "nativeName": "भोजपुरी"
  },
  {
    "code": "bi",
    "name": "Bislama",
    "nativeName": "Bislama"
  },
  {
    "code": "bjn",
    "name": "Banjar",
    "nativeName": "Banjar"
  },
  {
    "code": "blk",
    "name": "Pa'O",
    "nativeName": "ပအိုဝ်ႏဘာႏသာႏ"
  },
  {
    "code": "bm",
    "name": "Bambara",
    "nativeName": "bamanankan"
  },
  {
    "code": "bn",
    "name": "Bangla",
    "nativeName": "বাংলা"
  },
  {
    "code": "bo",
    "name": "Tibetan",
    "nativeName": "བོད་ཡིག"
  },
  {
    "code": "bpy",
    "name": "Bishnupriya",
    "nativeName": "বিষ্ণুপ্রিয়া মণিপুরী"
  },
  {
    "code": "br",
    "name": "Breton",
    "nativeName": "brezhoneg"
  },
  {
    "code": "bs",
    "name": "Bosnian",
    "nativeName": "bosanski"
  },
  {
    "code": "btm",
    "name": "Batak Mandailing",
    "nativeName": "Batak Mandailing"
  },
  {
    "code": "bug",
    "name": "Buginese",
    "nativeName": "Basa Ugi"
  },
  {
    "code": "bxr",
    "name": "Russia Buriat",
    "nativeName": "буряад"
  },
  {
    "code": "ca",
    "name": "Catalan",
    "nativeName": "català"
  },
  {
    "code": "cbk-zam",
    "name": "Chavacano",
    "nativeName": "Chavacano de Zamboanga"
  },
  {
    "code": "cdo",
    "name": "Mindong",
    "nativeName": "閩東語 / Mìng-dĕ̤ng-ngṳ̄"
  },
  {
    "code": "ce",
    "name": "Chechen",
    "nativeName": "нохчийн"
  },
  {
    "code": "ceb",
    "name": "Cebuano",
    "nativeName": "Cebuano"
  },
  {
    "code": "ch",
    "name": "Chamorro",
    "nativeName": "Chamoru"
  },
  {
    "code": "chr",
    "name": "Cherokee",
    "nativeName": "ᏣᎳᎩ"
  },
  {
    "code": "chy",
    "name": "Cheyenne",
    "nativeName": "Tsetsêhestâhese"
  },
  {
    "code": "ckb",
    "name": "Central Kurdish",
    "nativeName": "کوردی",
    "dir": "rtl"
  },
  {
    "code": "co",
    "name": "Corsican",
    "nativeName": "corsu"
  },
  {
    "code": "cr",
    "name": "Cree",
    "nativeName": "Nēhiyawēwin / ᓀᐦᐃᔭᐍᐏᐣ"
  },
  {
    "code": "crh",
    "name": "Crimean Tatar",
    "nativeName": "qırımtatarca"
  },
  {
    "code": "cs",
    "name": "Czech",
    "nativeName": "čeština"
  },
  {
    "code": "csb",
    "name": "Kashubian",
    "nativeName": "kaszëbsczi"
  },
  {
    "code": "cu",
    "name": "Church Slavic",
    "nativeName": "словѣньскъ / ⰔⰎⰑⰂⰡⰐⰠⰔⰍⰟ"
  },
  {
    "code": "cv",
    "name": "Chuvash",
    "nativeName": "чӑвашла"
  },
  {
    "code": "cy",
    "name": "Welsh",
    "nativeName": "Cymraeg"
  },
  {
    "code": "da",
    "name": "Danish",
    "nativeName": "dansk"
  },
  {
    "code": "dag",
    "name": "Dagbani",
    "nativeName": "dagbanli"
  },
  {
    "code": "dga",
    "name": "Southern Dagaare",
    "nativeName": "Dagaare"
  },
  {
    "code": "din",
    "name": "Dinka",
    "nativeName": "Thuɔŋjäŋ"
  },
  {
    "code": "diq",
    "name": "Dimli",
    "nativeName": "Zazaki"
  },
  {
    "code": "dsb",
    "name": "Lower Sorbian",
    "nativeName": "dolnoserbski"
  },
  {
    "code": "dtp",
    "name": "Central Dusun",
    "nativeName": "Kadazandusun"
  },
  {
    "code": "dty",
    "name": "Doteli",
    "nativeName": "डोटेली"
  },
  {
    "code": "dv",
    "name": "Divehi",
    "nativeName": "ދިވެހިބަސް",
    "dir": "rtl"
  },
  {
    "code": "dz",
    "name": "Dzongkha",
    "nativeName": "ཇོང་ཁ"
  },
  {
    "code": "ee",
    "name": "Ewe",
    "nativeName": "eʋegbe"
  },
  {
    "code": "el",
    "name": "Greek",
    "nativeName": "Ελληνικά"
  },
  {
    "code": "eml",
    "name": "Emiliano-Romagnolo",
    "nativeName": "emiliàn e rumagnòl"
  },
  {
    "code": "eo",
    "name": "Esperanto",
    "nativeName": "Esperanto"
  },
  {
    "code": "et",
    "name": "Estonian",
    "nativeName": "eesti"
  },
  {
    "code": "eu",
    "name": "Basque",
    "nativeName": "euskara"
  },
  {
    "code": "ext",
    "name": "Extremaduran",
    "nativeName": "estremeñu"
  },
  {
    "code": "fat",
    "name": "Fanti",
    "nativeName": "mfantse"
  },
  {
    "code": "ff",
    "name": "Fula",
    "nativeName": "Fulfulde"
  },
  {
    "code": "fi",
    "name": "Finnish",
    "nativeName": "suomi"
  },
  {
    "code": "fj",
    "name": "Fijian",
    "nativeName": "Na Vosa Vakaviti"
  },
  {
    "code": "fo",
    "name": "Faroese",
    "nativeName": "føroyskt"
  },
  {
    "code": "fon",
    "name": "Fon",
    "nativeName": "fɔ̀ngbè"
  },
  {
    "code": "frp",
    "name": "Arpitan",
    "nativeName": "arpetan"
  },
  {
    "code": "frr",
    "name": "Northern Frisian",
    "nativeName": "Nordfriisk"
  },
  {
    "code": "fur",
    "name": "Friulian",
    "nativeName": "furlan"
  },
  {
    "code": "fy",
    "name": "Western Frisian",
    "nativeName": "Frysk"
  },
  {
    "code": "ga",
    "name": "Irish",
    "nativeName": "Gaeilge"
  },
  {
    "code": "gag",
    "name": "Gagauz",
    "nativeName": "Gagauz"
  },
  {
    "code": "gan",
    "name": "Gan",
    "nativeName": "贛語"
  },
  {
    "code": "gcr",
    "name": "Guianan Creole",
    "nativeName": "kriyòl gwiyannen"
  },
  {
    "code": "gd",
    "name": "Scottish Gaelic",
    "nativeName": "Gàidhlig"
  },
  {
    "code": "gl",
    "name": "Galician",
    "nativeName": "galego"
  },
  {
    "code": "glk",
    "name": "Gilaki",
    "nativeName": "گیلکی",
    "dir": "rtl"
  },
  {
    "code": "gn",
    "name": "Guarani",
    "nativeName": "Avañe'ẽ"
  },
  {
    "code": "gom",
    "name": "Goan Konkani",
    "nativeName": "गोंयची कोंकणी / Gõychi Konknni"
  },
  {
    "code": "gor",
    "name": "Gorontalo",
    "nativeName": "Bahasa Hulontalo"
  },
  {
    "code": "got",
    "name": "Gothic",
    "nativeName": "𐌲𐌿𐍄𐌹𐍃𐌺"
  },
  {
    "code": "gpe",
    "name": "Ghanaian Pidgin",
    "nativeName": "Ghanaian Pidgin"
  },
  {
    "code": "gsw",
    "name": "Alemannic",
    "nativeName": "Alemannisch"
  },
  {
    "code": "gu",
    "name": "Gujarati",
    "nativeName": "ગુજરાતી"
  },
  {
    "code": "guc",
    "name": "Wayuu",
    "nativeName": "wayuunaiki"
  },
  {
    "code": "gur",
    "name": "Frafra",
    "nativeName": "farefare"
  },
  {
    "code": "guw",
    "name": "Gun",
    "nativeName": "gungbe"
  },
  {
    "code": "gv",
    "name": "Manx",
    "nativeName": "Gaelg"
  },
  {
    "code": "ha",
    "name": "Hausa",
    "nativeName": "Hausa"
  },
  {
    "code": "hak",
    "name": "Hakka Chinese",
    "nativeName": "客家語 / Hak-kâ-ngî"
  },
  {
    "code": "haw",
    "name": "Hawaiian",
    "nativeName": "Hawaiʻi"
  },
  {
    "code": "he",
    "name": "Hebrew",
    "nativeName": "עברית",
    "dir": "rtl"
  },
  {
    "code": "hif",
    "name": "Fiji Hindi",
    "nativeName": "Fiji Hindi"
  },
  {
    "code": "hr",
    "name": "Croatian",
    "nativeName": "hrvatski"
  },
  {
    "code": "hsb",
    "name": "Upper Sorbian",
    "nativeName": "hornjoserbsce"
  },
  {
    "code": "ht",
    "name": "Haitian Creole",
    "nativeName": "Kreyòl ayisyen"
  },
  {
    "code": "hu",
    "name": "Hungarian",
    "nativeName": "magyar"
  },
  {
    "code": "hy",
    "name": "Armenian",
    "nativeName": "հայերեն"
  },
  {
    "code": "hyw",
    "name": "Western Armenian",
    "nativeName": "Արեւմտահայերէն"
  },
  {
    "code": "ia",
    "name": "Interlingua",
    "nativeName": "interlingua"
  },
  {
    "code": "iba",
    "name": "Iban",
    "nativeName": "Jaku Iban"
  },
  {
    "code": "ie",
    "name": "Interlingue",
    "nativeName": "Interlingue"
  },
  {
    "code": "ig",
    "name": "Igbo",
    "nativeName": "Igbo"
  },
  {
    "code": "igl",
    "name": "Igala",
    "nativeName": "Igala"
  },
  {
    "code": "ik",
    "name": "Inupiaq",
    "nativeName": "Iñupiatun"
  },
  {
    "code": "ilo",
    "name": "Iloko",
    "nativeName": "Ilokano"
  },
  {
    "code": "inh",
    "name": "Ingush",
    "nativeName": "гӀалгӀай"
  },
  {
    "code": "io",
    "name": "Ido",
    "nativeName": "Ido"
  },
  {
    "code": "is",
    "name": "Icelandic",
    "nativeName": "íslenska"
  },
  {
    "code": "iu",
    "name": "Inuktitut",
    "nativeName": "ᐃᓄᒃᑎᑐᑦ / inuktitut"
  },
  {
    "code": "jam",
    "name": "Jamaican Creole English",
    "nativeName": "Patois"
  },
  {
    "code": "jbo",
    "name": "Lojban",
    "nativeName": "la .lojban."
  },
  {
    "code": "jv",
    "name": "Javanese",
    "nativeName": "Jawa"
  },
  {
    "code": "ka",
    "name": "Georgian",
    "nativeName": "ქართული"
  },
  {
    "code": "kaa",
    "name": "Kara-Kalpak",
    "nativeName": "Qaraqalpaqsha"
  },
  {
    "code": "kab",
    "name": "Kabyle",
    "nativeName": "Taqbaylit"
  },
  {
    "code": "kbd",
    "name": "Kabardian",
    "nativeName": "адыгэбзэ"
  },
  {
    "code": "kbp",
    "name": "Kabiye",
    "nativeName": "Kabɩyɛ"
  },
  {
    "code": "kcg",
    "name": "Tyap",
    "nativeName": "Tyap"
  },
  {
    "code": "kg",
    "name": "Kongo",
    "nativeName": "Kongo"
  },
  {
    "code": "kge",
    "name": "Komering",
    "nativeName": "Kumoring"
  },
  {
    "code": "ki",
    "name": "Kikuyu",
    "nativeName": "Gĩkũyũ"
  },
  {
    "code": "kk",
    "name": "Kazakh",
    "nativeName": "қазақша"
  },
  {
    "code": "kl",
    "name": "Kalaallisut",
    "nativeName": "kalaallisut"
  },
  {
    "code": "km",
    "name": "Khmer",
    "nativeName": "ភាសាខ្មែរ"
  },
  {
    "code": "kn",
    "name": "Kannada",
    "nativeName": "ಕನ್ನಡ"
  },
  {
    "code": "knc",
    "name": "Central Kanuri",
    "nativeName": "Yerwa Kanuri"
  },
  {
    "code": "koi",
    "name": "Komi-Permyak",
    "nativeName": "перем коми"
  },
  {
    "code": "krc",
    "name": "Karachay-Balkar",
    "nativeName": "къарачай-малкъар"
  },
  {
    "code": "ks",
    "name": "Kashmiri",
    "nativeName": "کٲشُر",
    "dir": "rtl"
  },
  {
    "code": "ksh",
    "name": "Colognian",
    "nativeName": "Ripoarisch"
  },
  {
    "code": "ku",
    "name": "Kurdish",
    "nativeName": "kurdî"
  },
  {
    "code": "kus",
    "name": "Kusaal",
    "nativeName": "Kʋsaal"
  },
  {
    "code": "kv",
    "name": "Komi",
    "nativeName": "коми"
  },
  {
    "code": "kw",
    "name": "Cornish",
    "nativeName": "kernowek"
  },
  {
    "code": "ky",
    "name": "Kyrgyz",
    "nativeName": "кыргызча"
  },
  {
    "code": "la",
    "name": "Latin",
    "nativeName": "Latina"
  },
  {
    "code": "lad",
    "name": "Ladino",
    "nativeName": "Ladino"
  },
  {
    "code": "lb",
    "name": "Luxembourgish",
    "nativeName": "Lëtzebuergesch"
  },
  {
    "code": "lbe",
    "name": "Lak",
    "nativeName": "лакку"
  },
  {
    "code": "lez",
    "name": "Lezghian",
    "nativeName": "лезги"
  },
  {
    "code": "lfn",
    "name": "Lingua Franca Nova",
    "nativeName": "Lingua Franca Nova"
  },
  {
    "code": "lg",
    "name": "Ganda",
    "nativeName": "Luganda"
  },
  {
    "code": "li",
    "name": "Limburgish",
    "nativeName": "Limburgs"
  },
  {
    "code": "lij",
    "name": "Ligurian",
    "nativeName": "Ligure"
  },
  {
    "code": "lld",
    "name": "Ladin",
    "nativeName": "Ladin"
  },
  {
    "code": "lmo",
    "name": "Lombard",
    "nativeName": "lombard"
  },
  {
    "code": "ln",
    "name": "Lingala",
    "nativeName": "lingála"
  },
  {
    "code": "lo",
    "name": "Lao",
    "nativeName": "ລາວ"
  },
  {
    "code": "lt",
    "name": "Lithuanian",
    "nativeName": "lietuvių"
  },
  {
    "code": "ltg",
    "name": "Latgalian",
    "nativeName": "latgaļu"
  },
  {
    "code": "lv",
    "name": "Latvian",
    "nativeName": "latviešu"
  },
  {
    "code": "lzh",
    "name": "Literary Chinese",
    "nativeName": "文言"
  },
  {
    "code": "mad",
    "name": "Madurese",
    "nativeName": "Madhurâ"
  },
  {
    "code": "mai",
    "name": "Maithili",
    "nativeName": "मैथिली"
  },
  {
    "code": "map-bms",
    "name": "Banyumasan",
    "nativeName": "Basa Banyumasan"
  },
  {
    "code": "mdf",
    "name": "Moksha",
    "nativeName": "мокшень"
  },
  {
    "code": "mg",
    "name": "Malagasy",
    "nativeName": "Malagasy"
  },
  {
    "code": "mhr",
    "name": "Eastern Mari",
    "nativeName": "олык марий"
  },
  {
    "code": "mi",
    "name": "Māori",
    "nativeName": "Māori"
  },
  {
    "code": "min",
    "name": "Minangkabau",
    "nativeName": "Minangkabau"
  },
  {
    "code": "mk",
    "name": "Macedonian",
    "nativeName": "македонски"
  },
  {
    "code": "ml",
    "name": "Malayalam",
    "nativeName": "മലയാളം"
  },
  {
    "code": "mn",
    "name": "Mongolian",
    "nativeName": "монгол"
  },
  {
    "code": "mni",
    "name": "Manipuri",
    "nativeName": "ꯃꯤꯇꯩ ꯂꯣꯟ"
  },
  {
    "code": "mnw",
    "name": "Mon",
    "nativeName": "ဘာသာမန်"
  },
  {
    "code": "mos",
    "name": "Mossi",
    "nativeName": "moore"
  },
  {
    "code": "mr",
    "name": "Marathi",
    "nativeName": "मराठी"
  },
  {
    "code": "mrj",
    "name": "Western Mari",
    "nativeName": "кырык мары"
  },
  {
    "code": "ms",
    "name": "Malay",
    "nativeName": "Bahasa Melayu"
  },
  {
    "code": "mt",
    "name": "Maltese",
    "nativeName": "Malti"
  },
  {
    "code": "mwl",
    "name": "Mirandese",
    "nativeName": "Mirandés"
  },
  {
    "code": "my",
    "name": "Burmese",
    "nativeName": "မြန်မာဘာသာ"
  },
  {
    "code": "myv",
    "name": "Erzya",
    "nativeName": "эрзянь"
  },
  {
    "code": "mzn",
    "name": "Mazanderani",
    "nativeName": "مازِرونی",
    "dir": "rtl"
  },
  {
    "code": "nah",
    "name": "Nahuatl",
    "nativeName": "Nāhuatl"
  },
  {
    "code": "nan",
    "name": "Minnan",
    "nativeName": "閩南語 / Bân-lâm-gí"
  },
  {
    "code": "nap",
    "name": "Neapolitan",
    "nativeName": "Napulitano"
  },
  {
    "code": "nds",
    "name": "Low German",
    "nativeName": "Plattdüütsch"
  },
  {
    "code": "nds-nl",
    "name": "Low Saxon",
    "nativeName": "Nedersaksies"
  },
  {
    "code": "ne",
    "name": "Nepali",
    "nativeName": "नेपाली"
  },
  {
    "code": "new",
    "name": "Newari",
    "nativeName": "नेपाल भाषा"
  },
  {
    "code": "nia",
    "name": "Nias",
    "nativeName": "Li Niha"
  },
  {
    "code": "nn",
    "name": "Norwegian Nynorsk",
    "nativeName": "norsk nynorsk"
  },
  {
    "code": "no",
    "name": "Norwegian",
    "nativeName": "norsk"
  },
  {
    "code": "nov",
    "name": "Novial",
    "nativeName": "Novial"
  },
  {
    "code": "nqo",
    "name": "N’Ko",
    "nativeName": "ߒߞߏ",
    "dir": "rtl"
  },
  {
    "code": "nr",
    "name": "South Ndebele",
    "nativeName": "isiNdebele seSewula"
  },
  {
    "code": "nrm",
    "name": "Norman",
    "nativeName": "Nouormand"
  },
  {
    "code": "nso",
    "name": "Northern Sotho",
    "nativeName": "Sesotho sa Leboa"
  },
  {
    "code": "nup",
    "name": "Nupe",
    "nativeName": "Nupe"
  },
  {
    "code": "nv",
    "name": "Navajo",
    "nativeName": "Diné bizaad"
  },
  {
    "code": "ny",
    "name": "Nyanja",
    "nativeName": "Chi-Chewa"
  },
  {
    "code": "oc",
    "name": "Occitan",
    "nativeName": "occitan"
  },
  {
    "code": "olo",
    "name": "Livvi-Karelian",
    "nativeName": "livvinkarjala"
  },
  {
    "code": "om",
    "name": "Oromo",
    "nativeName": "Oromoo"
  },
  {
    "code": "or",
    "name": "Odia",
    "nativeName": "ଓଡ଼ିଆ"
  },
  {
    "code": "os",
    "name": "Ossetic",
    "nativeName": "ирон"
  },
  {
    "code": "pa",
    "name": "Punjabi",
    "nativeName": "ਪੰਜਾਬੀ"
  },
  {
    "code": "pag",
    "name": "Pangasinan",
    "nativeName": "Pangasinan"
  },
  {
    "code": "pam",
    "name": "Pampanga",
    "nativeName": "Kapampangan"
  },
  {
    "code": "pap",
    "name": "Papiamento",
    "nativeName": "Papiamentu"
  },
  {
    "code": "pcd",
    "name": "Picard",
    "nativeName": "Picard"
  },
  {
    "code": "pcm",
    "name": "Nigerian Pidgin",
    "nativeName": "Naijá"
  },
  {
    "code": "pdc",
    "name": "Pennsylvania German",
    "nativeName": "Deitsch"
  },
  {
    "code": "pfl",
    "name": "Palatine German",
    "nativeName": "Pälzisch"
  },
  {
    "code": "pi",
    "name": "Pali",
    "nativeName": "पालि"
  },
  {
    "code": "pms",
    "name": "Piedmontese",
    "nativeName": "Piemontèis"
  },
  {
    "code": "pnb",
    "name": "Western Punjabi",
    "nativeName": "پنجابی",
    "dir": "rtl"
  },
  {
    "code": "pnt",
    "name": "Pontic",
    "nativeName": "Ποντιακά"
  },
  {
    "code": "ps",
    "name": "Pashto",
    "nativeName": "پښتو",
    "dir": "rtl"
  },
  {
    "code": "pwn",
    "name": "Paiwan",
    "nativeName": "pinayuanan"
  },
  {
    "code": "qu",
    "name": "Quechua",
    "nativeName": "Runa Simi"
  },
  {
    "code": "rki",
    "name": "Arakanese",
    "nativeName": "ရခိုင်"
  },
  {
    "code": "rm",
    "name": "Romansh",
    "nativeName": "rumantsch"
  },
  {
    "code": "rmy",
    "name": "Vlax Romani",
    "nativeName": "romani čhib"
  },
  {
    "code": "rn",
    "name": "Rundi",
    "nativeName": "ikirundi"
  },
  {
    "code": "ro",
    "name": "Romanian",
    "nativeName": "română"
  },
  {
    "code": "roa-tara",
    "name": "Tarantino",
    "nativeName": "tarandíne"
  },
  {
    "code": "rsk",
    "name": "Pannonian Rusyn",
    "nativeName": "руски"
  },
  {
    "code": "rue",
    "name": "Rusyn",
    "nativeName": "русиньскый"
  },
  {
    "code": "rup",
    "name": "Aromanian",
    "nativeName": "armãneashti"
  },
  {
    "code": "rw",
    "name": "Kinyarwanda",
    "nativeName": "Ikinyarwanda"
  },
  {
    "code": "sa",
    "name": "Sanskrit",
    "nativeName": "संस्कृतम्"
  },
  {
    "code": "sah",
    "name": "Yakut",
    "nativeName": "саха тыла"
  },
  {
    "code": "sat",
    "name": "Santali",
    "nativeName": "ᱥᱟᱱᱛᱟᱲᱤ"
  },
  {
    "code": "sc",
    "name": "Sardinian",
    "nativeName": "sardu"
  },
  {
    "code": "scn",
    "name": "Sicilian",
    "nativeName": "sicilianu"
  },
  {
    "code": "sco",
    "name": "Scots",
    "nativeName": "Scots"
  },
  {
    "code": "sd",
    "name": "Sindhi",
    "nativeName": "سنڌي",
    "dir": "rtl"
  },
  {
    "code": "se",
    "name": "Northern Sami",
    "nativeName": "davvisámegiella"
  },
  {
    "code": "sg",
    "name": "Sango",
    "nativeName": "Sängö"
  },
  {
    "code": "sgs",
    "name": "Samogitian",
    "nativeName": "žemaitėška"
  },
  {
    "code": "sh",
    "name": "Serbo-Croatian",
    "nativeName": "srpskohrvatski / српскохрватски"
  },
  {
    "code": "shi",
    "name": "Tachelhit",
    "nativeName": "Taclḥit"
  },
  {
    "code": "shn",
    "name": "Shan",
    "nativeName": "တႆး"
  },
  {
    "code": "si",
    "name": "Sinhala",
    "nativeName": "සිංහල"
  },
  {
    "code": "simple",
    "name": "Simple English",
    "nativeName": "Simple English"
  },
  {
    "code": "sk",
    "name": "Slovak",
    "nativeName": "slovenčina"
  },
  {
    "code": "skr",
    "name": "Saraiki",
    "nativeName": "سرائیکی",
    "dir": "rtl"
  },
  {
    "code": "sl",
    "name": "Slovenian",
    "nativeName": "slovenščina"
  },
  {
    "code": "sm",
    "name": "Samoan",
    "nativeName": "Gagana Samoa"
  },
  {
    "code": "smn",
    "name": "Inari Sami",
    "nativeName": "anarâškielâ"
  },
  {
    "code": "sn",
    "name": "Shona",
    "nativeName": "chiShona"
  },
  {
    "code": "so",
    "name": "Somali",
    "nativeName": "Soomaaliga"
  },
  {
    "code": "sq",
    "name": "Albanian",
    "nativeName": "shqip"
  },
  {
    "code": "sr",
    "name": "Serbian",
    "nativeName": "српски / srpski"
  },
  {
    "code": "srn",
    "name": "Sranan Tongo",
    "nativeName": "Sranantongo"
  },
  {
    "code": "ss",
    "name": "Swati",
    "nativeName": "SiSwati"
  },
  {
    "code": "st",
    "name": "Southern Sotho",
    "nativeName": "Sesotho"
  },
  {
    "code": "stq",
    "name": "Saterland Frisian",
    "nativeName": "Seeltersk"
  },
  {
    "code": "su",
    "name": "Sundanese",
    "nativeName": "Sunda"
  },
  {
    "code": "sw",
    "name": "Swahili",
    "nativeName": "Kiswahili"
  },
  {
    "code": "syl",
    "name": "Sylheti",
    "nativeName": "ꠍꠤꠟꠐꠤ"
  },
  {
    "code": "szl",
    "name": "Silesian",
    "nativeName": "ślůnski"
  },
  {
    "code": "szy",
    "name": "Sakizaya",
    "nativeName": "Sakizaya"
  },
  {
    "code": "ta",
    "name": "Tamil",
    "nativeName": "தமிழ்"
  },
  {
    "code": "tay",
    "name": "Atayal",
    "nativeName": "Tayal"
  },
  {
    "code": "tcy",
    "name": "Tulu",
    "nativeName": "ತುಳು"
  },
  {
    "code": "tdd",
    "name": "Tai Nuea",
    "nativeName": "ᥖᥭᥰ ᥖᥬᥲ ᥑᥨᥒᥰ"
  },
  {
    "code": "te",
    "name": "Telugu",
    "nativeName": "తెలుగు"
  },
  {
    "code": "tet",
    "name": "Tetum",
    "nativeName": "tetun"
  },
  {
    "code": "tg",
    "name": "Tajik",
    "nativeName": "тоҷикӣ"
  },
  {
    "code": "th",
    "name": "Thai",
    "nativeName": "ไทย"
  },
  {
    "code": "ti",
    "name": "Tigrinya",
    "nativeName": "ትግርኛ"
  },
  {
    "code": "tig",
    "name": "Tigre",
    "nativeName": "ትግሬ"
  },
  {
    "code": "tk",
    "name": "Turkmen",
    "nativeName": "Türkmençe"
  },
  {
    "code": "tl",
    "name": "Tagalog",
    "nativeName": "Tagalog"
  },
  {
    "code": "tly",
    "name": "Talysh",
    "nativeName": "tolışi"
  },
  {
    "code": "tn",
    "name": "Tswana",
    "nativeName": "Setswana"
  },
  {
    "code": "to",
    "name": "Tongan",
    "nativeName": "lea faka-Tonga"
  },
  {
    "code": "tpi",
    "name": "Tok Pisin",
    "nativeName": "Tok Pisin"
  },
  {
    "code": "trv",
    "name": "Taroko",
    "nativeName": "Seediq"
  },
  {
    "code": "ts",
    "name": "Tsonga",
    "nativeName": "Xitsonga"
  },
  {
    "code": "tt",
    "name": "Tatar",
    "nativeName": "татарча / tatarça"
  },
  {
    "code": "tum",
    "name": "Tumbuka",
    "nativeName": "chiTumbuka"
  },
  {
    "code": "tw",
    "name": "Twi",
    "nativeName": "Twi"
  },
  {
    "code": "ty",
    "name": "Tahitian",
    "nativeName": "reo tahiti"
  },
  {
    "code": "tyv",
    "name": "Tuvinian",
    "nativeName": "тыва дыл"
  },
  {
    "code": "udm",
    "name": "Udmurt",
    "nativeName": "удмурт"
  },
  {
    "code": "ug",
    "name": "Uyghur",
    "nativeName": "ئۇيغۇرچە / Uyghurche",
    "dir": "rtl"
  },
  {
    "code": "ur",
    "name": "Urdu",
    "nativeName": "اردو",
    "dir": "rtl"
  },
  {
    "code": "uz",
    "name": "Uzbek",
    "nativeName": "oʻzbekcha / ўзбекча"
  },
  {
    "code": "ve",
    "name": "Venda",
    "nativeName": "Tshivenda"
  },
  {
    "code": "vec",
    "name": "Venetian",
    "nativeName": "vèneto"
  },
  {
    "code": "vep",
    "name": "Veps",
    "nativeName": "vepsän kel’"
  },
  {
    "code": "vls",
    "name": "West Flemish",
    "nativeName": "West-Vlams"
  },
  {
    "code": "vo",
    "name": "Volapük",
    "nativeName": "Volapük"
  },
  {
    "code": "vro",
    "name": "Võro",
    "nativeName": "võro"
  },
  {
    "code": "wa",
    "name": "Walloon",
    "nativeName": "walon"
  },
  {
    "code": "war",
    "name": "Waray",
    "nativeName": "Winaray"
  },
  {
    "code": "wo",
    "name": "Wolof",
    "nativeName": "Wolof"
  },
  {
    "code": "wuu",
    "name": "Wu",
    "nativeName": "吴语"
  },
  {
    "code": "xal",
    "name": "Kalmyk",
    "nativeName": "хальмг"
  },
  {
    "code": "xh",
    "name": "Xhosa",
    "nativeName": "isiXhosa"
  },
  {
    "code": "xmf",
    "name": "Mingrelian",
    "nativeName": "მარგალური"
  },
  {
    "code": "yi",
    "name": "Yiddish",
    "nativeName": "ייִדיש",
    "dir": "rtl"
  },
  {
    "code": "yo",
    "name": "Yoruba",
    "nativeName": "Yorùbá"
  },
  {
    "code": "yue",
    "name": "Cantonese",
    "nativeName": "粵語"
  },
  {
    "code": "za",
    "name": "Zhuang",
    "nativeName": "Vahcuengh"
  },
  {
    "code": "zea",
    "name": "Zeelandic",
    "nativeName": "Zeêuws"
  },
  {
    "code": "zgh",
    "name": "Standard Moroccan Tamazight",
    "nativeName": "ⵜⴰⵎⴰⵣⵉⵖⵜ ⵜⴰⵏⴰⵡⴰⵢⵜ"
  },
  {
    "code": "zu",
    "name": "Zulu",
    "nativeName": "isiZulu"
  }
];

export function getLanguageByCode(code: string): WikipediaLanguage | undefined {
  return WIKIPEDIA_LANGUAGES.find(lang => lang.code === code);
}

export function getLanguageName(code: string, useNative: boolean = false): string {
  const lang = getLanguageByCode(code);
  if (!lang) return code;
  return useNative ? lang.nativeName : lang.name;
}

export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const hasLanguage = WIKIPEDIA_LANGUAGES.some(lang => lang.code === browserLang);
  return hasLanguage ? browserLang : 'en';
}
