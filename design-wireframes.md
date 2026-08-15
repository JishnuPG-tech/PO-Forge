================================================================================
POFORGE — PERSONAL STUDY OS
COMPLETE VISUAL UI/UX WIREFRAME BLUEPRINT
Every page. Every state. Desktop + Mobile.
================================================================================

DESIGN THESIS
=============
Calm. Clear. Compounding.
One primary action per screen. No marketplace clutter. No gamified noise.
Solo-use cockpit for daily bank exam prep.

TABLE OF CONTENTS
==================
 1.  Global Shell (Desktop + Mobile)
 2.  Command Palette (⌘K)
 3.  Today (Home)
 4.  Daily Mission Configuration
 5.  Question Engine
 6.  Question Feedback + How-to-Solve
 7.  Subject Transition
 8.  Mission Complete
 9.  Mock — Hub
10.  Mock — Full Length (Exam Mode)
11.  Mock — Result
12.  Mock — History
13.  Analysis — Overview
14.  Weakness Center
15.  Topic Detail
16.  Mistake Book
17.  Mistake Detail
18.  Revision Center
19.  Current Affairs
20.  Current Affairs — Question
21.  Library / Study Material
22.  Document Reader
23.  AI Coach (Slide-over Panel)
24.  AI Teaching Mode
25.  Settings
26.  Profile
27.  Notification Center
28.  Empty States
29.  Loading (Skeleton) States
30.  Error States
31.  Dark Mode Notes
32.  Mobile Bottom Navigation Map

================================================================================
1. GLOBAL SHELL
================================================================================

DESKTOP
-------
+----------------------------------------------------------------------------+
| POForge     [ ⌘K  Search anything... ]      IBPS RRB PO ▾    🔔    ◐    J  |
+---------------+--------------------------------------------------------------+
|               |                                                              |
| ○ Today       |                                                              |
| ○ Practice    |                                                              |
| ○ Mock        |                                                              |
| ○ Analysis    |                        MAIN CONTENT AREA                    |
| ○ Revision    |                                                              |
| ○ Coach       |                                                              |
|               |                                                              |
| ------------- |                                                              |
| Current Aff.  |                                                              |
| Library       |                                                              |
| Settings      |                                                              |
+---------------+--------------------------------------------------------------+

MOBILE
------
+------------------------------------------------+
|  POForge                        🔥12   ◐        |
+------------------------------------------------+
|                                                  |
|                MAIN CONTENT AREA                |
|                                                  |
|                                                  |
+------------------------------------------------+
|  Today   Practice   Mock   Analysis   Coach     |
+------------------------------------------------+

NOTES:
- Left rail collapses to icon-only on tablet width.
- No shadows on nav — 1px border separates rail from content.
- Active nav item: accent-colored left border (4px) + accent text. No pill bg.

================================================================================
2. COMMAND PALETTE (⌘K)
================================================================================

+------------------------------------------------------------------------+
|  🔍  ratio partnership_                                                |
|--------------------------------------------------------------------------
|  JUMP TO                                                                |
|    → Practice · Ratio & Proportion                                     |
|    → Analysis · Topic Detail: Ratio                                    |
|                                                                          |
|  QUESTIONS                                                              |
|    QNT-00482   Ratio and Partnership                                   |
|                                                                          |
|  NOTES                                                                  |
|    Quant Notes.pdf — Page 42                                           |
|                                                                          |
|  ACTIONS                                                                |
|    Start 10-Q Ratio practice set                                       |
|    Ask Coach about Ratio                                               |
+------------------------------------------------------------------------+
  esc to close        ↑↓ to navigate        enter to select

================================================================================
3. TODAY (HOME)
================================================================================

DESKTOP
-------
+------------------------------------------------------------------------+
| Good morning, Jishnu                                  🔥 12-day streak  |
| IBPS RRB PO · 43 days left                                             |
+------------------------------------------------------------------------+

