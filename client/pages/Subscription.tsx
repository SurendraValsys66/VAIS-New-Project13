import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Minus,
  CreditCard,
  Info,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  CircleX,
  Gift,
  Rocket,
  BarChart3,
  Building2,
  Coins,
} from "lucide-react";
import React, { useMemo, useState, useRef } from "react";

interface Plan {
  id: "free" | "growth" | "scale" | "enterprise";
  name: string;
  description?: string;
  priceMonthly: number; // USD per seat per month
  priceAnnual: number; // USD per seat per month billed annually
  creditsPerMonth: number | null;
  creditsLabel?: string; // override label (e.g., "1000 credits per plan")
  creditsNote?: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Plan",
    description:
      "Explore the platform to find leads, manage pipeline & close deals.",
    priceMonthly: 0,
    priceAnnual: 0,
    creditsPerMonth: null,
    creditsLabel: "1000 credits per plan",
    creditsNote: "7-day free plan",
  },
  {
    id: "growth",
    name: "Growth Plan",
    description:
      "Scale prospecting, outreach & deal management with more credits.",
    priceMonthly: 69,
    priceAnnual: 55,
    creditsPerMonth: 3000,
  },
  {
    id: "scale",
    name: "Scale Plan",
    description: "Advanced capabilities with higher monthly credits allotment.",
    priceMonthly: 99,
    priceAnnual: 79,
    creditsPerMonth: 6000,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description:
      "Custom pricing and higher limits for teams with advanced needs.",
    priceMonthly: 0,
    priceAnnual: 0,
    creditsPerMonth: null,
    creditsLabel: "Custom credits",
  },
];

// Core modules from the provided design
const coreRows: { label: string; values: (boolean | string | "-")[] }[] = [
  { label: "Build Your ABM with VAIS", values: [false, true, true, true] },
  { label: "ABM Verification", values: [false, true, true, true] },
  { label: "Look-Alike Generation", values: [false, true, true, true] },
  { label: "Find My Prospects", values: [false, true, true, true] },
  {
    label: "Download Center (Reports, Leads, Assets)",
    values: [false, true, true, true],
  },
  { label: "Buy Additional Credits", values: ["✖", "$1.50", "$1", "$1"] },
  {
    label: "Support",
    values: [
      "Tickets",
      "Email",
      "Priority Email Support",
      "Priority Email Support",
    ],
  },
];

// High value account insights
const insightsRows: { label: string; values: (boolean | string | "-")[] }[] = [
  { label: "Intent Topics", values: ["3", "5", "8", "8"] },
  {
    label: "Account Level Intent Signals",
    values: [
      "-",
      "First 10 Free Signals",
      "First 10 Free Signals",
      "First 10 Free Signals",
    ],
  },
  { label: "Account Profiling", values: [false, true, true, true] },
  { label: "Account Fit Insights", values: [true, true, true, true] },
  { label: "Market Trend Activity", values: [true, true, true, true] },
  { label: "Funnel Orchestration", values: [true, true, true, true] },
  { label: "Campaign Recommendation", values: [true, true, true, true] },
  { label: "Asset Recommendation", values: [true, true, true, true] },
];

function priceFor(plan: Plan, billing: "monthly" | "annual") {
  return billing === "monthly" ? plan.priceMonthly : plan.priceAnnual;
}

function planDisplay(plan: Plan, billing: "monthly" | "annual") {
  // Price label
  const isEnterprise = plan.id === "enterprise";
  const price = priceFor(plan, billing);

  let priceLabel: React.ReactNode;
  let priceSuffix: string = "";

  if (isEnterprise) {
    priceLabel = "Custom Plan";
    priceSuffix = "";
  } else if (price === 0) {
    priceLabel = "$0";
    priceSuffix = "";
  } else if (
    billing === "annual" &&
    plan.priceAnnual > 0 &&
    plan.priceAnnual < plan.priceMonthly
  ) {
    // Show discount: original monthly price struck-through then discounted annual monthly price
    priceLabel = (
      <span className="inline-flex items-baseline gap-2">
        <span className="line-through text-valasys-gray-400">
          {formatPrice(plan.priceMonthly)}
        </span>
        <span className="font-bold">{formatPrice(plan.priceAnnual)}</span>
      </span>
    );
    priceSuffix = "/month";
  } else {
    priceLabel = `$${price}`;
    priceSuffix = "/month";
  }

  // Billed note and credits text based on provided spec
  let billedNote =
    billing === "monthly"
      ? "Billed monthly"
      : "Per seat per month, billed annually";
  let credits = plan.creditsLabel ?? "";

  if (plan.id === "free") {
    credits = "1000 credits per plan";
    billedNote = "7-day free plan";
  } else if (billing === "annual") {
    if (plan.id === "growth") credits = "36,000 credits per user / year";
    if (plan.id === "scale") credits = "72,000 credits per user / year";
    if (plan.id === "enterprise") credits = "Custom credits";
  } else {
    if (plan.id === "growth") credits = "3,000 credits per user / month";
    if (plan.id === "scale") credits = "6,000 credits per user / month";
    if (plan.id === "enterprise") credits = "Custom credits";
  }

  return { priceLabel, priceSuffix, billedNote, credits };
}

