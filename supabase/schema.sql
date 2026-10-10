-- Physique School : création des tables
-- Collez ce script dans Supabase Dashboard > SQL Editor > New query > Run

CREATE TABLE IF NOT EXISTS public.users (
  _id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  "fullName" text NOT NULL,
  track text NOT NULL DEFAULT 'physique',
  level text NOT NULL DEFAULT '1ac',
  role text NOT NULL DEFAULT 'student',
  approved boolean DEFAULT false,
  "createdAt" text,
  "updatedAt" text
);

-- Ajout rétroactif (si la table existait déjà sans ce champ)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS public.lessons (
  _id text PRIMARY KEY,
  title text NOT NULL,
  "titleFr" text,
  chapter text,
  "chapterFr" text,
  "chapterNumber" numeric,
  content text,
  "contentFr" text,
  level text,
  track text,
  duration numeric DEFAULT 0,
  "order" numeric DEFAULT 0,
  "pdfUrl" text,
  published boolean DEFAULT false,
  "createdAt" text,
  "updatedAt" text
);

CREATE TABLE IF NOT EXISTS public.videos (
  _id text PRIMARY KEY,
  title text NOT NULL,
  "titleFr" text,
  description text,
  "descriptionFr" text,
  url text,
  thumbnail text,
  level text,
  track text,
  chapter text,
  "chapterFr" text,
  duration numeric DEFAULT 0,
  "lessonId" text,
  published boolean DEFAULT false,
  "createdAt" text,
  "updatedAt" text
);

CREATE TABLE IF NOT EXISTS public.exercises (
  _id text PRIMARY KEY,
  title text NOT NULL,
  "titleFr" text,
  description text,
  "descriptionFr" text,
  content text,
  "contentFr" text,
  solution text,
  "solutionFr" text,
  level text,
  track text,
  chapter text,
  "chapterFr" text,
  difficulty text DEFAULT 'medium',
  "lessonId" text,
  published boolean DEFAULT false,
  "createdAt" text,
  "updatedAt" text
);

CREATE TABLE IF NOT EXISTS public.homework (
  _id text PRIMARY KEY,
  title text NOT NULL,
  "titleFr" text,
  description text,
  "descriptionFr" text,
  level text,
  track text,
  "fileUrl" text,
  deadline text,
  chapter text,
  "chapterFr" text,
  published boolean DEFAULT false,
  "createdAt" text,
  "updatedAt" text
);

CREATE TABLE IF NOT EXISTS public.progress (
  _id text PRIMARY KEY,
  "userId" text NOT NULL,
  "contentType" text,
  "contentId" text,
  action text,
  "completedAt" text,
  "createdAt" text,
  "updatedAt" text
);

-- Permissions : tout est géré par le service role / anon via les clés API
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Autoriser lecture/écriture via la clé anon (simple pour ce projet éducatif)
CREATE POLICY "public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "public write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "public write lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "public write videos" ON public.videos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "public write exercises" ON public.exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read homework" ON public.homework FOR SELECT USING (true);
CREATE POLICY "public write homework" ON public.homework FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public read progress" ON public.progress FOR SELECT USING (true);
CREATE POLICY "public write progress" ON public.progress FOR ALL USING (true) WITH CHECK (true);
