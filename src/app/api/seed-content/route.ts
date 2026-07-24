import { NextResponse } from 'next/server';
import { lessons, videos, exercises, homework } from '@/lib/collections';

const LESSONS = [
  // === 1AC (1ère Année Collège) ===
  {
    title: "La Mesure", titleFr: "La Mesure",
    chapter: "Chapitre 1", chapterFr: "Chapitre 1",
    chapterNumber: 1,
    content: "La mesure", contentFr: "La mesure en physique consiste à comparer une grandeur à une unité de référence. On distingue les grandeurs scalaires (masse, temps, température) des grandeurs vectorielles (vitesse, force, acceleration).\n\nLes instruments de mesure :\n- La règle graduée (longueur) : précision au mm\n- La balance (masse) : précision au g\n- Le chronomètre (temps) : précision à la seconde\n\nL'incertitude absolue et relative :\n- Incertitude absolue : Δx = (plus petite division) / 2\n- Incertitude relative : ε = Δx / x\n\nLes grandeurs dérivées :\n- Vitesse = distance / temps (m/s)\n- Aire = longueur × largeur (m²)\n- Volume = longueur × largeur × hauteur (m³)",
    level: "1ac", track: "idadi", duration: 45, order: 1,
  },
  {
    title: "La Vitesse", titleFr: "La Vitesse",
    chapter: "Chapitre 2", chapterFr: "Chapitre 2",
    chapterNumber: 2,
    content: "La vitesse", contentFr: "La vitesse est une grandeur qui caractérise la rapidité d'un mouvement.\n\nDéfinition :\nv = d / t\n\nUnité : m/s (mètre par seconde)\n\nMouvement uniforme : vitesse constante, trajectoire rectiligne.\nLa distance parcourue : d = v × t\n\nExemple :\nUn voiturier parcourt 120 m en 30 s.\nv = 120 / 30 = 4 m/s\n\nGraphique d-t pour un mouvement uniforme : droite passant par l'origine.\npente = vitesse",
    level: "1ac", track: "idadi", duration: 50, order: 2,
  },
  {
    title: "Les États de la Matière", titleFr: "Les États de la Matière",
    chapter: "Chapitre 3", chapterFr: "Chapitre 3",
    chapterNumber: 3,
    content: "Les états de la matière", contentFr: "La matière se présente sous trois états principaux :\n\n1. L'état solide :\n- Volume propre, forme propre\n- Atomes/molécules serrés et ordonnés\n- Exemples : fer, glace, bois\n\n2. L'état liquide :\n- Volume propre, pas de forme propre\n- Atomes/molécules proches mais désordonnés\n- Exemples : eau, mercure, huile\n\n3. L'état gazeux :\n- Pas de volume propre, pas de forme propre\n- Atomes/molécules éloignés et en mouvement\n- Exemples : oxygène, azote, vapeur d'eau\n\nTransitions :\n- Fusion : solide → liquide\n- Solidification : liquide → solide\n- Vaporisation : liquide → gaz\n- Condensation : gaz → liquide\n- Sublimation : solide → gaz\n- Dépôt : gaz → solide",
    level: "1ac", track: "idadi", duration: 40, order: 3,
  },
  // === TCSF (Tronc Commun Scientifique Français) ===
  {
    title: "Cinématique du Point Matériel", titleFr: "Cinématique du Point Matériel",
    chapter: "Chapitre 1", chapterFr: "Chapitre 1",
    chapterNumber: 1,
    content: "Cinématique", contentFr: "La cinématique étudie les mouvements sans chercher leurs causes.\n\n1. Position et repérage :\n- Système d'axes (repère)\n- Vecteur position : OM → r⃗\n- Déplacement : Δr⃗ = r⃗(t₂) - r⃗(t₁)\n\n2. Trajectoire :\n- Ligne décrite par le point matériel\n- Rectiligne ou curviligne\n\n3. Allure du mouvement :\n- Uniforme : vitesse constante\n- Accéléré : vitesse croissante\n- Décéléré : vitesse décroissante\n\n4. Vitesse : v⃗ = d⃗/dt\n- Vitesse instantanée : v⃗(t)\n- Vitesse moyenne : V⃗ = Δr⃗/Δt\n\n5. Accélération : a⃗ = dv⃗/dt",
    level: "tcsf", track: "tawahili", duration: 55, order: 1,
  },
  {
    title: "Mouvement Uniformément Accéléré (MUA)", titleFr: "Mouvement Uniformément Accéléré (MUA)",
    chapter: "Chapitre 2", chapterFr: "Chapitre 2",
    chapterNumber: 2,
    content: "MUA", contentFr: "Le mouvement uniformément accéléré est un mouvement rectiligne dont l'accélération est constante en norme et en direction.\n\nCaractéristiques :\n- a⃗ = cste → a = cste ≠ 0\n- Trajectoire : rectiligne\n- Allure : accéléré ou décéléré\n\nÉquations du MUA :\n1. Vitesse : v⃗ = v⃗₀ + a⃗·t\n   v = v₀ + at\n2. Position : x⃗ = x⃗₀ + v⃗₀·t + ½·a⃗·t²\n   x = x₀ + v₀·t + ½·a·t²\n3. Élimination du temps : v² = v₀² + 2·a·(x - x₀)\n\nCas particulier :\n- Chute libre (a = g = 10 m/s²)\n- Lâcher initial : v₀ = 0\n\nExemple :\nUn mobile part du repos (v₀=0) avec a = 4 m/s².\nAprès 5 s : v = 0 + 4×5 = 20 m/s\nx = 0 + 0×5 + ½×4×25 = 50 m",
    level: "tcsf", track: "tawahili", duration: 60, order: 2,
  },
  {
    title: "La Dynamique - Loi Fondamentale", titleFr: "La Dynamique - Loi Fondamentale",
    chapter: "Chapitre 3", chapterFr: "Chapitre 3",
    chapterNumber: 3,
    content: "Dynamique", contentFr: "La loi fondamentale de la dynamique (2e loi de Newton) :\n\nΣF⃗ = m·a⃗\n\nLa somme vectorielle de toutes les forces appliquées à un corps est égale au produit de sa masse par son accélération.\n\nConditions d'application :\n- Masse constante\n- Vitesse << c (vitesse de la lumière)\n- Référentiel galiléen\n\nApplications :\n\n1. Mouvement horizontal sans frottement :\nF = m·a → a = F/m\n\n2. Mouvement vertical (chute libre) :\nmg - 0 = m·a → a = g\n\n3. Pente inclinée (sans frottement) :\nmg·sin(θ) = m·a → a = g·sin(θ)\n\n4. Poids et masse :\nP⃗ = m·g⃗\n|P⃗| = m·g (g = 10 m/s²)\n\nExemple :\nUn bloc de 5 kg est soumis à une force de 20 N horizontalement.\na = F/m = 20/5 = 4 m/s²",
    level: "tcsf", track: "tawahili", duration: 55, order: 3,
  },
];