function planIcon(id: Plan["id"]) {
  const cls = "w-6 h-6 text-valasys-orange";
  switch (id) {
    case "free":
      return <Gift className={cls} />;
    case "growth":
      return <Rocket className={cls} />;
    case "scale":
      return <BarChart3 className={cls} />;
    case "enterprise":
      return <Building2 className={cls} />;
    default:
      return null;
  }
}

function formatPrice(n: number) {
  return n === 0 ? "$0" : `$${n.toFixed(0)}`;
}

function PlanCard({
  plan,
  billing,
  selected,
  planIndex,
  onSelect,
  onToggleComparison,
  comparisonOpen,
}: {
  plan: Plan;
  billing: "monthly" | "annual";
  selected?: boolean;
  planIndex: 0 | 1 | 2 | 3;
  onSelect: () => void;
  onToggleComparison: () => void;
  comparisonOpen: boolean;
}) {
  const includedCore = coreRows
    .map((r) => ({ label: r.label, v: r.values[planIndex] }))
    .filter((r) => r.v !== false && r.v !== "-");
  const includedInsights = insightsRows
    .map((r) => ({ label: r.label, v: r.values[planIndex] }))
    .filter((r) => r.v !== false && r.v !== "-");

  return (
    <Card
      className={`relative h-full flex flex-col ${plan.id === "free" || plan.id === "enterprise" ? "cursor-default" : "cursor-pointer"} ${selected ? "ring-2 ring-yellow-300 bg-yellow-50" : ""}`}
      onClick={
        plan.id === "free" || plan.id === "enterprise" ? undefined : onSelect
      }
      role={
        plan.id === "free" || plan.id === "enterprise" ? undefined : "button"
      }
      tabIndex={plan.id === "free" || plan.id === "enterprise" ? -1 : 0}
      onKeyDown={(e) => {
        if (
          plan.id !== "free" &&
          plan.id !== "enterprise" &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <CardHeader className="!p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {plan.popular && (
              <Badge className="bg-valasys-orange text-white mb-1">
                MOST POPULAR
              </Badge>
            )}
            <div className="flex items-center gap-2">
              {planIcon(plan.id)}
              <CardTitle className="text-base md:text-xl font-semibold">
                {plan.name}
              </CardTitle>
            </div>
          </div>
        </div>
        <div className="mt-2 space-y-2">
          {plan.description && (
            <div className="text-sm text-valasys-gray-600">
              {plan.description}
            </div>
          )}
          {(() => {
            const d = planDisplay(plan, billing);
            return (
              <>
                <div className="text-3xl font-bold">
                  {d.priceLabel}
                  {d.priceSuffix && (
                    <span className="text-sm text-valasys-gray-500">
                      {" "}
                      {d.priceSuffix}
                    </span>
                  )}
                </div>
                <div className="text-valasys-gray-500">{d.billedNote}</div>
              </>
            );
          })()}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col !p-3">
        <div className="border-y border-valasys-gray-200 py-3">
          <div className="text-[17px] font-semibold text-black flex items-center gap-2">
            <Coins className="w-5 h-5 text-black" />
            {(() => {
              const d = planDisplay(plan, billing);
              return (
                <>
                  <span>{d.credits}</span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="pt-3 grid grid-cols-1">
          {plan.id === "enterprise" ? (
            <Button
              asChild
              className="w-full border-2 border-valasys-orange text-valasys-orange bg-white hover:bg-gradient-to-r hover:from-valasys-orange hover:to-valasys-orange-light hover:text-white"
            >
              <a href="mailto:sales@valasys.ai">Contact to our sales</a>
            </Button>
          ) : (
            <Button
              onClick={onSelect}
              disabled={plan.id === "free"}
              className={`w-full ${selected ? "bg-[#424242] text-white" : "bg-gradient-to-r from-valasys-orange to-valasys-orange-light text-white hover:from-valasys-orange/90 hover:to-valasys-orange-light/90"}`}
            >
              {selected && <Check className="w-4 h-4 mr-2 text-white" />}
              {selected
                ? "Selected"
                : plan.id === "free"
                  ? "Current Plan"
                  : "Select Plan"}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-valasys-gray-500">
            Core Platform Modules
          </div>
          <ul className="space-y-2">
            {includedCore.map((item) => (
              <li
                key={item.label}
                className="flex items-start text-sm text-valasys-gray-700"
              >
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                <span>
                  {item.label}
                  {typeof item.v === "string" && (
                    <span className="ml-2 text-xs text-valasys-gray-600">
                      {item.v}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-valasys-gray-500">
            High Value Account Insights
          </div>
          <ul className="space-y-2">
            {includedInsights.map((item) => (
              <li
                key={item.label}
                className="flex items-start text-sm text-valasys-gray-700"
              >
                <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                <span>
                  {item.label}
                  {typeof item.v === "string" && (
                    <span className="ml-2 text-xs text-valasys-gray-600">
                      {item.v}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={onToggleComparison}
          aria-expanded={comparisonOpen}
          className="mt-auto inline-flex items-center text-sm font-semibold text-valasys-gray-700 hover:text-valasys-gray-900"
        >
          {comparisonOpen ? "Hide plan comparison" : "Show plan comparison"}
          {comparisonOpen ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>
      </CardContent>
    </Card>
  );
}

function PlanComparisonTable({
  billing,
  plans,
  selectedPlan,
  onSelect,
}: {
  billing: "monthly" | "annual";
  plans: Plan[];
  selectedPlan: Plan["id"];
  onSelect: (id: Plan["id"]) => void;
}) {
  return (
    <div className="overflow-x-auto border border-valasys-gray-200 rounded-lg">
      <table className="min-w-[720px] w-full text-sm">
        <thead>
          <tr className="bg-valasys-gray-50">
            <th className="text-left p-3 font-semibold text-valasys-gray-700">
              Feature
            </th>
            {plans.map((p) => {
              const d = planDisplay(p, billing);
              const isSelected = p.id === selectedPlan;
              return (
                <th
                  key={p.id}
                  className={`p-3 font-semibold text-valasys-gray-800 text-left align-bottom ${isSelected ? "bg-yellow-50 border-b-2 border-yellow-300" : ""}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {planIcon(p.id)}
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <div className="text-[13px] font-medium">
                      {d.priceLabel}
                      {d.priceSuffix && (
                        <span className="text-valasys-gray-500">
                          {" "}
                          {d.priceSuffix}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-valasys-gray-500">
                      {d.billedNote}
                    </div>
                    <div className="text-[13px] font-semibold text-black flex items-center gap-2">
                      <Coins className="w-4 h-4 text-black" /> {d.credits}
                    </div>
                    <div className="pt-2">
                      {p.id === "enterprise" ? (
                        <Button
                          asChild
                          className="w-full border-2 border-valasys-orange text-valasys-orange bg-white hover:bg-gradient-to-r hover:from-valasys-orange hover:to-valasys-orange-light hover:text-white"
                        >
                          <a href="mailto:sales@valasys.ai">
                            Contact to our sales
                          </a>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => onSelect(p.id)}
                          disabled={p.id === "free"}
                          className={`w-full ${isSelected ? "bg-[#424242] text-white" : "bg-gradient-to-r from-valasys-orange to-valasys-orange-light text-white hover:from-valasys-orange/90 hover:to-valasys-orange-light/90"}`}
                        >
                          {isSelected && <Check className="w-4 h-4 mr-2" />}
                          {isSelected
                            ? "Selected"
                            : p.id === "free"
                              ? "Current Plan"
                              : "Select Plan"}
                        </Button>
                      )}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              colSpan={1 + plans.length}
              className="p-3 text-[12px] font-semibold uppercase tracking-wide text-valasys-gray-500 bg-white"
            >
              Core Platform Modules
            </td>
          </tr>
          {coreRows.map((row, i) => (
            <tr key={`core-${i}`} className="border-t border-valasys-gray-200">
              <td className="p-3 text-valasys-gray-800 font-medium">
                {row.label}
              </td>
              {row.values.map((v, idx) => (
                <td
                  key={idx}
                  className={`p-3 ${plans[idx].id === selectedPlan ? "bg-yellow-50" : "bg-white"}`}
                >
                  {v === "-" || v === "✖" ? (
                    <CircleX className="w-5 h-5 text-red-500" />
                  ) : v === true ? (
                    <CircleCheckBig className="w-5 h-5 text-green-600" />
                  ) : v === false ? (
                    <CircleX className="w-5 h-5 text-red-500" />
                  ) : typeof v === "string" ? (
                    <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-valasys-gray-700">
                      {v}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td
              colSpan={1 + plans.length}
              className="p-3 text-[12px] font-semibold uppercase tracking-wide text-valasys-gray-500 bg-white"
            >
              High Value Account Insights
            </td>
          </tr>
          {insightsRows.map((row, i) => (
            <tr
              key={`insights-${i}`}
              className="border-t border-valasys-gray-200"
            >
              <td className="p-3 text-valasys-gray-800 font-medium">
                {row.label}
              </td>
              {row.values.map((v, idx) => (
                <td
                  key={idx}
                  className={`p-3 ${plans[idx].id === selectedPlan ? "bg-yellow-50" : "bg-white"}`}
                >
                  {v === "-" || v === "✖" ? (
                    <CircleX className="w-5 h-5 text-red-500" />
                  ) : v === true ? (
                    <CircleCheckBig className="w-5 h-5 text-green-600" />
                  ) : v === false ? (
                    <CircleX className="w-5 h-5 text-red-500" />
                  ) : typeof v === "string" ? (
                    <span className="inline-block rounded-full border px-2 py-0.5 text-xs text-valasys-gray-700">
                      {v}
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Subscription() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "growth" | "scale" | "enterprise"
  >("growth");
  const [showComparison, setShowComparison] = useState(false);
  const comparisonHeadingRef = useRef<HTMLDivElement | null>(null);
  const handleToggleComparison = () => {
    setShowComparison((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => {
          const el = comparisonHeadingRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const offset = 120; // account for sticky header
          const top = rect.top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        });
      }
      return next;
    });
  };
  const sortedPlans = useMemo(() => plans, []);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const [summaryBounds, setSummaryBounds] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const recalcBounds = () => {
    const el = pageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSummaryBounds({
      left: Math.round(rect.left),
      width: Math.round(rect.width),
    });
  };
  React.useEffect(() => {
    recalcBounds();
    const el = pageRef.current;
    const ro = new ResizeObserver(() => recalcBounds());
    if (el) ro.observe(el);
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      recalcBounds();
    };
    const onScroll = () => recalcBounds();
    const onTransitionEnd = () => recalcBounds();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    document.addEventListener("transitionend", onTransitionEnd);
    const tid = setTimeout(recalcBounds, 300);
    return () => {
      if (el) ro.unobserve(el);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll as any);
      document.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(tid);
    };
  }, []);

  React.useEffect(() => {
    const el = summaryRef.current;
    const measure = () => setSummaryHeight(el ? el.offsetHeight : 0);
    measure();
    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      if (el) ro.unobserve(el);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selectedPlan, billing, showComparison]);

  const selectPlan = (id: "free" | "growth" | "scale" | "enterprise") => {
    setSelectedPlan(id);
    setTimeout(recalcBounds, 250);
  };
  const selectedPlanObj = useMemo(
    () => sortedPlans.find((p) => p.id === selectedPlan),
    [sortedPlans, selectedPlan],
  );

  return (
    <DashboardLayout>
      <div
        className="space-y-8"
        ref={pageRef}
        style={{ paddingBottom: (summaryHeight || 0) + 24 }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold text-valasys-gray-900">
            Empowering business growth from a single platform
          </h1>
          <p className="text-valasys-gray-600">
            Select from best plans, ensuring a perfect match.
          </p>
          <div className="flex items-center gap-3">
            <Tabs
              value={billing}
              onValueChange={(v: any) => setBilling(v)}
              className="bg-white rounded-lg border border-valasys-gray-200 p-1"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger
                  value="annual"
                  className="data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-valasys-orange data-[state=active]:to-valasys-orange-light"
                >
                  Annual Plans
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-valasys-orange data-[state=active]:to-valasys-orange-light"
                >
                  Monthly Plans
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Plan grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
          {sortedPlans.map((p, idx) => (
            <PlanCard
              key={p.id}
              plan={p}
              billing={billing}
              planIndex={idx as 0 | 1 | 2 | 3}
              selected={p.id === selectedPlan}
              onSelect={() => selectPlan(p.id as any)}
              onToggleComparison={handleToggleComparison}
              comparisonOpen={showComparison}
            />
          ))}
        </div>

        {showComparison && (
          <div className="mt-6" id="plan-comparison">
            <div
              ref={comparisonHeadingRef}
              className="flex items-center gap-2 bg-valasys-gray-50 border rounded-t-lg px-4 py-3 text-valasys-gray-800"
            >
              <div>
                <div className="font-semibold">Plan comparison</div>
                <div className="text-xs text-valasys-gray-600">
                  Find the features available in each plan
                </div>
              </div>
            </div>
            <PlanComparisonTable
              billing={billing}
              plans={sortedPlans}
              selectedPlan={selectedPlan}
              onSelect={(id) => selectPlan(id)}
            />
          </div>
        )}

        {selectedPlanObj && (
          <div
            ref={summaryRef}
            className="fixed bottom-0 z-[80] border-t border-valasys-gray-200 bg-white rounded-t-lg shadow-2xl drop-shadow-2xl shadow-[0_-12px_36px_rgba(0,0,0,0.18)] w-full"
            style={{
              left: `${summaryBounds.left}px`,
              width: `${summaryBounds.width}px`,
            }}
          >
            <div className="px-4 py-3 text-[17px]">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
                <div>
                  <div className="font-medium text-valasys-gray-500">
                    Summary
                  </div>
                  <div className="font-semibold text-valasys-gray-900 flex items-center gap-2">
                    {planIcon(selectedPlanObj.id)}
                    <span>{selectedPlanObj.name}</span>
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 text-[12px]">
                      Selected
                    </span>
                  </div>
                  <button
                    className="underline text-valasys-gray-600 hover:text-valasys-gray-900"
                    onClick={() => {
                      if (!showComparison) handleToggleComparison();
                      else {
                        requestAnimationFrame(() => {
                          const el = document.getElementById("plan-comparison");
                          if (!el) return;
                          const rect = el.getBoundingClientRect();
                          const top = rect.top + window.scrollY - 120;
                          window.scrollTo({ top, behavior: "smooth" });
                        });
                      }
                    }}
                  >
                    See price breakdown
                  </button>
                </div>
                <div className="md:text-right">
                  <div className="flex flex-wrap items-center justify-center md:justify-end">
                    <div className="pr-6">
                      <div className="text-valasys-gray-500">
                        Billed {billing === "annual" ? "Annually" : "Monthly"}
                      </div>
                      <div className="font-semibold text-valasys-gray-900">
                        {(() => {
                          const p = selectedPlanObj;
                          if (!p) return "";
                          if (p.id === "enterprise") return "Custom";
                          const amt =
                            billing === "annual"
                              ? p.priceAnnual * 12
                              : p.priceMonthly;
                          const suffix = billing === "annual" ? "/yr" : "/mo";
                          return `$${amt}${suffix}`;
                        })()}
                      </div>
                    </div>
                    <div className="pl-6 pr-6 border-l border-valasys-gray-200">
                      <div className="text-valasys-gray-500">Due Today</div>
                      <div className="font-semibold text-valasys-gray-900">
                        {(() => {
                          const p = selectedPlanObj;
                          if (!p) return "";
                          if (p.id === "enterprise") return "Custom";
                          const amt =
                            billing === "annual"
                              ? p.priceAnnual * 12
                              : p.priceMonthly;
                          return `$${amt}`;
                        })()}
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 md:pl-6 md:border-l border-valasys-gray-200 w-full md:w-auto flex justify-center">
                      <Button className="bg-gradient-to-r from-valasys-orange to-valasys-orange-light text-white hover:from-valasys-orange/90 hover:to-valasys-orange-light/90 mx-auto">
                        <CreditCard className="w-5 h-5 mr-2" /> Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
