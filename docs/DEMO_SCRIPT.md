# Salary Desk — recording script

The final 6:07 recording has been completed: [watch it in Presentation](https://incubyte-salary-desk.vercel.app/presentation#video-demo). This script is retained as the planning/rehearsal artifact, not an outstanding deliverable or a verbatim transcript.

Target: **about 5–6 minutes**, spoken at a comfortable pace. Read only the quoted narration; the action lists are your cues. Pause while a result loads. Use your normal voice, not a presenter voice; contractions and short pauses are fine. This is a demonstration of an AI-assisted assessment, not a claim that every line was written manually.

## Before recording

1. Use your separate **local development database** for the save. Start with `npm run dev`, open `http://localhost:3000`, and authenticate before recording. The deployed application is linked in the submission; the local recording demonstrates the same workflows with isolated persistence.
2. Confirm ACME-03001 is **Aarav Al-Hassan, India, Finance, INR 600,000.00 annually**. This was verified in the development DB when preparing the script. If you have already rehearsed a save, restore your own development record through the normal editor to 600000.00 before another take. Do not reset/reseed the database or overwrite an unrelated pre-existing edit to fit a script.
3. Open Dashboard with INR selected. Keep these available as bookmarks: `/dashboard?currency=INR`, `/employees`, `/overview?currency=INR&groupBy=department`, `/presentation/architecture`, `/presentation/quality`, and the public repository's Actions page. Use the sidebar during the take.
4. Use a readable browser window around 1440 × 900, close private tabs/notifications and hide credentials. Record the browser, with microphone enabled. Make a ten-second test and replay it to check audio/text before the real take.
5. The salary example is **600000.00 → 630000.00**, an increase of **INR 30,000.00 / 5.00%**. Enter amounts without commas. You will save only in the separate development environment.

## 1. Introduce the problem — 0:00–0:35

**Show:** Dashboard in INR. Keep the headcount cards and country/department charts visible.

**Say:**

> Hi, I'm Ayush. This is Salary Desk, my solution to the Incubyte salary-management assessment.
>
> The user here is an HR Manager at ACME, with ten thousand employees across multiple countries. I focused on three things: finding a person's compensation, making a safe salary correction, and answering pay questions for a clearly defined group.
>
> I'm using my separate development database for this recording so I can demonstrate a real save. The deployed application and public source are included in my submission.

## 2. Explain the Dashboard — 0:35–1:05

**Do:** Point to 10,000 employees and the two headcount charts. Hover one country segment. Scroll to the INR compensation snapshot and distribution.

**Say:**

> The Dashboard gives HR a quick picture of the organization. Headcount can cover everyone, across countries and currencies.
>
> Salary figures work differently. Here I've selected INR, so the summary and distribution only include employees paid in INR. The amounts are annual base salary, and there's no currency conversion happening in the background.
>
> These charts give an overview and a way into the employee data. They don't imply a historical trend or explain why two people are paid differently.

## 3. Find the right population — 1:05–1:45

**Do:**

1. Open **Employees** in the sidebar.
2. Select **Country: India**, **Department: Finance**, **Pay currency: INR**. Keep 25 per page.
3. Click **Apply filters**. Point to the matching count and pagination. Click **Next**, then **Previous**.
4. Enter `ACME-03001` in Search and click **Apply filters**.
5. Open **View Aarav Al-Hassan** using the employee row action.

**Say:**

> In Employees, I can narrow the population by country, department, role and pay currency. The controls stay as a draft until I apply them together.
>
> The table is paginated on the server. There are twenty-five employees on this page; the matching count covers the whole filtered population. Only the requested page of employee rows is sent to the browser.
>
> I'll search by employee number here, because names can repeat. This brings me to Aarav's current compensation and the context HR needs before making a change.

## 4. Preview, validate and persist a correction — 1:45–3:00

**Do:**

1. Point to **INR 600,000.00**, annual period and the version/update metadata.
2. In **New annual salary (INR)**, enter `0`. Show the validation message and disabled Save.
3. Replace it with `630000.00`. Point to the old/new amounts and **INR 30,000.00 / 5.00%** preview.
4. Click **Save salary**. Wait for **Salary saved**; do not speak as though it succeeded before confirmation.
5. Close the panel, reload the page, and reopen Aarav. Show **INR 630,000.00** and the advanced version.

**Say:**

> Aarav's current annual base salary is six hundred thousand rupees. The currency and annual period stay explicit.
>
> If I enter zero, the application rejects it and keeps Save disabled. For a valid proposal of six hundred and thirty thousand, I can see the old amount, the new amount, and the thirty-thousand-rupee increase, which is five percent, before saving.
>
> I'll save that now and wait for confirmation.
>
> After reloading and reopening the employee, the new amount is still here. The change has been persisted in PostgreSQL.
>
> The save also checks the version originally loaded. If another update wins first, the stale save is rejected and the draft is kept for review. The concurrent-write behavior is also covered by the database and browser tests.

## 5. Answer a pay question — 3:00–3:50

**Do:**

1. Close the employee panel. Click **Salary overview**.
2. Click **Clear filters**. This clears the employee search and restores the overview's INR default. Keep **Group by: Department**.
3. Show the population line, four salary cards and department table.
4. Click **Explain Median annual base**. Point to definition, currency/period, active filters and matching population. Close it afterward. The matching-employees link is available if you want to show the drill-down briefly.

**Say:**

> Now I'll clear the earlier employee filters and look at everyone paid in INR.
>
> This is the more detailed analysis view: total annual base, median, lowest and highest salary, followed by the department breakdown. Every number uses the full matching population, across all pages.
>
> If a number needs context, I can open its explanation. Here I can see what the median means, which filters apply and which employees belong to that population.
>
> Salary amounts are stored as exact minor units. Even-sized medians retain the half-unit until display rounding, so the calculation doesn't silently truncate it.

## 6. Trace the implementation — 3:50–4:40

**Do:** Open **Presentation → Architecture and flows**. Show the system diagram, then scroll to the salary-update flow and its version-checked persistence excerpt. Allow a brief pause for the diagram to be readable.

**Say:**

> The Presentation section is the assessment report, with the scope, implementation, decisions and supporting evidence.
>
> The application is a TypeScript modular monolith using Next.js, Drizzle and PostgreSQL. The domain rules, request validation and database queries have separate responsibilities, so the salary logic can be understood and tested independently of the UI.
>
> This flow shows the salary update: authenticate, validate the proposal, then update the row only if its version still matches. A successful write advances the version and refreshes the affected employee and analysis views. A conflict or failed confirmation keeps the user's proposal available.

## 7. Show evidence and AI collaboration — 4:40–5:25

**Do:** Open **Verification**, show the source-labeled checks and artifact index. Open the linked GitHub Actions workflow's latest successful run. Briefly show the README documentation map or AI-collaboration link; do not scroll through raw operational logs.

**Say:**

> The repository includes the one-page requirements, architecture and workflow diagrams, setup instructions, decisions and the AI-collaboration record.
>
> The passing verification includes unit tests for money and core rules, PostgreSQL tests for queries and concurrent updates, and production-browser checks for the HR workflow and interaction failures. The CI run identifies the exact commit it tested.
>
> I used AI throughout development to help plan, implement, test and review the solution. The collaboration record includes the actual revisions and corrections. That record shows how the implementation evolved and how generated work was checked.

## 8. Close with scope and review links — 5:25–5:55

**Do:** Return to the report overview or Dashboard. Finish on a clean, readable screen.

**Say:**

> While awaiting clarification, I proceeded with the documented scope: current annual base pay, one-currency analysis, and updates to current salary values. Bonuses, equity, payroll, salary history and future-effective changes are outside this version.
>
> The deployed application, public repository and report are linked in my submission, with the evaluator access code supplied privately. That's Salary Desk. Thank you for taking the time to review it.

## After recording

- Replay the whole video: readable screens, working audio, accurate save outcome and no credentials/notifications.
- In your own development environment, restore Aarav to the pre-recording 600000.00 through a normal version-checked save if you want to rehearse again. Do not reset/reseed or touch the public demo for this purpose.
- Upload the final recording, verify signed-out playback, and add the actual URL to the private submission draft and README/video status. The script is not a completed video.
- If you stumble, pause, repeat the sentence, and trim that pause. Do not speed-click to fit exact timestamps; 5–6 minutes is a guide, not an assessment-imposed limit.
