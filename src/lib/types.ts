export type Verdict = "fits" | "partial" | "doesnt_fit" | "unknown";

export type Source = {
  id: string;
  kind: "listing" | "rules" | "location" | "review" | "host_answer";
  label: string;
  text: string;
};

export type Evidence = {
  sourceId: string;
  quote: string;
  verified: boolean;
  sourceLabel?: string;
};

export type Assessment = {
  need: string;
  verdict: Verdict;
  summary: string;
  evidence: Evidence[];
  hostQuestion?: string;
  downgraded?: boolean;
};

export type TripContext = {
  who?: string;
  purpose?: string;
  needs: string[];
  notes?: string;
};

export type HostAnswer = {
  id: string;
  question: string;
  answer: string;
  answeredAt: string;
};

export type FitResult = {
  overall: string;
  assessments: Assessment[];
  followUp?: string;
  meta: {
    model: string;
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    evidenceTotal: number;
    evidenceVerified: number;
    downgrades: number;
    mock?: boolean;
  };
};
