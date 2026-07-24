export const TRACKS = {
  IDADI: 'idadi',
  TAWAHILI: 'tawahili',
} as const;

export type TrackType = typeof TRACKS[keyof typeof TRACKS];

export const LEVELS = {
  // Collège (Idadi)
  '1AC': '1ac',
  '2AC': '2ac',
  '3AC': '3ac',
  // Lycée (Tawahili)
  'TCSF': 'tcsf',
  '1BACSEF': '1bacsef',
  '1BACSMF': '1bacsmf',
  '2BACSPF': '2bacspf',
  '2BACSVTF': '2bacsvtf',
  '2BACSMF': '2bacsmf',
} as const;

export type LevelType = typeof LEVELS[keyof typeof LEVELS];

export interface TrackLevelConfig {
  track: TrackType;
  trackNameAr: string;
  trackNameFr: string;
  levels: {
    id: LevelType;
    nameAr: string;
    nameFr: string;
    code: string;
  }[];
}

export const TRACK_LEVEL_CONFIG: TrackLevelConfig[] = [
  {
    track: TRACKS.IDADI,
    trackNameAr: 'السلك الإعدادي',
    trackNameFr: 'Collège',
    levels: [
      { id: LEVELS['1AC'], nameAr: 'الأولى إعدادي', nameFr: '1ère Année Collège', code: '1AC' },
      { id: LEVELS['2AC'], nameAr: 'الثانية إعدادي', nameFr: '2ème Année Collège', code: '2AC' },
      { id: LEVELS['3AC'], nameAr: 'الثالثة إعدادي', nameFr: '3ème Année Collège', code: '3AC' },
    ],
  },
  {
    track: TRACKS.TAWAHILI,
    trackNameAr: 'السلك التأهيلي',
    trackNameFr: 'Lycée',
    levels: [
      { id: LEVELS['TCSF'], nameAr: 'جذع مشترك علمي خيار فرنسية', nameFr: 'Tronc Commun Scientifique Français', code: 'TCSF' },
      { id: LEVELS['1BACSEF'], nameAr: 'الأولى بكالوريا العلوم التجريبية خيار فرنسية', nameFr: '1ère Bac Sciences Expérimentales Français', code: '1BACSEF' },
      { id: LEVELS['1BACSMF'], nameAr: 'الأولى بكالوريا العلوم الرياضية خيار فرنسية', nameFr: '1ère Bac Sciences Mathématiques Français', code: '1BACSMF' },
      { id: LEVELS['2BACSPF'], nameAr: 'الثانية بكالوريا العلوم الفيزيائية خيار فرنسية', nameFr: '2ème Bac Sciences Physiques Français', code: '2BACSPF' },
      { id: LEVELS['2BACSVTF'], nameAr: 'الثانية بكالوريا علوم الحياة والأرض خيار فرنسية', nameFr: '2ème Bac Sciences de la Vie et de la Terre Français', code: '2BACSVTF' },
      { id: LEVELS['2BACSMF'], nameAr: 'الثانية بكالوريا العلوم الرياضية خيار فرنسية', nameFr: '2ème Bac Sciences Mathématiques Français', code: '2BACSMF' },
    ],
  },
];

export function getLevelConfig(levelId: LevelType) {
  for (const track of TRACK_LEVEL_CONFIG) {
    const level = track.levels.find((l) => l.id === levelId);
    if (level) {
      return { ...level, track: track.track, trackNameAr: track.trackNameAr, trackNameFr: track.trackNameFr };
    }
  }
  return null;
}
