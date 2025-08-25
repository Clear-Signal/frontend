import { useMemo, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { RiCoupon2Fill } from "react-icons/ri";

const PLANS = {
  monthly: {
    key: "monthly",
    title: "Monthly",
    price: 12.0,
    periodLabel: "per month",
    features: [
      "Access to Problem breakdowns",
      "Faster Run Times",
      "No Ads",
      "Badges for collections",
      "Save more Submissions",
      "20 AI Powered Hints a day",
      "Generate 5 questions a day from Deep-0",
    ],
  },
  yearly: {
    key: "yearly",
    title: "Yearly",
    price: 119.0,
    periodLabel: "per year",
    features: ["All monthly features", "Saves ~18% from the monthly plan"],
    recommended: true,
  },
};

// Demo promo codes
const PROMOS = {
  DEEP10: { desc: "10% off", discount: 0.10 },
  CREATOR20: { desc: "20% off (creator)", discount: 0.20 },
};

export default function SubscriptionPage() {
  const [selected, setSelected] = useState("monthly");
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

  const plan = PLANS[selected];

  // compute discounted price
  const finalPrice = useMemo(() => {
    const base = plan.price;
    if (!appliedPromo) return base;
    return +(base * (1 - appliedPromo.discount)).toFixed(2);
  }, [plan, appliedPromo]);

  function applyPromo() {
    setPromoError("");
    const code = (promo || "").trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a promo code");
      return;
    }
    const info = PROMOS[code];
    if (!info) {
      setPromoError("Invalid promo code");
      return;
    }
    setAppliedPromo({ code, ...info });
    setPromoError("");
  }

  function clearPromo() {
    setAppliedPromo(null);
    setPromo("");
    setPromoError("");
  }

  function handleSubscribe() {
    // TODO: wire to payments / backend
    alert(`Subscribe -> ${plan.title} (${appliedPromo ? `${appliedPromo.code} applied` : "no promo"})`);
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-[var(--color-bg)] text-[var(--color-fg)]">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold">Choose your plan</h1>
        <p className="mt-3 text-sm text-[var(--color-fg)]">
          Practice problem solving to its fullest using our premium features.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Monthly Card */}
        <article
          onClick={() => setSelected("monthly")}
          className={`cursor-pointer rounded-2xl border border-[var(--color-border)] p-8 shadow-sm transition
            ${selected === "monthly" ? "ring-2 ring-[var(--color-warning)]" : ""}
            bg-[var(--color-surface)]`}
          aria-selected={selected === "monthly"}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Monthly</h2>
              <div className="text-sm text-[var(--color-muted)]"> </div>
            </div>

            <div className="mt-6">
              <div className="text-4xl sm:text-5xl font-mono font-bold leading-none text-[var(--color-fg)]">
                ${PLANS.monthly.price.toFixed(2)}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-1">{PLANS.monthly.periodLabel}</div>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {PLANS.monthly.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-[var(--color-warning)]">
                    <FiCheck />
                  </span>
                  <span className="text-[var(--color-fg)]/90">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <label className="block text-xs text-[var(--color-muted)] mb-2">Promo/Creator code</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter promo code"
                    className="w-full border-1 border-[var(--color-fg)] rounded-3xl px-3 py-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg)]"
                    aria-label="Promo code"
                  />
                </div>

                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-3 py-2 rounded-4xl bg-[var(--color-gray)] text-[var(--color-fg)]"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-2 text-sm text-[var(--color-warning)] flex items-center justify-between">
                  <div>
                    Applied <strong>{appliedPromo.code}</strong> — {appliedPromo.desc}
                  </div>
                  <button onClick={clearPromo} className="text-xs underline text-[var(--color-fg)]">Remove</button>
                </div>
              )}

              {promoError && <div className="text-sm text-[var(--color-error)] mt-2">{promoError}</div>}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubscribe}
                className="w-full py-3 rounded-full bg-[var(--color-warning)] text-[var(--color-bg)] font-semibold cursor-pointer"
                aria-label="Subscribe monthly"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </article>

        {/* Yearly Card */}
        <article
          onClick={() => setSelected("yearly")}
          className={`relative h-full cursor-pointer rounded-2xl border-2 p-8 transition
            ${selected === "yearly" ? "border-[var(--color-warning)] ring-2 ring-[var(--color-warning)]" : "border-[var(--color-border)]"}
            bg-[var(--color-surface)]`}
          aria-selected={selected === "yearly"}
        >
          {/* recommended badge */}
          <div className="absolute top-4 right-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-warning)] text-[var(--color-bg)] text-xs font-medium">
              Wise decision
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Yearly</h2>
              <div className="text-sm text-[var(--color-muted)]"></div>
            </div>

            <div className="mt-6">
              <div className="text-4xl sm:text-5xl font-mono font-bold leading-none text-[var(--color-fg)]">
                ${PLANS.yearly.price.toFixed(2)}
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-1">{PLANS.yearly.periodLabel}</div>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {PLANS.yearly.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 text-[var(--color-warning)]">
                    <FiCheck />
                  </span>
                  <span className="text-[var(--color-fg)]/90">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <label className="block text-xs text-[var(--color-muted)] mb-2">Promo/Creator code</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Enter promo code"
                    className="w-full border-1 border-[var(--color-fg)] rounded-3xl px-3 py-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg)]"
                    aria-label="Promo code for yearly"
                  />
                </div>

                <button
                  type="button"
                  onClick={applyPromo}
                  className="px-3 py-2 rounded-4xl bg-[var(--color-gray)] text-[var(--color-fg)]"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-2 text-sm text-[var(--color-warning)] flex items-center justify-between">
                  <div>
                    Applied <strong>{appliedPromo.code}</strong> — {appliedPromo.desc}
                  </div>
                  <button onClick={clearPromo} className="text-xs underline text-[var(--color-muted)]">Remove</button>
                </div>
              )}

              {promoError && <div className="text-sm text-[var(--color-error)] mt-2">{promoError}</div>}
            </div>

            <div className="mt-6">
              <button
                onClick={handleSubscribe}
                className="w-full py-3 rounded-full bg-[var(--color-warning)] text-[var(--color-bg)] font-semibold cursor-pointer"
                aria-label="Subscribe yearly"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </article>
      </div>

      {/* Price preview + small note */}
      <div className="max-w-6xl mx-auto mt-8 text-center text-sm text-[var(--color-fg)]">
        <div>
          Selected: <strong>{plan.title}</strong> —{" "}
          <span className="font-mono">${finalPrice.toFixed(2)}</span>
          {appliedPromo ? <span className="ml-2 text-[var(--color-primary)]">({appliedPromo.code} applied)</span> : null}
        </div>
        <div className="mt-2">All payments are processed securely. You can cancel anytime.</div>
      </div>
    </div>
  );
}
