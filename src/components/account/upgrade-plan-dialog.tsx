import * as React from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleCheck,
  Minus,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AccountSurfaceStyle, WorkspacePlan } from "./types";

type UpgradePlanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  style: AccountSurfaceStyle;
  currentPlan: WorkspacePlan;
  onPlanChange: (plan: WorkspacePlan) => void;
};

type BillingCycle = "monthly" | "yearly";
type DialogStep = "plans" | "confirm" | "success";

type PlanDetails = {
  name: WorkspacePlan;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
};

const PLANS: PlanDetails[] = [
  {
    name: "Free",
    description: "A focused workspace for everyday conversations.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    accent: "Essential",
    icon: Sparkles,
    highlights: ["Core chat", "5 file uploads", "1 active project"],
  },
  {
    name: "Plus",
    description: "More room for files, projects, and connected work.",
    monthlyPrice: 20,
    yearlyPrice: 192,
    accent: "Expanded",
    icon: Zap,
    highlights: ["Expanded usage", "50 file uploads", "10 active projects"],
  },
  {
    name: "Pro",
    description: "Maximum capacity for demanding creative workflows.",
    monthlyPrice: 40,
    yearlyPrice: 384,
    accent: "Maximum",
    icon: BadgeCheck,
    highlights: ["Highest usage", "250 file uploads", "Unlimited projects"],
  },
];

const COMPARISON: Array<{
  label: string;
  values: Record<WorkspacePlan, string | boolean>;
}> = [
  { label: "Chat access", values: { Free: "Core", Plus: "Expanded", Pro: "Maximum" } },
  { label: "File uploads", values: { Free: "5", Plus: "50", Pro: "250" } },
  { label: "Active projects", values: { Free: "1", Plus: "10", Pro: "Unlimited" } },
  { label: "Connectors", values: { Free: "2", Plus: "10", Pro: "All" } },
  {
    label: "Extended context",
    values: { Free: false, Plus: true, Pro: true },
  },
  {
    label: "Priority responses",
    values: { Free: false, Plus: false, Pro: true },
  },
];

const PLAN_ORDER: Record<WorkspacePlan, number> = {
  Free: 0,
  Plus: 1,
  Pro: 2,
};

function planPrice(plan: PlanDetails, cycle: BillingCycle) {
  if (plan.monthlyPrice === 0) return { amount: 0, detail: "No billing" };
  if (cycle === "monthly") {
    return { amount: plan.monthlyPrice, detail: "Illustrative monthly price" };
  }

  return {
    amount: Math.round(plan.yearlyPrice / 12),
    detail: `$${plan.yearlyPrice} illustrative yearly total`,
  };
}

function ComparisonValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") return <span>{value}</span>;

  return value ? (
    <>
      <Check className="mx-auto h-3.5 w-3.5 text-(--lumen-accent)" aria-hidden />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus className="mx-auto h-3.5 w-3.5 opacity-25" aria-hidden />
      <span className="sr-only">Not included</span>
    </>
  );
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  style,
  currentPlan,
  onPlanChange,
}: UpgradePlanDialogProps) {
  const reduceMotion = useReducedMotion();
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly");
  const [step, setStep] = React.useState<DialogStep>("plans");
  const [pendingPlan, setPendingPlan] = React.useState<WorkspacePlan | null>(null);
  const confirmButtonRef = React.useRef<HTMLButtonElement>(null);
  const doneButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) {
      setStep("plans");
      setPendingPlan(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const button = step === "confirm" ? confirmButtonRef.current : doneButtonRef.current;
    if (!button) return;

    const frame = window.requestAnimationFrame(() => button.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open, step]);

  const selectPlan = (plan: WorkspacePlan) => {
    if (plan === currentPlan) return;
    setPendingPlan(plan);
    setStep("confirm");
  };

  const confirmChange = () => {
    if (!pendingPlan) return;
    onPlanChange(pendingPlan);
    setStep("success");
  };

  const selectedPlan = PLANS.find((plan) => plan.name === pendingPlan) ?? null;
  const direction =
    pendingPlan && PLAN_ORDER[pendingPlan] < PLAN_ORDER[currentPlan] ? "downgrade" : "change";
  const motionProps = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${style.panelClass} h-[min(820px,calc(100dvh-24px))] w-[calc(100vw-24px)] max-w-[940px] gap-0 overflow-hidden border-0 p-1 text-foreground shadow-2xl sm:max-w-[940px]`}
      >
        <div className={`${style.panelInnerClass} flex min-h-0 flex-1 flex-col overflow-hidden`}>
          <header className="shrink-0 border-b border-foreground/10 px-5 py-4 pr-12 sm:px-6">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] opacity-50">
              <Sparkles className="h-3.5 w-3.5" />
              Workspace plan
            </div>
            <DialogTitle className="mt-2 text-[24px] font-normal tracking-[-0.025em]">
              {step === "plans"
                ? "Choose your workspace capacity"
                : step === "confirm"
                  ? `Confirm ${direction}`
                  : "Plan updated"}
            </DialogTitle>
            <DialogDescription className="mt-1 max-w-2xl text-[11px] leading-relaxed opacity-65">
              {step === "plans"
                ? "Compare available workspace plans and choose the capacity that fits your work."
                : step === "confirm"
                  ? "Review the change before applying it to this local prototype."
                  : "Your workspace plan has been changed locally."}
            </DialogDescription>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence initial={false} mode="wait">
              {step === "plans" ? (
                <motion.div key="plans" {...motionProps} className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div
                      role="radiogroup"
                      aria-label="Illustrative billing cycle"
                      className={`${style.panelClass} inline-flex w-fit gap-1 p-1`}
                    >
                      {(["monthly", "yearly"] as const).map((cycle) => {
                        const active = billingCycle === cycle;
                        return (
                          <button
                            key={cycle}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setBillingCycle(cycle)}
                            className={`relative min-w-24 rounded-md px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--lumen-accent) ${
                              active ? "text-foreground" : "opacity-45 hover:opacity-75"
                            }`}
                          >
                            {active ? (
                              <motion.span
                                layoutId="plan-billing-cycle"
                                className="accent-soft absolute inset-0 rounded-md"
                                transition={
                                  reduceMotion
                                    ? { duration: 0 }
                                    : { type: "spring", stiffness: 420, damping: 34 }
                                }
                              />
                            ) : null}
                            <span className="relative">{cycle}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="inline-flex items-center gap-2 font-mono text-[8.5px] uppercase tracking-[0.15em] opacity-45">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      UI preview · no payment is collected
                    </p>
                  </div>

                  <section aria-label="Available plans" className="grid gap-3 md:grid-cols-3">
                    {PLANS.map((plan) => {
                      const current = plan.name === currentPlan;
                      const price = planPrice(plan, billingCycle);
                      const Icon = plan.icon;
                      return (
                        <article
                          key={plan.name}
                          className={`${style.panelClass} relative flex min-h-[280px] flex-col overflow-hidden p-1 ${
                            current
                              ? "ring-1 ring-[color:var(--lumen-accent)] ring-offset-1 ring-offset-background"
                              : ""
                          }`}
                        >
                          <div
                            className={`${style.panelInnerClass} flex min-h-0 flex-1 flex-col px-4 py-4`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-foreground/10 bg-background/40">
                                <Icon className="h-4 w-4 text-(--lumen-accent)" />
                              </span>
                              <span className="font-mono text-[8px] uppercase tracking-[0.17em] opacity-45">
                                {current ? "Current plan" : plan.accent}
                              </span>
                            </div>
                            <h3 className="mt-4 text-[17px] font-medium">{plan.name}</h3>
                            <div className="mt-1 flex items-end gap-1.5">
                              <NumberFlow
                                value={price.amount}
                                format={{
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                }}
                                className="text-[26px] font-normal leading-none tabular-nums"
                              />
                              {plan.monthlyPrice > 0 ? (
                                <span className="pb-0.5 text-[9px] opacity-45">/ month</span>
                              ) : null}
                            </div>
                            <p className="mt-1 min-h-7 font-mono text-[7.5px] uppercase tracking-[0.1em] opacity-40">
                              {price.detail}
                            </p>
                            <p className="mt-3 text-[10px] leading-relaxed opacity-55">
                              {plan.description}
                            </p>
                            <ul className="mt-4 space-y-2">
                              {plan.highlights.map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-[10px]">
                                  <Check
                                    className="h-3 w-3 shrink-0 text-(--lumen-accent)"
                                    aria-hidden
                                  />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <div className="mt-auto pt-6">
                              <button
                                type="button"
                                disabled={current}
                                onClick={() => selectPlan(plan.name)}
                                className={`${style.buttonClass} h-9 w-full px-3 text-[10px] disabled:cursor-default disabled:opacity-50`}
                              >
                                {current ? "Current plan" : `Choose ${plan.name}`}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>

                  <section aria-labelledby="plan-comparison-title" className="mt-5">
                    <div className="mb-2 px-1">
                      <h3
                        id="plan-comparison-title"
                        className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-60"
                      >
                        Feature details
                      </h3>
                      <p className="mt-1 text-[10px] opacity-45">
                        Illustrative limits for this local interface prototype.
                      </p>
                    </div>
                    <div className={`${style.panelClass} overflow-x-auto p-1`}>
                      <table className={`${style.panelInnerClass} w-full min-w-[560px] text-left`}>
                        <thead>
                          <tr className="border-b border-foreground/10">
                            <th
                              scope="col"
                              className="w-[40%] px-4 py-3 font-mono text-[8px] font-normal uppercase tracking-[0.16em] opacity-45"
                            >
                              Capability
                            </th>
                            {PLANS.map((plan) => (
                              <th
                                key={plan.name}
                                scope="col"
                                className="px-3 py-3 text-center font-mono text-[8px] font-normal uppercase tracking-[0.16em]"
                              >
                                {plan.name}
                                {plan.name === currentPlan ? (
                                  <span className="ml-1 text-(--lumen-accent)">· current</span>
                                ) : null}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {COMPARISON.map((feature) => (
                            <tr
                              key={feature.label}
                              className="border-b border-foreground/8 last:border-b-0"
                            >
                              <th
                                scope="row"
                                className="px-4 py-3 text-[10px] font-medium opacity-65"
                              >
                                {feature.label}
                              </th>
                              {PLANS.map((plan) => (
                                <td
                                  key={plan.name}
                                  className="px-3 py-3 text-center text-[9.5px] opacity-65"
                                >
                                  <ComparisonValue value={feature.values[plan.name]} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </motion.div>
              ) : step === "confirm" && selectedPlan ? (
                <motion.div
                  key="confirm"
                  {...motionProps}
                  className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-6 sm:px-6"
                >
                  <button
                    type="button"
                    onClick={() => setStep("plans")}
                    className="mb-5 inline-flex w-fit items-center gap-2 rounded-md px-1 py-1 text-[10px] opacity-55 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--lumen-accent)"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to comparison
                  </button>

                  <section
                    aria-labelledby="confirm-plan-heading"
                    className={`${style.panelClass} overflow-hidden p-1`}
                  >
                    <div className={`${style.panelInnerClass} px-5 py-5 sm:px-6`}>
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-mono text-[8px] uppercase tracking-[0.18em] opacity-45">
                            Plan change
                          </p>
                          <h3 id="confirm-plan-heading" className="mt-2 text-[20px] font-medium">
                            {currentPlan} <span className="mx-1 opacity-25">→</span>{" "}
                            {selectedPlan.name}
                          </h3>
                          <p className="mt-2 max-w-md text-[10.5px] leading-relaxed opacity-55">
                            This updates only the plan label and prototype limits stored by Lumen.
                            It does not create a subscription or contact a payment provider.
                          </p>
                        </div>
                        <div className="shrink-0 sm:text-right">
                          <div className="text-[24px] font-normal leading-none">
                            <NumberFlow
                              value={planPrice(selectedPlan, billingCycle).amount}
                              format={{
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }}
                              className="tabular-nums"
                            />
                            {selectedPlan.monthlyPrice > 0 ? (
                              <span className="text-[9px] opacity-40"> / month</span>
                            ) : null}
                          </div>
                          <div className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.12em] opacity-40">
                            Illustrative only
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-y border-foreground/10 py-4">
                        <ul className="grid gap-2 sm:grid-cols-2">
                          {selectedPlan.highlights.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-[10px]">
                              <Check
                                className="h-3.5 w-3.5 shrink-0 text-(--lumen-accent)"
                                aria-hidden
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 rounded-md border border-(--lumen-accent)/25 bg-(--lumen-accent)/6 px-4 py-3">
                        <div className="flex gap-3">
                          <ShieldCheck
                            className="mt-0.5 h-4 w-4 shrink-0 text-(--lumen-accent)"
                            aria-hidden
                          />
                          <div>
                            <p className="text-[10px] font-medium">No payment action</p>
                            <p className="mt-0.5 text-[9.5px] leading-relaxed opacity-55">
                              Confirming updates the plan locally. No charge, invoice, renewal,
                              or payment information is involved.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setStep("plans")}
                          className={`${style.buttonClass} h-10 px-4 text-[10px]`}
                        >
                          Cancel
                        </button>
                        <button
                          ref={confirmButtonRef}
                          type="button"
                          onClick={confirmChange}
                          className={`${style.buttonClass} accent-soft h-10 px-4 text-[10px]`}
                        >
                          Confirm {direction}
                        </button>
                      </div>
                    </div>
                  </section>
                </motion.div>
              ) : step === "success" && pendingPlan ? (
                <motion.div
                  key="success"
                  {...motionProps}
                  role="status"
                  aria-live="polite"
                  className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center px-5 py-10 text-center"
                >
                  <motion.div
                    initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 360, damping: 24 }}
                    className="accent-soft flex h-14 w-14 items-center justify-center rounded-full text-(--lumen-accent)"
                  >
                    <CircleCheck className="h-6 w-6" aria-hidden />
                  </motion.div>
                  <h3 className="mt-5 text-[21px] font-medium">Prototype plan changed</h3>
                  <p className="mt-2 max-w-sm text-[10.5px] leading-relaxed opacity-55">
                    This workspace now displays the {pendingPlan} plan. The change was saved locally;
                    no subscription or payment was created.
                  </p>
                  <div className={`${style.panelClass} mt-6 w-full p-1`}>
                    <div
                      className={`${style.panelInnerClass} flex items-center justify-between gap-4 px-4 py-3`}
                    >
                      <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] opacity-45">
                        Active plan
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                        <CircleCheck className="h-3.5 w-3.5 text-(--lumen-accent)" />
                        {pendingPlan}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={() => setStep("plans")}
                      className={`${style.buttonClass} h-10 px-4 text-[10px]`}
                    >
                      Compare plans
                    </button>
                    <button
                      ref={doneButtonRef}
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className={`${style.buttonClass} accent-soft h-10 px-6 text-[10px]`}
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
