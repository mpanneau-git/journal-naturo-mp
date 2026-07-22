# Journal de Suivi — Michaël Panneau

Application web de journal hebdomadaire pour clients naturopathie.

## Stack
- React + Vite (frontend)
- Vercel Serverless Functions (API)
- Notion (base de données)
- Make (automatisation email dimanche 23h59)

## Variables d'environnement (à configurer dans Vercel)

```
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=ab293d9a451d42bd85d5bbad0b795878
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/xxxxxxxxxxxxxxxx
```

## Déploiement

1. Push ce repo sur GitHub
2. Importer dans Vercel → New Project → Import Git Repository
3. Ajouter les 3 variables d'environnement dans Vercel → Settings → Environment Variables
4. Déployer → URL générée automatiquement (ex: journal-naturo-mp.vercel.app)

## Notion

Base de données cible : `📓 Journaux de suivi hebdomadaires`
ID : `ab293d9a451d42bd85d5bbad0b795878`

Créer une intégration sur notion.so/my-integrations et partager la base avec elle.