const EXERCISES = [
  // === 1AC ===
  {
    title: "Exercice : Calcul de vitesse", titleFr: "Exercice : Calcul de vitesse",
    description: "Exercices sur la vitesse et le mouvement uniforme", descriptionFr: "Exercices sur la vitesse et le mouvement uniforme",
    content: "Exercice 1 :\nUn cyclist parcourt 15 km en 0,5 h. Calcule sa vitesse en m/s.\n\nExercice 2 :\nUne voiture roule à une vitesse constante de 72 km/h. Quelle distance parcourt-elle en 15 minutes ?\n\nExercice 3 :\nUn piéton marche à 4 km/h. Combien de temps met-il pour parcourir 2 km ?",
    contentFr: "Exercice 1 :\nUn cyclist parcourt 15 km en 0,5 h. Calcule sa vitesse en m/s.\n\nExercice 2 :\nUne voiture roule à une vitesse constante de 72 km/h. Quelle distance parcourt-elle en 15 minutes ?\n\nExercice 3 :\nUn piéton marche à 4 km/h. Combien de temps met-il pour parcourir 2 km ?",
    solution: "Correction :\n\nEx 1 :\nv = d/t = 15 000 m / (0,5 × 3600 s) = 15 000 / 1800 = 8,33 m/s\n\nEx 2 :\nd = v × t = 72 × (15/60) = 72 × 0,25 = 18 km\n\nEx 3 :\nt = d/v = 2/4 = 0,5 h = 30 minutes",
    solutionFr: "Correction :\n\nEx 1 :\nv = d/t = 15 000 m / (0,5 × 3600 s) = 15 000 / 1800 = 8,33 m/s\n\nEx 2 :\nd = v × t = 72 × (15/60) = 72 × 0,25 = 18 km\n\nEx 3 :\nt = d/v = 2/4 = 0,5 h = 30 minutes",
    level: "1ac", track: "idadi", chapter: "Chapitre 2", chapterFr: "Chapitre 2",
    difficulty: "easy",
  },
  {
    title: "Exercice : États de la matière", titleFr: "Exercice : États de la matière",
    description: "Identifier les états de la matière", descriptionFr: "Identifier les états de la matière",
    content: "Exercice :\nClassez les objets suivants selon leur état physique :\n\n1. L'eau qui bout → ?\n2. Le fer fondu → ?\n3. L'air dans une chambre → ?\n4. La neige → ?\n5. Le pétrole → ?\n6. La fumée → ?\n\nQuel est l'état de la matière de :\na) Un diamant ?\nb) Le mercure dans un thermomètre ?\nc) Le gaz dans un briquet ?",
    contentFr: "Exercice :\nClassez les objets suivants selon leur état physique :\n\n1. L'eau qui bout → ?\n2. Le fer fondu → ?\n3. L'air dans une chambre → ?\n4. La neige → ?\n5. Le pétrole → ?\n6. La fumée → ?\n\nQuel est l'état de la matière de :\na) Un diamant ?\nb) Le mercure dans un thermomètre ?\nc) Le gaz dans un briquet ?",
    solution: "Correction :\n1. L'eau qui bout → Gaz (vapeur d'eau)\n2. Le fer fondu → Liquide\n3. L'air dans une chambre → Gaz\n4. La neige → Solide\n5. Le pétrole → Liquide\n6. La fumée → Mélange gaz + particules solides\n\na) Le diamant → Solide\nb) Le mercure → Liquide\nc) Le gaz dans un briquet → Gaz",
    solutionFr: "Correction :\n1. L'eau qui bout → Gaz (vapeur d'eau)\n2. Le fer fondu → Liquide\n3. L'air dans une chambre → Gaz\n4. La neige → Solide\n5. Le pétrole → Liquide\n6. La fumée → Mélange gaz + particules solides\n\na) Le diamant → Solide\nb) Le mercure → Liquide\nc) Le gaz dans un briquet → Gaz",
    level: "1ac", track: "idadi", chapter: "Chapitre 3", chapterFr: "Chapitre 3",
    difficulty: "easy",
  },
  {
    title: "Exercice : Incertitudes", titleFr: "Exercice : Incertitudes",
    description: "Calcul d'incertitudes", descriptionFr: "Calcul d'incertitudes",
    content: "Exercice :\nOn mesure la longueur d'un crayon avec une règle millimétrée.\nLecture : 17,3 cm\n\n1. Quelle est l'incertitude absolue ?\n2. Quelle est l'incertitude relative ?\n3. Donner le résultat sous la forme x = (x ± Δx) avec le bon nombre de chiffres significatifs.",
    contentFr: "Exercice :\nOn mesure la longueur d'un crayon avec une règle millimétrée.\nLecture : 17,3 cm\n\n1. Quelle est l'incertitude absolue ?\n2. Quelle est l'incertitude relative ?\n3. Donner le résultat sous la forme x = (x ± Δx) avec le bon nombre de chiffres significatifs.",
    solution: "Correction :\n1. La plus petite division = 1 mm = 0,1 cm\n   Δx = 0,1 / 2 = 0,05 cm\n\n2. ε = Δx / x = 0,05 / 17,3 ≈ 0,003 ≈ 0,3%\n\n3. L = (17,30 ± 0,05) cm",
    solutionFr: "Correction :\n1. La plus petite division = 1 mm = 0,1 cm\n   Δx = 0,1 / 2 = 0,05 cm\n\n2. ε = Δx / x = 0,05 / 17,3 ≈ 0,003 ≈ 0,3%\n\n3. L = (17,30 ± 0,05) cm",
    level: "1ac", track: "idadi", chapter: "Chapitre 1", chapterFr: "Chapitre 1",
    difficulty: "medium",
  },
  // === TCSF ===
  {
    title: "Exercice : MUA - Chute libre", titleFr: "Exercice : MUA - Chute libre",
    description: "Exercices sur le mouvement uniformément accéléré", descriptionFr: "Exercices sur le mouvement uniformément accéléré",
    content: "Exercice 1 :\nUn objet est lâché du repos du sommet d'une tour de 80 m (g = 10 m/s²).\na) Calculer la vitesse à l'impact.\nb) Calculer le temps de chute.\n\nc) Calculer la vitesse après 2 s.\n\nExercice 2 :\nUne voiture roule à 108 km/h et freine uniformément pendant 6 s pour s'arrêter.\na) Calculer l'accélération.\nb) Calculer la distance de freinage.",
    contentFr: "Exercice 1 :\nUn objet est lâché du repos du sommet d'une tour de 80 m (g = 10 m/s²).\na) Calculer la vitesse à l'impact.\nb) Calculer le temps de chute.\n\nc) Calculer la vitesse après 2 s.\n\nExercice 2 :\nUne voiture roule à 108 km/h et freine uniformément pendant 6 s pour s'arrêter.\na) Calculer l'accélération.\nb) Calculer la distance de freinage.",
    solution: "Correction Ex1 :\na) v² = v₀² + 2gh = 0 + 2×10×80 = 1600 → v = 40 m/s\nb) v = gt → t = v/g = 40/10 = 4 s\nc) v = gt = 10×2 = 20 m/s\n\nCorrection Ex2 :\nv₀ = 108 km/h = 30 m/s\nv = 0 m/s\nt = 6 s\n\na) v = v₀ + at → 0 = 30 + a×6 → a = -5 m/s²\nb) d = v₀t + ½at² = 30×6 + ½×(-5)×36 = 180 - 90 = 90 m",
    solutionFr: "Correction Ex1 :\na) v² = v₀² + 2gh = 0 + 2×10×80 = 1600 → v = 40 m/s\nb) v = gt → t = v/g = 40/10 = 4 s\nc) v = gt = 10×2 = 20 m/s\n\nCorrection Ex2 :\nv₀ = 108 km/h = 30 m/s\nv = 0 m/s\nt = 6 s\n\na) v = v₀ + at → 0 = 30 + a×6 → a = -5 m/s²\nb) d = v₀t + ½at² = 30×6 + ½×(-5)×36 = 180 - 90 = 90 m",
    level: "tcsf", track: "tawahili", chapter: "Chapitre 2", chapterFr: "Chapitre 2",
    difficulty: "medium",
  },
  {
    title: "Exercice : Loi fondamentale de la dynamique", titleFr: "Exercice : Loi fondamentale de la dynamique",
    description: "Applications de ΣF = ma", descriptionFr: "Applications de ΣF = ma",
    content: "Exercice 1 :\nUn bloc de 10 kg glisse sur un plan horizontal sans frottement sous l'effet d'une force F = 30 N.\na) Calculer l'accélération.\nb) Calculer la vitesse après 4 s.\nc) Calculer la distance parcourue en 4 s.\n\nExercice 2 :\nDeux forces F₁ = 50 N et F₂ = 30 N s'opposent sur un corps de 10 kg.\na) Calculer la force résultante.\nb) Calculer l'accélération.\nc) Dans quelle direction se déplace le corps ?",
    contentFr: "Exercice 1 :\nUn bloc de 10 kg glisse sur un plan horizontal sans frottement sous l'effet d'une force F = 30 N.\na) Calculer l'accélération.\nb) Calculer la vitesse après 4 s.\nc) Calculer la distance parcourue en 4 s.\n\nExercice 2 :\nDeux forces F₁ = 50 N et F₂ = 30 N s'opposent sur un corps de 10 kg.\na) Calculer la force résultante.\nb) Calculer l'accélération.\nc) Dans quelle direction se déplace le corps ?",
    solution: "Correction Ex1 :\na) F = ma → a = F/m = 30/10 = 3 m/s²\nb) v = v₀ + at = 0 + 3×4 = 12 m/s\nc) x = ½at² = ½×3×16 = 24 m\n\nCorrection Ex2 :\na) F_r = F₁ - F₂ = 50 - 30 = 20 N\nb) a = F_r/m = 20/10 = 2 m/s²\nc) Le corps se déplace dans le sens de F₁ (la force la plus grande)",
    solutionFr: "Correction Ex1 :\na) F = ma → a = F/m = 30/10 = 3 m/s²\nb) v = v₀ + at = 0 + 3×4 = 12 m/s\nc) x = ½at² = ½×3×16 = 24 m\n\nCorrection Ex2 :\na) F_r = F₁ - F₂ = 50 - 30 = 20 N\nb) a = F_r/m = 20/10 = 2 m/s²\nc) Le corps se déplace dans le sens de F₁ (la force la plus grande)",
    level: "tcsf", track: "tawahili", chapter: "Chapitre 3", chapterFr: "Chapitre 3",
    difficulty: "medium",
  },
  {
    title: "Exercice : Cinématique", titleFr: "Exercice : Cinématique",
    description: "Exercices sur le repérage et la vitesse", descriptionFr: "Exercices sur le repérage et la vitesse",
    content: "Exercice :\nUn point matériel M se déplace selon l'équation : x(t) = 3t² + 2t + 1 (en m)\n\n1. Calculer la position à t = 0, 1s, 2s, 3s.\n2. Calculer le déplacement entre t=0 et t=2s.\n3. Calculer la vitesse moyenne entre t=0 et t=2s.\n4. Calculer la vitesse instantanée à t=2s.\n5. Calculer l'accélération à t=2s.",
    contentFr: "Exercice :\nUn point matériel M se déplace selon l'équation : x(t) = 3t² + 2t + 1 (en m)\n\n1. Calculer la position à t = 0, 1s, 2s, 3s.\n2. Calculer le déplacement entre t=0 et t=2s.\n3. Calculer la vitesse moyenne entre t=0 et t=2s.\n4. Calculer la vitesse instantanée à t=2s.\n5. Calculer l'accélération à t=2s.",
    solution: "Correction :\n\n1. Positions :\nx(0) = 3(0)² + 2(0) + 1 = 1 m\nx(1) = 3(1)² + 2(1) + 1 = 6 m\nx(2) = 3(2)² + 2(2) + 1 = 17 m\nx(3) = 3(3)² + 2(3) + 1 = 34 m\n\n2. Δx = x(2) - x(0) = 17 - 1 = 16 m\n\n3. V_moy = Δx/Δt = 16/2 = 8 m/s\n\n4. v(t) = dx/dt = 6t + 2\n   v(2) = 6(2) + 2 = 14 m/s\n\n5. a(t) = dv/dt = 6\n   a(2) = 6 m/s² (constante)",
    solutionFr: "Correction :\n\n1. Positions :\nx(0) = 3(0)² + 2(0) + 1 = 1 m\nx(1) = 3(1)² + 2(1) + 1 = 6 m\nx(2) = 3(2)² + 2(2) + 1 = 17 m\nx(3) = 3(3)² + 2(3) + 1 = 34 m\n\n2. Δx = x(2) - x(0) = 17 - 1 = 16 m\n\n3. V_moy = Δx/Δt = 16/2 = 8 m/s\n\n4. v(t) = dx/dt = 6t + 2\n   v(2) = 6(2) + 2 = 14 m/s\n\n5. a(t) = dv/dt = 6\n   a(2) = 6 m/s² (constante)",
    level: "tcsf", track: "tawahili", chapter: "Chapitre 1", chapterFr: "Chapitre 1",
    difficulty: "hard",
  },
];

