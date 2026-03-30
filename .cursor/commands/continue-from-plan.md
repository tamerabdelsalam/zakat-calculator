# Continue from implementation plan

Follow these steps in order. Checklist lines are **not** full specs—use the implementation plan, existing code patterns, and project rules for design details.

## Repository context

- This is an **Arabic-first zakat calculator** (`lang="ar"`, `dir="rtl"`).
- Calculation rules are in `docs/zakat-rules-reference.md` (Thndr specification).
- All user-facing text must be in Arabic. Use logical CSS properties (start/end).

## 1. Progress snapshot

From the **repository root**, run:

```bash
npm run docs:progress
```

Include the command output in your reply.

## 2. Read project docs

- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — architecture and phased roadmap.
- [docs/IMPLEMENTATION_PROGRESS.md](docs/IMPLEMENTATION_PROGRESS.md) — full checklist for context.

## 3. Suggest major phase, subsection, and next slice (auto)

**User-facing reply (what the user sees):** Use the steps below **internally** to compute phase, section, and slice. In the **visible** reply, **do not** walk through the algorithm (e.g. "first incomplete `####`…") unless the user asks.

- **Order:** `npm run docs:progress` output (§1) → at most **one line** of doc context if it helps → **recommended next slice only** as the main body: a **short** plain sentence and/or **1–3 bullets** (parent checklist rows you will implement on `YES`) → minimal confirmation block (§4).
- **Phase / subsection labels:** Do **not** use large separate headings for them. Optionally add **one** subtitle line the user can ignore, e.g. `Context: Phase 2 · Calculation Engine`.
- **Risk / bigger bite:** At most **one** optional line **after** the slice bullets (deferral or "if you prefer a bigger bite: …"). Do **not** use a second template block for alternatives.

**Major phase (compute first):**

1. Open `docs/IMPLEMENTATION_PROGRESS.md` and scan top-to-bottom.
2. Find the **first** line matching `### Phase` (roadmap order).
3. The **major phase** is the **first** such heading whose region (from that line until the next `### Phase` or end of file) contains **at least one** unchecked task line `- [ ]`.

**Suggested subsection (`#### N.M`) within that major phase:**

4. Inside that major phase only, scan top-to-bottom for headings matching **`#### N.M`** — pattern: `####` + space + a section id like `1.3`, `2.1`, `4.2` (digit(s), `.`, digit(s), then the rest of the title).
5. **Suggested section** is the **first** such `####` block whose span (from that line until the next `####` or `### Phase`) contains **at least one** `- [ ]`.

**Edge case:** If the major phase has no `####` headings, fall back to naming only the major phase and pick **1–3** unchecked parent items from that phase's body.

**Override:** If the user already specified a **major phase** and/or **subsection** in this thread (e.g. "Phase 2", "1.4", "Phase 1.4"), use that instead. Say **Overriding suggestion:** and what you changed.

**Next slice:** Pick **1–3** unchecked `- [ ]` **parent** items **only from inside the suggested `#### N.M` section** (or from the major phase body if no `####` subsections exist). Don't expand a single checkbox into multiple "items" from its indented sub-bullets. One short line per item.

**Risk-aware refinement:** If the literal next checkboxes would be **heavy or tangled** for one session, your **visible** recommendation must still be the **smallest clear slice** you would ship first (usually still inside the same `#### N.M`). Fold deferrals into that slice or into the **single** optional line after the bullets; the `YES` default stays the **lowest-regret** slice.

## 4. Confirm before coding

**Stop** after step 3. Do **not** edit application code, refactors, or checkboxes until the user replies.

**Internally** retain the major phase and `#### N.M` subsection you used so §5 doc updates stay accurate and so you can honor `ADJUST`, `PHASE N`, or `SECTION N.M` if the user sends them—you **need not** list those keywords as a tutorial.

Between the bullets and **Next step** below, you may insert **at most one** extra user-facing line (deferral or bigger-bite hint). If none, **omit** that line—do not print a placeholder.

End your message with **exactly** this structure (fill bracketed placeholders). This is the **only** scope summary the user needs; do **not** repeat the same scope at length outside it.

---

**Recommended next slice**

- [verbatim parent checklist line 1 — refined/safe default when the section is risky]
- [optional parent line 2]
- [optional parent line 3]

**Next step:** Reply `YES` to implement this slice, `UNTIL N` to auto-continue through Phase N, or say what you want changed.

---

Answering clarifying questions before `YES` or a scope change is fine.

## 5. After the user confirms (`YES`)

- Implement **only** the agreed scope. Match [`.cursor/rules`](.cursor/rules) (RTL layout, route groups, component structure, price data, zakat domain).
- When done, update checkboxes in `docs/IMPLEMENTATION_PROGRESS.md`.
- Run **`npm run verify`** before treating the work as finished.

## 6. Auto-continue mode (`UNTIL N`)

When the user replies `UNTIL N` (e.g. `UNTIL 3`) instead of `YES`, implement the current slice **and then loop**, picking and implementing successive slices without further confirmation until all tasks through Phase N (inclusive) are done.

### Safety commit

Before starting the first slice, create a **WIP commit** of the current working tree so the user can `git diff` or `git reset --hard` to recover if the loop goes sideways:

```bash
git add -A && git commit -m "wip: checkpoint before auto-continue UNTIL N"
```

If the working tree is already clean, skip the commit.

### Loop behavior

1. **Implement** the current slice (same rules as §5).
2. **Run `npm run verify`.**
   - If it **fails**: attempt to fix the issue and re-run `npm run verify` **once**. If the second attempt also fails, **stop the loop** and report the error.
3. **Update docs** — checkboxes in `IMPLEMENTATION_PROGRESS.md`.
4. **Check for remaining work** — re-read `IMPLEMENTATION_PROGRESS.md`. If there are no unchecked `- [ ]` tasks in phases ≤ N, **stop** and print the final summary (see below). Otherwise continue.
5. **Pick the next slice** using the same algorithm as §3 (first incomplete `#### N.M` within the first incomplete `### Phase` that is ≤ N).
6. **Print a slice header** before implementing:

```
--- Auto-continuing (Phase X · Section Title) ---
- checklist item 1
- checklist item 2
```

7. When crossing from one `### Phase` to the next, print: `Crossing into Phase X...`
8. **Go to step 1.**

### Final summary

When the loop ends (either all tasks through Phase N are done or verify failed twice), print:

```
--- Auto-continue complete ---
Slices completed: [count]
Progress: [done]/[total] tasks through Phase N
[Stopped early: verify failed in Phase X (if applicable)]
```
