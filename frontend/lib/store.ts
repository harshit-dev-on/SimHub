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
  likes?: number;
  subscribers?: string;
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
      // 1. Gradient Descent
      {
        id: "sim-gradient-descent",
        title: "Gradient Descent",
        description:
          "Explore 2D and 3D loss surfaces, non-convex double wells, learning rates (η), and momentum dynamics with step-by-step convergence telemetry.",
        topic: "Machine Learning & Optimization",
        gradeLevel: "College / Advanced STEM",
        repoUrl: "https://github.com/simhub-stem/gradient-descent-lab",
        liveUrl: "https://distill.pub/2017/momentum/",
        authorLogin: "dr-thorne",
        authorName: "Dr. Aris Thorne",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 9841234,
        repoNumericId: 91402318,
        license: "MIT",
        status: "approved",
        warnings: [],
        observationPrompt:
          "Tune the learning rate η from 0.001 to 0.5. Observe the onset of oscillatory overshoot and divergence in non-convex valleys.",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=640&auto=format&fit=crop&q=80"],
        views: "34.8K learners",
        viewsCount: 34820,
        uploadedAt: "1 day ago",
        likes: 2150,
        subscribers: "15.4K researchers",
        durationLabel: "Interactive Lab",
        reportsCount: 0,
        questions: [
          {
            id: "q-gd-1",
            question: "What happens when the learning rate (η) is set too high on a steep quadratic bowl?",
            options: [
              { id: "opt-1", text: "Convergence accelerates monotonically.", isCorrect: false },
              { id: "opt-2", text: "The parameter oscillates and diverges away from the global minimum.", isCorrect: true },
              { id: "opt-3", text: "The gradient immediately equals zero.", isCorrect: false },
            ],
            explanation: "Overstepping occurs when the step size η·∇f exceeds the curvature threshold 2/L, causing explosive divergence.",
          },
        ],
        comments: [
          {
            id: "c-gd-1",
            authorName: "Maya Lin",
            authorAvatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=MayaGreen",
            text: "The real-time contour loss curves helped me visualize momentum term damping!",
            timestamp: "3 hours ago",
            likes: 28,
            hasMindChangedBadge: true,
          },
        ],
      },

      // 2. Monty Hall Problem
      {
        id: "sim-monty-hall",
        title: "Monty Hall Problem",
        description:
          "Test the famous 3-door probability paradox through interactive single-play reveals and high-speed Monte Carlo batch simulations (N = 10,000).",
        topic: "Probability & Game Theory",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/simhub-stem/monty-hall-paradox",
        liveUrl: "https://www.mathwarehouse.com/monty-hall-simulation-website/",
        authorLogin: "priya-stem",
        authorName: "Priya Sharma",
        authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 104523,
        repoNumericId: 82410952,
        license: "MIT",
        status: "approved",
        warnings: [],
        observationPrompt:
          "Run 1,000 trials with 'Always Switch' versus 'Stay'. Compare empirical win rate with the theoretical 2/3 vs 1/3 expectation.",
        thumbnailUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=640&auto=format&fit=crop&q=80"],
        views: "42.1K learners",
        viewsCount: 42100,
        uploadedAt: "2 days ago",
        likes: 3100,
        subscribers: "18.2K students",
        durationLabel: "Interactive Sim",
        reportsCount: 0,
        questions: [
          {
            id: "q-mh-1",
            question: "Why does switching doors yield a 2/3 win probability instead of 1/2?",
            options: [
              { id: "opt-1", text: "Because the host knows where the prize is and always reveals a goat, concentrating probability on the unchosen door.", isCorrect: true },
              { id: "opt-2", text: "Because each remaining door is always 50/50 independent.", isCorrect: false },
              { id: "opt-3", text: "It is purely an empirical artifact of small sample sizes.", isCorrect: false },
            ],
            explanation: "Your initial choice has only a 1/3 chance of being correct. Since the host filters out a losing door, the remaining unopened door carries the other 2/3 probability mass.",
          },
        ],
        comments: [
          {
            id: "c-mh-1",
            authorName: "Rohan V.",
            authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanEarth",
            text: "Ran 10,000 iterations: switching won 66.8% of the time. Mind completely blown!",
            timestamp: "5 hours ago",
            likes: 45,
            hasMindChangedBadge: true,
          },
        ],
      },

      // 3. Projectile Motion
      {
        id: "sim-projectile-motion",
        title: "Projectile Motion",
        description:
          "Analyze 2D ballistic trajectories, aerodynamic drag coefficients (C_d), Magnus spin effect, and optimal launch angles in real-time vector phase space.",
        topic: "Classical Kinematics",
        gradeLevel: "High School / College",
        repoUrl: "https://github.com/phet-interactive/projectile-motion",
        liveUrl: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_all.html",
        authorLogin: "phet-team",
        authorName: "PhET Interactive Physics",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 4891023,
        repoNumericId: 67104921,
        license: "GPL-3.0",
        status: "approved",
        warnings: [],
        observationPrompt:
          "Toggle air drag on and off at 45°. Notice how air resistance skews the parabolic peak and shifts optimal range angle downward.",
        thumbnailUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1509228468518-180dd4864904?w=640&auto=format&fit=crop&q=80"],
        views: "58.3K learners",
        viewsCount: 58300,
        uploadedAt: "4 days ago",
        likes: 4200,
        subscribers: "24.1K educators",
        durationLabel: "Vector Physics",
        reportsCount: 0,
        questions: [
          {
            id: "q-pm-1",
            question: "When quadratic air resistance is included, the optimal launch angle for maximum horizontal range is:",
            options: [
              { id: "opt-1", text: "Strictly less than 45°.", isCorrect: true },
              { id: "opt-2", text: "Exactly 45° regardless of drag.", isCorrect: false },
              { id: "opt-3", text: "Strictly greater than 45°.", isCorrect: false },
            ],
            explanation: "Because air resistance decelerates the projectile throughout flight, spending less time aloft in the horizontal drag regime yields a flatter, lower trajectory (<45°).",
          },
        ],
        comments: [
          {
            id: "c-pm-1",
            authorName: "Anil Kapoor",
            authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            text: "Terrific for teaching vectors in Newtonian mechanics.",
            timestamp: "1 day ago",
            likes: 19,
          },
        ],
      },

      // 4. Electron Clouding (3D Quantum Orbitals)
      {
        id: "sim-electron-cloud",
        title: "Electron Clouding: Hydrogen Orbital Wavefunctions",
        description:
          "Visualize 3D quantum probability density distributions (ψ²), spherical harmonics (Y_lm), and radial nodes for hydrogenic orbitals (s, p, d, f).",
        topic: "Quantum Physics",
        gradeLevel: "College / Advanced STEM",
        repoUrl: "https://github.com/simhub-stem/quantum-orbitals-3d",
        liveUrl: "https://falstad.com/qmatom/",
        authorLogin: "dr-thorne",
        authorName: "Dr. Aris Thorne",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        authorNumericId: 9841234,
        repoNumericId: 77891240,
        license: "MIT",
        status: "approved",
        warnings: [],
        observationPrompt:
          "Select the 3d_z² state. Rotate in 3D and inspect the nodal cones where electron probability amplitude drops to exactly zero.",
        thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&auto=format&fit=crop&q=80",
        screenshots: ["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&auto=format&fit=crop&q=80"],
        views: "29.4K learners",
        viewsCount: 29400,
        uploadedAt: "3 days ago",
        likes: 1890,
        subscribers: "14.2K students",
        durationLabel: "3D WebGL",
        reportsCount: 0,
        questions: [
          {
            id: "q-ec-1",
            question: "What determines the angular nodal planes in a hydrogenic orbital wavefunction?",
            options: [
              { id: "opt-1", text: "The principal quantum number n.", isCorrect: false },
              { id: "opt-2", text: "The azimuthal/orbital angular momentum quantum number l.", isCorrect: true },
              { id: "opt-3", text: "The electron spin s.", isCorrect: false },
            ],
            explanation: "The angular wavefunction Y_lm has exactly l angular nodal surfaces (planes or cones), while the radial part has (n - l - 1) radial nodes.",
          },
        ],
        comments: [
          {
            id: "c-ec-1",
            authorName: "Elena Rostova",
            authorAvatar: "https://api.dicebear.com/7.x/personas/svg?seed=Elena",
            text: "Seeing the probability density slices in 3D makes quantum chemistry so much more intuitive!",
            timestamp: "6 hours ago",
            likes: 31,
          },
        ],
      },

      // 5. REPO B - Carbon Bathtub Stand-in
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
