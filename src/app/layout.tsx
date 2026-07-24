import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Physique School - Plateforme d\'apprentissage de la physique',
  description: 'Site éducatif pour la physique - Cours, vidéos, exercices et devoirs pour le collège et le lycée',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
