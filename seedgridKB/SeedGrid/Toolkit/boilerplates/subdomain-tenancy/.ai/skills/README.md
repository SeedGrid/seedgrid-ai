# Skills

This directory stores project-local skills for `seedgrid` (subdomain-tenancy boilerplate).

## Available skills

- `seedgrid-new-screen`
  - checklist to add a screen, menu item or permission without forgetting a synced place
  - covers migration (audience, ADMIN, plan terms), `@PermissionsAllowed`/`@RequiresPlanFeature`, `data.ts`,
    `Shell` icon/active item, profile-editor catalogs and the sellable plan-feature tree
  - use whenever a screen, action or permission is created, moved or renamed
  - note: here the app migrations (`db/migration/app`) run in the MASTER database

## Directory pattern

Each skill lives in its own folder (`.ai/skills/<name>/SKILL.md`), with optional `references/` and `agents/`.
