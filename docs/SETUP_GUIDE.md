# 🚀 Guide de Mise en Route - Planificateur avec Supabase

## ✅ Configuration Complète

### 1️⃣ **SQL à exécuter dans Supabase**

1. Connecte-toi à ton tableau de bord Supabase: https://supabase.com
2. Va dans **SQL Editor** → **New Query**
3. Copie-colle tout le contenu du fichier `setup.sql`
4. Clique sur **Run** (▶️)

Cela créera:
- ✅ Table `planner_data` (données annuelles)
- ✅ Table `weekly_data` (données hebdomadaires)
- ✅ Table `day_extra` (événements/tâches du jour)
- ✅ Table `habits` (habitudes)
- ✅ Table `user_preferences` (préférences utilisateur)
- ✅ Policies RLS (sécurité)

---

### 2️⃣ **Fichiers créés**

| Fichier | Rôle |
|---------|------|
| `supabase.js` | Configuration + Fonctions DB |
| `setup.sql` | Schéma PostgreSQL |
| `index.html` (modifié) | Intégration login + Supabase |

---

### 3️⃣ **Caractéristiques**

| Feature | Description |
|---------|-------------|
| 🔐 **Authentification** | Email + mot de passe via Supabase Auth |
| 📝 **Inscription** | Les utilisateurs peuvent créer un compte |
| 💾 **Sauvegarde Cloud** | Toutes les données sauvegardées dans Supabase |
| 🛡️ **Sécurité** | Row-Level Security (RLS) - chaque user ne voit que ses données |
| 📱 **Responsive** | Marche sur desktop et mobile |

---

### 4️⃣ **Comment tester**

#### Première visite:
1. Ouvre `index.html`
2. Clique sur **"Créer un compte"**
3. Inscris-toi avec: `test@example.com` / `password123`
4. ✅ Tu es connecté!

#### Deuxième visite:
1. Actualize la page
2. Connecte-toi avec tes identifiants
3. ✅ Tes données sont restaurées depuis Supabase!

---

### 5️⃣ **Structure des données Supabase**

#### Table: `planner_data`
```json
{
  "id": "uuid",
  "user_id": "uuid (ref auth.users)",
  "year": 2026,
  "data": {
    "2026-03-10": "Notes du jour...",
    "2026-03-11": {...}
  },
  "created_at": "2026-03-10T10:00:00Z",
  "updated_at": "2026-03-10T10:00:00Z"
}
```

#### Table: `weekly_data`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "week_key": "2026-W10",
  "data": {
    "habits": [...],
    "todos": [...]
  }
}
```

#### Table: `day_extra`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "day_key": "2026-03-10",
  "events": [
    {"time": "09:00", "title": "Réunion", ...}
  ]
}
```

---

### 6️⃣ **Flux d'Authentification**

```
┌─────────────────────────────────────────────────────┐
│ Page charge                                         │
│ ↓                                                   │
│ initAuth() appelé                                   │
│ ├─ Vérifie si user est connecté (session)          │
│ │  ├─ OUI → showPlannerView()                       │
│ │  └─ NON → showLoginView()                         │
│ ├─ Écoute les changements d'auth state              │
│ └─ Affiche login ou app                             │
│                                                     │
│ User signe up → POST /auth/v1/signup               │
│ ├─ Hash du password                                 │
│ ├─ Crée record dans auth.users                      │
│ ├─ Crée record user_preferences                     │
│ └─ Auto-login si succès                             │
│                                                     │
│ User signe in → POST /auth/v1/signin               │
│ ├─ Valide credentials                               │
│ ├─ Retourne session + JWT                           │
│ └─ onAuthStateChange() → showPlannerView()          │
│                                                     │
│ App charge data:                                    │
│ ├─ loadPlannerData(year) → Supabase                 │
│ ├─ loadWeeklyData(weekKey) → Supabase               │
│ ├─ loadDayExtra(dayKey) → Supabase                  │
│ └─ loadHabits() → Supabase                          │
│                                                     │
│ User édite data:                                    │
│ ├─ savePlannerData() → Supabase                     │
│ ├─ saveWeeklyData() → Supabase                      │
│ └─ showToast('Sauvegardé!')                         │
│                                                     │
│ User logout:                                        │
│ ├─ signOut()                                        │
│ ├─ Efface session                                   │
│ └─ showLoginView()                                  │
└─────────────────────────────────────────────────────┘
```

---

### 7️⃣ **Mot de passe oublié?**

Pour implémenter un lien "Mot de passe oublié", ajoute dans `supabase.js`:

```javascript
async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}?reset=true`
  });
  return { success: !error, error };
}
```

---

### 8️⃣ **Performance & Optimisations**

- ✅ Les données sont chargées au démarrage
- ✅ Les changes sont sauvegardées immédiatement
- ✅ Indexes sur les tables pour les recherches rapides
- ✅ RLS empêche les requêtes inutiles
- ⚠️ À faire: Ajouter un `debounce` pour les saves fréquentes

---

### 9️⃣ **Dépannage**

**Problème**: Erreur "CORS"
- ✅ Normal pour les requêtes du frontend
- ✅ Supabase gère CORS automatiquement

**Problème**: Données ne se sauvegardent pas
- ❌ Vérifie que tu es connecté: `console.log(currentUser)`
- ❌ Vérifie les policies RLS dans Supabase
- ❌ Regarde la console browser (F12)

**Problème**: "Row level security" error
- ✅ Exécute le `setup.sql` complet
- ✅ Vérifie que `auth.uid()` est défini

---

### 🔟 **Prochaines Étapes**

1. ✅ **Tests**: Crée 2-3 comptes et teste la sauvegarde
2. 📋 **Sync offline**: Ajouter IndexedDB comme cache
3. 🔔 **Notifications**: Real-time updates entre devices
4. 📊 **Analytics**: Tracker l'utilisation dans Supabase
5. 🌐 **PWA**: Rendre l'app installable

---

## 📞 Support

Si tu as des questions:
- Dans `supabase.js`: Les fonctions documentées
- Dans `setup.sql`: Commentaires sur chaque table
- Dans la console: Des logs détaillés

Bonne utilisation! 🚀