+========================= TODAY'S MISSION ==============================+
|                                                                          |
|  90 Questions                                              ~75 min      |
|                                                                          |
|  [==========------------------------------------------] 22 / 90         |
|                                                                          |
|   Quant        8 / 25     Reasoning   14 / 25                          |
|   English      0 / 20     Current Affairs   0 / 20                     |
|                                                                          |
|                    [  CONTINUE TODAY'S MISSION →  ]                     |
+==========================================================================+

+------------------+------------------+------------------+------------------+
|   STREAK         |   ACCURACY       |   MASTERY        |   DAYS LEFT      |
|   12 days        |   84%            |   76%            |   43             |
+------------------+------------------+------------------+------------------+

+----------------------------- AI COACH -----------------------------------+
|  "Profit & Loss dragged your accuracy down yesterday.                    |
|   A 10-minute recovery set is ready."                                    |
|                                          [ Start recovery ]  [ Ask more ] |
+----------------------------------------------------------------------------+

+-------- REVISION DUE (12) --------+  +-------- LAST 7 DAYS ------------+
| Ratio                    4        |  |  Accuracy                       |
| Profit & Loss            5        |  |  72-76-74-79-81-83-84           |
| Error Detection          3        |  |  Speed                          |
|          [ START REVISION ]       |  |  58-54-52-49-47-44-42 sec       |
+------------------------------------+  +----------------------------------+

+------------------------- NEXT BEST ACTION -------------------------------+
|  Complete 10 medium Profit & Loss questions before your next mock.       |
|                                      [ START RECOMMENDED TRAINING ]      |
+----------------------------------------------------------------------------+

MOBILE (stacked, single column)
--------------------------------
+------------------------------------------------+
| Good morning, Jishnu          🔥 12             |
| IBPS RRB PO · 43 days left                      |
+------------------------------------------------+
+==================================================+
|  TODAY'S MISSION            90 Q · ~75 min       |
|  [=======---------------------------] 22/90      |
|  Quant 8/25  Reasoning 14/25                     |
|  English 0/20  CA 0/20                           |
|        [ CONTINUE TODAY'S MISSION → ]            |
+==================================================+
| Streak 12 | Accuracy 84% | Mastery 76% | Days 43 |
+------------------------------------------------+
+---------------- AI COACH ------------------------+
| P&L dragged accuracy down yesterday.             |
| [ Start recovery ]        [ Ask more ]           |
+------------------------------------------------+
+---------------- REVISION DUE (12) ---------------+
| Ratio 4 · P&L 5 · Error Detection 3               |
| [ START REVISION ]                                |
+------------------------------------------------+
+---------------- 7-DAY TREND ----------------------+
|   accuracy sparkline (horizontal scroll)          |
+------------------------------------------------+

STATE: MISSION COMPLETE (collapsed variant)
--------------------------------------------
+========================= TODAY'S MISSION ==============================+
|  ✓  Mission complete — 82/100 · 82% accuracy                            |
|                                              [ VIEW ANALYSIS ]           |
+==========================================================================+
(card shrinks to single line height, freeing space for Revision/Trend above the fold)

================================================================================
4. DAILY MISSION CONFIGURATION
================================================================================

+------------------------------------------------------------------------+
|  Customize Today's Training                                    [ ✕ ]   |
|--------------------------------------------------------------------------
|  SUBJECTS                                                                |
|   [✓] Quantitative Aptitude     [✓] Reasoning                           |
|   [✓] English                   [✓] Current Affairs                     |
|   [ ] Banking Awareness         [ ] Computer Awareness                  |
|                                                                          |
|  QUANTITATIVE APTITUDE — TOPICS                                         |
|  --------------------------------------------------------------------   |
|   Topic                    State              Enabled                   |
|   Simplification           AVAILABLE            [✓]                     |
|   Percentage                MASTERED  ✓✓         [✓]                    |
|   Ratio & Proportion         NEEDS REVISION ↻    [✓]                    |
|   Profit & Loss              LEARNING ◐          [✓]                    |
|   Partnership                LOCKED 🔒           [ ]                    |
|   Data Interpretation         NOT LEARNED 🔒     [ ]                    |
|                                                                          |
|  QUESTION COUNT      [ 90  ]        DIFFICULTY   [ Adaptive ▾ ]         |
|                                                                          |
|                          [ SAVE CONFIGURATION ]                         |
+------------------------------------------------------------------------+

TOPIC STATE LEGEND (icon + label + color — never color alone)
  🔒  Locked            — not learned yet
  ◐   Learning          — in progress
  ✓   Available         — ready for practice
  ↻   Needs Revision    — decayed since last review
  ✓✓  Mastered          — strong, low-frequency review only

================================================================================
5. QUESTION ENGINE
================================================================================

DESKTOP (70/30 split)
----------------------
+---------------------------------------------------+------------------+
| Quant · Profit & Loss         Q 12 / 25    00:42   |  PALETTE         |
+---------------------------------------------------+------------------+
|                                                     |  01 02 03 04 05 |
|  A shopkeeper marks an article 40% above cost       |  06 07 08 09 10 |
|  price and allows a discount of 15%. Find his        |  11 [12]13 14 15|
|  profit percent.                                     |  16 17 18 19 20 |
|                                                     |  21 22 23 24 25 |
|   ○  A.  15%                                       |------------------|
|   ○  B.  18%                                       |  LEGEND          |
|   ○  C.  19%                                       |  ● Answered      |
|   ○  D.  21%                                       |  ○ Not visited   |
|   ○  E.  None of these                             |  ! Marked        |
|                                                     |  [12] Current    |
+---------------------------------------------------+------------------+
| ← Previous     Mark for review     Skip      [ SUBMIT → ]              |
+--------------------------------------------------------------------------+

OPTION CARD STATES (zoomed)
----------------------------
 DEFAULT      +--------------------------+
              |  A.  ₹500                |
              +--------------------------+

 HOVER        +==========================+
              |  A.  ₹500                |
              +==========================+   (accent border, no fill)

 SELECTED     +==========================+
              |  ●  A.  ₹500              |   (accent border + accent-soft fill)
              +==========================+

 CORRECT      +--------------------------+
              |  ✓  C.  ₹550              |   (success border + icon)
              +--------------------------+

 INCORRECT    +--------------------------+
              |  ✕  B.  ₹500              |   (danger border + icon)
              +--------------------------+

MOBILE
------
+------------------------------------------------+
| QUANT · P&L            12/25          00:42     |
+------------------------------------------------+
| A shopkeeper marks an article 40% above cost    |
| price and allows a discount of 15%. Find his    |
| profit percent.                                 |
|                                                  |
| +----------------------------------------------+ |
| | A.  15%                                       | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | B.  18%                                       | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | C.  19%                                       | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | D.  21%                                       | |
| +----------------------------------------------+ |
| +----------------------------------------------+ |
| | E.  None of these                             | |
| +----------------------------------------------+ |
|                                                  |
|                 [  SUBMIT  ]                     |
+------------------------------------------------+
|  ← Prev     Skip     Mark ▲    12/25    Next →   |
+------------------------------------------------+
        ▲ tap "12/25" pill to open palette as bottom sheet

================================================================================
6. QUESTION FEEDBACK + HOW-TO-SOLVE
================================================================================

CORRECT (inline, replaces submit bar — no page change)
--------------------------------------------------------
+--------------------------------------------------------------------------+
|  ✓  CORRECT                                                              |
|     Your answer: C        Correct answer: C                              |
|     Time: 38s   Target: 45s                                              |
|     Good work — within target time.                                     |
|                                                       [ NEXT QUESTION → ] |
+--------------------------------------------------------------------------+

INCORRECT
---------
+--------------------------------------------------------------------------+
|  ✕  INCORRECT                                                            |
|     Your answer: B        Correct answer: D                              |
|     Mistake type: Concept Error                                          |
|                                                                          |
|     [ HOW TO SOLVE ▾ ]     [ TRY SIMILAR ]        [ NEXT QUESTION → ]    |
+--------------------------------------------------------------------------+

HOW TO SOLVE (accordion expansion — same screen, no modal)
------------------------------------------------------------
+--------------------------------------------------------------------------+
|  HOW TO SOLVE                                                    [ ▲ ]  |
|--------------------------------------------------------------------------
|  CONCEPT                                                                 |
|  Discount is applied on marked price, not cost price.                   |
|                                                                          |
|  APPROACH                                                                |
|  Step 1  ...                                                            |
|  Step 2  ...                                                            |
|  Step 3  ...                                                            |
|                                                                          |
|  FAST EXAM METHOD                                                        |
|  ...                                                                    |
|                                                                          |
|  COMMON TRAP                                                             |
|  You treated marked price as cost price.                                |
|                                                                          |
|  [ TRY SIMILAR QUESTION ]        [ SAVE TO MISTAKE BOOK ]                |
+--------------------------------------------------------------------------+

================================================================================
7. SUBJECT TRANSITION
================================================================================

+==========================================================================+
|              QUANTITATIVE APTITUDE COMPLETE  ✓                          |
|                                                                          |
|                        25 / 25 answered                                 |
|                                                                          |
|      Accuracy          84%              Avg Time        43 sec         |
|                                                                          |
|      Strongest topic:        Percentage                                |
|      Needs attention:        Profit & Loss                              |
|                                                                          |
|                    [ CONTINUE TO REASONING → ]                          |
+==========================================================================+

================================================================================
8. MISSION COMPLETE
================================================================================

+==========================================================================+
|                        MISSION COMPLETE  ✓                              |
|                                                                          |
|                            82 / 100                                     |
|                                                                          |
|   Accuracy        82%        Correct      82                           |
|   Incorrect       16         Skipped       2                           |
|   Avg Time        42 sec     Total Time   42:18                        |
|                                                                          |
|                     [ VIEW FULL ANALYSIS → ]                            |
+==========================================================================+
        (single quiet checkmark animation, no confetti, no sound)

================================================================================
9. MOCK — HUB
================================================================================

+------------------------------------------------------------------------+
|  MOCK                                                                    |
|  Test yourself under real exam conditions.                              |
|--------------------------------------------------------------------------
|  [ Topic ]  [ Sectional ]  [ Full Length ]  [ Custom ]  [ Adaptive ]  [ History ]
+------------------------------------------------------------------------+

TOPIC MOCK GRID
-----------------
+------------------------+------------------------+------------------------+
|  PERCENTAGE             |  RATIO                  |  PROFIT & LOSS         |
|  20 Q                   |  20 Q                   |  20 Q                  |
|  Best: 91%   ↑          |  Best: 87%   ↑          |  Best: 68%   →         |
|              [ START ]  |              [ START ]  |   Needs Work [ START ] |
+------------------------+------------------------+------------------------+

FULL MOCK CARD
----------------
+==========================================================================+
|  IBPS RRB PO PRELIMS                                                     |
|  80 Questions · 80 Marks · 45 Minutes                                    |
|  Reasoning 40 Q     Quant 40 Q                                          |
|                                            [ START FULL MOCK ]           |
+==========================================================================+

CUSTOM MOCK BUILDER
----------------------
+------------------------------------------------------------------------+
|  Exam            [ IBPS RRB PO ▾ ]                                     |
|  Subjects        [✓] Quant  [✓] Reasoning  [ ] English                |
|  Topics          [✓] Percentage  [✓] Ratio  [ ] DI                     |
|  Questions       [ 40 ]                                                 |
|  Difficulty      [ Adaptive ▾ ]                                        |
|  Duration        [ 30 min ]                                            |
|                                    [ GENERATE MOCK ]                    |
+------------------------------------------------------------------------+

ADAPTIVE MOCK CARD
---------------------
+------------------------------------------------------------------------+
|  AI ADAPTIVE MOCK                                                        |
|  Difficulty adjusts to your demonstrated performance.                    |
|  Current ability   74      Accuracy   82%      Speed   71%              |
|  Weakest topics: Profit & Loss / DI                                    |
|                                       [ START ADAPTIVE MOCK ]           |
+------------------------------------------------------------------------+

================================================================================
10. MOCK — FULL LENGTH (EXAM MODE)
================================================================================
NOTE: Deliberately grayscale / no accent color — trains real exam visual
conditions. Timer is the only emphasized element.

+---------------------------------------------------+------------------+
|  SECTION: REASONING           Q 14/40      12:04   |  PALETTE         |
+---------------------------------------------------+------------------+
|  (question + options, plain black/white styling)   |  01..40 grid     |
|                                                     |                  |
+---------------------------------------------------+------------------+
| ← Previous     Mark for Review     Clear Response  |  [ SUBMIT SECTION → ] |
+--------------------------------------------------------------------------+
  Sections: [ Reasoning ]  [ Quant ]        (locked once time expires per section)

================================================================================
11. MOCK — RESULT
================================================================================

+==========================================================================+
|                          MOCK COMPLETE                                   |
|                            78 / 80                                       |
|                             97.5%                                        |
|                                                                          |
|   Accuracy   97.5%        Time   43:11        Percentile   optional     |
+==========================================================================+

  Quant          38 / 40   ████████████████████░  95%
  Reasoning      40 / 40   █████████████████████  100%

+----------------------- 3 THINGS TO FIX -----------------------------------+
|  1. Data Interpretation — 2 misses, both time-pressure related           |
|  2. Slow section: Quant averaged 68s/question vs 52s target              |
|  3. Revisit Simplification shortcuts                                     |
|                                          [ FIX THESE ]  [ FULL BREAKDOWN ]|
+----------------------------------------------------------------------------+

================================================================================
12. MOCK — HISTORY
================================================================================

+------------------------------------------------------------------------+
|  MOCK HISTORY                                                            |
|--------------------------------------------------------------------------
|  Mock                Score       Accuracy      Time         Trend        |
|  RRB PO Mock 05       78/80        97.5%       43:11         ↑          |
|  RRB PO Mock 04       74/80        92.5%       44:02         ↑          |
|  RRB PO Mock 03       68/80        85.0%       43:48         →          |
+------------------------------------------------------------------------+

================================================================================
13. ANALYSIS — OVERVIEW
================================================================================

+------------------+------------------+------------------+------------------+
|   MASTERY        |   ACCURACY       |   SPEED          |   RETENTION      |
|   76%            |   84%            |   72%            |   74%            |
+------------------+------------------+------------------+------------------+

+========================= EXAM READINESS =================================+
|                            COMPETITIVE                                   |
|                                                                          |
|  Knowledge        ███████████████░░░  78%                               |
|  Accuracy         █████████████████░  84%                               |
|  Speed            ██████████████░░░░  72%                               |
|  Consistency      ████████████████░░  81%                               |
|  Retention        ███████████████░░░  74%                               |
|                                                                          |
|  Next milestone: STRONG                                                  |
+============================================================================+

STATES: Foundation → Developing → Competitive → Strong → Exam Ready

+------------------------- SUBJECT PERFORMANCE -----------------------------+
|  Quantitative Aptitude       84%     ↑                                  |
|  Reasoning                    88%     ↑                                  |
|  English                      72%     →                                  |
|  Current Affairs               79%     ↑                                  |
+----------------------------------------------------------------------------+

+---------------------------- TREND CHARTS ---------------------------------+
|  [ 7D ]  [ 30D ]  [ 90D ]  [ ALL ]                                       |
|                                                                          |
|  Accuracy      Speed      Questions Completed      Mock Score           |
|  (single-color thin sparkline per chart, no gradient fill)              |
+----------------------------------------------------------------------------+

================================================================================
14. WEAKNESS CENTER
================================================================================

+------------------------------------------------------------------------+
|  CURRENT WEAKNESSES                                                      |
|--------------------------------------------------------------------------
|  01  PROFIT & LOSS                                                       |
|      Mastery: 58%   ·   18 incorrect attempts   ·   6 recurring mistakes|
|                                                        [ FIX THIS → ]    |
|--------------------------------------------------------------------------
|  02  DATA INTERPRETATION                                                  |
|      Mastery: 62%   ·   Slow interpretation pattern                     |
|                                                        [ FIX THIS → ]    |
+------------------------------------------------------------------------+
        ↑ ranked worst-first · this is the highest-effort screen in the app

================================================================================
15. TOPIC DETAIL
================================================================================

+------------------------------------------------------------------------+
|  ← Analysis          PROFIT & LOSS                                      |
+------------------------------------------------------------------------+
|  MASTERY 58%    ACCURACY 61%    SPEED 49%    RETENTION 64%              |
|                                                                          |
|  7-DAY TREND        52% - 55% - 56% - 58%                              |
|                                                                          |
|  MISTAKE BREAKDOWN                                                       |
|  Concept          ████████████        12                                |
|  Calculation      ████                  4                                |
|  Careless         ██                    2                                |
|                                                                          |
|  RECOMMENDED                                                             |
|  · 10 medium-difficulty questions                                       |
|  · 5 previous mistakes to retry                                          |
|  · Review discount concept note                                          |
|                                                                          |
|  [ PRACTICE TOPIC ]   [ REVIEW CONCEPT ]   [ TAKE TOPIC MOCK ]          |
+------------------------------------------------------------------------+

================================================================================
16. MISTAKE BOOK
================================================================================

+------------------------------------------------------------------------+
|  MISTAKE BOOK                                                            |
|  Total 247      Unresolved 61      Recovered 186                       |
|--------------------------------------------------------------------------
|  Concept Error       ███████████████    92                              |
|  Calculation Error   █████████           54                              |
|  Careless Error      ██████               43                              |
|  Time Pressure       ████                 31                              |
|  Misread             ██                   18                              |
|  Guess               █                     9                              |
|--------------------------------------------------------------------------
|  Filter: [ All ▾ ]  [ Concept ]  [ Calculation ]  [ Careless ]          |
|                                                                          |
|  QNT-001284   Profit & Loss   Concept Error          [ VIEW ▾ ]        |
|  QNT-000942   Ratio            Careless Error         [ VIEW ▾ ]        |
|  ...                                                                    |
+------------------------------------------------------------------------+
        ↑ tapping VIEW expands the entry inline (accordion), no navigation

================================================================================
17. MISTAKE DETAIL (expanded inline)
================================================================================

+------------------------------------------------------------------------+
|  QNT-001284 · Profit & Loss                                    [ ▲ ]   |
|--------------------------------------------------------------------------
|  Your answer: B          Correct: D          Previous similar: 4        |
|  Mistake type: Concept Error                                            |
|                                                                          |
|  WHY                                                                     |
|  You treated marked price as cost price.                                |
|                                                                          |
|  HOW TO SOLVE                                                            |
|  Step 1 ...   Step 2 ...   Step 3 ...                                   |
|                                                                          |
|  REMEMBER                                                                 |
|  Discount is calculated on marked price.                                |
|                                                                          |
|  [ RETRY ]  [ REVIEW CONCEPT ]  [ TRY SIMILAR ]  [ MARK RECOVERED ]     |
+------------------------------------------------------------------------+

================================================================================
18. REVISION CENTER
================================================================================

+------------------------------------------------------------------------+
|  REVISION                                                                |
|  [ Due Today ]  [ Upcoming ]  [ Recovered ]  [ Weak Concepts ]          |
+------------------------------------------------------------------------+
|  DUE TODAY                                                               |
|                                                                          |
|  Ratio & Proportion            4 questions                              |
|  Profit & Loss                 5 questions                              |
|  Error Detection               3 questions                              |
|                                                                          |
|                          [ START REVISION ]                             |
+------------------------------------------------------------------------+

================================================================================
19. CURRENT AFFAIRS
================================================================================

+------------------------------------------------------------------------+
|  CURRENT AFFAIRS       [ Today ]  [ This Week ]  [ This Month ]         |
|  Categories: Banking · Economy · Government · Reports · Appointments ·  |
|              Awards · Schemes                                           |
+------------------------------------------------------------------------+
|  TODAY'S CAPSULE — 10 updates                                           |
|                                                                          |
|                [ READ ]              [ PRACTICE MCQS ]                  |
+------------------------------------------------------------------------+
        ↑ finite daily capsule — no infinite scroll, no feed-doomscroll pattern

================================================================================
20. CURRENT AFFAIRS — QUESTION
================================================================================

+------------------------------------------------------------------------+
|  Which institution released the Financial Stability Report?             |
|                                                                          |
|  ○ A.  RBI          ○ B.  SEBI         ○ C.  NABARD       ○ D.  IMF    |
|--------------------------------------------------------------------------
|  ✓ Correct — RBI                                                        |
|  Explanation · Source · Date · Related facts                            |
|                                                            [ NEXT → ]    |
+------------------------------------------------------------------------+

================================================================================
21. LIBRARY / STUDY MATERIAL
================================================================================

+------------------------------------------------------------------------+
|  MY LIBRARY                                                              |
|--------------------------------------------------------------------------
|  Quant Notes.pdf            182 pages     RAG Indexed ✓                  |
|                                          [ OPEN ]   [ ASK AI ]          |
|--------------------------------------------------------------------------
|  Reasoning Notes.pdf         94 pages     RAG Indexed ✓                  |
|                                          [ OPEN ]   [ ASK AI ]          |
|--------------------------------------------------------------------------
|  Banking Awareness.pdf       62 pages     Processing...                 |
+------------------------------------------------------------------------+

================================================================================
22. DOCUMENT READER
================================================================================

+---------------------+----------------------------------------------------+
| PAGES               |  Chapter 01                                        |
|                      |                                                    |
| 01                   |  (document content rendered here)                 |
| 02                   |                                                    |
| 03                   |                                                    |
| 04                   |                                                    |
| 05                   |                                                    |
+---------------------+----------------------------------------------------+
| 🔍 Search    🔎 Zoom    Page 3/182         [ ASK AI ABOUT THIS PAGE ]     |
+----------------------------------------------------------------------------+

================================================================================
23. AI COACH (SLIDE-OVER PANEL — reachable from anywhere, key "/")
================================================================================

+---------------+------------------------------------------------------------+
| QUICK ACTIONS |  YOUR AI BANKING COACH                             [ ✕ ]  |
|               |  Your preparation. Your data. Your coach.                  |
| Explain       |----------------------------------------------------------- |
| mistakes      |                                                             |
|               |  YOU: Why am I weak in Profit & Loss?                      |
| Teach a       |                                                             |
| topic         |  COACH:                                                    |
|               |  Your current Profit & Loss mastery is 58%.                |
| Practice      |  Across your last 43 attempts, most mistakes came from     |
| with me       |  discount and marked-price problems.                       |
|               |  I recommend focusing on discount word problems first.     |
| Analyze       |                                                             |
| performance   |  Based on your performance — 43 attempts · 58% mastery     |
|               |                                                             |
| Analyze       |         [ START 10-QUESTION RECOVERY SESSION ]             |
| mock          |                                                             |
|               |------------------------------------------------------------|
| Search my     |  Type a message...                            [ Send ]    |
| notes         |                                                             |
|               |                                                             |
| Plan          |                                                             |
| tomorrow      |                                                             |
+---------------+------------------------------------------------------------+

WORKING STATE (tool-use transparency, high-level only)
--------------------------------------------------------
+------------------------------------------------------------------------+
|  AI COACH IS WORKING                                                     |
|  ✓ Checking recent attempts                                             |
|  ✓ Checking topic mastery                                               |
|  ●  Searching your notes                                                 |
|  ○  Building recommendation                                              |
+------------------------------------------------------------------------+

SOURCE CITATION CARD
-----------------------
+------------------------------------------------------------------------+
|  SOURCE                                                                   |
|  Quantitative Aptitude Notes · Page 42                                  |
|                                                          [ OPEN SOURCE ] |
+------------------------------------------------------------------------+

================================================================================
24. AI TEACHING MODE
================================================================================

+------------------------------------------------------------------------+
|  TEACH: PERCENTAGE                                                       |
|--------------------------------------------------------------------------
|  STEP 1                                                                   |
|  Understand percentage increase                                         |
|                                                                          |
|  EXAMPLE                                                                  |
|  ...                                                                    |
|                                                                          |
|  QUICK CHECK                                                              |
|  What is 20% of 250?                                                    |
|  [ 40 ]   [ 50 ]   [ 60 ]   [ 70 ]                                      |
|                                                                          |
|  [ I UNDERSTAND ]  [ GIVE ANOTHER EXAMPLE ]  [ TEST ME ]  [ SIMPLIFY ]  |
+------------------------------------------------------------------------+

================================================================================
25. SETTINGS
================================================================================

+------------------+--------------------------------------------------------+
| ACCOUNT          |  EXAM                                                   |
| Profile          |  Target exam        [ IBPS RRB PO ▾ ]                  |
| Security         |  Exam date          [ dd/mm/yyyy ]                     |
| Sessions         |  Daily target        [ 90 questions ▾ ]                |
|                  |                                                          |
| EXAM             |  TRAINING                                               |
| Training         |  Subjects, Topics, Difficulty, Revision preferences     |
|                  |                                                          |
| AI               |  AI                                                     |
| Appearance       |  Coach tone, memory preferences                        |
|                  |                                                          |
| Notifications    |  APPEARANCE                                             |
|                  |  ( ) Light    (•) Dark    ( ) System                    |
|                  |                                                          |
|                  |  NOTIFICATIONS   (off by default — no spam patterns)   |
|                  |  [ ] Daily mission reminder   [ ] Revision due          |
|                  |  [ ] Mock reminders                                     |
+------------------+--------------------------------------------------------+

================================================================================
26. PROFILE
================================================================================

+------------------------------------------------------------------------+
|  Jishnu                                                                   |
|  Target exam: IBPS RRB PO       Phase: COMPETITIVE                      |
|--------------------------------------------------------------------------
|  Questions solved     Mocks completed     Current streak    Mastery      |
|  4,812                 14                  12 days           76%        |
|                                                                          |
|  [ Edit profile ]  [ Exam configuration ]  [ Training prefs ]           |
+------------------------------------------------------------------------+

================================================================================
27. NOTIFICATION CENTER
================================================================================

+------------------------------------------------------------------------+
|  NOTIFICATIONS                                                            |
|--------------------------------------------------------------------------
|  AI Coach     Your daily mission is ready                                |
|  Revision     12 questions are due                                       |
|  Mock         Your latest mock analysis is ready                        |
|  Streak       10-day streak completed                                    |
+------------------------------------------------------------------------+

================================================================================
28. EMPTY STATES
================================================================================

  NO MISTAKES YET
  Complete a practice session to start your Mistake Book.
                                              [ START PRACTICE ]

  NO MOCKS COMPLETED
  Take your first mock to build a performance baseline.
                                              [ TAKE MOCK ]

  YOUR LIBRARY IS EMPTY
  Add study material to build your personal AI knowledge base.
                                              [ ADD MATERIAL ]

  NOTE: dry, functional copy — no illustrations, no cute mascots.

================================================================================
29. LOADING (SKELETON) STATES
================================================================================

  HOME:      [mission skeleton] [stat tile x4 skeleton] [coach skeleton]
  QUESTION:  [question block skeleton] [5x option skeleton]
  ANALYSIS:  [readiness bar skeleton] [4x stat skeleton] [chart skeleton]
  AI:        [message bubble skeleton] [tool-status line]

  Skeletons always match final layout shape — never a bare spinner.

================================================================================
30. ERROR STATES
================================================================================

+------------------------------------------------------------------------+
|  Something went wrong                                                     |
|  We couldn't load your daily mission.                                    |
|                                                          [ RETRY ]       |
+------------------------------------------------------------------------+

+------------------------------------------------------------------------+
|  AI COACH TEMPORARILY UNAVAILABLE                                         |
|  Your saved data is safe. Try again.                                     |
|                                                        [ TRY AGAIN ]     |
+------------------------------------------------------------------------+

================================================================================
31. DARK MODE NOTES (default theme)
================================================================================

  bg:#101113  surface:#17191C  surface-2:#1E2124  border:#2A2D31
  text:#EDEDEE  text-muted:#9A9DA6  accent:#6E9CF5
  success:#3FBE73  danger:#F27272  warning:#E0A64A

  - Charts keep single-color thin lines, no glow.
  - Question text stays high-contrast against surface, never surface-2.
  - No neon, no cyberpunk gradients — professional exam-hall feel.

================================================================================
32. MOBILE BOTTOM NAVIGATION MAP
================================================================================

  +------------------------------------------------+
  |  Today   Practice   Mock   Analysis   Coach     |
  +------------------------------------------------+
        |         |        |        |         |
        v         v        v        v         v
     Home    Question   Mock Hub  Overview  Slide-over
              Engine                         panel

  Revision / Current Affairs / Library reachable via Today page
  cards + Command Palette (⌘K) — kept off the 5-tab limit deliberately.

================================================================================
END OF WIREFRAME BLUEPRINT
================================================================================
