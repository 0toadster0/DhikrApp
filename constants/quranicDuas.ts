export type Dua = {
  id: number;
  arabic: string;
  english: string;
  reference: string;
};

export const QURANIC_DUAS: Dua[] = [
  {
    id: 1,
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    english: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.",
    reference: "Surah Al-A‘raf (7:23)",
  },
  {
    id: 2,
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    english: "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Indeed, You are the Bestower.",
    reference: "Surah Aal-E-Imran (3:8)",
  },
  {
    id: 3,
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    english: "My Lord, increase me in knowledge.",
    reference: "Surah Taha (20:114)",
  },
  {
    id: 4,
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    english: "My Lord, expand my chest and ease my task for me.",
    reference: "Surah Taha (20:25–26)",
  },
  {
    id: 5,
    arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    english: "My Lord, I am in need of whatever good You send down to me.",
    reference: "Surah Al-Qasas (28:24)",
  },
  {
    id: 6,
    arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    reference: "Surah Al-Anbiya (21:87)",
  },
  {
    id: 7,
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ",
    english: "Allah is sufficient for me. There is no deity except Him. Upon Him I rely.",
    reference: "Surah At-Tawbah (9:129)",
  },
  {
    id: 8,
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا",
    english: "Our Lord, pour upon us patience and make our feet firm.",
    reference: "Surah Al-Baqarah (2:250)",
  },
  {
    id: 9,
    arabic: "رَبَّنَا تَقَبَّلْ مِنَّا ۖ إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ",
    english: "Our Lord, accept from us. Indeed, You are the Hearing, the Knowing.",
    reference: "Surah Al-Baqarah (2:127)",
  },
  {
    id: 10,
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
    english: "Our Lord, give us good in this world and good in the Hereafter.",
    reference: "Surah Al-Baqarah (2:201)",
  },
  {
    id: 11,
    arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا",
    english: "Our Lord, do not hold us accountable if we forget or make mistakes.",
    reference: "Surah Al-Baqarah (2:286)",
  },
  {
    id: 12,
    arabic: "وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا",
    english: "Pardon us, forgive us, and have mercy upon us.",
    reference: "Surah Al-Baqarah (2:286)",
  },
  {
    id: 13,
    arabic: "أَنتَ مَوْلَانَا فَانصُرْنَا",
    english: "You are our Protector, so give us victory.",
    reference: "Surah Al-Baqarah (2:286)",
  },
  {
    id: 14,
    arabic: "رَبَّنَا لَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا",
    english: "Our Lord, do not place upon us a burden like that which You placed upon those before us.",
    reference: "Surah Al-Baqarah (2:286)",
  },
  {
    id: 15,
    arabic: "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ",
    english: "Our Lord, do not burden us with that which we have no ability to bear.",
    reference: "Surah Al-Baqarah (2:286)",
  },
  {
    id: 16,
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ",
    english: "Our Lord, forgive me, my parents, and the believers.",
    reference: "Surah Ibrahim (14:41)",
  },
  {
    id: 17,
    arabic: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا",
    english: "Our Lord, perfect for us our light and forgive us.",
    reference: "Surah At-Tahrim (66:8)",
  },
  {
    id: 18,
    arabic: "رَبَّنَا هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً",
    english: "My Lord, grant me from Yourself a good offspring.",
    reference: "Surah Aal-E-Imran (3:38)",
  },
  {
    id: 19,
    arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
    english: "My Lord, do not leave me alone, and You are the best of inheritors.",
    reference: "Surah Al-Anbiya (21:89)",
  },
  {
    id: 20,
    arabic: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا وَارْحَمْنَا",
    english: "Our Lord, we have believed, so forgive us and have mercy upon us.",
    reference: "Surah Aal-E-Imran (3:16)",
  },
  {
    id: 21,
    arabic: "رَبِّ نَجِّنِي مِنَ الْغَمِّ",
    english: "My Lord, save me from distress.",
    reference: "Surah Al-Anbiya (21:88)",
  },
  {
    id: 22,
    arabic: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ",
    english: "My Lord, I seek refuge in You from the incitements of the devils.",
    reference: "Surah Al-Mu’minun (23:97)",
  },
  {
    id: 23,
    arabic: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي",
    english: "My Lord, forgive me and have mercy upon me.",
    reference: "Surah Al-Mu’minun (23:118)",
  },
  {
    id: 24,
    arabic: "رَبِّ لَا تَجْعَلْنِي مِنَ الْقَوْمِ الظَّالِمِينَ",
    english: "My Lord, do not place me among the wrongdoing people.",
    reference: "Surah Al-Qasas (28:21)",
  },
  {
    id: 25,
    arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ",
    english: "Our Lord, turn away from us the punishment of Hell.",
    reference: "Surah Al-Furqan (25:65)",
  },
  {
    id: 26,
    arabic: "رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ",
    english: "My Lord, let me enter in truth and exit in truth.",
    reference: "Surah Al-Isra (17:80)",
  },
  {
    id: 27,
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ",
    english: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me.",
    reference: "Surah An-Naml (27:19)",
  },
  {
    id: 28,
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا",
    english: "Our Lord, do not let our hearts deviate after You have guided us.",
    reference: "Surah Aal-E-Imran (3:8)",
  },
  {
    id: 29,
    arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا",
    english: "Our Lord, forgive us and our brothers who preceded us in faith.",
    reference: "Surah Al-Hashr (59:10)",
  },
  {
    id: 30,
    arabic: "رَبِّ إِنِّي أَعُوذُ بِكَ أَنْ أَسْأَلَكَ مَا لَيْسَ لِي بِهِ عِلْمٌ",
    english: "My Lord, I seek refuge in You from asking that of which I have no knowledge.",
    reference: "Surah Hud (11:47)",
  },
];
