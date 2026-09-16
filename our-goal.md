# Our Goal — Effective Agents

**Ship Outcomes, Not Chat**

![Abstract closed-loop agents completing work outcomes](./assets/img/sections/our-goal-hero.png)

---

## The goal

Make enterprise intelligence **effective**: agents that finish work inside Microsoft 365 — composed from Intent to Governance, grounded in SharePoint and Graph, steered by human preference, and measured by outcomes rather than conversation volume.¹

We are not chasing a model that can discuss everything. We are shipping agents that can **do** the next useful thing — under identity, policy, and audit — then get better from the people who correct them.

![Intent-to-governance stack as layered abstract geometry](./assets/img/sections/our-goal-intent.png)

---

## The estate is already a workbench

Enterprises already run the machinery agents need:

- **Identity** that knows who may see what
- **SharePoint and Graph** that hold the corpus of real work
- **Copilot** as a surface people already open
- **Copilot Studio and Agent Builder** to compose behaviour
- **Microsoft Foundry** to host, evaluate, and govern models and agents
- **Purview and Scout** to watch for drift, overreach, and unsafe scale

What is missing is not another chatbot. What is missing is a discipline: treat agents as **production systems** with feedback loops — not demos with personality.

Chat is a door. Effectiveness is what walks through it.

---

## Decorative intelligence vs effective agents

Too many programmes stop at a familiar shape: a conversation pane sitting on institutional knowledge. Users ask. The bot answers. Someone still copies the answer into the form, the ticket, the policy pack, the approval chain.

That is decorative intelligence — useful for discovery, weak for delivery.

Effective agents invert the pattern:

| Decorative intelligence | Effective agent |
|-------------------------|-----------------|
| Answers in a pane | Completes a step in the workflow |
| Context is whatever fit in the prompt | Grounding is SharePoint, Graph, and permissions |
| Success = fluent reply | Success = task completion + audit trail |
| Feedback buried in a log | Preference loops that retrain and re-steer |
| Governance = hope | Foundry, Purview, Scout, eval sets |

Conversation was never the unit of value. **Outcomes** are.

---

## Preference as the enterprise signal

A common critique says human-in-the-loop feedback produces chatty, people-pleasing systems that need babysitting forever.

In the enterprise, that critique misses the asset.

**Human preference grounded in real work is not a bug — it is the training signal.**

When a knowledge worker thumbs down a SharePoint agent’s draft, corrects a classification, or escalates a borderline approval, they are not apologising for incomplete automation. They are labelling the only dataset that matters: *what good looks like here*, under *these* policies, in *this* tenant.

We treat preference loops as production practice:

1. **Preference** — thumbs, rankings, “use this version”
2. **Correction** — edit the artefact; the delta is gold
3. **Escalation** — route to a human when confidence is low or policy is hot
4. **Eval sets** — freeze hard cases; refuse to regress

Agents that cannot be corrected cannot be trusted. Agents that are corrected and never learn are theatre. Effective agents **close the loop**.

---

## Governed enough to scale

You let a component run unattended if it is reliable. You only build on top of it if it is trustworthy.

- **Permissions and sensitivity labels** bound what grounding can see
- **Copilot Studio / Agent Builder** bound what actions can fire
- **Foundry** binds which models, tools, and evaluations are in play
- **Purview** binds retention, DLP, and audit
- **Scout** and monitoring bind visibility into agent behaviour at estate scale

We call this **governed emergence**: capability grows inside rails strong enough that leaders will fund the next layer.

---

## Three moves

### 1. Compose on the stack you already own

Start with Intent → Agent → Grounding → Action → Feedback → Governance. Map every agent to Microsoft products in the estate. Prefer SharePoint agents and Copilot surfaces over orphaned web UIs.

### 2. Instrument preference as production data

Treat every thumbs-up, correction, and escalation as first-class telemetry. Build eval sets from failures. Calibrate confidence so “I’m unsure” routes to a human before “I’m fluent” invents a policy.

### 3. Measure effectiveness, not engagement

Report task completion, time-to-outcome, escalation rate, and confidence calibration. If the metric board only shows message counts, you are funding chat theatre.

See also: [Effective Insights](./insights/), [Effective Choice](./choice/), [Effective Measurements](./measurements/).

---

## Closing

The age of decorative copilots is ending. The organisations that win will not be those with the wittiest system prompt. They will be those whose agents **ship work**, under governance, improved by the people who know the work.

That is our goal: **effective agents**.

**Ship Outcomes, Not Chat.**

---

## Footnotes

¹ Effective Agents is an independent practice and brand. Built on Microsoft technologies. Not affiliated with Microsoft Corporation or TypeSafe AI.

² “Outcome” means a completed business step with an artefact or state change (document filed, case updated, approval recorded) — not a conversational turn.

³ Preference loops here mean enterprise ratings, corrections, escalations, and eval-driven updates applied to agents on the Microsoft stack — not a claim about training foundation models from scratch.
