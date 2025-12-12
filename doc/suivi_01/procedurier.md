# KAEB – Rapport du Sprint 1  
### Développement d’applications mobiles  
### Étudiant : Samer Sultan - Derek Lopez  
### Sprint 1 – Liste et Consultation  
### Date : 28 novembre  

---

# 1. Procédurier  
Résultats attendus pour les fonctionnalités développées dans le Sprint 1.  
Uniquement les fonctionnalités déjà implémentées sont documentées.

---

## 1.1 Authentification  
### Connexion
- Clic sur **Log in** avec email ou mot de passe vide → Message d’erreur.  
- Clic sur **Log in** avec informations invalides → Message d’erreur.  
- Clic sur **Log in** avec email + mot de passe valides → Navigation vers **HomeScreen**.  
- Clic sur **Register** → Ouverture de l’écran d’inscription.

### Inscription
- Clic sur **Register** avec champs incomplets → Message d’erreur.  
- Clic sur **Register** avec email déjà existant → Message d’erreur (contrainte unique).  
- Clic sur **Register** avec données valides → Requête Martha `register-user/execute` → Navigation vers Login.  

---

## 1.2 Liste des publications (HomeScreen)
1. L’application charge l’ID utilisateur via AsyncStorage.  
2. En parallèle, une requête POST est envoyée :  
   - `queries/select-posts/execute`
3. Martha retourne une liste JSON contenant :  
   - id  
   - user_id  
   - firstname / lastname  
   - avatar_url  
   - community  
   - description  
   - image_url  
   - created_at  
4. L’écran Home affiche chaque publication via **PostCard**.  
5. Pendant le chargement → “Loading posts…” apparaît.  
6. En cas d’erreur → la liste reste vide mais l’application ne plante pas.  

---

## 1.3 Consultation d’une publication (PublicationScreen)
1. L’utilisateur clique sur une publication.  
2. Navigation :  
   ```js
   navigation.navigate("Publication", { post })

# Documentation du projet

## Écran d’affichage

- **Image en grand**
- **Auteur**
- **Avatar**
- **Communauté**
- **Description**
- **Date**

Un bouton retour permet de revenir à **Home**.

---

## 1.4 Profil utilisateur (ProfileScreen)

- L’utilisateur clique sur l’onglet **Profil** dans la barre du bas.
- L’ID est récupéré via `AsyncStorage.getItem("user_id")`.
- Deux requêtes Martha sont appelées :
  - `select-profile/execute` (avatar + nom)
  - `select-user-posts/execute` (publications de l’utilisateur)

### Interface

- Avatar
- Onglet **Publicaciones**
- Onglet **Guardados**
- Onglet **Publicaciones** → Grille **3×3**
- Clic sur une image → ouverture de la publication

---

## 2. Identifiants des usagers tests

| id | firstname | lastname       | birthdate   | career | email           | password |
|----|-----------|----------------|-------------|--------|-----------------|----------|
| 4  | Derek     | Lopez          | 2003-11-30  | TI     | asd@gmail.com   | 123456   |
| 6  | Samer     | Sultan         | 2004-09-04  | TI     | a@gmail.com     | 123456   |

⚙️ Les mots de passe sont hashés avec :  
`SHA2(password,256)`

---

## 3. Standards de développement

### 3.1 Standards UI / UX

- Thème sombre uniforme
- Texte blanc sur fond noir
- Icônes **Ionicons** pour cohérence
- **BottomBar** visible sur toutes les pages
- **PostCard** comme composant réutilisable
- Profil inspiré d’Instagram (grille 3×3)
- Layout propre et minimaliste

### 3.2 Standards de nommage et structure du code

✔ **Règle 1** — Les dossiers racine sont toujours en minuscules  
✔ **Règle 2** — Les sous-dossiers sont en Majuscules (PascalCase)  


**Pourquoi ?**
- Facilite l’organisation
- Conforme aux conventions React Native
- Meilleure lisibilité
- Évite erreurs sensibles à la casse (Android/Linux)

### 3.3 Standards base de données

**Tables utilisées au Sprint 1 :**

#### Users
- id  
- firstname  
- lastname  
- birthdate  
- career  
- email (UNIQUE)  
- password (SHA2 hash)  
- avatar_url  
- created_at  

#### Posts
- id  
- user_id (FK vers Users.id)  
- communauté  
- description  
- image_url  
- created_at  

**Relation :**  
`Users (1) — (∞) Posts`

---

## 4. Guide de déploiement & sauvegarde

Ce guide explique en détail tout le processus technique, pour quelqu’un qui n’a jamais vu le projet.

### 4.1 Étape 1 – Création de la base de données SQL
### 4.2 Étape 2 – Création des queries Martha
### 4.3 Étape 3 – Liaison avec l’application (fetch)
### 4.4 Sauvegarde

# Complement de l’application

## ✅ UI
- Grand avatar  
- Onglets **“Publications”** / **“Enregistrés”**  
- Grille **3×3** inspirée d’Instagram  
- Tout aligné verticalement (résultat correct)  

---

## ✅ UX
- Onglets tactiles fonctionnels  
- Clic sur une photo → ouverture de **PublicationScreen**  
- Bouton de retour  
- **BottomBar** présent sur toute l’application  

---

## ✅ Données
- `select-profile/execute`  
- `select-user-posts/execute`  

**Données correctes envoyées par Martha :**
- `avatar_url`  
- `firstname`  
- `lastname`  
- `posts` de l’utilisateur  
- `image_url`  

---

## ✅ Persistance
- L’avatar persiste grâce à :
  - `upload-profile-avatar`
  - requête `update-avatar`  
- Les publications persistent (stockées dans la table **Posts**)  
- Le **fetch** est relancé correctement lors de l’entrée dans **Profile**  
