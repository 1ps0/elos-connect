
# TODO

> updated 12-4-2022
> https://jasmine.github.io/


- build tests

- bookmarks as storage
    - topics/
    - daily/
    - in-progress/
-

- daily:
    - daily journal document (mm-dd-yyyy.md)
    - daily recurring items (todo, schedule reminders)
    - daily work items (gmail, duolingo, coursera)
    -

---

## Items

- move tab to window
    - specify which window
    - each object is a primitive, alias or lookup

- move selected to window

- add a list of items
- ability to persist items or dupe or add from 'template'
- check off items
- track pomodoro interval for items

- add "offline" caching for tabs with articles etc

---

<<<<<<< HEAD
idea: key combo to switch between sections of the application

- ex: cmd+L focus on url bar


---

idea: autostash

lifecycle events for tabs
- discard after x time inactive
- hide after y time inactive (skip this, out of band)
- stash after z time inactive

- exceptions: pins, common tabs
- stash autosort, enqueue,
- determine "completeness" of viewing (video %, page #, etc)
- feature: article queue,
    - top word text vectors
        - grouped into n clusters depending on proximal distances within the known space
    - vs semantics of generated/manual tag phrases in static lists
- 'rescue' stashed tabs, can we capture session state?

- lifecycle cron/windowing:
    - decrement a "life point" every x time units
    - reset or downgrade tab/window state
    - select by tags for different effects (ex: "test" window having more permanence, or get trimmed by default)

- lifecycle schemes customizable and premade
    - autostash
    - daily cull
    - consolidate to one window
    -

---

identifiers
areas = {
    browser: {  },
    tabGroup: { this, here, window, selected, all },
    displayTypes: {
        webAction: { toggle playing, toggle loop, edit playing list, toggle playing list },
        browserAction: {},
        remoteAction: { sync pull, sync push, search remote, }
    },


}


components for the parent child relationship between settings and implementation structure
settings are seeds
structure is the set of steps from those seeds

profile:

- user:
    - inspiration picture
    - mantra
    - reminders
    - recent
    - new session

- profile: (personaset)
    - persona name
    - goals
    - keywords and interests
    - past education topics
    - affinities
    - backlog import/export (function)
    - study level
    - statistics:
        - top timer items
        - study session count and duration desc
        - goals met
        - achivements
        -
    - preferred learning methods
        - visual / auditory / text-only
        - level of metadata/processing extracted (summaries, keywords, etc)
        -
    - scans:
        - scan archives
        - rescan every: schedule
        - scan git repos
        -
    - processing:
        - extract pdfs
        - thumbnail images
        - rasterize images
    - display:
        - render markdown files
        -

