import { deriveBindingToken, sha256 } from "./crypto";

export interface GateResult {
  gateId: "g1" | "g2" | "g3" | "g4" | "g5" | "g6";
  name: string;
  passed: boolean;
  statusText: string;
  latencyMs: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface GateSuiteResult {
  gates: GateResult[];
  allPassed: boolean;
  warnings: string[];
}

export interface SimulationManifest {
  name: string;
  version: string;
  description: string;
  token: string;
  license: string;
  author: string;
  githubUserId: number;
  repoId: number;
  entryPoint: string;
  observationPrompt: string;
  topic: string;
  gradeLevel: string;
}

export interface PoeQuestion {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionLabel?: string;
  }[];
  explanation: string;
}

export interface SimulationEntry {
  id: string;
  title: string;
  description: string;
  topic: string;
  gradeLevel: string;
  repoUrl: string;
  liveUrl: string;
  authorLogin: string;
  authorNumericId: number;
  repoNumericId: number;
  license: string;
  status: "draft" | "pending" | "approved" | "restricted" | "drift_flagged";
  statusReason?: string;
  gates?: GateResult[];
  warnings: string[];
  observationPrompt: string;
  fingerprint?: {
    htmlSha: string;
    scriptsSha: Record<string, string>;
    scannedScripts: number;
    unscannedSummary: string;
    token: string;
    approvedAt: string;
  };
  reportsCount: number;
  questions: PoeQuestion[];
  isDemoRepoB?: boolean;
  isDemoRepoA?: boolean;
}

// Global in-memory singleton state
class EcoVerseStore {
  public simulations: SimulationEntry[] = [];
  public repoBDriftActive: boolean = false;

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.repoBDriftActive = false;

    // Derived tokens for demo repos
    const repoBToken = deriveBindingToken(9841234, 74512091, "http://localhost:3000/api/mock-sim/repo-b/");

