# Fintech Decision Aid

Build a clean, interactive AI Decision Engine prototype for a fintech product.

Concept:

The product helps a fintech company decide whether a card/UPI transaction should be APPROVED, FLAGGED FOR REVIEW, or BLOCKED using an AI decision model inspired by Jev AI.

Target user:

Fintech risk/fraud operations team.

Create a simple dashboard with:

1. Transaction Input

Allow the user to enter/select:

- Transaction amount

- Merchant category

- User's usual transaction amount

- Transaction location

- Device status: Known / New

- Transaction frequency: Normal / Unusual

- Time of transaction

2. "Analyze Transaction" button

3. Decision Output

After clicking the button, display:

- Decision: APPROVE / REVIEW / BLOCK

- Confidence score: 0–100%

- Risk level: Low / Medium / High

- Top 2–3 reasons behind the decision

4. Recommended Action

Based on the decision:

- APPROVE → Process transaction

- REVIEW → Send for manual verification

- BLOCK → Block transaction and notify customer

5. PM Dashboard

Show three simple metrics:

- Transactions analyzed

- % automatically approved

- % sent for manual review

Add 3 pre-built examples:

A. ₹800 transaction from a known device and usual location → APPROVE

B. ₹45,000 transaction from a new device/location → REVIEW

C. ₹1,20,000 transaction with unusual frequency and new device → BLOCK

UX:

- Minimal, modern fintech dashboard

- White/light background

- Clear cards and simple typography

- Make the decision visually prominent

- Add a small flow at the bottom:

Transaction Context → AI Decision → Confidence → Action

Important:

This is a prototype demonstrating the PRODUCT CONCEPT, not a real fraud detection system and not an actual Jev API integration.

At the bottom, add:

"AI-assisted decisioning — human review remains available for high-risk cases."

The experience should feel like a real internal fintech risk tool that a Product Manager could present in an AI product case study.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ae81048d-4e67-567e-ba44-93eaa6cb9492).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
