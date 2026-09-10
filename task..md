Да. Ниже ТЗ уже **под твою текущую архитектуру**: один Vite/React repo, один Railway service и два поддомена.

````md
# TASK: Split one Vite/React repo into two hostname-based landing sites

You are working inside the copied G2M repository.

This repository is deployed as ONE Railway service, but TWO custom domains point to the same deployment:

- https://consulting.go2market.qa
- https://registration.go2market.qa

The goal is to make the same codebase render two different focused websites depending on the current hostname.

IMPORTANT:
- Do NOT create a second repository.
- Do NOT create a second Vite project.
- Do NOT migrate away from Vite.
- Do NOT create a monorepo.
- Do NOT duplicate the whole application.
- Reuse shared components and styles.
- Make the smallest clean architectural change necessary.

---

# CURRENT STACK

The project uses:

- Vite
- React 19
- TypeScript
- React Router DOM v7
- Tailwind CSS 4
- Lucide React
- SSR / pre-rendering via `scripts/prerender.mjs`
- Railway deployment

Existing shared functionality includes:

- Header
- Footer
- Hero
- ContactForm
- WhatsAppWidget
- case studies
- service pages
- privacy page
- terms page
- Google Analytics
- Meta/Facebook Pixel
- existing G2M Qatar design system

---

# DOMAINS

The application must behave differently based on hostname.

## Consulting

Hostname:

`consulting.go2market.qa`

Purpose:

Business Consultation / Advisory / Market Entry / Growth

## Registration

Hostname:

`registration.go2market.qa`

Purpose:

Company Registration / Business Setup / Setup Support in Qatar

Both domains resolve to the SAME Railway service and SAME codebase.

---

# PRIMARY ARCHITECTURE

Create a central site-detection layer.

Example concept:

```ts
export type SiteType = 'consulting' | 'registration';

export function getSiteType(hostname: string): SiteType {
  if (hostname.startsWith('registration.')) {
    return 'registration';
  }

  return 'consulting';
}
````

Do not scatter hostname checks throughout many components.

Keep hostname/domain logic centralized.

Suggested location:

```text
src/config/site.ts
```

or:

```text
src/lib/site.ts
```

The implementation must also support localhost development.

For localhost, provide a simple development fallback.

For example:

* default localhost → consulting
* `?site=registration` → registration

or another clean development mechanism.

Document how to preview both sites locally.

---

# DESIRED PROJECT STRUCTURE

Prefer an architecture similar to:

```text
src/
├── sites/
│   ├── consulting/
│   │   ├── ConsultingHomePage.tsx
│   │   ├── ConsultingServicePage.tsx
│   │   └── sections/
│   │
│   └── registration/
│       ├── RegistrationHomePage.tsx
│       ├── RegistrationServicePage.tsx
│       └── sections/
│
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ContactForm.tsx
│   └── ...
│
├── config/
│   └── site.ts
│
└── App.tsx
```

This is only a guideline.

Inspect the current repository first and adapt to the existing structure instead of forcing unnecessary rewrites.

---

# SHARED VS SITE-SPECIFIC

The following should remain shared where practical:

* Header base component
* Footer base component
* buttons
* typography
* cards
* layout primitives
* ContactForm
* analytics
* tracking
* language system
* Tailwind design tokens
* icons
* common animations
* privacy / terms handling

The following should be site-specific:

* hero messaging
* main service content
* CTA copy
* section order
* SEO metadata
* selected FAQ
* service positioning
* form default service/source

Avoid duplicating identical components.

---

# CONSULTING SITE

Domain:

`consulting.go2market.qa`

Primary goal:

Convert visitors into Business Consultation leads.

The visitor should immediately understand that G2M helps businesses enter, operate, and grow in Qatar.

Recommended homepage structure:

## Hero

Headline direction:

"Navigate Business in Qatar with Expert Guidance"

Alternative direction:

"Build and Grow Your Business in Qatar"

Subheadline:

Explain that G2M provides practical business consulting, market-entry guidance, strategic support, and local market insight.

Primary CTA:

"Book a Business Consultation"

Secondary CTA:

"Explore Consulting Services"

---

## Consulting Areas

Highlight areas such as:

* Market Entry Strategy
* Business Strategy
* Growth Planning
* Business Development
* Operational Guidance
* Local Market Orientation

Do not invent capabilities not supported by the existing G2M positioning.

---

## Who We Help

Examples:

* Entrepreneurs
* SMEs
* International companies
* Investors entering Qatar
* Companies planning expansion

---

## How Consultation Works

Use a simple process such as:

1. Initial Consultation
2. Business Situation Review
3. Strategic Recommendations
4. Action Plan
5. Ongoing Support if needed

Frame this as G2M's service process, not as a legal requirement.

---

## Why G2M

Use qualitative trust factors:

* Local market understanding
* Practical guidance
* Personalized approach
* Clear communication
* End-to-end business support

Do not invent statistics.

---

## Case Studies

Reuse existing relevant case studies.

Show only a selected subset if appropriate.

---

## FAQ

Relevant topics:

* What can G2M advise on?
* Who is business consultation for?
* Can G2M support market entry into Qatar?
* Can consultation continue after initial setup?
* How does the consultation process work?

Avoid invented guarantees or fixed outcomes.

---

## Final CTA

Strong final CTA:

"Discuss Your Business Plans with G2M"

Lead directly to ContactForm.

---

# REGISTRATION SITE

Domain:

`registration.go2market.qa`

Primary goal:

Convert visitors who want to start/register a company in Qatar.

Recommended homepage structure:

## Hero

Headline direction:

"Start Your Company in Qatar with G2M"

Subheadline:

Explain that G2M supports entrepreneurs and businesses through company setup, registration coordination, documentation, and related business setup steps.

Primary CTA:

"Start Your Company Registration"

Secondary CTA:

"See How It Works"

---

## What G2M Helps With

Possible areas:

* Company structure guidance
* Registration coordination
* Licensing support
* Documentation support
* Business setup guidance
* Visa-related business support
* Corporate bank account preparation support

Use careful terms such as:

* support
* guidance
* assistance
* coordination

Do NOT promise:

* guaranteed approval
* guaranteed bank account
* guaranteed license
* guaranteed visa
* fixed completion dates

---

## Who It Is For

Examples:

* Entrepreneurs
* Foreign investors
* SMEs
* International companies
* Businesses entering Qatar

---

## Registration Process

Present a simple service process, such as:

1. Initial Consultation
2. Business Activity Review
3. Structure Selection Guidance
4. Documentation & Registration Support
5. Post-Registration Setup Support

Do not describe this as an official legal sequence unless already verified in existing content.

---

## Why Register with G2M

Use qualitative trust positioning:

* local market knowledge
* clear guidance
* practical coordination
* personalized setup support
* support beyond registration

---

## FAQ

Possible topics:

* How can I register a company in Qatar?
* Can foreign investors establish companies in Qatar?
* What business structure should I choose?
* What documents may be required?
* How long can the process take?
* Can G2M help after registration?
* Can G2M assist with visas or business bank account preparation?

Where requirements depend on business type/activity/ownership, state that clearly.

Do not invent exact regulatory facts.

---

## Final CTA

Example:

"Ready to Start Your Company in Qatar?"

CTA:

"Start Your Registration"

Lead directly to ContactForm.

---

# CONTACT FORM

Reuse the existing ContactForm component.

Do not create two separate forms unless absolutely necessary.

The form must automatically understand which site generated the lead.

Example:

On consulting domain:

```text
service = "Business Consultation"
source = "consulting.go2market.qa"
```

On registration domain:

```text
service = "Company Registration"
source = "registration.go2market.qa"
```

If the current form supports preselected services, use that capability.

If not, extend the component cleanly with props such as:

```tsx
<ContactForm
  defaultService="Business Consultation"
  source="consulting.go2market.qa"
