import { useMemo, useState, useEffect, useContext } from "react";
import { FiCheck } from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import LoadingScreen from "../components/LoadingScreen";
import axios from "axios";
import { AuthContext } from "../stores/authStore";
import { useNavigate } from "react-router-dom";

// Promo codes remain the same
const PROMOS = {
  SIG10: { desc: "10% off", discount: 0.1 },
  CREATOR20: { desc: "20% off (creator)", discount: 0.2 },
};

export default function SubscriptionPage() {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  // ✅ 1. Use an object to store input values for each plan's promo code
  const [promoInputs, setPromoInputs] = useState({});
  // ✅ 2. Use an object to store applied promos, keyed by plan ID
  const [appliedPromos, setAppliedPromos] = useState({});
  // ✅ 3. Use an object to store errors for each plan
  const [promoErrors, setPromoErrors] = useState({});
  
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {user} = useContext(AuthContext);
  const { data: plans, loading, error } = useFetch("/api/general/premium-plan");

  // Helper to get the promo code for the currently selected plan
  const activePromoCode = useMemo(() => {
    if (!selected || !appliedPromos[selected]) return null;
    return appliedPromos[selected].code;
  }, [selected, appliedPromos]);

  async function handleSubscribe() {
    if (!currentPlan) return;
    setIsRedirecting(true);

    try {
      const response = await axios.post(
        "http://localhost:8181/api/user/subscribe-now/checkout",
        {
          planId: currentPlan._id,
          // ✅ 4. Send the promo code specific to the selected plan
          promoCode: activePromoCode,
        },
        { withCredentials: true }
      );

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Could not retrieve payment URL.");
      }
    } catch (err) {
      console.error("Error creating Stripe checkout session:", err);
      alert("Could not proceed to payment. Please try again later.");
      setIsRedirecting(false);
    }
  }

  useEffect(() => {
    if(!user) navigate("/sign-in");
    if(user?.data?.hasPremiumAccess) {
      // If user has premium access, redirect to dashboard
      window.location.href = "/dashboard";
    } else if (plans && plans.length > 0 && !selected) {
      const defaultPlan = plans.sort((a, b) => a.durationInDays - b.durationInDays)[0];
      setSelected(defaultPlan._id);
    }
  }, [plans, selected]);

  const currentPlan = useMemo(() => {
    if (!plans || !selected) return null;
    return plans.find((p) => p._id === selected);
  }, [plans, selected]);

  const finalPrice = useMemo(() => {
    if (!currentPlan) return 0;
    const base = currentPlan.price;
    // ✅ 5. Look up the promo for the currently selected plan
    const promo = appliedPromos[currentPlan._id];
    if (!promo) return base;
    return +(base * (1 - promo.discount)).toFixed(2);
  }, [currentPlan, appliedPromos]);

  // ✅ 6. Update promo logic to be plan-specific
  function applyPromo(planId) {
    setPromoErrors(prev => ({ ...prev, [planId]: "" })); // Clear previous error for this plan
    const code = (promoInputs[planId] || "").trim().toUpperCase();

    if (!code) {
      setPromoErrors(prev => ({ ...prev, [planId]: "Enter a promo code" }));
      return;
    }
    const info = PROMOS[code];
    if (!info) {
      setPromoErrors(prev => ({ ...prev, [planId]: "Invalid promo code" }));
      return;
    }
    
    setAppliedPromos(prev => ({ ...prev, [planId]: { code, ...info } }));
  }

  function clearPromo(planId) {
    setAppliedPromos(prev => {
        const newPromos = { ...prev };
        delete newPromos[planId];
        return newPromos;
    });
    setPromoInputs(prev => ({ ...prev, [planId]: "" }));
    setPromoErrors(prev => ({ ...prev, [planId]: "" }));
  }

  if (loading || !user) return <LoadingScreen />;
  if (error || !plans || !plans.length) {
    return (
        <div className="min-h-screen px-4 py-12 bg-[var(--color-bg-black)] text-center text-red-400">
            <h1 className="text-2xl">Could not load subscription plans.</h1>
            <p>{error?.message || "Please try again later."}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-[var(--color-bg-black)] text-[var(--color-fg)]">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold">Choose your plan</h1>
        <p className="mt-3 text-sm text-[var(--color-fg)]">
          Practice problem solving to its fullest using our premium features.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {plans.map((plan) => {
            const promoForThisPlan = appliedPromos[plan._id];
            const errorForThisPlan = promoErrors[plan._id];

            return (
          <article
            key={plan._id}
            onClick={() => setSelected(plan._id)}
            className={`cursor-pointer rounded-3xl border p-8 shadow-sm transition ${
              selected === plan._id
                ? "border-[var(--color-warning)] ring-2 ring-[var(--color-warning)]"
                : "border-[var(--color-border)]"
            } bg-[var(--color-surface)]`}
            aria-selected={selected === plan._id}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                {plan.durationInDays > 30 && (
                  <div className="relative top-0 right-0 flex justify-end">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-warning)] text-[var(--color-bg)] text-xs font-medium">
                      Wise decision
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="text-4xl sm:text-5xl font-mono font-bold leading-none text-[var(--color-fg)]">
                  ${plan.price.toFixed(2)}
                </div>
                <div className="text-xs text-[var(--color-muted)] mt-1">
                  per {plan.durationInDays === 30 ? "month" : "year"}
                </div>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-[var(--color-warning)]"><FiCheck /></span>
                    <span className="text-[var(--color-fg)]/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <label className="block text-xs text-[var(--color-muted)] mb-2">
                  Promo/Creator code
                </label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <input
                      value={promoInputs[plan._id] || ''}
                      onChange={(e) => setPromoInputs(prev => ({...prev, [plan._id]: e.target.value}))}
                      placeholder="Enter promo code"
                      className="w-full border-1 border-[var(--color-fg)] rounded-3xl px-3 py-2 text-[var(--color-fg)] placeholder:text-[var(--color-fg)]"
                      aria-label={`Promo code for ${plan.name}`}
                    />
                  </div>
                  <button type="button" onClick={() => applyPromo(plan._id)} className="px-3 py-2 rounded-4xl bg-[var(--color-gray)] text-[var(--color-fg)]">
                    Apply
                  </button>
                </div>
                {promoForThisPlan && (
                  <div className="mt-2 text-sm text-[var(--color-warning)] flex items-center justify-between">
                    <div>
                      Applied <strong>{promoForThisPlan.code}</strong> — {promoForThisPlan.desc}
                    </div>
                    <button onClick={() => clearPromo(plan._id)} className="text-xs underline text-[var(--color-muted)]">
                      Remove
                    </button>
                  </div>
                )}
                {errorForThisPlan && (
                  <div className="text-sm text-[var(--color-error)] mt-2">
                    {errorForThisPlan}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={handleSubscribe}
                  disabled={loading || isRedirecting}
                  className="w-full py-3 rounded-full bg-[var(--color-warning)] text-[var(--color-bg)] font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isRedirecting && selected === plan._id ? "Redirecting..." : "Subscribe Now"}
                </button>
              </div>
            </div>
          </article>
        )})}
      </div>

      {currentPlan && (
        <div className="max-w-6xl mx-auto mt-8 text-center text-sm text-[var(--color-fg)]">
          <div>
            Selected: <strong>{currentPlan.name}</strong> —{" "}
            <span className="font-mono">${finalPrice.toFixed(2)}</span>
            {appliedPromos[currentPlan._id] ? (
              <span className="ml-2 text-[var(--color-primary)]">
                ({appliedPromos[currentPlan._id].code} applied)
              </span>
            ) : null}
          </div>
          <div className="mt-2">
            All payments are processed securely. You can cancel anytime.
          </div>
        </div>
      )}
    </div>
  );
}