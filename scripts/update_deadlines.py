"""Weekly update of the AI conference deadlines (and Q1 journal list).

Run by .github/workflows/update-deadlines.yml every Monday, or by hand:
    git clone --depth 1 https://github.com/ccfddl/ccf-deadlines.git /tmp/ccfddl
    pip install pyyaml
    python scripts/update_deadlines.py --ccfddl /tmp/ccfddl --out _data

Sources, in order of trust:
  1. The curated list on s-elim.github.io (_data/conferences.yml). It decides
     which venues appear, their field and CORE rank, and every dated stage it
     already holds is kept as written.
  2. The ccf-deadlines dataset (github.com/ccfddl/ccf-deadlines). When the
     curated list has no date for an edition (TBA) or its call has closed, the
     dates, location and website come from the dataset's next edition.
  3. Each conference's official website. The page is fetched and searched for
     the paper deadline; the result is recorded as `site_check` and shown on the
     card. A website is never used to change a date.

Writes _data/conferences.yml, _data/journals.yml (copied from s-elim.github.io)
and _data/deadlines_meta.yml (update date and change log). Nothing is written if
validation fails, so a bad source can never break the site build.
"""
from __future__ import annotations

import argparse
import datetime as dt
import glob
import html
import os
import re
import sys
import urllib.request

import yaml

