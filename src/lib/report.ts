export type HazardCategory = {
  id: string;
  label: string;
  code: string;
  department: string;
  severity: "Low" | "Moderate" | "High";
  priority: string;
  description: string;
};

const CATEGORIES: HazardCategory[] = [
  {
    id: "pothole",
    label: "Roadway Pothole",
    code: "RW-204",
    department: "Dept. of Streets & Paving",
    severity: "High",
    priority: "P2 — Repair within 5 business days",
    description:
      "Imagery indicates a depression in the asphalt surface with fractured edges and exposed sub-base material. The defect presents a vehicle-damage and cyclist-fall risk, and is likely to expand with further water intrusion and freeze-thaw cycling. Recommended action: cold-patch stabilization followed by scheduled hot-mix resurfacing of the affected lane section.",
  },
  {
    id: "sidewalk",
    label: "Damaged Sidewalk",
    code: "PW-118",
    department: "Dept. of Public Walkways",
    severity: "Moderate",
    priority: "P3 — Inspection within 10 business days",
    description:
      "Imagery indicates displaced or cracked concrete panels producing a vertical trip differential across the pedestrian path of travel. The condition reduces accessible clearance and may not meet ADA surface-continuity guidance. Recommended action: temporary bevel ramp or grinding, with panel replacement scheduled in the next sidewalk maintenance cycle.",
  },
  {
    id: "streetlight",
    label: "Street Light Outage",
    code: "EL-072",
    department: "Dept. of Street Lighting",
    severity: "Moderate",
    priority: "P3 — Service call within 7 business days",
    description:
      "Imagery indicates a non-illuminated or damaged luminaire on a public right-of-way pole. Reduced night-time lighting levels at this location increase pedestrian and intersection conflict risk. Recommended action: field verification of lamp, photocell, and feeder circuit, followed by fixture replacement as required.",
  },
  {
    id: "debris",
    label: "Obstruction / Debris",
    code: "SN-341",
    department: "Dept. of Sanitation & Right-of-Way",
    severity: "Low",
    priority: "P4 — Removal within 14 business days",
    description:
      "Imagery indicates loose material or an unauthorized object encroaching on the public right-of-way. The obstruction narrows the usable travel path and may redirect pedestrians into the roadway. Recommended action: right-of-way clearance crew dispatch and disposal per municipal waste handling procedure.",
  },
  {
    id: "signage",
    label: "Damaged Signage",
    code: "TR-509",
    department: "Dept. of Traffic Operations",
    severity: "High",
    priority: "P2 — Repair within 5 business days",
    description:
      "Imagery indicates a regulatory or warning sign that is bent, obscured, or missing from its standard mounting height. Compromised sign visibility affects driver expectancy at this location. Recommended action: temporary portable signage and permanent post/panel replacement to MUTCD retroreflectivity standards.",
  },
];

const STREETS = [
  "N Almond St",
  "W Harbor Ave",
  "E Chestnut Blvd",
  "S Beacon Rd",
  "Maple Terrace",
  "Old Mill Way",
];

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type GeneratedReport = {
  reference: string;
  category: HazardCategory;
  latitude: string;
  longitude: string;
  address: string;
  accuracy: string;
  capturedAt: string;
};

export function generateReport(seedSource: string): GeneratedReport {
  const name = seedSource.toLowerCase();
  const keyed = CATEGORIES.find((c) =>
    c.id === "pothole"
      ? /pot|hole|road|asphalt/.test(name)
      : c.id === "sidewalk"
        ? /side|walk|curb|concrete/.test(name)
        : c.id === "streetlight"
          ? /light|lamp|pole/.test(name)
          : c.id === "signage"
            ? /sign|stop/.test(name)
            : /trash|debris|garbage|branch/.test(name),
  );

  const seed = hash(seedSource);
  const category = keyed ?? CATEGORIES[seed % CATEGORIES.length]!;

  const lat = 40.71 + ((seed % 1800) / 1000) * 0.05;
  const lng = -74.02 + (((seed >> 5) % 1800) / 1000) * 0.05;
  const now = new Date();

  return {
    reference: `RPT-${now.getFullYear()}-${String((seed % 89999) + 10000)}`,
    category,
    latitude: `${lat.toFixed(6)}° N`,
    longitude: `${Math.abs(lng).toFixed(6)}° W`,
    address: `${(seed % 1800) + 100} ${STREETS[seed % STREETS.length]}`,
    accuracy: `± ${(seed % 7) + 3} m`,
    capturedAt: now.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}
