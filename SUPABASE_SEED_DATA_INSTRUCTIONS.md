# Guide d'insertion des données de test Supabase

## 📋 Vue d'ensemble

Le fichier `supabase_data_seed.sql` contient des données d'exemple pour tester votre schéma Supabase. Il inclut :
- ✅ Données d'agenda (planner_data)
- ✅ Habitudes hebdomadaires (weekly_data)
- ✅ Événements quotidiens (day_events)
- ✅ Contacts avec anniversaires
- ✅ Kanban (objectifs et cartes)
- ✅ Tracker d'épisodes TV
- ✅ Calendriers personnalisés
- ✅ Paramètres d'application

## ⚠️ Prérequis

Avant d'exécuter le script, vous DEVEZ avoir créé les utilisateurs dans Supabase Auth.

### Étape 1 : Créer les utilisateurs dans Supabase Auth

1. Allez sur **Supabase Dashboard**
2. Naviguez vers **Authentication → Users**
3. Cliquez **Add user** ou **Invite**
4. Créez au moins 2 utilisateurs :
   - Email : `jean@example.com` (ou votre email)
   - Email : `marie@example.com` (optionnel)

Supabase génère automatiquement un UUID pour chaque utilisateur.

### Étape 2 : Obtenir les UUID réels

Dans Supabase SQL Editor, exécutez :

```sql
SELECT id, email FROM auth.users;
```

Vous verrez deux colonnes :
- `id` = UUID (ce qui nous intéresse)
- `email` = l'email de l'utilisateur

**Exemple de résultat :**

```
id                                   | email
-------------------------------------|-------------------
a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6 | jean@example.com
b2c3d4e5-f6g7-48h9-i0j1-k2l3m4n5o6p7 | marie@example.com
```

**Notez les UUIDs** - vous en aurez besoin à l'étape suivante.

## 🔄 Étape 3 : Remplacer les UUIDs dans le script

