import { Button } from "@/components/ui/button";

const features = [
  "Unlimited leads at every trade show—no per-scan fees",
  "QR code scanning with instant contact capture",
  "Export to CRM or spreadsheet—no vendor lock-in",
  "Works offline at exhibition halls with spotty wifi",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">
          <div className="space-y-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Stop Paying $1,500 Per Show For Lead Capture
            </h1>
            <p className="text-xl text-muted-foreground">
              Built for results. $599/year unlimited.
            </p>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              Buy Now
            </Button>
          </div>

          {/* App screenshot placeholder */}
          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
              <div className="aspect-[4/3] bg-muted/50 p-6">
                <div className="flex h-full flex-col gap-4 rounded-lg border border-dashed border-muted-foreground/30 bg-background/80 p-6">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="flex-1 space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-4 rounded bg-muted/70"
                        style={{ width: `${80 - i * 10}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-20 rounded bg-primary/20" />
                    <div className="h-8 w-20 rounded bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
