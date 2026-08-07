export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
      <div className="w-full max-w-4xl p-6 bg-card border border-border rounded-xl shadow-lg space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary font-sans">Personal Finance Manager</h1>
            <p className="text-sm text-muted-foreground font-body">Deep Ledger Design System Baseline</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
            v1.0 MVP
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-background border border-border rounded-lg space-y-1">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Net Balance</span>
            <div className="text-2xl font-bold font-mono text-income tabular-nums">+$4,250.50</div>
          </div>
          <div className="p-4 bg-background border border-border rounded-lg space-y-1">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Monthly Income</span>
            <div className="text-2xl font-bold font-mono text-income tabular-nums">+$5,400.00</div>
          </div>
          <div className="p-4 bg-background border border-border rounded-lg space-y-1">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Monthly Expense</span>
            <div className="text-2xl font-bold font-mono text-expense tabular-nums">-$1,149.50</div>
          </div>
        </div>

        <div className="p-3 bg-warning/10 border border-warning/30 rounded-md text-warning text-xs font-semibold flex items-center justify-between">
          <span>Dining Out: $425.00 / $500.00 (85% Approaching Limit)</span>
          <span className="px-2 py-0.5 rounded bg-warning/20">Amber Warning</span>
        </div>
      </div>
    </main>
  );
}