/>
```

or:

```tsx
<ContactForm
  defaultService="Company Registration"
  source="registration.go2market.qa"
/>
```

Do not duplicate form logic.

Keep existing analytics integration.

---

# HEADER

Use the same base Header component, but configure navigation and CTA based on site type.

## consulting.go2market.qa

Suggested navigation:

* Consulting
* How It Works
* Case Studies
* FAQ
* Contact

Primary CTA:

"Book a Consultation"

## registration.go2market.qa

Suggested navigation:

* Company Registration
* Process
* FAQ
* Contact

Primary CTA:

"Start Registration"

The header should not expose irrelevant navigation from the old general website.

---

# FOOTER

Keep G2M branding and required legal links.

Shared footer can be reused.

Legal pages:

* `/privacy`
* `/terms`

Make sure they work correctly on both domains.

---

# WHATSAPP

Remove WhatsAppWidget from the active UI on both new focused sites.

The ContactForm should be the primary conversion channel.

Do not delete code unnecessarily if removing it from rendering is sufficient.

---

# ROUTING

React Router must continue to work.

Keep routes simple.

Both hostnames should support:

```text
/
```

Optional detail routes may remain if useful.

The main homepage content must be determined by site type.

Do not require users to visit:

```text
consulting.go2market.qa/business-consultation
```

just to see the main consultation landing.

The domain itself is already the landing page:

```text
consulting.go2market.qa/
```

Likewise:

```text
registration.go2market.qa/
```

should itself be the registration landing page.

Existing case studies and legal routes may remain shared.

---

# SEO

SEO must be different for the two domains.

## consulting.go2market.qa

Homepage title direction:

`Business Consulting in Qatar | G2M`

Description direction:

G2M provides business consulting, market-entry guidance, and strategic support for companies and entrepreneurs operating in Qatar.

Canonical:

`https://consulting.go2market.qa/`

---

## registration.go2market.qa

