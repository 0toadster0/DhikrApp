export type QuranVerse = {
  arabic: string;
  transliteration: string;
  english: string;
  reference: string;
};

export const QURAN_VERSES: QuranVerse[] = [
  {
    arabic: "إِنَّ اللَّهَ لَطِيفٌ بِعِبَادِهِ",
    transliteration: "Inna Allaha latifun bi'ibadih.",
    english: "Indeed, Allah is Gentle with His servants.",
    reference: "Surah Ash-Shura (42:19)",
  },
  {
    arabic: "وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ",
    transliteration: "Wasbir fa inna Allaha la yudi'u ajra al-muhsinin.",
    english: "And be patient, for Allah does not let the reward of the good be lost.",
    reference: "Surah Hud (11:115)",
  },
  {
    arabic: "سَيَجْعَلُ اللَّهُ بَعْدَ عُسْرٍ يُسْرًا",
    transliteration: "Sayaj'alu Allahu ba'da 'usrin yusra.",
    english: "Allah will bring about ease after hardship.",
    reference: "Surah At-Talaq (65:7)",
  },
  {
    arabic: "وَاللَّهُ غَفُورٌ رَّحِيمٌ",
    transliteration: "Wallahu ghafurun rahim.",
    english: "And Allah is Forgiving and Merciful.",
    reference: "Surah Al-Baqarah (2:173)",
  },
  {
    arabic: "وَاللَّهُ يُحِبُّ الصَّابِرِينَ",
    transliteration: "Wallahu yuhibbu as-sabirin.",
    english: "And Allah loves those who are patient.",
    reference: "Surah Aal-E-Imran (3:146)",
  },
  {
    arabic: "إِنَّ اللَّهَ بِالنَّاسِ لَرَءُوفٌ رَّحِيمٌ",
    transliteration: "Inna Allaha bin-nasi lara'ufun rahim.",
    english: "Indeed, Allah is Kind and Merciful to people.",
    reference: "Surah Al-Baqarah (2:143)",
  },
  {
    arabic: "وَرَبُّكَ الْغَفُورُ ذُو الرَّحْمَةِ",
    transliteration: "Wa rabbuka al-ghafuru dhu ar-rahmah.",
    english: "And your Lord is the Forgiving, Full of Mercy.",
    reference: "Surah Al-Kahf (18:58)",
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    transliteration: "Inna ma'a al-'usri yusra.",
    english: "Indeed, with hardship comes ease.",
    reference: "Surah Ash-Sharh (94:6)",
  },
  {
    arabic: "وَاللَّهُ خَيْرُ الرَّازِقِينَ",
    transliteration: "Wallahu khayru ar-raziqin.",
    english: "And Allah is the best of providers.",
    reference: "Surah Al-Jumu’ah (62:11)",
  },
  {
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    transliteration: "La taqnatu min rahmati Allah.",
    english: "Do not despair of the mercy of Allah.",
    reference: "Surah Az-Zumar (39:53)",
  },
  {
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    transliteration: "Wa man yatawakkal 'ala Allahi fahuwa hasbuh.",
    english: "Whoever relies upon Allah—He is sufficient for them.",
    reference: "Surah At-Talaq (65:3)",
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    transliteration: "Inna Allaha yuhibbu al-muhsinin.",
    english: "Indeed, Allah loves those who do good.",
    reference: "Surah Al-Baqarah (2:195)",
  },
  {
    arabic: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    transliteration: "Wa rahmati wasi'at kulla shay'.",
    english: "My mercy encompasses all things.",
    reference: "Surah Al-A‘raf (7:156)",
  },
  {
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma.",
    english: "My Lord, increase me in knowledge.",
    reference: "Surah Taha (20:114)",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    transliteration: "Inna Allaha ma'a as-sabirin.",
    english: "Indeed, Allah is with the patient.",
    reference: "Surah Al-Baqarah (2:153)",
  },
  {
    arabic: "إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "Inna Allaha 'ala kulli shay'in qadir.",
    english: "Indeed, Allah is over all things competent.",
    reference: "Surah Al-Baqarah (2:20)",
  },
  {
    arabic: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ",
    transliteration: "Inna rabbi qaribun mujib.",
    english: "Indeed, my Lord is Near and Responsive.",
    reference: "Surah Hud (11:61)",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    transliteration: "Fadhkuruni adhkurkum.",
    english: "So remember Me; I will remember you.",
    reference: "Surah Al-Baqarah (2:152)",
  },
  {
    arabic: "إِنَّ اللَّهَ نِعِمَّا يَعِظُكُم بِهِ",
    transliteration: "Inna Allaha ni'imma ya'izukum bih.",
    english: "Indeed, excellent is that which Allah instructs you.",
    reference: "Surah An-Nisa (4:58)",
  },
  {
    arabic: "إِنَّ إِلَىٰ رَبِّكَ الرُّجْعَىٰ",
    transliteration: "Inna ila rabbika ar-ruj'a.",
    english: "Indeed, to your Lord is the return.",
    reference: "Surah Al-‘Alaq (96:8)",
  },
];

function localCalendarDayNumber(date: Date): number {
  const noon = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0
  );
  const origin = new Date(1970, 0, 1, 12, 0, 0, 0).getTime();
  return Math.floor((noon.getTime() - origin) / 86_400_000);
}

export function getDailyQuranVerse(date: Date = new Date()): QuranVerse {
  const dayNumber = localCalendarDayNumber(date);
  const index =
    ((dayNumber % QURAN_VERSES.length) + QURAN_VERSES.length) %
    QURAN_VERSES.length;
  return QURAN_VERSES[index];
}