Le fichier `supabase_data_seed.sql` utilise des UUIDs d'exemple par défaut :
- `550e8400-e29b-41d4-a716-446655440000` (Jean - l'utilisateur principal)
- `550e8400-e29b-41d4-a716-446655440001` (Marie - utilisateur secondaire, optionnel)

### Méthode A : Find and Replace (Recommandé)

1. Ouvrez `supabase_data_seed.sql` dans VS Code
2. Appuyez sur **CTRL+H** (ou **CMD+H** sur Mac)
3. Remplissez les champs :
   - **Find** : `550e8400-e29b-41d4-a716-446655440000`
   - **Replace** : Collez votre 1er UUID (depuis l'étape 2)
4. Cliquez **Replace All**
5. Répétez pour le 2e UUID (optionnel) :
   - **Find** : `550e8400-e29b-41d4-a716-446655440001`
   - **Replace** : Votre 2e UUID
6. Sauvegardez le fichier

### Méthode B : Édition manuelle

Cherchez les deux UUIDs dans le fichier et remplacez-les manuellement par vos UUIDs réels.

## ✅ Étape 4 : Exécuter le script

1. Allez sur **Supabase Dashboard → SQL Editor**
2. Créez une nouvelle requête (NEW QUERY)
3. Ouvrez le fichier `supabase_data_seed.sql` et copiez **LE CONTENU ENTIER**
4. Collez-le dans l'éditeur SQL
5. Cliquez **Run** (le bouton play bleu)
6. Attendez que l'exécution termine (quelques secondes)

**Succès !** 🎉 Vous devriez voir un message "Query executed successfully"

## 🔍 Étape 5 : Vérifier les données

Pour confirmer que les données ont été insérées correctement, exécutez ces requêtes :

```sql
-- Vérifier les données de l'agenda
SELECT COUNT(*) as total FROM planner_data;        -- Devrait = 1

-- Vérifier les contacts
SELECT COUNT(*) as total FROM contacts;            -- Devrait = 8

-- Vérifier les objectifs Kanban
SELECT COUNT(*) as total FROM kanban_cards;        -- Devrait = 8

-- Vérifier les épisodes TV
SELECT COUNT(*) as total FROM tracker_episodes;    -- Devrait = 12

-- Vérifier les événements calendrier
SELECT COUNT(*) as total FROM calendar_events;     -- Devrait = 10
```

Si tous les chiffres correspondent, c'est gagnant ! ✅

## 🚨 Dépannage

### Erreur : "Key is not present in table 'users'"

**Cause** : Les utilisateurs n'existent pas dans `auth.users`

**Solution** : Allez à l'Étape 1 et créez d'abord les utilisateurs via Supabase Auth UI

### Erreur : "Syntax error near"

**Cause** : Les UUIDs n'ont pas été correctement remplacés

**Solution** :
1. Vérifiez que vous avez bien fait Find and Replace
2. Assurez-vous que les UUIDs sont valides (36 caractères avec tirets)
3. Re-copiez le script et réessayez

### Erreur : "Constraint violation"

**Cause** : Peut survenir si vous exécutez le script deux fois

**Solution** : ✅ C'est normal ! Le script utilise `ON CONFLICT ... DO NOTHING` qui ignore les doublons intelligemment.

Pour vraiment résetar : Allez à la section **Suppression** ci-dessous.

## 🗑️ Suppression complète (si besoin de réinitialiser)

### Reset complet de TOUS les utilisateurs et données

```sql
DELETE FROM audit_log;
DELETE FROM connection_history;
DELETE FROM calendar_events;
DELETE FROM calendars_system;
DELETE FROM oscars_watched;
DELETE FROM tracker_schedule;
DELETE FROM tracker_episodes;
DELETE FROM kanban_cards;
DELETE FROM kanban_statuses;
DELETE FROM contacts;
DELETE FROM habits;
DELETE FROM day_events;
DELETE FROM weekly_data;
DELETE FROM planner_data;
DELETE FROM app_settings;
```

### Reset d'UN utilisateur spécifique

```sql
-- Remplacer par votre UUID réel
DELETE FROM user_profiles 
WHERE id = 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6';
```

Les données associées se supprimeront automatiquement grâce aux **CASCADE** dans la base de données.

## 📊 Contenu des données insérées

| Table | Nombre | Description |
|-------|--------|-------------|
| Planner Data | 1 | Données d'agenda pour 4 jours |
| Weekly Data | 1 | Une semaine (W10) avec habitudes |
| Day Events | 2 | Événements sur 2 jours |
| Habits | 5 | Sport, Méditation, Lecture, Hydratation, Sommeil |
| Contacts | 8 | Famille, amis, célébrités |
| Kanban Statuses | 3 | À faire, En cours, Complété |
| Kanban Cards | 8 | Objectifs pour 2026 |
| Tracker Episodes | 12 | Star Trek TNG + X-Files |
| Tracker Schedule | 5 | Épisodes programmés |
| Oscars Watched | 9 | Films Oscars 2024-2025 |
| Calendars System | 4 | Travail, Personnel, Sports, Vacances |
| Calendar Events | 10 | Événements variés |
| App Settings | 2 | Préférences pour 2 utilisateurs |
| Connection History | 4 | Historique de connexion |

**Total** : ~67 enregistrements de test

## ❓ Questions fréquentes

**Q: Puis-je modifier les données de test ?**  
R: Oui ! Éditez `supabase_data_seed.sql` avant d'exécuter (changez les date, titres, etc.)

**Q: Est-ce que j'ai besoin de 2 utilisateurs ?**  
R: Non, 1 seul suffit. Suppressez simplement les insertions du 2e UUID ou laissez les en place.

**Q: Les user_profiles sont-ils créés automatiquement ?**  
R: Oui ! Quand un utilisateur se crée dans `auth.users`, Supabase crée automatiquement une ligne `user_profiles`. Vous n'avez rien à faire pour ça.

**Q: Puis-je utiliser mes propres données ?**  
R: Bien sûr ! Le fichier `supabase-migration.js` automatise le transfert des données localStorage vers Supabase.

## 📖 Ressources supplémentaires

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL JSONB Guide](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- Fichier : `SUPABASE_SCHEMA_DOCUMENTATION.md` - Vue d'ensemble complète du schéma
- Fichier : `supabase-migration.js` - Script de migration depuis localStorage

---

**Besoin d'aide ?** Consultez les messages d'erreur - ils sont généralement explicites sur ce qui ne va pas ! 🚀