    this.simulations = [
      // REPO B - Carbon Bathtub Stand-in (Primary Demo Actor)
      {
        id: "sim-repo-b",
        title: "Carbon Bathtub: CO₂ Stock & Flow Model",
        description:
          "An interactive stock-and-flow atmospheric CO₂ model confronting the common misconception that stabilizing emissions stabilizes atmospheric carbon concentrations.",
        topic: "Carbon Cycle",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/ecoteacher/carbon-bathtub",
        liveUrl: "http://localhost:3000/api/mock-sim/repo-b/",
        authorLogin: "ecoteacher",
        authorNumericId: 9841234,
        repoNumericId: 74512091,
        license: "MIT",
        status: "pending",
        warnings: [],
        observationPrompt:
          "Adjust emissions and absorption rates. Notice what happens to the atmospheric CO₂ water level when emissions match net uptake vs when emissions stay flat.",
        reportsCount: 0,
        isDemoRepoB: true,
        questions: [
          {
            id: "q1",
            question:
              "If worldwide carbon emissions stop increasing and flatline at current rates (~40 Gt/yr), what will happen to the CO₂ concentration in the atmosphere?",
            options: [
              {
                id: "q1-a",
                text: "It will immediately stabilize at current levels.",
                isCorrect: false,
                misconceptionLabel:
                  "Stock-Flow Fallacy: Confusing rate of inflow with total accumulated stock (Sterman & Sweeney, 2007)",
              },
              {
                id: "q1-b",
                text: "It will begin to decrease as natural ocean and terrestrial sinks absorb it.",
                isCorrect: false,
                misconceptionLabel:
                  "Sink Overestimation: Assuming natural sinks can absorb current gross emissions without saturation",
              },
              {
                id: "q1-c",
                text: "It will continue to rise rapidly because current emissions are roughly double natural absorption capacity.",
                isCorrect: true,
              },
            ],
            explanation:
              "Like a bathtub with the faucet pouring twice as fast as the drain, holding the faucet steady keeps water pouring in faster than it drains, so the water level (CO₂ stock) continues to rise.",
          },
          {
            id: "q2",
            question: "To bring atmospheric CO₂ concentration back to a stable, flat line, global emissions must:",
            options: [
              {
                id: "q2-a",
                text: "Match the natural uptake rate of land and ocean carbon sinks (~50% reduction required).",
                isCorrect: true,
              },
              {
                id: "q2-b",
                text: "Be reduced by 5% to 10% each decade.",
                isCorrect: false,
                misconceptionLabel:
                  "Gradualism Fallacy: Small reductions still leave inflows far larger than natural drainage",
              },
              {
                id: "q2-c",
                text: "Hold constant at 2020 levels.",
                isCorrect: false,
                misconceptionLabel:
                  "Rate-Level Confusion: Believing stabilization of the rate stabilizes the reservoir level",
              },
            ],
            explanation:
              "Equilibrium in a reservoir requires Inflow = Outflow. Since natural sinks absorb ~20 Gt/yr while emissions are ~40 Gt/yr, emissions must drop by ~50% simply to halt further rise.",
          },
          {
            id: "q3",
            question: "In the bathtub analogy, what does the water level represent?",
            options: [
              {
                id: "q3-a",
                text: "The flow rate of greenhouse gas emissions coming from industrial sources.",
                isCorrect: false,
                misconceptionLabel:
                  "Flux Confusion: Conflating instantaneous emissions flux with reservoir stock",
              },
              {
                id: "q3-b",
                text: "The total accumulated stock of CO₂ in the atmosphere (ppm).",
                isCorrect: true,
              },
              {
                id: "q3-c",
                text: "The maximum capacity of the planet before runaway tipping points.",
                isCorrect: false,
                misconceptionLabel:
                  "Threshold Misinterpretation: Conflating system state variable with boundary limit",
              },
            ],
            explanation:
              "The water level represents the state variable (stock) — the accumulated ppm of CO₂ in the atmosphere that drives global temperature rise.",
          },
        ],
      },

      // REPO A - Glacier Melt (Missing Manifest / Rejection Demo)
      {
        id: "sim-repo-a",
        title: "Glacier Retreat & Ice Albedo Feedback",
        description:
          "Simulation illustrating the feedback loop between retreating ice surface area and reduced solar albedo reflectivity.",
        topic: "Cryosphere & Climate Feedbacks",
        gradeLevel: "Middle / High School",
        repoUrl: "https://github.com/ecoteacher/glacier-melt-sim",
        liveUrl: "https://ecoteacher.github.io/glacier-melt-sim/",
        authorLogin: "ecoteacher",
        authorNumericId: 9841234,
        repoNumericId: 81290314,
        license: "MIT",
        status: "draft",
        warnings: [],
        observationPrompt: "Observe temperature acceleration as reflective white ice is replaced by dark meltwater.",
        reportsCount: 0,
        isDemoRepoA: true,
        questions: [],
      },

      // SEEDED CURATED SIMULATIONS (Approved and Verified)
      {
        id: "sim-greenhouse",
        title: "Greenhouse Gas Infrared Absorption Spectrogram",
        description:
          "Examines why triatomic molecules (CO₂, H₂O, CH₄) absorb infrared wavelengths while diatomic nitrogen and oxygen do not.",
        topic: "Atmospheric Physics",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/phet-interactive/greenhouse-effect",
        liveUrl: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html",
        authorLogin: "phet-educators",
        authorNumericId: 104523,
        repoNumericId: 309812,
        license: "GPL-3.0",
        status: "approved",
        warnings: ["Framing disallowed by origin (launches in hardened sandboxed new tab)"],
        observationPrompt: "Compare vibrational resonance modes of N₂ vs CO₂ under infrared photon bombardment.",
        reportsCount: 0,
        questions: [],
      },
      {
        id: "sim-ocean-acid",
        title: "Ocean Acidification & Aragonite Saturation State",
        description:
          "Simulates dissolved CO₂ forming carbonic acid, lowering ocean pH and reducing carbonate ion availability for pteropod shell formation.",
        topic: "Marine Chemistry",
        gradeLevel: "College",
        repoUrl: "https://github.com/noaa-education/ocean-acidification-lab",
        liveUrl: "https://oceanacidification.noaa.gov/interactive-calc/",
        authorLogin: "noaa-science",
        authorNumericId: 441029,
        repoNumericId: 918231,
        license: "Apache-2.0",
        status: "approved",
        warnings: [],
        observationPrompt: "Track shell dissolution rates as water saturation state (Ω) drops below 1.0.",
        reportsCount: 0,
        questions: [],
      },
      {
        id: "sim-solar-angle",
        title: "Photovoltaic Array Tilt & Seasonal Solar Irradiance",
        description:
          "Calculates optimal solar panel tilt angles based on latitude and seasonal zenith changes to maximize annual megawatt-hour generation.",
        topic: "Renewable Energy",
        gradeLevel: "Vocational / College",
        repoUrl: "https://github.com/solarenergy-lab/pv-tilt-calculator",
        liveUrl: "https://pv-tilt-sim.energy.gov/",
        authorLogin: "pv-researcher",
        authorNumericId: 887201,
        repoNumericId: 554192,
        license: "MIT",
        status: "approved",
        warnings: ["Optional manifest field 'gradeLevel' was unpopulated"],
        observationPrompt: "Adjust winter and summer tilt angles to compare peak generation curves.",
        reportsCount: 0,
        questions: [],
      },
      {
        id: "sim-urban-heat",
        title: "Urban Heat Island & Urban Canopy Transpiration",
        description:
          "Compares asphalt albedo and convective cooling against urban tree canopy transpiration rates in high-density city microclimates.",
        topic: "Urban Ecology",
        gradeLevel: "Middle / High School",
        repoUrl: "https://github.com/urbancool/city-canopy-sim",
        liveUrl: "https://citycanopy.netlify.app/",
        authorLogin: "ecocities",
        authorNumericId: 651209,
        repoNumericId: 881234,
        license: "BSD-3-Clause",
        status: "approved",
        warnings: [],
        observationPrompt: "Observe neighborhood surface temperatures at 3 PM when vegetative cover is increased from 10% to 40%.",
        reportsCount: 0,
        questions: [],
      },
      {
        id: "sim-aquifer",
        title: "Groundwater Recharge vs Center-Pivot Aquifer Depletion",
        description:
          "Interactive hydrogeology cross-section modeling deep unconfined aquifers, cone of depression radius, and decade-scale recharge lag.",
        topic: "Water Resources",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/hydrogeo/aquifer-balance",
        liveUrl: "https://hydrogeo.org/aquifer-balance/",
        authorLogin: "hydro-prof",
        authorNumericId: 334910,
        repoNumericId: 449012,
        license: "MIT",
        status: "approved",
        warnings: ["Repository inactive for >12 months (verified static baseline)"],
        observationPrompt: "Note the delay between rainfall events at the recharge zone and water table recovery at the wellhead.",
        reportsCount: 0,
        questions: [],
      },
    ];
  }

  public getSimulation(id: string): SimulationEntry | undefined {
    return this.simulations.find((s) => s.id === id);
  }

  public toggleRepoBDrift(): boolean {
    this.repoBDriftActive = !this.repoBDriftActive;
    return this.repoBDriftActive;
  }
}

// Global variable across hot-reloads in Next.js development
const globalForStore = globalThis as unknown as { ecoVerseStore?: EcoVerseStore };

export const store = globalForStore.ecoVerseStore ?? new EcoVerseStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.ecoVerseStore = store;
}
