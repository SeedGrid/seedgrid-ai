# Skills

This directory stores project-local skills for `seedgrid`.

## Available skills

- `seedgrid-crud`
  - standard for SeedGrid CRUD flows in Next.js
  - use separate `*_list` and `*_edit` pages
  - use `publicId` in public admin routes
  - use SeedGrid components
  - use `SgInputTextSearch` for remote search when applicable
- `seedgrid-new-screen`
  - checklist to add a screen, menu item or permission without forgetting a synced place
  - covers migration (audience, ADMIN, plan terms), `@PermissionsAllowed`/`@SgRequiresPlanFeature`, `data.ts`,
    `Shell` icon/active item, profile-editor catalogs and the sellable plan-feature tree
  - use whenever a screen, action or permission is created, moved or renamed
- `stripe-best-practices`
  - guides Stripe integration decisions and implementation reviews
  - covers Checkout vs PaymentIntents, subscriptions, Connect, Treasury, and security
  - prefer when building or changing payment and billing flows
- `stripe-directory`
  - helps find vendors, software, service providers, and partners
  - useful for discovery and, when applicable, programmatic purchasing flows
  - use to build short relevant shortlists for a business need or workflow
- `stripe-projects`
  - provisions infrastructure and third-party services through Stripe Projects
  - use for databases, auth, caching, hosting, API keys, monitoring, queues, storage, and similar setup tasks
  - also applies when the user asks how to get credentials for a third-party service
- `upgrade-stripe`
  - guide for upgrading Stripe API versions and SDKs
  - use when planning or executing Stripe version migrations

## Directory pattern

Each skill should live in its own folder, for example:

- `.ai/skills/seedgrid-crud/SKILL.md`

Optional supporting files may live under:

- `agents/`
- `references/`
- `scripts/`
- `assets/`
