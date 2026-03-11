# 📅 Planificateur - Instructions d'Installation

## 🎯 En 3 minutes

### Étape 1: Exécute le SQL dans Supabase ⚡

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet: **`heifenuzqaybzvmketmy`**
3. Clique sur **SQL Editor** (à gauche)
4. Clique sur **+ New Query**
5. Copie-colle **tout** le contenu de `setup.sql`
6. Clique sur le bouton **▶ Run**

**✅ Voilà! Ta base de données est prête.**

---

### Étape 2: Lance l'app 🚀

1. Ouvre `index.html` dans ton navigateur
2. Tu vois une page de login
3. Clique sur **"Créer un compte"**
4. Remplis:
   - Email: `test@example.com` (ou le tien)
   - Mot de passe: `password123` (au moins 6 caractères)
   - Confirme: `password123`
5. Clique sur **S'inscrire**

**✅ Tu es inscrit et connecté!**

---

### Étape 3: Utilise le planificateur 📝

1. Tu vois maintenant le planificateur complet
2. Ajoute des notes, tâches, événements
3. **Tout est sauvegardé automatiquement dans Supabase** ☁️

---

## 🔄 Prochaine visite

1. Ouvre `index.html`
2. Connecte-toi avec tes identifiants
3. ✅ Toutes tes données sont restaurées!

---

## 📱 Multi-appareil

- Connecte-toi depuis ton téléphone avec le même email
- ✅ Tu vois les mêmes données partout
- ✅ Les changements se synchronisent

---

## ⚠️ Avant de commencer

Assure-toi d'avoir:
- ✅ Un compte Supabase (déjà créé)
- ✅ Un projet Supabase (déjà créé)
- ✅ Les fichiers: `index.html`, `supabase.js`, `episode-tracker.html`
- ✅ Les nouveaux fichiers: `setup.sql`, `SETUP_GUIDE.md`

---

## ❓ Questions Fréquentes

### "Le login ne marche pas"
- Vérifie que tu as exécuté `setup.sql` ✅
- Attends 2 secondes après signup avant de tester
- Regarde la console (F12 → Console) pour les erreurs

### "Mes données ne se sauvegardent pas"
- Vérifie que tu es connecté (vérifies le bouton "Déconnexion")
- Regarde la console pour les erreurs Supabase
- Essaie de recharger la page (F5)

### "J'ai oublié mon mot de passe"
- À implémenter (voir SETUP_GUIDE.md)
- Pour maintenant: Crée un nouveau compte

### "Je veux utiliser une vraie URL"
- Configure un domaine custom
- Ou utilise un service comme Vercel/Netlify pour héberger
- Supabase supporte les URLs custom

---

## 📂 Structure des fichiers

```
planner/
├── index.html           ← Fichier principal (modifié)
├── episode-tracker.html ← Inchangé
├── supabase.js          ← ✨ Nouveau (config Supabase)
├── setup.sql            ← ✨ Nouveau (schéma BD)
├── SETUP_GUIDE.md       ← Nouvelle (doc complète)
└── instructions.md      ← Celle-ci
```

---

## 🔐 Sécurité

- 🔒 Tes mots de passe sont hachés par Supabase
- 🔒 Chaque user ne voit que ses propres données
- 🔒 Les clés API sont protégées
- ✅ Row-Level Security activée

---

## 📞 Besoin d'aide?

1. Regarde `SETUP_GUIDE.md` pour une doc complète
2. Ouvre la console (F12) pour voir les erreurs
3. Vérifie dans Supabase que les tables existent
   - SQL Editor → Voir quels tables existent

---

## 🎉 Bravo!

Tu as maintenant un planificateur:
- ✅ Avec authentification sécurisée
- ✅ Avec sauvegarde cloud
- ✅ Multi-appareil
- ✅ Zéro serveur complexe

Enjoy! 🚀