Homepage title direction:

`Company Registration in Qatar | G2M`

Description direction:

G2M supports entrepreneurs and businesses with company registration and business setup in Qatar.

Canonical:

`https://registration.go2market.qa/`

---

Also configure:

* Open Graph title
* Open Graph description
* Open Graph URL
* canonical
* structured data where appropriate

Do not allow the consulting domain to output registration canonical URLs or vice versa.

---

# IMPORTANT: PRERENDER / SSR

The project currently uses:

`scripts/prerender.mjs`

This needs careful handling.

Inspect how the current pre-render system works.

Because both domains share the same deployment, ensure that pre-rendered HTML does not incorrectly hard-code one site's:

* title
* description
* canonical
* hero content

for the other hostname.

Before implementing large changes:

1. inspect the prerender architecture
2. determine how hostname-specific rendering can work with the current setup
3. preserve SSR/pre-render functionality if possible
4. do not silently break SEO

If true hostname-aware pre-rendering is not possible with the current architecture, clearly document the limitation and implement the cleanest compatible solution rather than hiding the problem.

Do not migrate the project to Next.js just to solve this.

---

# ANALYTICS

Preserve existing:

* Google Analytics
* Meta Pixel

Add useful site context to events where possible.

Examples:

```text
site: consulting
```

or:

```text
site: registration
```

Track meaningful conversion events:

* CTA click
* form start
* form submit
* lead success

Avoid duplicate events.

---

# DESIGN

Both websites should clearly belong to the same G2M brand.

Use the existing:

* Qatar-maroon design system
* typography
* Tailwind patterns
* button system
* card system
* responsive layout
* icons
* animations where appropriate

However, the two sites can have slightly different emphasis.

## Consulting

Feel:

* strategic
* executive
* professional
* advisory
* premium

## Registration

Feel:

* clear
* structured
* reassuring
* practical
* process-oriented

Do not create two unrelated visual identities.

---

# CONVERSION PRINCIPLES

These are action-oriented websites.

Every major section should answer one of these questions:

* What does G2M help me with?
* Is this relevant to me?
* Why should I trust G2M?
* How does the process work?
* What should I do next?

Primary CTA should appear multiple times naturally.

Do not overload pages with excessive text.

Avoid generic corporate filler.

Do not create decorative sections without a conversion purpose.

---

# CONTENT SAFETY / ACCURACY

Do NOT invent:

* prices
* government fees
* legal requirements
* guaranteed timelines
* approvals
* testimonials
* client logos
* awards
* statistics
* licenses
* certifications
* employee counts
* years of experience

Reuse verified existing company information where available.

If uncertain, use neutral wording.

---

# IMPLEMENTATION ORDER

Work in this order:

1. Inspect current App/router architecture.
2. Inspect current prerender setup.
3. Inspect Header/Footer/ContactForm.
4. Create centralized site detection.
5. Add local development site switching.
6. Build consulting site.
7. Build registration site.
8. Configure shared Header/Footer.
9. Configure ContactForm source/default service.
10. Remove WhatsAppWidget from active rendering.
11. Configure site-specific SEO.
12. Update prerender logic carefully.
13. Preserve analytics.
14. Test all existing shared routes.
15. Test both hostnames conceptually.
16. Run TypeScript checks.
17. Run production build.
18. Fix all introduced errors.

---

# LOCAL DEVELOPMENT

Because localhost does not contain the production subdomain, implement an easy way to preview both sites locally.

Preferred behavior:

```text
http://localhost:5173/
```

→ consulting by default

and:

```text
http://localhost:5173/?site=registration
```

→ registration

Alternatively, use another simple and clean development-only mechanism.

Production must rely on hostname, not query parameters.

---

# FINAL EXPECTATION

One codebase.

One Railway deployment.

Two independent marketing experiences:

```text
consulting.go2market.qa
→ Business Consultation

registration.go2market.qa
→ Company Registration
```

They must share infrastructure and reusable components while having different:

* positioning
* hero
* page structure
* copy
* CTAs
* form context
* navigation
* metadata
* canonical URLs

The final result should feel like two focused G2M acquisition funnels built from one maintainable codebase, not like two duplicated websites.

````

Есть только **один момент, на котором я бы попросил Cursor остановиться и отчитаться до реализации**: `prerender.mjs`.

Поскольку оба домена сейчас отдают один Railway deployment, обычная логика `window.location.hostname` отлично разделит сайты **в браузере**, но prerender может быть построен во время `npm run build`, когда реального hostname ещё нет. Поэтому в ТЗ я специально заставил Cursor сначала разобраться с текущим prerender, а не просто написать `window.location.hostname` и объявить задачу законченной.

Для пользователя два сайта при этом будут выглядеть абсолютно независимо:

```text
consulting.go2market.qa
→ только консультации

registration.go2market.qa
→ только регистрация
````

а для тебя под капотом останется **один GitHub + один Railway + общие компоненты**.
