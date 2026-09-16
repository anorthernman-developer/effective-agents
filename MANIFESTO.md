# Effective Agents Manifesto

**Ship Outcomes, Not Chat**

---

## Mission

Our mission is to make enterprise intelligence **effective**: agents that finish work inside Microsoft 365 — composed from Intent to Governance, grounded in SharePoint and Graph, steered by human preference, and measured by outcomes rather than conversation volume.¹

We are not chasing a god-model that can discuss everything. We are shipping agents that can **do** the next useful thing — under identity, policy, and audit — then get better from the people who correct them.

---

## We already have the factory floor

Enterprises already run the machinery that agents need:

- **Identity** that knows who may see what
- **SharePoint and Graph** that hold the corpus of real work
- **Copilot** as a surface people already open
- **Copilot Studio and Agent Builder** to compose behaviour
- **Microsoft Foundry** to host, evaluate, and govern models and agents
- **Purview and Scout** to watch for drift, overreach, and unsafe emergence

What is missing is not another chatbot. What is missing is a discipline: treat agents as **production systems** with feedback loops, not demos with personality.

Chat is a door. Effectiveness is what walks through it.

---

## The horseless carriage of enterprise AI

Early cars looked like carriages with engines bolted on. Early enterprise AI looks like **chatbots bolted onto the intranet**.

Same habit: take a familiar shape (conversation), attach it to institutional knowledge, and call the job done. Users ask. The bot answers. Someone still copies the answer into the form, the ticket, the policy pack, the approval chain.

That is decorative intelligence — useful for discovery, weak for delivery.

Effective agents invert the pattern:

| Chatbot bolted on | Effective agent |
|-------------------|-----------------|
| Answers in a pane | Completes a step in the workflow |
| Context is “whatever fit in the prompt” | Grounding is SharePoint, Graph, and permissions |
| Success = fluent reply | Success = task completion + audit trail |
| Feedback = “thanks / not helpful” buried in a log | Feedback = preference loops that retrain and re-steer |
| Governance = hope | Governance = Foundry, Purview, Scout, eval sets |

The carriage was never the point. Transport was. Conversation was never the point. **Outcomes** are.

---

## RLHF, reclaimed

A common critique of RLHF says it produces chatty, human-pleasing models that need humans in the loop forever.

In the enterprise, that critique misses the asset.

**Human preference grounded in real work is not a bug — it is the training signal.**

When a knowledge worker thumbs down a SharePoint agent’s draft, corrects a classification, or escalates a borderline approval, they are not babysitting a failed AGI. They are labelling the only dataset that matters: *what good looks like here*, under *these* policies, in *this* tenant.

We reclaim RLHF as the enterprise feedback loop:

1. **Preference** — thumbs, rankings, “use this version”
2. **Correction** — edit the artefact; the delta is gold
3. **Escalation** — route to a human when confidence is low or policy is hot
4. **Eval sets** — freeze hard cases; refuse to regress

Agents that cannot be corrected cannot be trusted. Agents that are corrected and never learn are theatre. Effective agents **close the loop**.

---

## Safe emergence via Microsoft governance

Safety is not a manifesto slogan. It is whether you will let an agent touch a library, a mailbox, or a workflow unattended.

Emergence without governance is a breach waiting for a blog post. Emergence **with** Microsoft’s control plane is how organisations scale:

- **Permissions and sensitivity labels** bound what grounding can see
- **Copilot Studio / Agent Builder** bound what actions can fire
- **Foundry** binds which models, tools, and evaluations are in play
- **Purview** binds retention, DLP, and audit
- **Scout** and monitoring bind visibility into agent behaviour at estate scale

You bury a dependency five layers deep only when you can inspect it, constrain it, and roll it back. That is true for libraries. It must be true for agents.

We call this **governed emergence**: capability grows inside rails strong enough that leaders will fund the next layer.

---

## Three steps

### 1. Compose on the stack you already own

Stop starting with a blank chat window. Start with Intent → Agent → Grounding → Action → Feedback → Governance. Map every agent to Microsoft products that already exist in the estate. Prefer SharePoint agents and Copilot surfaces over orphaned web UIs.

### 2. Instrument preference as production data

Treat every thumbs-up, correction, and escalation as first-class telemetry. Build eval sets from failures. Calibrate confidence so “I’m unsure” routes to a human before “I’m fluent” invents a policy.

### 3. Measure effectiveness, not engagement

Report task completion, time-to-outcome, escalation rate, and confidence calibration. If the metric board only shows message counts, you are funding chat theatre.

---

## Last words

The age of decorative copilots is ending. The organisations that win will not be those with the wittiest system prompt. They will be those whose agents **ship work**, under governance, improved by the people who know the work.

We are not building God.

We are building **effective agents**.

**Ship Outcomes, Not Chat.**

---

## Tagline candidates (see also TAGLINES.md)

| Rank | Line |
|------|------|
| 1 | Ship Outcomes, Not Chat |
| 2 | Effective, Not Decorative |
| 3 | Agents That Finish the Job |
| 4 | Inside the Tools. Measured by Outcomes. |
| 5 | Preference That Ships |
| 6 | Compose. Ground. Act. Improve. |
| 7 | Intelligence With a Work Order |
| 8 | Governed Emergence, Real Work |
| 9 | Stop Bolting Chat Onto the Intranet |
| 10 | RLHF for Work That Matters |
| 11 | From Copilot Pane to Closed Loop |
| 12 | Build Agents, Not Oracles |

---

## Footnotes

¹ Effective Agents is an independent practice and brand. Built on Microsoft technologies. Not affiliated with Microsoft Corporation or TypeSafe AI.

² “Outcome” means a completed business step with an artefact or state change (document filed, case updated, approval recorded) — not a conversational turn.

³ RLHF here means enterprise preference loops (ratings, corrections, escalations, eval-driven updates) applied to agents on the Microsoft stack — not a claim about training foundation models from scratch.
