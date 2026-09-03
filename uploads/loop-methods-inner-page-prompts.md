# Loop Methods Revamp — Inner Page Prompts (Part 2)

Prerequisite: BLOCK 1 (Design System) and BLOCK 2 (Homepage) are already built.
Build these one page per prompt, in this order. Each prompt begins by re-anchoring the
design system so Claude Design doesn't drift. Do not paste more than one page at a time.

RULE FOR ALL PAGES: Do not invent content. Where real copy, names, roles, metrics,
quotes, or photos don't exist yet, insert a clearly labelled placeholder (e.g.
"[ROLE TITLE]", "[client quote — to be supplied]") rather than fabricating.

---

## PAGE 1 — ABOUT  (/about)

```
Using the established Loop Methods design system, build the About page. Keep section gaps
consistent with the spacing system. Real copy where noted; placeholders otherwise.

1. PAGE HERO
   - Eyebrow: "About Loop Methods"
   - Heading two lines: "Navigate the" (white) + "Digital Frontier." (ShinyText)
   - Subcopy: Loop is a multi-industry technology partner delivering high-quality, scalable
     solutions backed by a diverse, senior team — measured by outcomes, not hours.

2. WHO WE ARE  (two-column: short narrative left, supporting image/placeholder right)
   - Real positioning: collaborating globally to turn challenges into opportunities through
     software, blockchain, Web 3.0, Industry 4.0, AI/ML and Salesforce.

3. STATS BAND  (reuse homepage component, identical styling)
   - 16+ Countries · 100+ Clients · 160+ Projects · 40+ Consultants.

4. WHAT SETS US APART  (4 cards — real copy, NOT placeholder)
   - Industry Expertise (15+ years), Cutting-Edge Technology, User-Centric Design,
     Robust Security. One real sentence each.

5. TEAM / CULTURE  (optional)
   - Brief culture statement. If no bios/photos exist, use placeholder cards labelled clearly.

6. CLOSING CTA — "Work with us" + "Get in Touch".
```

---

## PAGE 2 — SERVICES  (/services)

```
Using the established Loop Methods design system, build the Services page. Consistent gaps.

1. PAGE HERO
   - Eyebrow: "What we do"
   - Heading: "Engineered for" (white) + "global business." (ShinyText)
   - Subcopy: end-to-end delivery across six practice areas.

2. SERVICE SECTIONS  (one block per service — alternating image/text layout, consistent rhythm)
   - Software Development, Blockchain, Web 3.0, Industry 4.0 Solutions, AI & ML, Salesforce.
   - Each: short real description + 3-4 capability bullets. No Lorem Ipsum.

3. HOW WE WORK  (4-step process, reuse homepage styling)
   - Discovery & Feasibility Analysis → Strategy Development →
     Development & Integration → Deployment & Test Cases. Real one-liners.

4. CLOSING CTA — "Have a project in mind?" + "Get in Touch".
```

---

## PAGE 3 — PROJECTS / CASE STUDIES  (/projects)

```
Using the established Loop Methods design system, build the Projects page. Consistent gaps.

1. PAGE HERO
   - Eyebrow: "Our work"
   - Heading: "Featured" (white) + "Cases." (ShinyText)
   - Subcopy: real outcomes across industries.

2. (Optional) FILTER ROW — category pills (All, AI/ML, Web 3.0, Salesforce, etc.).
   Visual only unless filtering logic is requested.

3. CASE GRID  (Loop's real projects — card each, consistent card component)
   - LED 360 — vehicle assistance platform (towing, repairs, care).
   - FrequenC — Web 3.0 event platform.
   - Dubber — proof of concept delivered in two months by a lean team.
   - WLOG — smart water disaster management with real-time monitoring.
   - Each card: image placeholder, title, 1-2 sentence real description, "Know more" link.
   - For any metric not provided, use a placeholder — do not invent results.

4. CLOSING CTA — "Want results like these?" + "Get in Touch".
```

---

## PAGE 4 — CAREER  (/career)

```
Using the established Loop Methods design system, build the Career page. Consistent gaps.

1. PAGE HERO
   - Eyebrow: "Careers"
   - Heading: "Build what's" (white) + "next." (ShinyText)
   - Subcopy: join a senior, multi-industry engineering team.

2. WHY LOOP  (3-4 culture/benefit cards — write generic-but-true statements or placeholders;
   do NOT invent specific perks that may not exist).

3. OPEN ROLES  (list/cards)
   - IMPORTANT: do not invent job listings. Render a clearly labelled placeholder list
     ("[Role title] · [Location] · [Type]") with an "Apply" link, ready to populate later.
   - If no roles, show a "No open roles right now — send us your resume" state.

4. APPLICATION CTA — "Don't see your role?" + email/apply button.
```

---

## PAGE 5 — CONTACT  (/contactUs)

```
Using the established Loop Methods design system, build the Contact page. Consistent gaps.

1. PAGE HERO
   - Eyebrow: "Contact us"
   - Heading: "Let's" (white) + "talk." (ShinyText)

2. TWO-COLUMN
   - Left: contact form (Name, Email, Company, Message, Submit).
     Use React state + onClick handlers — do NOT rely on native HTML form submit.
     Note in the build: the form needs a backend/endpoint wired separately; leave a clearly
     marked submit handler stub.
   - Right: real contact details —
     LOOP IT METHODS PVT LTD, 4th floor, Unit 405/406, Tower B, Logix Technopark,
     Sector 127, Noida, Uttar Pradesh, 201313 India.
     +91 9811780576 · info@loopmethods.com.

3. (Optional) MAP embed placeholder for the Noida office.

4. FOOTER — same global footer as the rest of the site.
```

---

## Build order recap
Design System → Homepage → About → Services → Projects → Career → Contact.
After each page renders, check the section gaps against the spacing system before moving on.
Keep the accent token (#64CEFB or your chosen color) identical across every page.