const HOMEWORK = [
  // === 1AC ===
  {
    title: "Devoir n°1 - La Mesure et la Vitesse", titleFr: "Devoir n°1 - La Mesure et la Vitesse",
    description: "Exercices sur la mesure et le mouvement uniforme", descriptionFr: "Exercices sur la mesure et le mouvement uniforme",
    level: "1ac", track: "idadi",
    fileUrl: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    chapter: "Chapitre 1 & 2", chapterFr: "Chapitre 1 & 2",
  },
  {
    title: "Devoir n°2 - États de la matière", titleFr: "Devoir n°2 - États de la matière",
    description: "Exercices sur les trois états de la matière", descriptionFr: "Exercices sur les trois états de la matière",
    level: "1ac", track: "idadi",
    fileUrl: "",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    chapter: "Chapitre 3", chapterFr: "Chapitre 3",
  },
  // === TCSF ===
  {
    title: "Devoir n°1 - Cinématique et MUA", titleFr: "Devoir n°1 - Cinématique et MUA",
    description: "Exercices de synthèse sur la cinématique", descriptionFr: "Exercices de synthèse sur la cinématique",
    level: "tcsf", track: "tawahili",
    fileUrl: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    chapter: "Chapitre 1 & 2", chapterFr: "Chapitre 1 & 2",
  },
  {
    title: "Devoir n°2 - Dynamique", titleFr: "Devoir n°2 - Dynamique",
    description: "Exercices sur la loi fondamentale de la dynamique", descriptionFr: "Exercices sur la loi fondamentale de la dynamique",
    level: "tcsf", track: "tawahili",
    fileUrl: "",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    chapter: "Chapitre 3", chapterFr: "Chapitre 3",
  },
];

