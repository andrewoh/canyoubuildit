# Independent methods audit

Audit date: 2026-09-25. Scope: new playoff and clustering extension plus original injury-report prediction claims. Read analysis code, data definitions, results and source audit; independently recomputed headline estimates. No website files edited.

## Verdict

**No substantive numerical or season-alignment error found in the headline results.** The analyses support a persistent SF injury-burden excess, an inconclusive league-wide next-year playoff penalty, and recognizable but overlapping roster profiles. They do **not** identify a principal cause of SF's excess or rule out an individual fatigue effect.

## Copy correction — resolved before publication

`work/revision/clusters/README.md`, limitation 7, says pandemic illness can contribute to 2020/2021 AGL outcomes. This conflicts with the source-audited input: all 2020/2021 rows explicitly use **COVID-excluded** AGL. Use: “Direct COVID absences are excluded. Pandemic-era changes in preparation, schedules and reporting can still affect comparison.” Normalization cannot remove all such effects. This wording was corrected in the README and public article before publication.

## Checks independently reproduced

- 256 unique team-season transitions, 32 per outcome year, 2018–2025; exposure year is always outcome minus one. Three-year playoff exposure draws on 2015–2016 schedules when needed. No completed 2026 outcomes enter.
- Recreated primary regressions with `statsmodels`, independently from the custom fitting function. Coefficients and franchise-cluster standard errors match to numerical precision. Student-t intervals with 31 degrees of freedom also match.
- Additional playoff game: **+3.4538 index points**, 95% CI **−3.4394 to +10.3471**. Prior Super Bowl appearance: **+17.5838**, CI **−21.5594 to +56.7271**. Additional 1,000 prior-year offense/defense player-snaps: **+0.1417**, CI **−3.6787 to +3.9621**.
- Independently checked SF mean season-normalized index **139.5971**; 2024 **183.4585**; highest three Super Bowl follow-ups are SF2020, LAR2022, SF2024. Other 14 follow-ups average **91.9281**.
- Recomputed cluster silhouette **0.181089** and burden means **102.6576 / 97.1710**. All cluster feature years precede outcome years; injury overlays exactly match AGL inputs. Current/future injury burden is not used to fit or select clusters.
- Recomputed heldout next-report AUC **0.662912** and average precision **0.151019** from predictions. Heldout seasons are 2024/2025 only. Eligibility requires no current injury report, a next game, and positive current-game participation; next week is always later. Earlier workload fields are nonnegative and intentionally exclude index-game snaps.

## Interpretation guardrails that need to remain visible

1. **AGL endpoint:** this is weighted regular-season availability burden to expected starters, injury replacements and important situational players. It includes partial loss and prolonged absence, not a count of new injuries, all medical events, or playoff injuries. Do not call the index an injury probability or clinical incidence rate.
2. **Units:** 100 is each season's NFL mean. A +10-point effect equals 10% of average league burden, not a 10% increase relative to the exposed team's baseline and not ten additional injuries. Player-snaps sum participation across players; an ordinary play contributes about 11 on each participating unit. A team total is not individual cumulative mileage.
3. **Playoff comparison:** only 16 Super Bowl follow-ups from seven franchises; repeated KC and SF seasons are dependent. Franchise-cluster inference and wild-bootstrap checks are appropriate but cannot manufacture power. Before/after +34.9 points is descriptive; adjusted +17.6 is a separate all-other-teams contrast. Do not compare their intervals interchangeably.
4. **Selection and causal scope:** prior health, age and wins controls improve a comparison but do not randomize postseason exposure. Wins and health help teams qualify; regression toward ordinary health is plausible. Roster turnover, offseason surgery, actual recovery, practice load and collision intensity are unavailable. Excluding SF demonstrates influence, not a preferred estimate or proof nobody else experiences carryover. Team fixed effects with a lagged outcome over eight years can be dynamically biased; retain as sensitivity only.
5. **Pandemic and vintages:** use COVID-excluded annual tables, display exclusion sensitivities, and disclose successive AGL methodology vintages. Year-normalization corrects scale, not changing case inclusion. The cancelled 2022 BUF–CIN game is counted in source AGL but excluded from played-game workload; disclose this narrow source-definition difference in methods. It does not change the core finding.
6. **Profile timing:** the SF “82.5% continuity entering 2024” means 82.5% of **2023** snaps were played by people who also played for SF in **2022**. It does not measure retention from 2023 into 2024. Prior-year snap-weighted age describes people who played, not the actual next opening roster. Concentration is partly a consequence of prior health.
7. **Clusters:** two groups are chosen by feature-only silhouette, which is weak. Bootstrap and alternative algorithms show material boundary uncertainty. PCA captures 53.4% of variance; true nearest neighbors use all six features. Overlay intervals condition on fixed labels and omit clustering-selection uncertainty. SF2024's 100% matched-bootstrap membership agreement does not mean its future injury outcome was predictable.
8. **Importance endpoint and timescale:** original model predicts a new public physical-injury/condition-report appearance before a team's next game among previously unreported participants. Direct-to-IR cases, training-camp losses and nonparticipants can be absent. It is not the AGL outcome, next-year health, or new clinical injury incidence. Use “predictive clues” instead of a causal ranking. Workload's +0.0279 AP-drop and history's +0.0261 can be shown directly; normalized 43% / 40% shares are not fractions of injuries explained. Individual usage importance mainly reflects earlier snap share, not accumulated month-long volume.
9. **Uncertainty:** original game-cluster bootstrap omits repeated-player/franchise dependence and model-training uncertainty; importance bootstrap uses one fixed permutation. Call bands approximate conditional uncertainty. Low surface importance cannot refute injury-specific medical studies. Clustering separation shares are a third metric and must never share the injury-feature-importance label.
10. **Outlier wording:** SF is highest by this period's normalized mean, narrowly ahead of Arizona, and remains fourth after excluding both pandemic seasons. This establishes an unusually heavy burden; it does not establish a uniquely separated franchise or specific staff culpability. The initial post-selection all-team null diagnostic is borderline, not a clean causal significance test.

## Suggested publishable conclusion

“The 49ers have carried an unusually heavy injury burden. Their two post–Super Bowl collapses are striking, but extra playoff games and total prior-year team volume do not show a statistically clear league-wide penalty in this sample. Their roster profile has peers; those peers do not reliably reproduce their injury burden. Public data describe the problem more confidently than they identify its cause.”


## September 26 extension verification

The body-region and game-timing extensions received an additional code/data/claim review. The primary timing counts were independently regrouped from first_events.csv: SF 126 first-half / 160 second-half, versus 2,907 / 4,209 for other teams. Quarter counts for SF were 53, 73, 68 and 92. Body-region estimates agree with the fractional listing totals and adjusted comparison table; all 320 team-period category compositions passed normalization and interval-gating checks. All 384 timing filters passed count, denominator and finite-interval checks.

The timing parser's own audit verifies every standardized phrase, team/jersey attribution, and a seeded sample of source descriptions; this is not an independent medical validation. Missing announcements remain material. The mix simultaneous intervals and timing bootstrap intervals were not independently re-estimated in this extension review; the published scripts and frozen input snapshots support that reproduction.

The website was checked for definition popovers, team/year filters, phone layout, and PNG exports. Definitions distinguish prior-game playing time, prior-year volume, and within-game timing. Neither report composition nor timed announcements is represented as all clinical injuries.
