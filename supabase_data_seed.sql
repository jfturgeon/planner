-- =====================================================================
-- PLANIFICATEUR ANNUEL - Seed Data (Test/Example Data)
-- Version 1.3.4 - Generated 2026-03-11
-- =====================================================================
-- 
-- Ce fichier crée des données d'exemple pour tester la structure
-- À adapter selon les UUID utilisateurs réels
-- 
-- ⚠️ IMPORTANT - AVANT D'EXÉCUTER CE SCRIPT:
-- =====================================================================
-- 
-- 1. CRÉER LES UTILISATEURS DANS SUPABASE AUTH D'ABORD:
--    - Aller dans Supabase Dashboard → Authentication → Users
--    - Créer au moins 2 utilisateurs (ou inviter via email)
--    - Noter les UUID générés
-- 
-- 2. REMPLACER LES UUIDs DANS CE SCRIPT:
--    CTRL+H (Find and Replace) puis:
--    - Remplacer: 550e8400-e29b-41d4-a716-446655440000
--    - Par: Votre vrai UUID (depuis auth.users)
--    
--    - Remplacer: 550e8400-e29b-41d4-a716-446655440001
--    - Par: Votre 2e UUID (si vous avez 2 utilisateurs)
-- 
-- 3. COMMENT OBTENIR LES UUIDs RÉELS:
--    Exécuter cette requête dans Supabase SQL Editor:
--    SELECT id, email FROM auth.users;
-- 
-- =====================================================================

-- =====================================================================
-- 1. USER PROFILES - AUTO-GÉNÉRÉS PAR SUPABASE AUTH
-- =====================================================================
-- NOTE: Les user_profiles sont créés automatiquement par Supabase
-- quand un utilisateur se crée via Supabase Auth.
-- Vous n'avez pas besoin de créer manuellement les user_profiles.
-- 
-- Si vous devez mettre à jour les profils existants:
/*
UPDATE user_profiles 
SET language = 'fr', theme = 'light'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

UPDATE user_profiles 
SET language = 'fr', theme = 'dark'
WHERE id = '550e8400-e29b-41d4-a716-446655440001';
*/

-- =====================================================================
-- 2. PLANNER DATA - Données d'agenda 2026
-- =====================================================================
INSERT INTO planner_data (user_id, year, data)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  2026,
  $${
    "2026-03-10": {
      "tasks": [
        {"text": "Réunion d'équipe", "done": false, "priority": "urgent"},
        {"text": "Rapport mensuel", "done": true, "priority": "normal"},
        {"text": "Appel client", "done": false, "priority": "normal"}
      ],
      "notes": "Journée chargée - réunions importantes"
    },
    "2026-03-11": {
      "tasks": [
        {"text": "Présentation", "done": false, "priority": "urgent"},
        {"text": "Révision budget", "done": false, "priority": "high"}
      ],
      "notes": "Présentation au directeur"
    },
    "2026-03-12": {
      "tasks": [
        {"text": "Déjeuner client", "done": false, "priority": "normal"}
      ],
      "notes": ""
    },
    "2026-03-13": {
      "tasks": [],
      "notes": "Repos - week-end"
    }
  }$$::jsonb
)
ON CONFLICT (user_id, year) DO NOTHING;

-- =====================================================================
-- 3. WEEKLY DATA - Habitudes hebdomadaires
-- =====================================================================
INSERT INTO weekly_data (user_id, week_key, data)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '2026-W10',
  $${
    "habits": [
      {
        "name": "Sport",
        "color": "#2d6bbf",
        "track": {
          "2026-03-09": true,
          "2026-03-10": false,
          "2026-03-11": true,
          "2026-03-12": true,
          "2026-03-13": false,
          "2026-03-14": true,
          "2026-03-15": true
        }
      },
      {
        "name": "Méditation",
        "color": "#2a7a4b",
        "track": {
          "2026-03-09": true,
          "2026-03-10": true,
          "2026-03-11": false,
          "2026-03-12": true,
          "2026-03-13": true,
          "2026-03-14": true,
          "2026-03-15": true
        }
      },
      {
        "name": "Lecture",
        "color": "#8b7355",
        "track": {
          "2026-03-09": true,
          "2026-03-10": false,
          "2026-03-11": true,
          "2026-03-12": true,
          "2026-03-13": false,
          "2026-03-14": true,
          "2026-03-15": false
        }
      }
    ],
    "weekTodos": [
      {
        "id": "todo_001",
        "text": "Préparer présentation",
        "done": false,
        "statusId": "doing"
      },
      {
        "id": "todo_002",
        "text": "Appeler fournisseur",
        "done": true,
        "statusId": "done"
      },
      {
        "id": "todo_003",
        "text": "Valider contrat",
        "done": false,
        "statusId": "todo"
      }
    ],
    "filters": {
      "show": "all",
      "priority": "normal"
    }
  }$$::jsonb
)
ON CONFLICT (user_id, week_key) DO NOTHING;