HOMEPAGE_DATA = "https://raw.githubusercontent.com/s-elim/s-elim.github.io/master/_data/"
USER_AGENT = "AVIL-deadline-bot/1.0 (+https://avil-lab.github.io/avil/deadlines/)"
# Curated name -> ccf-deadlines title, where the two differ.
ALIASES = {"kdd": "sigkdd"}
FLAGS = {
    "united states": "🇺🇸", "usa": "🇺🇸", "us": "🇺🇸", "canada": "🇨🇦", "mexico": "🇲🇽", "brazil": "🇧🇷",
    "united kingdom": "🇬🇧", "uk": "🇬🇧", "ireland": "🇮🇪", "france": "🇫🇷", "germany": "🇩🇪", "italy": "🇮🇹",
    "spain": "🇪🇸", "portugal": "🇵🇹", "netherlands": "🇳🇱", "belgium": "🇧🇪", "switzerland": "🇨🇭", "austria": "🇦🇹",
    "sweden": "🇸🇪", "norway": "🇳🇴", "denmark": "🇩🇰", "finland": "🇫🇮", "poland": "🇵🇱", "czech republic": "🇨🇿",
    "czechia": "🇨🇿", "greece": "🇬🇷", "turkey": "🇹🇷", "israel": "🇮🇱", "uae": "🇦🇪", "united arab emirates": "🇦🇪",
    "india": "🇮🇳", "china": "🇨🇳", "hong kong": "🇭🇰", "hong kong sar": "🇭🇰", "taiwan": "🇹🇼", "japan": "🇯🇵",
    "south korea": "🇰🇷", "korea": "🇰🇷", "singapore": "🇸🇬", "malaysia": "🇲🇾", "thailand": "🇹🇭", "vietnam": "🇻🇳",
    "indonesia": "🇮🇩", "philippines": "🇵🇭", "australia": "🇦🇺", "new zealand": "🇳🇿", "south africa": "🇿🇦",
    "egypt": "🇪🇬", "morocco": "🇲🇦", "chile": "🇨🇱", "argentina": "🇦🇷", "hungary": "🇭🇺", "romania": "🇷🇴",
    "croatia": "🇭🇷", "estonia": "🇪🇪", "iceland": "🇮🇸", "luxembourg": "🇱🇺", "slovenia": "🇸🇮",
}
STAGE_LABELS = {
    "abstract_deadline": "Abstract Deadline",
    "deadline": "Paper Submission",
    "rebuttal_deadline": "Rebuttal Deadline",
    "decision_deadline": "Notification",
}
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def norm(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def as_text(value) -> str:
    """YAML may parse 2026-11-16 as a date; keep every date as plain text."""
    if isinstance(value, (dt.date, dt.datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)


def fetch(url: str, timeout: int = 25, limit: int = 3_000_000) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read(limit)
        charset = r.headers.get_content_charset() or "utf-8"
        return r.status, raw.decode(charset, errors="replace")


# ---------------------------------------------------------------------- sources

def load_base(out_dir: str, log: list[str]) -> list[dict]:
    try:
        _, text = fetch(HOMEPAGE_DATA + "conferences.yml")
        base = yaml.safe_load(text)
        log.append("Base list: s-elim.github.io/_data/conferences.yml")
    except Exception as exc:  # network trouble: fall back to the copy in this repo
        with open(os.path.join(out_dir, "conferences.yml"), encoding="utf-8") as f:
            base = yaml.safe_load(f)
        log.append(f"Base list: local copy (homepage fetch failed: {exc})")
    if not isinstance(base, list) or len(base) < 10:
        raise SystemExit("Base conference list is missing or too short")
    for c in base:
        for st in c.get("timeline") or []:
            st["date"] = as_text(st.get("date", "tba"))
            if "time" in st:
                st["time"] = as_text(st["time"])
    return base


def load_ccfddl(root: str) -> dict[str, dict]:
    index: dict[str, dict] = {}
    for path in glob.glob(os.path.join(root, "conference", "*", "*.yml")):
        try:
            with open(path, encoding="utf-8") as f:
                entries = yaml.safe_load(f) or []
        except yaml.YAMLError:
            continue
        for e in entries:
            if isinstance(e, dict) and e.get("title") and e.get("confs"):
                index.setdefault(norm(e["title"]), e)
    if len(index) < 100:
        raise SystemExit(f"ccf-deadlines looks incomplete ({len(index)} conferences)")
    return index


# ---------------------------------------------------------------------- merging

def stage_instant(st: dict) -> dt.datetime | None:
    if not DATE_RE.match(str(st.get("date", ""))):
        return None
    return dt.datetime.strptime(st["date"] + " " + str(st.get("time", "23:59")), "%Y-%m-%d %H:%M")


def primary_stage(timeline: list[dict], now: dt.datetime | None = None) -> dict | None:
    """The full-paper submission stage: prefers a 'submission'/'full paper' label
    over abstract, registration or notification stages."""
    dated = [s for s in timeline or [] if stage_instant(s) and (now is None or stage_instant(s) > now)]
    skip = re.compile(r"abstract|registration|notification|rebuttal|camera|decision|author", re.I)
    for pattern in (r"paper submission|full paper|submission deadline|paper deadline", r"submission", r"paper"):
        hit = next((s for s in dated if re.search(pattern, s.get("label", ""), re.I) and not skip.search(s.get("label", ""))), None)
        if hit:
            return hit
    return None


def has_future_stage(conf: dict, now: dt.datetime) -> bool:
    return any((t := stage_instant(st)) and t > now for st in conf.get("timeline") or [])


def all_tba(conf: dict) -> bool:
    return all(stage_instant(st) is None for st in conf.get("timeline") or [])


def ccf_stages(cconf: dict) -> list[dict]:
    """ccf-deadlines timeline -> list of {label, date, time, tz}, oldest first."""
    tz = str(cconf.get("timezone") or "AoE")
    out = []
    for item in cconf.get("timeline") or []:
        comment = str(item.get("comment") or "").strip()
        for key, label in STAGE_LABELS.items():
            raw = str(item.get(key) or "").strip()
            m = re.match(r"^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}):(\d{2}))?", raw)
            if not m:
                continue
            if key == "deadline" and comment:
                label = f"{label} ({comment})"
            out.append({"label": label, "date": m.group(1), "time": f"{m.group(2) or '23'}:{m.group(3) or '59'}", "tz": tz})
    out.sort(key=lambda s: (s["date"], s["time"]))
    seen, uniq = set(), []
    for s in out:
        k = (s["label"], s["date"])
        if k not in seen:
            seen.add(k)
            uniq.append(s)
    return uniq


def flag_for(place: str) -> str | None:
    country = str(place).split("(")[0].split(",")[-1].strip().lower()
    return FLAGS.get(country)


def merge(base: dict, ccf: dict | None, now: dt.datetime, today: str) -> tuple[dict, str | None, str | None]:
    """Returns (entry, change description or None, disagreement or None)."""
    entry = dict(base)
    if not ccf:
        return entry, None, None
    edition = int(entry.get("edition") or 0)
    candidates = []
    for cc in ccf.get("confs") or []:
        stages = ccf_stages(cc)
        future = [s for s in stages if stage_instant(s) and stage_instant(s) > now]
        if int(cc.get("year") or 0) >= edition and future:
            candidates.append((min(stage_instant(s) for s in future), int(cc["year"]), cc, stages))
    disagreement = None
    same = next((cc for cc in ccf.get("confs") or [] if int(cc.get("year") or 0) == edition), None)
    if same and has_future_stage(entry, now):
        ours = primary_stage(entry.get("timeline"))
        theirs = primary_stage(ccf_stages(same))
        if ours and theirs and abs((stage_instant(ours) - stage_instant(theirs)).days) > 1:
            disagreement = f"{entry['name']} {edition}: curated paper deadline {ours['date']}, ccf-deadlines {theirs['date']} (curated date kept)"
    if has_future_stage(entry, now) and not all_tba(entry):
        return entry, None, disagreement  # a curated, still-open call wins
    if not candidates:
        return entry, None, disagreement
    candidates.sort(key=lambda c: c[0])
    _, year, cc, stages = candidates[0]
    entry["edition"] = year
    entry["timeline"] = stages
    if cc.get("place") and str(cc["place"]).upper() not in ("TBD", "TBA"):
        entry["location"] = str(cc["place"])
        flag = flag_for(cc["place"])
        if flag:
            entry["flag"] = flag
        else:
            entry.pop("flag", None)
    if cc.get("date") and str(cc["date"]).upper() not in ("TBD", "TBA"):
        entry["dates"] = str(cc["date"])
    if cc.get("link"):
        entry["website"] = str(cc["link"])
    entry["note"] = f"Dates filled automatically from the ccf-deadlines dataset on {today}. Confirm on the official site before submitting."
    entry["source"] = "ccf-deadlines"
    first = next((s for s in stages if stage_instant(s) and stage_instant(s) > now), stages[0])
    return entry, f"{entry['name']}: {base.get('edition')} -> {year}, next stage {first['label']} on {first['date']}", disagreement


# ------------------------------------------------------------- website checks

def date_patterns(date: str) -> list[str]:
    d = dt.datetime.strptime(date, "%Y-%m-%d")
    mon, month = d.strftime("%b"), d.strftime("%B")
    day = str(d.day)
    suffix = "th" if 11 <= d.day <= 13 else {1: "st", 2: "nd", 3: "rd"}.get(d.day % 10, "th")
    return [
        date, d.strftime("%Y/%m/%d"), d.strftime("%d.%m.%Y"),
        f"{month} {day}", f"{month} {day}{suffix}", f"{mon} {day}", f"{mon}. {day}", f"{mon} {day}{suffix}",
        f"{day} {month}", f"{day}{suffix} {month}", f"{day} {mon}", f"{day} {mon}.",
    ]


def page_text(markup: str) -> str:
    markup = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", markup)
    text = html.unescape(re.sub(r"(?s)<[^>]+>", " ", markup))
    return re.sub(r"\s+", " ", text)


def check_site(entry: dict, now: dt.datetime, today: str) -> dict | None:
    url = entry.get("website")
    target = primary_stage(entry.get("timeline"), now)
    if not url or not target:
        return None
    result = {"on": today, "date": target["date"]}
    try:
        status, markup = fetch(url)
        text = page_text(markup)
        low = text.lower()
        result["found"] = any(p.lower() in low for p in date_patterns(target["date"]))
        result["status"] = status
    except Exception as exc:
        result["found"] = False
        result["error"] = type(exc).__name__
    return result


# ------------------------------------------------------------------ output

HEADER = """# ==========================================================================
#  AI conference deadlines: data for /deadlines/ on the AVIL lab website.
#  GENERATED every week by scripts/update_deadlines.py. Do not edit here:
#  edit the curated list on s-elim.github.io (_data/conferences.yml) instead.
#
#  Fields are those of the curated list, plus:
#    source      ccf-deadlines when the dates came from that dataset
#    site_check  result of searching the official website for the paper
#                deadline: on (check date), date, found (true/false)
# ==========================================================================
"""


def validate(confs: list[dict]) -> None:
    if len(confs) < 10:
        raise SystemExit("Refusing to write: fewer than 10 conferences")
    for c in confs:
        for key in ("name", "edition", "category", "timeline"):
            if key not in c:
                raise SystemExit(f"Refusing to write: {c.get('name')} has no {key}")
        if not c["timeline"]:
            raise SystemExit(f"Refusing to write: {c['name']} has an empty timeline")
        for st in c["timeline"]:
            if not st.get("label") or not (DATE_RE.match(st.get("date", "")) or st.get("date") == "tba"):
                raise SystemExit(f"Refusing to write: bad stage in {c['name']}: {st}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--ccfddl", required=True, help="path to a clone of ccfddl/ccf-deadlines")
    ap.add_argument("--out", default="_data", help="data folder to write into")
    ap.add_argument("--no-web", action="store_true", help="skip the official-website checks")
    ap.add_argument("--today", help="override today's date (YYYY-MM-DD), for testing")
    args = ap.parse_args()

    now = (dt.datetime.strptime(args.today, "%Y-%m-%d") if args.today
           else dt.datetime.now(dt.timezone.utc).replace(tzinfo=None))
    today = now.strftime("%Y-%m-%d")
    log: list[str] = []
    base = load_base(args.out, log)
    ccf = load_ccfddl(args.ccfddl)
    log.append(f"ccf-deadlines: {len(ccf)} conferences")

    merged, changes, disagreements = [], [], []
    for b in base:
        key = norm(b["name"])
        entry, change, disagree = merge(b, ccf.get(key) or ccf.get(ALIASES.get(key, "")), now, today)
        if change:
            changes.append(change)
        if disagree:
            disagreements.append(disagree)
        merged.append(entry)

    checked = found = 0
    if not args.no_web:
        for e in merged:
            res = check_site(e, now, today)
            if res is not None:
                e["site_check"] = res
                checked += 1
                found += bool(res.get("found"))
    validate(merged)

    # Journals: copied from the homepage after a sanity check.
    _, jtext = fetch(HOMEPAGE_DATA + "journals.yml")
    journals = yaml.safe_load(jtext)
    if not isinstance(journals, list) or len(journals) < 10 or not all("issn" in j and "jif" in j for j in journals):
        raise SystemExit("Refusing to write: journals.yml from the homepage looks wrong")

    with open(os.path.join(args.out, "conferences.yml"), "w", encoding="utf-8") as f:
        f.write(HEADER + "\n" + yaml.safe_dump(merged, allow_unicode=True, sort_keys=False, width=1000))
    with open(os.path.join(args.out, "journals.yml"), "w", encoding="utf-8") as f:
        f.write(jtext)
    meta = {
        "updated": today,
        "conferences": len(merged),
        "from_ccfddl": sum(1 for e in merged if e.get("source") == "ccf-deadlines"),
        "site_checked": checked,
        "site_found": found,
        "changes": changes,
        "disagreements": disagreements,
    }
    with open(os.path.join(args.out, "deadlines_meta.yml"), "w", encoding="utf-8") as f:
        f.write("# Written by scripts/update_deadlines.py. Do not edit.\n")
        f.write(yaml.safe_dump(meta, allow_unicode=True, sort_keys=False, width=1000))

    summary = [f"## Deadline update {today}", *[f"- {line}" for line in log],
               f"- Website checks: deadline found on {found} of {checked} official sites",
               "", "### Changes", *(f"- {c}" for c in changes or ["none"]),
               "", "### Curated vs ccf-deadlines disagreements", *(f"- {d}" for d in disagreements or ["none"])]
    print("\n".join(summary))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write("\n".join(summary) + "\n")


if __name__ == "__main__":
    sys.exit(main())
