# 📊 Supabase Schema - Documentation Complète

## Vue d'ensemble

Ce schéma SQL est conçu pour migrer complètement l'application Planificateur Annuel de `localStorage` vers Supabase. Il comprend **16 tables** organisées par domaine fonctionnel.

---

## 📋 Table des matières

1. [Profils & Authentification](#1-profils--authentification)
2. [Données du Planificateur](#2-données-du-planificateur)
3. [Contacts](#3-contacts)
4. [Kanban - Objectifs](#4-kanban--objectifs)
5. [Tracker - Épisodes](#5-tracker--épisodes)
6. [Oscars - Films Regardés](#6-oscars--films-regardés)
7. [Calendriers](#7-calendriers)
8. [Audit & Configuration](#8-audit--configuration)

---

## 1. Profils & Authentification

### `user_profiles`
Données de profil utilisateur liées à `auth.users`.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (référence auth.users) |
| `email` | TEXT | Email unique |
| `full_name` | TEXT | Nom complet |
| `avatar_url` | TEXT | URL de l'avatar |
| `language` | TEXT | Langue préférée (défaut: 'fr') |
| `theme` | TEXT | Thème ('light', 'dark') |
| `created_at` | TIMESTAMP | Horodatage création |
| `updated_at` | TIMESTAMP | Dernière modification |

**RLS**: Chaque utilisateur ne peut voir/modifier que son propre profil.

---

## 2. Données du Planificateur

### `planner_data`
Données principales du planificateur (tâches, notes par jour).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `year` | INT | Année des données |
| `data` | JSONB | **Structure**: `{"2026-03-10": {"tasks": [...], "notes": "..."}}` |
| `created_at` | TIMESTAMP | Création |
| `updated_at` | TIMESTAMP | Modification |

**Unique**: (`user_id`, `year`) - Une entrée par utilisateur par année.

**Index**: 
```
- user_id, year
- updated_at (pour sync)
```

**Structure JSONB exemple**:
```json
{
  "2026-03-10": {
    "tasks": [
      {"text": "Réunion", "done": false, "priority": "urgent"},
      {"text": "Rapport", "done": true, "priority": "normal"}
    ],
    "notes": "Journée chargée"
  },
  "2026-03-11": {
    "tasks": [],
    "notes": ""
  }
}
```

---

### `weekly_data`
Données hebdomadaires (habitudes, todos semaine, filtres).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `week_key` | TEXT | Format: `"2026-W10"` |
| `data` | JSONB | Habits, weekTodos, filtres |
| `created_at` | TIMESTAMP | Création |
| `updated_at` | TIMESTAMP | Modification |

**Structure JSONB exemple**:
```json
{
  "habits": [
    {"name": "Sport", "color": "#2d6bbf", "track": {"2026-03-10": true, "2026-03-11": false}},
    {"name": "Méditation", "color": "#2a7a4b", "track": {"2026-03-10": true}}
  ],
  "weekTodos": [
    {"id": "todo_123", "text": "Appel client", "done": false, "statusId": "doing"}
  ],
  "filters": {"show": "all", "priority": "normal"}
}
```

---

### `day_events`
Événements spécifiques pour chaque jour.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `day_key` | TEXT | Format: `"2026-03-10"` |
| `data` | JSONB | Événements et propriétés |
| `created_at` | TIMESTAMP | Création |
| `updated_at` | TIMESTAMP | Modification |

**Structure JSONB exemple**:
```json
{
  "events": [
    {
      "id": "ev_123",
      "title": "Réunion",
      "time": "14:30",
      "allDay": false,
      "description": "Avec l'équipe",
      "color": "#2d6bbf"
    },
    {
      "id": "ev_124",
      "title": "Anniversaire Marie",
      "allDay": true,
      "fromContact": true
    }
  ]
}
```

---

### `habits`
Habitudes globales (indépendantes des semaines).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `name` | TEXT | Nom de l'habitude |
| `color` | TEXT | Couleur hex |
| `created_at` | TIMESTAMP | Création |
| `updated_at` | TIMESTAMP | Modification |

**Utilisation**: Master list des habitudes. La tracking se fait via `weekly_data`.

---

## 3. Contacts

### `contacts`
Contacts avec informations de naissance/décès.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `first_name` | TEXT | Prénom |
| `last_name` | TEXT | Nom |
| `birth_year` | INT | Année de naissance |
| `birth_month` | INT | Mois (1-12) |
| `birth_day` | INT | Jour (1-31) |
| `death_year` | INT | Année de décès |
| `death_month` | INT | Mois décès |
| `death_day` | INT | Jour décès |
| `phone` | TEXT | Téléphone |
| `email` | TEXT | Email |
| `address` | TEXT | Adresse |
| `tags` | TEXT[] | Tags/groupes: `['Famille', 'Ami']` |
| `notes` | TEXT | Notes |

**Index**:
```
- user_id
- birth_month, birth_day (pour anniversaires)
```

**Vue**: `upcoming_birthdays` - Liste des anniversaires à venir.

---

## 4. Kanban - Objectifs

### `kanban_statuses`
Définitions des statuses (À faire, En cours, Complété).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `status_id` | TEXT | ID unique: `'todo'`, `'doing'`, `'done'` |
| `label` | TEXT | Label visible: `'À faire'`, `'En cours'`, `'Complété'` |
| `color` | TEXT | Couleur hex |
| `position` | INT | Ordre d'affichage |

**Données initiales par utilisateur**:
```sql
INSERT INTO kanban_statuses (user_id, status_id, label, color, position) VALUES
  (user_uuid, 'todo', 'À faire', '#8b7355', 0),
  (user_uuid, 'doing', 'En cours', '#2d6bbf', 1),
  (user_uuid, 'done', 'Complété', '#2a7a4b', 2);
```

---

### `kanban_cards`
Objectifs/cartes du Kanban.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `card_id` | TEXT | ID unique: `'kb_1234567890_abc'` |
| `title` | TEXT | Titre de l'objectif |
| `description` | TEXT | Description détaillée |
| `year` | INT | Année cible |
| `status_id` | TEXT | Référence kanban_statuses |
| `color` | TEXT | Couleur hex |
| `position_order` | INT | Position dans la colonne |

**Index**:
```
- user_id, year
- user_id, status_id
```

---

## 5. Tracker - Épisodes

### `tracker_episodes`
Episodes regardés (TV shows).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `show_id` | TEXT | ID du show: `'startrek'`, `'xfiles'` |
| `series_id` | TEXT | ID de la série: `'tng'`, `'xf'` |
| `season_number` | INT | Numéro de saison |
| `episode_number` | INT | Numéro d'épisode |
| `watched` | BOOL | Regardé ou non |
| `watched_at` | TIMESTAMP | Date de visionnage |
| `notes` | TEXT | Notes personnelles |

**Index**:
```
- user_id
- user_id, show_id, series_id
```

**Vue**: `unwatched_episodes` - Episodes non regardés.

---

### `tracker_schedule`
Calendrier des épisodes à venir.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `day_key` | TEXT | Date: `"2026-03-10"` |
| `show_id` | TEXT | ID du show |
| `series_id` | TEXT | ID de la série |
| `season_number` | INT | Numéro de saison |
| `episode_number` | INT | Numéro d'épisode |
| `scheduled_date` | DATE | Date de diffusion |

---

## 6. Oscars - Films Regardés

### `oscars_watched`
Films et catégories regardés aux Oscars.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `year` | INT | Année de la cérémonie |
| `film_title` | TEXT | Titre du film |
| `category_id` | TEXT | ID catégorie: `'picture'`, `'director'`, etc. |
| `watched` | BOOL | Regardé ou non |
| `watched_at` | TIMESTAMP | Date de visionnage |
| `notes` | TEXT | Notes |

**Index**:
```
- user_id, year
```

---

## 7. Calendriers

### `calendars_system`
Calendriers personnalisés (Google, iCal, etc.).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `calendar_id` | TEXT | ID unique du calendrier |
| `name` | TEXT | Nom affiché |
| `color` | TEXT | Couleur hex |
| `position` | INT | Ordre d'affichage |
| `visible` | BOOL | Visible ou non |

---

### `calendar_events`
Événements dans les calendriers.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `calendar_id` | TEXT | Référence calendrier |
| `event_date` | DATE | Date de l'événement |
| `title` | TEXT | Titre |
| `description` | TEXT | Description |
| `color` | TEXT | Couleur hex |
| `all_day` | BOOL | Événement toute la journée |
| `start_time` | TIME | Heure de début |
| `end_time` | TIME | Heure de fin |
| `location` | TEXT | Lieu |

---

## 8. Audit & Configuration

### `app_settings`
Préférences utilisateur et configuration.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `current_year` | INT | Année actuelle sélectionnée |
| `week_start_offset` | INT | Décalage semaine |
| `compact_view` | BOOL | Vue compacte |
| `notifications_enabled` | BOOL | Notifications activées |
| `auto_backup` | BOOL | Backup automatique |
| `last_backup` | TIMESTAMP | Dernier backup |
| `settings` | JSONB | Settings JSON libre |

---

### `connection_history`
Historique de connexion (logs).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `ip_address` | TEXT | Adresse IP |
| `user_agent` | TEXT | User agent du navigateur |
| `login_at` | TIMESTAMP | Heure de connexion |

---

### `audit_log`
Journalisation complète des modifications.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `user_id` | UUID | Référence utilisateur |
| `action` | TEXT | Type: `'INSERT'`, `'UPDATE'`, `'DELETE'` |
| `table_name` | TEXT | Table affectée |
| `record_id` | UUID | ID du record modifié |
| `changes` | JSONB | Détails des changements |
| `created_at` | TIMESTAMP | Heure du changement |

**Index**: `(user_id, table_name, created_at DESC)`

---

## 🔐 Row Level Security (RLS)

Toutes les tables protégées par RLS. Chaque utilisateur ne peut accéder qu'à SES données.

Exemple:
```sql
CREATE POLICY "Users can access own data" 
  ON planner_data FOR ALL USING (auth.uid() = user_id);
```

---

## 🔄 Synchronisation localStorage ↔ Supabase

### Stratégie recommandée:

1. **Au chargement**: Charger depuis Supabase, fallback localStorage
2. **À chaque modification**: Écrire dans localStorage ET Supabase (async)
3. **En cas de conflict**: Dernière modification (updated_at) gagne
4. **Export/Backup**: Télécharger planner_data JSONB complet

### Fonction de sync (pseudocode):
```javascript
async function saveDataWithSync(data) {
  // 1. Save localement (instantané)
  localStorage.setItem('ap_data', JSON.stringify(data));
  
  // 2. Save Supabase (async)
  if (currentUser && supabaseClient) {
    await supabaseClient
      .from('planner_data')
      .upsert({
        user_id: currentUser.id,
        year: getCurrentYear(),
        data: data,
        updated_at: new Date().toISOString()
      });
  }
}
```

---

## 📦 Migration depuis localStorage

### Script de migration (côté application):

```javascript
async function migrateLocalStorageToSupabase() {
  const userId = currentUser.id;
  const year = getYear();
  
  // Planner data
  const plannerData = loadData(); // from localStorage
  await db.from('planner_data').upsert({
    user_id: userId,
    year: year,
    data: plannerData
  });
  
  // Weekly data
  const weeklyKeys = Object.keys(localStorage)
    .filter(k => k.startsWith('ap_w_'));
  for (const key of weeklyKeys) {
    const weekKey = key.replace('ap_w_', '');
    await db.from('weekly_data').upsert({
      user_id: userId,
      week_key: weekKey,
      data: JSON.parse(localStorage.getItem(key))
    });
  }
  
  // ... continue for other tables
}
```

---

## 🚀 Installation

1. Accéder au dashboard Supabase
2. SQL Editor → Coller le script `supabase_schema.sql`
3. Execute → Créer toutes les tables
4. Configurer Auth (Google, passwords, etc.)
5. Implementer sync dans l'app
6. Migrer données utilisateurs

---

## 📝 Notes

- Tous les timestamps sont en UTC (`TIMESTAMP WITH TIME ZONE`)
- Les données JSONB permettent flexibilité sans migration
- Indexes optimisés pour requêtes courantes
- RLS appliquée par défaut pour sécurité
- Triggers automatiques pour `updated_at`

---

**Version**: 1.3.4  
**Date**: 2026-03-11  
**Application**: Planificateur Annuel
