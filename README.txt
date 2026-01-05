# Jeu interactif (HTML) — Trier les fiches par opération

## Comment ça marche
- 10 fiches tirées au hasard.
- L'élève glisse la fiche dans la case : +, -, x, :
- À la fin : score / 10.

## Déploiement sur Cloudflare Pages
1) Crée un projet Cloudflare Pages (Upload direct ou GitHub).
2) Dépose **tout le contenu** de ce dossier.
3) Build command : (vide) / Framework preset : None
4) Le site est prêt : `index.html` est la page d'accueil.

## Modifier les réponses attendues
- Ouvre `data/cards.json`
- Chaque entrée : { "file": "cards/fiche_01.png", "op": "+" }
- op doit être l'un de : +  -  x  :
