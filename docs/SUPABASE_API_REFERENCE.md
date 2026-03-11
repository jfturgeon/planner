# 🔧 Supabase.js - API Reference

## Configuration

```javascript
// Import automatique si tu ouvres index.html
// Crée une instance Supabase globale: window.supabase

// Variables globales:
// currentUser → User actuel (ou null si non connecté)
// supabase → Client Supabase
```

---

## 🔐 Authentication Functions

### `signUp(email, password)`
Crée un nouvel utilisateur

```javascript
const result = await signUp('user@example.com', 'password123');
// {  
//   success: true,
//   data: { user: {...}, session: {...} }
// }
// OR
// {
//   success: false,
//   error: "Email déjà utilisé"
// }
```

### `signIn(email, password)`
Connecte l'utilisateur

```javascript
const result = await signIn('user@example.com', 'password123');
// { success: true, data: {...} }
```

### `signOut()`
Déconnecte l'utilisateur

```javascript
const result = await signOut();
// { success: true }
currentUser = null; // Auto-reset
```

### `initAuth()`
Vérifie et initialise les sessions existantes

```javascript
await initAuth();
// Appelé automatiquement on page load
// Écoute les changements d'auth state
```

---

## 💾 Planner Data Functions

### `savePlannerData(year, data)`
Sauvegarde les données annuelles

```javascript
const year = 2026;
const data = {
  '2026-03-10': 'Notes du jour',
  '2026-03-11': { tasks: [...] }
};

const result = await savePlannerData(year, data);
// { success: true }
```

### `loadPlannerData(year)`
Charge les données annuelles

```javascript
const result = await loadPlannerData(2026);
// { success: true, data: {...} }
// Retourne {} si rien trouvé
```

---

## 📅 Weekly Data Functions

### `saveWeeklyData(weekKey, data)`
Sauvegarde une semaine (schedule, todos, habits)

```javascript
const result = await saveWeeklyData('2026-W10', {
  habits: [...],
  todos: [...]
});
// { success: true }
```

### `loadWeeklyData(weekKey)`
Charge une semaine

```javascript
const result = await loadWeeklyData('2026-W10');
// { success: true, data: {...} }
// Retourne null si non trouvée
```

**Format weekKey**: `YYYY-Www` (ex: `2026-W10` pour la semaine 10)

---

## 🌞 Day Extra Functions

### `saveDayExtra(dayKey, events)`
Sauvegarde les événements d'un jour

```javascript
const result = await saveDayExtra('2026-03-10', [
  { time: '09:00', title: 'Réunion', done: false },
  { time: '14:00', title: 'Déjeuner', done: true }
]);
// { success: true }
```

### `loadDayExtra(dayKey)`
Charge les événements d'un jour

```javascript
const result = await loadDayExtra('2026-03-10');
// {  
//   success: true,  
//   data: { events: [...] }  
// }
```

**Format dayKey**: `YYYY-MM-DD` (ex: `2026-03-10`)

---

## 🎯 Habits Functions

### `saveHabits(habitsList)`
Sauvegarde la liste des habitudes

```javascript
const result = await saveHabits([
  { id: 1, name: 'Exercice', checked: { '2026-03-10': true } },
  { id: 2, name: 'Lecture', checked: { '2026-03-10': false } }
]);
// { success: true }
```

### `loadHabits()`
Charge la liste des habitudes

```javascript
const result = await loadHabits();
// { success: true, data: [...] }
// Retourne [] si rien
```

---

## ⚙️ Preferences Functions

### `loadPreferences()`
Charge les préférences utilisateur

```javascript
const result = await loadPreferences();
// {
//   success: true,
//   data: {
//     user_id: 'uuid',
//     current_year: 2026,
//     week_start: 0,
//     left_panel_visible: true
//   }
// }
```

### `savePreferences(prefs)`
Sauvegarde les préférences

```javascript
await savePreferences({
  current_year: 2026,
  week_start: 1,
  left_panel_visible: false
});
// { success: true }
```

---

## 🔗 Direct Database Queries

Tu peux aussi faire des requêtes brutes via `supabase`:

```javascript
// SELECT
const { data, error } = await supabase
  .from('planner_data')
  .select('*')
  .eq('year', 2026);

// INSERT
const { error } = await supabase
  .from('planner_data')
  .insert({ user_id, year, data });

// UPDATE
const { error } = await supabase
  .from('planner_data')
  .update({ data })
  .eq('user_id', userId)
  .eq('year', 2026);

// DELETE
const { error } = await supabase
  .from('planner_data')
  .delete()
  .eq('user_id', userId);
```

---

## 🛡️ Error Handling

Tous les retours suivent ce format:

```javascript
{
  success: true/false,
  error?: "Message d'erreur",
  data?: {...}
}
```

Bon pattern:

```javascript
const result = await savePlannerData(2026, data);
if (result.success) {
  showToast('✅ Sauvegardé');
} else {
  console.error('Erreur:', result.error);
  showToast('❌ ' + result.error);
}
```

---

## 📡 Global State

```javascript
// User actuel (ou null)
currentUser

// Client Supabase
window.supabase

// Fonction pour vérifier si connecté
function isLoggedIn() {
  return currentUser !== null;
}

// Fonction pour obtenir l'ID utilisateur
function getUserId() {
  return currentUser?.id || null;
}
```

---

## 🔄 Sync Helpers

```javascript
// Sync data from Supabase to localStorage
await syncDataFromSupabase();

// Save + Sync functions (localStorage + Supabase)
await saveDataWithSync(appData);
await saveWeeklyWithSync(weekKey, data);
await saveDayExtraWithSync(dayKey, events);
await saveHabitsWithSync(habits);
```

---

## ⚡ Performance Tips

1. **Cache avec localStorage**
   - Les données sont en cache local
   - Sync se fait en arrière-plan
   - Pas de lag utilisateur

2. **Batch operations**
   - Groupe les updates
   - Sauvegarde une fois

3. **Debounce saves**
   - Attendez 1-2 sec après le dernier changement
   - Puis sauvegarder une fois

---

## 🐛 Debugging

```javascript
// Voir l'utilisateur actuel
console.log('Current user:', currentUser);

// Voir si la sync est en cours
console.log('Sync in progress:', dataSyncInProgress);

// Test une requête DB directement
const { data, error } = await supabase
  .from('planner_data')
  .select('*')
  .limit(1);
console.log('Query result:', { data, error });
```

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL JSON: https://www.postgresql.org/docs/current/datatype-json.html
- JWT: https://jwt.io

---

## 🎯 Common Tasks

### Charger les données au démarrage
```javascript
async function initApp() {
  const data = await loadPlannerData(getCurrentYear());
  appData = data.data || {};
  render();
}
```

### Sauvegarder automatiquement
```javascript
function onDataChange() {
  saveDataWithSync(appData);
  showToast('Sauvegardé');
}
```

### Exporter données utilisateur
```javascript
async function exportUserData() {
  const planner = await loadPlannerData(2026);
  const habits = await loadHabits();
  return {
    planner: planner.data,
    habits: habits.data,
    export_date: new Date().toISOString()
  };
}
```

---

Made with ❤️ for efficient planning
