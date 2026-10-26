"""Check that every lab member's and alumnus's papers are found by their spellings.

The member and alumni "Papers" buttons open /publications/?author=<slug>, which
keeps papers whose author list contains any spelling of that person: `name`,
`name_ko` or an entry in `aliases` (case-sensitive, whole words, the same rule
that bolds lab names). A paper written with a spelling that is not listed, such
as "Bhattacharyya Chaitali" or "FIRDIANTIKA", is silently left out.

Run by hand after adding papers, members or alumni:
    pip install pyyaml
    python scripts/check_author_names.py

Errors (exit code 1):
  * two people share a slug, so one Papers button would open the other's list;
  * two people list the same spelling, so a paper would count for both.
Warnings (exit code 0), to review and copy into `aliases` when they are right:
  * the surname of someone with a distinctive surname appears in an author list,
    next to a name or initial starting with one of their given-name initials, without any
    listed spelling around it;
  * a Korean name appears spaced out ("류 준 환") without being listed.
Surnames shared by several lab people (Kim, Lee, Park, ...) are not scanned,
because a short form like "Kim J" cannot be assigned to one person
automatically; add such a spelling by hand only after checking the paper.
"""
from __future__ import annotations

import collections
import os
import re
import sys

import yaml

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
LATIN = "A-Za-zÀ-ɏ"


def load(name: str):
    with open(os.path.join(ROOT, "_data", f"{name}.yml"), encoding="utf-8") as f:
        return yaml.safe_load(f) or []


def slugify(s: str) -> str:
    """Jekyll's default slugify: lower case, runs of non-alphanumerics to '-'."""
    return re.sub(r"[\W_]+", "-", s.lower()).strip("-")


def word_re(spellings: list[str], flags: int = 0) -> re.Pattern | None:
    spellings = sorted({s for s in spellings if s}, key=len, reverse=True)
    if not spellings:
        return None
    alt = "|".join(map(re.escape, spellings))
    return re.compile(f"(?<![{LATIN}])(?:{alt})(?![{LATIN}])", flags)


def main() -> int:
    prof = load("professor")
    people = [("member", m) for m in load("members")] + [("alumni", a) for a in load("alumni")]
    pubs = load("publications")
    authors = [str(p.get("authors") or p.get("text") or "") for p in pubs]

    spell = []  # (label, spellings) for everyone, professor included
    spell.append((prof.get("name", "professor"), [prof.get("name"), prof.get("name_ko"), *(prof.get("aliases") or [])]))
    for _, p in people:
        spell.append((p.get("name") or p.get("name_ko"), [p.get("name"), p.get("name_ko"), *(p.get("aliases") or [])]))

    errors, warnings = [], []

    slugs = collections.defaultdict(list)
    for _, p in people:
        label = p.get("name") or p.get("name_ko")
        slugs[slugify(label)].append(label)
    errors += [f"slug '{s}' is shared by {', '.join(n)}" for s, n in slugs.items() if len(n) > 1]

    owners = collections.defaultdict(set)
    for label, sp in spell:
        for s in sp:
            if s:
                owners[s].add(label)
    errors += [f"spelling '{s}' is listed for {', '.join(sorted(o))}" for s, o in owners.items() if len(o) > 1]

    # Spans already covered by some listed spelling, per paper.
    every = word_re([s for _, sp in spell for s in sp])
    covered = [[m.span() for m in every.finditer(a)] if every else [] for a in authors]

    def uncovered(i: int, start: int, end: int) -> bool:
        return not any(s <= start and end <= e for s, e in covered[i])

    def initial_nearby(text: str, start: int, end: int, initials: str) -> bool:
        """True when the name part next to the surname starts with one of the
        person's given-name initials: "Shin, Yeonha", "Jo, S.", "M. S. Son",
        "Bhattacharyya Chaitali", "Indah Monisa firdiantika"."""
        tok = lambda s: [t.strip(".()") for t in re.findall(r"[^\s,;&]+", s)]
        before, after = tok(text[:start]), tok(text[end:])
        starts = lambda t: t[:1].casefold() in initials.casefold()
        if after and starts(after[0]):
            return True
        if before and starts(before[-1]):
            return True
        # "M. S. Son": a run of initials ending just before the surname
        return len(before) >= 2 and len(before[-1]) == 1 and len(before[-2]) == 1 and starts(before[-2])

    surnames = collections.Counter()
    for label, sp in spell:
        name = sp[0] or ""
        if " " in name:
            surnames[name.split()[-1].lower()] += 1

    skipped = []
    for kind, p in people:
        name, name_ko = p.get("name"), p.get("name_ko")
        hits = []
        if name and " " in name:
            sur = name.split()[-1]
            initials = "".join(g[0] for g in name.split()[:-1])
            if surnames[sur.lower()] > 1:
                skipped.append(name)
            else:
                rx = word_re([sur], re.IGNORECASE)
                for i, a in enumerate(authors):
                    for m in rx.finditer(a):
                        if uncovered(i, *m.span()) and initial_nearby(a, *m.span(), initials):
                            hits.append((i, m.start(), m.end()))
        if name_ko and len(name_ko) > 1:
            spaced = " ".join(name_ko)
            for i, a in enumerate(authors):
                for m in re.finditer(re.escape(spaced), a):
                    if uncovered(i, *m.span()):
                        hits.append((i, m.start(), m.end()))
        for i, s, e in hits:
            a = authors[i]
            snippet = a[max(0, s - 25):e + 25].replace("\n", " ")
            warnings.append(f"{name or name_ko} ({kind}): '{a[s:e]}' not covered in {pubs[i].get('year', 'n.d.')} paper: ...{snippet}...")

    for e in errors:
        print("ERROR  ", e)
    for w in warnings:
        print("WARNING", w)
    if skipped:
        print(f"Not scanned (surname shared by several lab people): {', '.join(sorted(skipped))}")
    print(f"{len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