-- =====================================================================
-- 4. DAY EVENTS - Événements spécifiques
-- =====================================================================
INSERT INTO day_events (user_id, day_key, data)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '2026-03-10',
  $${
    "events": [
      {
        "id": "ev_001",
        "title": "Réunion direction",
        "time": "09:30",
        "allDay": false,
        "description": "Sync avec le management",
        "color": "#2d6bbf"
      },
      {
        "id": "ev_002",
        "title": "Déjeuner équipe",
        "time": "12:00",
        "allDay": false,
        "description": "Restaurant du coin",
        "color": "#2a7a4b"
      },
      {
        "id": "ev_003",
        "title": "Anniversaire Sophie",
        "allDay": true,
        "fromContact": true,
        "color": "#e74c3c"
      }
    ]
  }$$::jsonb
),
(
  '550e8400-e29b-41d4-a716-446655440000',
  '2026-03-15',
  $${
    "events": [
      {
        "id": "ev_004",
        "title": "Sprint planning",
        "time": "14:00",
        "allDay": false,
        "description": "Planning pour la prochaine sprint",
        "color": "#f39c12"
      }
    ]
  }$$::jsonb
)
ON CONFLICT (user_id, day_key) DO NOTHING;

-- =====================================================================
-- 5. HABITS - Habitudes globales
-- =====================================================================
INSERT INTO habits (user_id, name, color)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Sport', '#2d6bbf'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Méditation', '#2a7a4b'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Lecture', '#8b7355'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Hydratation', '#3498db'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Sommeil', '#9b59b6')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 6. CONTACTS - Base de contacts avec anniversaires
-- =====================================================================
INSERT INTO contacts (user_id, first_name, last_name, birth_year, birth_month, birth_day, tags)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Sophie', 'Turgeon', 1985, 3, 10, ARRAY['Famille']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Pierre', 'Carrier', 1982, 7, 15, ARRAY['Ami', 'Collègue']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Catherine', 'Dubois', 1990, 5, 22, ARRAY['Famille']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Marc', 'Dion', 1978, 11, 3, ARRAY['Ami']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Emma', 'Garcia', 1995, 1, 18, ARRAY['Collègue']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Tom', 'Cruise', 1962, 12, 3, ARRAY['Célébrité']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Angelina', 'Jolie', 1975, 6, 4, ARRAY['Célébrité']),
  ('550e8400-e29b-41d4-a716-446655440000', 'Jack', 'Nicholson', 1937, 4, 22, ARRAY['Célébrité'])
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 7. KANBAN STATUSES - Statuses par défaut
-- =====================================================================
INSERT INTO kanban_statuses (user_id, status_id, label, color, position)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'todo', 'À faire', '#8b7355', 0),
  ('550e8400-e29b-41d4-a716-446655440000', 'doing', 'En cours', '#2d6bbf', 1),
  ('550e8400-e29b-41d4-a716-446655440000', 'done', 'Complété', '#2a7a4b', 2)
ON CONFLICT (user_id, status_id) DO NOTHING;

