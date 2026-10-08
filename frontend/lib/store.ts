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

export interface SimulationComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  hasMindChangedBadge?: boolean;
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
  authorName: string;
  authorAvatar: string;
  authorNumericId: number;
  repoNumericId: number;
  license: string;
  status: "draft" | "pending" | "approved" | "restricted" | "drift_flagged";
  statusReason?: string;
  gates?: GateResult[];
  warnings: string[];
  observationPrompt: string;
  thumbnailUrl: string;
  screenshots: string[];
  views: string;
  viewsCount: number;
  uploadedAt: string;
  likes: number;
  subscribers: string;
  isSubscribed?: boolean;
  durationLabel: string;
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
  comments: SimulationComment[];
  isDemoRepoB?: boolean;
  isDemoRepoA?: boolean;
  isUserUploaded?: boolean;
}

class EcoVerseStore {
  public simulations: SimulationEntry[] = [];
  public repoBDriftActive: boolean = false;

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.repoBDriftActive = false;

    this.simulations = [
      // 1. REPO B - Carbon Bathtub Stand-in (Primary Demo Simulator)
      {
        id: "sim-repo-b",
        title: "The Carbon Bathtub: Atmospheric CO₂ Stock & Flow Simulation",
        description:
          "An interactive stock-and-flow dynamic model illustrating why stabilizing carbon emissions will NOT stabilize atmospheric carbon dioxide concentrations. Features controllable faucet emissions, natural ocean/land sink absorption drains, and real-time parts-per-million (ppm) tracking.",
        topic: "Carbon Cycle",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/ecoteacher/carbon-bathtub",
        liveUrl: "http://localhost:3000/api/mock-sim/repo-b/",
        authorLogin: "ecoteacher",
        authorName: "Dr. Aris Thorne",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 9841234,
        repoNumericId: 74512091,
        license: "MIT",
        status: "approved",
        warnings: [],
        observationPrompt:
          "Adjust emissions and absorption rates. Notice what happens to the atmospheric CO₂ water level when emissions match net uptake vs when emissions stay flat.",
        thumbnailUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=640&auto=format&fit=crop&q=80",
        screenshots: [
          "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=640&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1584277261846-c6a1672dd979?w=640&auto=format&fit=crop&q=80",
        ],
        views: "18.4K learners",
        viewsCount: 18420,
        uploadedAt: "3 days ago",
        likes: 1420,
        subscribers: "12.8K educators",
        durationLabel: "Interactive Sim",
        reportsCount: 0,
        isDemoRepoB: true,
        comments: [
          {
            id: "c1",
            authorName: "Ananya Iyer",
            authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            text: "This completely cured my misconception! I always assumed holding emissions flat would keep CO2 constant. Inflow vs stock blew my mind.",
            timestamp: "1 day ago",
            likes: 64,
            hasMindChangedBadge: true,
          },
          {
            id: "c2",
            authorName: "Prof. K. Raman",
            authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            text: "Assigned this to my 11th grade environmental science batch today. The POE loop gives instant conceptual feedback without teacher grading burden.",
            timestamp: "2 days ago",
            likes: 42,
          },
        ],
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

      // 2. Greenhouse Gas Spectrogram (PhET Interactive)
      {
        id: "sim-greenhouse",
        title: "Greenhouse Gas Infrared Absorption Spectrogram & Molecular Dipoles",
        description:
          "Investigates why triatomic greenhouse gas molecules (CO₂, H₂O, CH₄) absorb infrared wavelengths while homonuclear diatomic nitrogen (N₂) and oxygen (O₂) allow thermal radiation to escape uninhibited.",
        topic: "Atmospheric Physics",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/phet-interactive/greenhouse-effect",
        liveUrl: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_all.html",
        authorLogin: "phet-educators",
        authorName: "PhET Interactive Team",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 104523,
        repoNumericId: 309812,
        license: "GPL-3.0",
        status: "approved",
        warnings: ["Framing restricted by origin (launches with sandboxed sandbox parameters)"],
        observationPrompt: "Compare vibrational resonance modes of N₂ vs CO₂ under infrared photon bombardment.",
        thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&auto=format&fit=crop&q=80"],
        views: "42.1K learners",
        viewsCount: 42100,
        uploadedAt: "1 week ago",
        likes: 3100,
        subscribers: "94.2K educators",
        durationLabel: "PhET HTML5",
        reportsCount: 0,
        comments: [],
        questions: [],
      },

      // 3. Ocean Acidification & Aragonite Saturation (NOAA)
      {
        id: "sim-ocean-acid",
        title: "Ocean Acidification & Aragonite Saturation Carbonate Chemistry",
        description:
          "Models how dissolved anthropogenic CO₂ generates carbonic acid, lowering seawater pH and depleting available carbonate ions needed by pteropods and coral reefs for calcification.",
        topic: "Marine Chemistry",
        gradeLevel: "College",
        repoUrl: "https://github.com/noaa-education/ocean-acidification-lab",
        liveUrl: "https://oceanacidification.noaa.gov/interactive-calc/",
        authorLogin: "noaa-science",
        authorName: "NOAA Marine Lab",
        authorAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 441029,
        repoNumericId: 918231,
        license: "Apache-2.0",
        status: "approved",
        warnings: [],
        observationPrompt: "Track shell dissolution rates as water saturation state (Ω) drops below 1.0.",
        thumbnailUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=640&auto=format&fit=crop&q=80"],
        views: "9.3K learners",
        viewsCount: 9320,
        uploadedAt: "2 weeks ago",
        likes: 720,
        subscribers: "5.1K educators",
        durationLabel: "Chemistry Lab",
        reportsCount: 0,
        comments: [],
        questions: [],
      },

      // 4. Photovoltaic Array Tilt & Solar Irradiance
      {
        id: "sim-solar-angle",
        title: "Photovoltaic Panel Tilt, Azimuth & Seasonal Zenith Angle Optimizer",
        description:
          "Computes direct and diffuse irradiance across solar arrays as a function of latitude and seasonal solar zenith angles to maximize megawatt-hour generation.",
        topic: "Renewable Energy",
        gradeLevel: "Vocational / College",
        repoUrl: "https://github.com/solarenergy-lab/pv-tilt-calculator",
        liveUrl: "https://pv-tilt-sim.energy.gov/",
        authorLogin: "pv-researcher",
        authorName: "Solar Energy Lab",
        authorAvatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 887201,
        repoNumericId: 554192,
        license: "MIT",
        status: "approved",
        warnings: ["Optional manifest field 'gradeLevel' was unpopulated"],
        observationPrompt: "Adjust winter and summer tilt angles to compare peak generation curves.",
        thumbnailUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?w=640&auto=format&fit=crop&q=80"],
        views: "12.8K learners",
        viewsCount: 12800,
        uploadedAt: "3 weeks ago",
        likes: 950,
        subscribers: "8.4K educators",
        durationLabel: "Physics Tool",
        reportsCount: 0,
        comments: [],
        questions: [],
      },

      // 5. Urban Heat Island & Tree Canopy Transpiration
      {
        id: "sim-urban-heat",
        title: "Urban Heat Island: Asphalt Albedo vs Tree Canopy Transpiration",
        description:
          "Compares asphalt albedo absorption and surface thermal re-radiation against vegetative shade and evaporative cooling across dense city street canyons.",
        topic: "Urban Ecology",
        gradeLevel: "Middle / High School",
        repoUrl: "https://github.com/urbancool/city-canopy-sim",
        liveUrl: "https://citycanopy.netlify.app/",
        authorLogin: "ecocities",
        authorName: "Urban Ecology Network",
        authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 651209,
        repoNumericId: 881234,
        license: "BSD-3-Clause",
        status: "approved",
        warnings: [],
        observationPrompt: "Observe neighborhood surface temperatures at 3 PM when vegetative cover is increased from 10% to 40%.",
        thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=640&auto=format&fit=crop&q=80"],
        views: "7.1K learners",
        viewsCount: 7100,
        uploadedAt: "1 month ago",
        likes: 540,
        subscribers: "3.2K educators",
        durationLabel: "GIS Model",
        reportsCount: 0,
        comments: [],
        questions: [],
      },

      // 6. Groundwater Recharge & Aquifer Drawdown
      {
        id: "sim-aquifer",
        title: "Aquifer Recharge Lag vs Center-Pivot Well Depletion Cone",
        description:
          "Interactive hydrogeology cross-section modeling deep unconfined aquifers, cone of depression radius, and decade-scale recharge lag.",
        topic: "Water Resources",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/hydrogeo/aquifer-balance",
        liveUrl: "https://hydrogeo.org/aquifer-balance/",
        authorLogin: "hydro-prof",
        authorName: "Dr. Sandeep Verma",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 334910,
        repoNumericId: 449012,
        license: "MIT",
        status: "approved",
        warnings: ["Repository inactive for >12 months (verified static baseline)"],
        observationPrompt: "Note the delay between rainfall events at the recharge zone and water table recovery at the wellhead.",
        thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=640&auto=format&fit=crop&q=80"],
        views: "15.6K learners",
        viewsCount: 15600,
        uploadedAt: "1 month ago",
        likes: 1100,
        subscribers: "6.9K educators",
        durationLabel: "Geo Sim",
        reportsCount: 0,
        comments: [],
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

const globalForStore = globalThis as unknown as { ecoVerseStore?: EcoVerseStore };

export const store = globalForStore.ecoVerseStore ?? new EcoVerseStore();

if (process.env.NODE_ENV !== "production") {
  globalForStore.ecoVerseStore = store;
}
