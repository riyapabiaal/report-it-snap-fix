import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  RotateCcw,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { generateReport, type GeneratedReport } from "@/lib/report";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Report It — Snap a Photo, Report a Civic Hazard" },
      {
        name: "description",
        content:
          "Report potholes, broken sidewalks and other street hazards in seconds. Snap a photo and Report It writes the official report for you.",
      },
      { property: "og:title", content: "Report It — Snap a Photo, Report a Civic Hazard" },
      {
        property: "og:description",
        content:
          "Report potholes, broken sidewalks and other street hazards in seconds. Snap a photo and Report It writes the official report for you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportItPage,
});

type Stage = "home" | "analyzing" | "result" | "submitted";

const STEPS = [
  "Uploading photo…",
  "Analyzing issue…",
  "Locking GPS coordinates…",
  "Drafting official report…",
];

function ReportItPage() {
  const [stage, setStage] = useState<Stage>("home");
  const [photo, setPhoto] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo);
  }, [photo]);

  function handleFile(file: File) {
    setPhoto(URL.createObjectURL(file));
    setReport(generateReport(`${file.name}-${file.size}`));
    setStage("analyzing");
  }

  function reset() {
    setPhoto(null);
    setReport(null);
    setStage("home");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <main className="min-h-screen bg-hero">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-action text-primary-foreground shadow-lift">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="truncate text-lg font-extrabold tracking-tight">Report It</span>
          </div>
          <span className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-semibold text-muted-foreground shadow-soft">
            City of Northbay
          </span>
        </header>

        {stage === "home" && <HomeStage onPick={() => fileRef.current?.click()} />}
        {stage === "analyzing" && photo && (
          <AnalyzingStage photo={photo} onDone={() => setStage("result")} />
        )}
        {(stage === "result" || stage === "submitted") && photo && report && (
          <ResultStage
            photo={photo}
            report={report}
            submitted={stage === "submitted"}
            onSubmit={() => setStage("submitted")}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}

function HomeStage({ onPick }: { onPick: () => void }) {
  return (
    <div className="flex flex-1 flex-col animate-rise">
      <div className="mt-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-primary shadow-soft">
          <Sparkles className="h-3.5 w-3.5" /> Reports written for you
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
          See something broken?
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-base text-muted-foreground">
          Snap a photo of a pothole, cracked sidewalk or dead streetlight. We'll handle the
          paperwork.
        </p>
      </div>

      <div className="relative my-12 grid place-items-center">
        <span className="absolute h-56 w-56 rounded-full bg-primary/15 animate-pulse-ring" />
        <span className="absolute h-56 w-56 rounded-full bg-primary/10" />
        <button
          type="button"
          onClick={onPick}
          className="relative grid h-52 w-52 place-items-center rounded-full bg-action text-primary-foreground shadow-lift transition-transform duration-200 active:scale-95"
        >
          <span className="flex flex-col items-center gap-3">
            <Camera className="h-14 w-14" />
            <span className="text-xl font-extrabold tracking-tight">Snap a Photo</span>
          </span>
        </button>
      </div>

      <ul className="mt-auto space-y-2.5">
        {[
          "Takes under 30 seconds",
          "Location captured automatically",
          "Routed to the right department",
        ].map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm font-medium shadow-soft"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalyzingStage({ photo, onDone }: { photo: string; onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i), i * 850),
    );
    const finish = setTimeout(onDone, STEPS.length * 850 + 700);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center animate-rise">
      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-3xl shadow-lift">
        <img src={photo} alt="Uploaded hazard" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-primary/15" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/60 to-transparent animate-scan" />
        <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-primary-foreground/60" />
      </div>

      <div className="mt-8 flex items-center gap-2 text-lg font-bold">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        {STEPS[step]}
      </div>

      <div className="mt-5 flex gap-1.5">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 w-10 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">Hang tight — this only takes a moment.</p>
    </div>
  );
}

function ResultStage({
  photo,
  report,
  submitted,
  onSubmit,
  onReset,
}: {
  photo: string;
  report: GeneratedReport;
  submitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const { category } = report;

  return (
    <div className="flex flex-1 flex-col gap-4 pt-6 animate-rise">
      <div className="overflow-hidden rounded-3xl bg-card shadow-lift">
        <div className="relative">
          <img src={photo} alt="Reported hazard" className="h-52 w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-signal px-3 py-1 text-xs font-bold text-signal-foreground">
            {category.severity} severity
          </span>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border pb-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Issue category
              </p>
              <h2 className="truncate text-xl font-extrabold tracking-tight">{category.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{category.department}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 font-mono text-xs font-bold text-secondary-foreground">
              {category.code}
            </span>
          </div>

          <div className="rounded-2xl bg-muted p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Location (GPS)
            </p>
            <p className="mt-2 font-mono text-sm font-bold">
              {report.latitude}, {report.longitude}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {report.address} · accuracy {report.accuracy}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <ScanLine className="h-3.5 w-3.5" /> Auto-generated description
            </p>
            <p className="mt-2 text-sm leading-relaxed">{category.description}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Reference</dt>
              <dd className="truncate font-mono font-bold">{report.reference}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Captured</dt>
              <dd className="truncate font-semibold">{report.capturedAt}</dd>
            </div>
            <div className="col-span-2 min-w-0">
              <dt className="text-xs text-muted-foreground">Priority</dt>
              <dd className="font-semibold">{category.priority}</dd>
            </div>
          </dl>
        </div>
      </div>

      {submitted ? (
        <div className="rounded-3xl bg-card p-5 text-center shadow-lift animate-rise">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <p className="mt-3 text-lg font-extrabold">Sent to the city</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.reference} is queued with {category.department}. You'll get an update when a
            crew is assigned.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-3.5 text-base font-bold text-secondary-foreground transition-transform active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" /> Report another issue
          </button>
        </div>
      ) : (
        <div className="mt-auto space-y-3 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-5 py-4 text-lg font-extrabold text-primary-foreground shadow-lift transition-transform active:scale-[0.98]"
          >
            <Send className="h-5 w-5" /> Submit to City
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full rounded-2xl px-5 py-3 text-sm font-semibold text-muted-foreground"
          >
            Retake photo
          </button>
        </div>
      )}
    </div>
  );
}
