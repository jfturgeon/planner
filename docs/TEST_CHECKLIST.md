# 🧪 Test Checklist - Planificateur Supabase

## ✅ Tests à Effectuer

### Test 1: Page de Login Apparaît ✅
- [ ] Ouvre `index.html` dans le navigateur
- [ ] **Attendu**: Voir la page de login avec:
  - Input Email
  - Input Password
  - Bouton "Se connecter"
  - Lien "Créer un compte"
- [ ] **Vérifier Console**: Pas d'erreurs rouges (F12 → Console)

### Test 2: Création de Compte 📝
- [ ] Clique "Créer un compte"
- [ ] **Attendu**: Formulaire signup apparaît
- [ ] Remplis:
  - Email: `test123@example.com` (change le numéro!)
  - Password: `TestPassword123`
  - Confirm: `TestPassword123`
- [ ] Clique "S'inscrire"
- [ ] **Attendu**: Succès et auto-login vers le planificateur

### Test 3: Planificateur Charge ✅
- [ ] **Attendu**: Voir le planificateur principal
- [ ] Bouton "Déconnexion" visible dans l'header
- [ ] Console: Message "✅ Data synced from Supabase"

### Test 4: Ajoute des Données 📝
- [ ] Clique sur une date quelconque
- [ ] Ajoute une note ou une tâche
- [ ] Clique "Sauvegarder"
- [ ] **Attendu**: Toast "Sauvegardé" (ou ✅ log dans console)

### Test 5: Reload = Persistance ↻
- [ ] Appuie sur **F5** (reload la page)
- [ ] **Attendu**: 
  - Login form réapparaît d'abord
  - Tu dois te reconnecter (c'est normal, première visite)
  - Après login → données restaurées ✨

### Test 6: Logout & Relogin
- [ ] Clique "Déconnexion"
- [ ] **Attendu**: Page de login réapparaît qui
- [ ] Reconnecte-toi avec les mêmes identifiants
- [ ] **Attendu**: Toutes les données sont de retour! ☁️

### Test 7: Multi-Device (Bonus) 📱
- [ ] Ouvre depuis ton téléphone
- [ ] Connecte-toi avec le même email/password
- [ ] **Attendu**: Même données que sur desktop

---

## 🔍 Vérifications Console (F12 → Console)

### À la page load:
```
✅ initAuth() appelé
```

### Après login:
```
✅ Data synced from Supabase
```

### Après sauvegarder:
```
(Pas d'erreur rouge!)
```

### Pas d'erreurs attendues:
```
❌ CORS error
❌ TypeError: supabase is undefined
❌ "data.json" not found
```

Si tu vois ces erreurs → quelque chose ne va pas.

---

## 🐛 Troubleshooting Rapide

| Problème | Solution |
|----------|----------|
| "Erreur de connexion" | Vérifies email/password, ou crée nouveau compte |
| Console rouge "Cannot read property 'createClient'" | Supabase SDK pas chargé, attends 2 secondes |
| Données ne persist pas après reload | Vérifies que setup.sql a été exécuté dans Supabase |
| "RLS policy" error | Exécute setup.sql complet (y compris les policies) |

---

## ✨ Si Tout Fonctionne

Bravo! Tu as:
- ✅ Intégration Supabase en production
- ✅ Authentification sécurisée
- ✅ Cloud storage
- ✅ Multi-device sync

C'est un MVP complet! 🚀

---

## 📊 Checklist Finale

- [ ] Page load → Login form visible
- [ ] Signup → Account créé
- [ ] Login → Planificateur visible  
- [ ] Add data → Sauvegardé
- [ ] Reload → Data persiste
- [ ] Logout/Login → Data back
- [ ] Console → Pas d'erreurs

**Si tous les checks sont ✅ → READY FOR PRODUCTION! 🎉**