const VIDEOS = [
  // === 1AC ===
  {
    title: "Leçon : La Mesure", titleFr: "Leçon : La Mesure",
    description: "Cours complet sur la mesure en physique", descriptionFr: "Cours complet sur la mesure en physique",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    level: "1ac", track: "idadi", duration: 12,
  },
  {
    title: "Leçon : La Vitesse et le mouvement uniforme", titleFr: "Leçon : La Vitesse et le mouvement uniforme",
    description: "Explication détaillée de la vitesse", descriptionFr: "Explication détaillée de la vitesse",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    level: "1ac", track: "idadi", duration: 15,
  },
  // === TCSF ===
  {
    title: "Cinématique : Introduction", titleFr: "Cinématique : Introduction",
    description: "Introduction à la cinématique du point matériel", descriptionFr: "Introduction à la cinématique du point matériel",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    level: "tcsf", track: "tawahili", duration: 20,
  },
  {
    title: "MUA : Mouvement Uniformément Accéléré", titleFr: "MUA : Mouvement Uniformément Accéléré",
    description: "Cours complet sur le MUA", descriptionFr: "Cours complet sur le MUA",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    level: "tcsf", track: "tawahili", duration: 25,
  },
  {
    title: "Dynamique : Loi de Newton", titleFr: "Dynamique : Loi de Newton",
    description: "La loi fondamentale de la dynamique expliquée", descriptionFr: "La loi fondamentale de la dynamique expliquée",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    level: "tcsf", track: "tawahili", duration: 22,
  },
];

export async function GET() {
  try {
    let counts = { lessons: 0, exercises: 0, homework: 0, videos: 0 };

    for (const l of LESSONS) {
      await lessons.create({ ...l, published: true } as any);
      counts.lessons++;
    }
    for (const e of EXERCISES) {
      await exercises.create({ ...e, published: true } as any);
      counts.exercises++;
    }
    for (const h of HOMEWORK) {
      await homework.create({ ...h, published: true } as any);
      counts.homework++;
    }
    for (const v of VIDEOS) {
      await videos.create({ ...v, published: true } as any);
      counts.videos++;
    }

    return NextResponse.json({
      message: "Contenu ajouté avec succès",
      counts,
    });
  } catch (error) {
    console.error("Seed content error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