-- =====================================================================
-- 8. KANBAN CARDS - Objectifs 2026
-- =====================================================================
INSERT INTO kanban_cards (user_id, card_id, title, description, year, status_id, color, position_order)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_001', 'Finir projet A', 'Terminer le projet A avant juin', 2026, 'doing', '#2d6bbf', 1),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_002', 'Apprendre TypeScript', 'Suivre un cours et faire 3 projets', 2026, 'doing', '#3498db', 2),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_003', 'Lire 12 livres', 'Au moins 1 livre par mois', 2026, 'todo', '#8b7355', 3),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_004', 'Présenter conférence', 'Parler à 100 personnes minimum', 2026, 'todo', '#e74c3c', 4),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_005', 'Améliorer fitness', '5kg de muscle, 10kg de graisse', 2026, 'doing', '#27ae60', 5),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_006', 'Voyager', 'Visiter 3 pays en 2026', 2026, 'todo', '#9b59b6', 6),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_007', 'Refactorer codebase', 'Nettoyer et documenter', 2026, 'done', '#2a7a4b', 7),
  ('550e8400-e29b-41d4-a716-446655440000', 'kb_008', 'Investir', '5000€ en bourse cette année', 2026, 'done', '#16a085', 8)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 9. TRACKER EPISODES - Episodes regardés
-- =====================================================================
INSERT INTO tracker_episodes (user_id, show_id, series_id, season_number, episode_number, watched, watched_at, notes)
VALUES 
  -- TNG (The Next Generation)
  ('550e8400-e29b-41d4-a716-446655440000', 'startrek', 'tng', 1, 1, true, '2026-02-01 18:30:00+00:00', 'Excellent démarrage'),
  ('550e8400-e29b-41d4-a716-446655440000', 'startrek', 'tng', 1, 2, true, '2026-02-02 19:00:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'startrek', 'tng', 1, 3, true, '2026-02-03 20:15:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'startrek', 'tng', 1, 4, true, '2026-02-10 19:30:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'startrek', 'tng', 1, 5, false, null, ''),
  
  -- X-Files
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 1, 1, true, '2026-03-01 20:00:00+00:00', 'Classique'),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 1, 2, true, '2026-03-02 21:00:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 1, 3, false, null, ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 1, 4, false, null, ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 6, 4, true, '2026-02-15 19:00:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 6, 5, true, '2026-02-16 19:30:00+00:00', ''),
  ('550e8400-e29b-41d4-a716-446655440000', 'xfiles', 'xf', 6, 6, true, '2026-02-17 20:00:00+00:00', '')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 10. TRACKER SCHEDULE - Calendrier d'épisodes
-- =====================================================================
INSERT INTO tracker_schedule (user_id, day_key, show_id, series_id, season_number, episode_number, scheduled_date)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '2026-03-10', 'startrek', 'tng', 1, 6, '2026-03-10'),
  ('550e8400-e29b-41d4-a716-446655440000', '2026-03-12', 'startrek', 'tng', 1, 7, '2026-03-12'),
  ('550e8400-e29b-41d4-a716-446655440000', '2026-03-15', 'xfiles', 'xf', 1, 5, '2026-03-15'),
  ('550e8400-e29b-41d4-a716-446655440000', '2026-03-17', 'startrek', 'tng', 1, 8, '2026-03-17'),
  ('550e8400-e29b-41d4-a716-446655440000', '2026-03-20', 'xfiles', 'xf', 1, 6, '2026-03-20')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 11. OSCARS WATCHED - Films Oscars regardés
-- =====================================================================
INSERT INTO oscars_watched (user_id, year, film_title, category_id, watched, watched_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 2025, 'Anora', 'picture', true, '2026-01-10 20:00:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2025, 'The Brutalist', 'picture', true, '2026-02-05 19:30:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2025, 'Dune: Part Two', 'picture', true, '2026-02-01 21:00:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2025, 'Conclave', 'picture', false, null),
  ('550e8400-e29b-41d4-a716-446655440000', 2025, 'Emilia Pérez', 'picture', false, null),
  ('550e8400-e29b-41d4-a716-446655440000', 2024, 'Poor Things', 'picture', true, '2024-12-20 19:00:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2024, 'Oppenheimer', 'picture', true, '2024-11-15 20:00:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2024, 'Killers of the Flower Moon', 'picture', true, '2024-12-01 18:30:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', 2024, 'Anatomy of a Fall', 'picture', false, null)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 12. CALENDARS SYSTEM - Calendriers personnalisés
-- =====================================================================
INSERT INTO calendars_system (user_id, calendar_id, name, color, position, visible)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_work', 'Travail', '#2d6bbf', 0, true),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_personal', 'Personnel', '#2a7a4b', 1, true),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_sports', 'Sports', '#e74c3c', 2, true),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_holidays', 'Vacances', '#f39c12', 3, true)
ON CONFLICT (user_id, calendar_id) DO NOTHING;

-- =====================================================================
-- 13. CALENDAR EVENTS - Événements calendrier
-- =====================================================================
INSERT INTO calendar_events (user_id, calendar_id, event_date, title, description, color, all_day, start_time, location)
VALUES 
  -- Travail
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_work', '2026-03-10', 'Meeting directeurs', 'Réunion trimestrielle', '#2d6bbf', false, '09:30:00', 'Salle A'),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_work', '2026-03-12', 'Deadline Projet X', 'Livraison finale', '#e74c3c', true, null, null),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_work', '2026-03-15', 'Formation TypeScript', 'Cours en ligne', '#2d6bbf', false, '14:00:00', 'Bureau'),
  
  -- Personnel
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_personal', '2026-03-10', 'Anniversaire Sophie', 'Gâteau et cadeaux', '#2a7a4b', true, null, 'Maison'),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_personal', '2026-03-17', 'Rendez-vous médecin', 'Visite annuelle', '#9b59b6', false, '10:00:00', 'Clinique Dr. Pierre'),
  
  -- Sports
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_sports', '2026-03-11', 'Entraînement', 'Gym - Musculation', '#e74c3c', false, '18:30:00', 'Gym XYZ'),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_sports', '2026-03-13', 'Match foot', 'Championnat local', '#e74c3c', false, '20:00:00', 'Stade municipal'),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_sports', '2026-03-15', 'Yoga', 'Cours yoga dimanche', '#2a7a4b', false, '10:00:00', 'Studio Zen'),
  
  -- Vacances
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_holidays', '2026-04-10', 'Vacances Pâques', 'Week-end prolongé', '#f39c12', true, null, 'Montagne'),
  ('550e8400-e29b-41d4-a716-446655440000', 'cal_holidays', '2026-07-15', 'Vacances été', 'Vacances principales', '#f39c12', true, null, 'Plage')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 14. APP SETTINGS - Préférences utilisateur
-- =====================================================================
INSERT INTO app_settings (user_id, current_year, week_start_offset, compact_view, notifications_enabled, auto_backup, settings)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 2026, 0, false, true, true, $${"theme": "light", "language": "fr", "defaultView": "week"}$$::jsonb),
  ('550e8400-e29b-41d4-a716-446655440001', 2026, 1, true, true, true, $${"theme": "dark", "language": "fr", "defaultView": "month"}$$::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================================
-- 15. CONNECTION HISTORY - Historique connexion
-- =====================================================================
INSERT INTO connection_history (user_id, ip_address, user_agent, login_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2026-03-10 08:00:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '2026-03-11 08:15:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440000', '192.168.1.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3)', '2026-03-12 12:30:00+00:00'),
  ('550e8400-e29b-41d4-a716-446655440001', '10.0.0.50', 'Mozilla/5.0 (X11; Linux x86_64)', '2026-03-10 09:00:00+00:00')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SUMMARY - Données insérées
-- =====================================================================
-- 
-- Summary des données créées:
-- 
-- ✅ User Profiles: 2 utilisateurs de test
-- ✅ Planner Data: Données agenda pour 4 jours en mars 2026
-- ✅ Weekly Data: 1 semaine (W10) avec habitudes et todos
-- ✅ Day Events: 2 jours avec événements
-- ✅ Habits: 5 habitudes différentes
-- ✅ Contacts: 8 contacts (famille, amis, célébrités)
-- ✅ Kanban Statuses: 3 statuses (todo, doing, done)
-- ✅ Kanban Cards: 8 objectifs pour 2026
-- ✅ Tracker Episodes: 12 épisodes (TNG et X-Files)
-- ✅ Tracker Schedule: 5 épisodes programmés
-- ✅ Oscars Watched: 9 films Oscars 2024-2025
-- ✅ Calendars System: 4 calendriers (travail, personnel, sports, vacances)
-- ✅ Calendar Events: 10 événements divers
-- ✅ App Settings: Préférences pour 2 utilisateurs
-- ✅ Connection History: 4 connexions
-- =====================================================================

-- =====================================================================
-- NOTES D'UTILISATION - ÉTAPES ESSENTIELLES
-- =====================================================================
--
-- ✅ ÉTAPE 1 - CRÉER LES UTILISATEURS DANS SUPABASE AUTH
-- =========================================================
-- 
-- Allez dans: Supabase Dashboard → Authentication → Users
-- Créez au moins 2 utilisateurs (via Invite ou Sign Up)
-- Exemple d'emails:
--   - jean@example.com
--   - marie@example.com
-- 
-- Notez les UUIDs générés automatiquement pour chaque utilisateur.
-- Vous pouvez voir les UUIDs en exécutant:
--
--   SELECT id, email FROM auth.users;
--
-- ✅ ÉTAPE 2 - REMPLACER LES UUIDs DANS CE SCRIPT
-- ================================================
--
-- Les UUIDs actuels dans ce script sont des exemples:
--   - '550e8400-e29b-41d4-a716-446655440000' (Jean)
--   - '550e8400-e29b-41d4-a716-446655440001' (Marie)
--
-- À REMPLACER PAR VOS VRAIES UUIDs:
--   1. Utiliser CTRL+H (Find and Replace)
--   2. Remplacer '550e8400-e29b-41d4-a716-446655440000' par votre UUID réel
--   3. Remplacer '550e8400-e29b-41d4-a716-446655440001' par votre 2e UUID (optionnel)
--   4. Sauvegarder
--
-- ✅ ÉTAPE 3 - EXÉCUTER LE SCRIPT
-- ================================
--
-- 1. Copier ce fichier COMPLET
-- 2. Aller dans Supabase → SQL Editor
-- 3. Coller le contenu
-- 4. Cliquer "Run" (ou RUN)
--
-- ✅ ÉTAPE 4 - VÉRIFIER LES DONNÉES
-- ==================================
--
-- Après insertion, vérifier que tout s'est bien passé:
--
--   SELECT COUNT(*) as total FROM planner_data;      -- Devrait = 1
--   SELECT COUNT(*) as total FROM contacts;          -- Devrait = 8
--   SELECT COUNT(*) as total FROM kanban_cards;      -- Devrait = 8
--   SELECT COUNT(*) as total FROM tracker_episodes;  -- Devrait = 12
--   SELECT COUNT(*) as total FROM calendar_events;   -- Devrait = 10
--
-- =====================================================================
-- TROUBLESHOOTING
-- =====================================================================
--
-- ❌ Erreur: "Key is not present in table 'users'"
--    → Solution: Créer les utilisateurs dans auth.users d'abord (Étape 1)
--
-- ❌ Erreur: "Syntax error near"
--    → Solution: Vérifier que tous les UUIDs ont été remplacés correctement
--
-- ❌ Les données n'apparaissent pas
--    → Solution: Vérifier que vous êtes connecté au bon projet Supabase
--               et à la bonne base de données
--
-- ✅ SUPPRESSION COMPLÈTE (si besoin de reset)
-- =====================================================
--
-- Pour supprimer TOUS les utilisateurs et leurs données:
--
--   DELETE FROM audit_log WHERE user_id IS NOT NULL;
--   DELETE FROM connection_history WHERE user_id IS NOT NULL;
--   DELETE FROM calendar_events WHERE user_id IS NOT NULL;
--   DELETE FROM calendar_events WHERE user_id IS NOT NULL;
--   DELETE FROM calendars_system WHERE user_id IS NOT NULL;
--   DELETE FROM oscars_watched WHERE user_id IS NOT NULL;
--   DELETE FROM tracker_schedule WHERE user_id IS NOT NULL;
--   DELETE FROM tracker_episodes WHERE user_id IS NOT NULL;
--   DELETE FROM kanban_cards WHERE user_id IS NOT NULL;
--   DELETE FROM kanban_statuses WHERE user_id IS NOT NULL;
--   DELETE FROM contacts WHERE user_id IS NOT NULL;
--   DELETE FROM habits WHERE user_id IS NOT NULL;
--   DELETE FROM day_events WHERE user_id IS NOT NULL;
--   DELETE FROM weekly_data WHERE user_id IS NOT NULL;
--   DELETE FROM planner_data WHERE user_id IS NOT NULL;
--   DELETE FROM app_settings WHERE user_id IS NOT NULL;
--
-- Pour supprimer UN utilisateur spécifique ET toutes ses données:
--
--   DELETE FROM user_profiles 
--   WHERE id = '550e8400-e29b-41d4-a716-446655440000';
--   -- Les autres données se supprimeront automatiquement via CASCADE
--
-- =====================================================================
