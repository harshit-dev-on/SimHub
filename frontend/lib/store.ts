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

export interface SimulationComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  score?: number;
  upvotes?: number;
  downvotes?: number;
  userVote?: "up" | "down" | null;
  hasMindChangedBadge?: boolean;
  isCreator?: boolean;
  replies?: SimulationComment[];
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
  comments: SimulationComment[];
  isDemoRepoB?: boolean;
  isDemoRepoA?: boolean;
  isUserUploaded?: boolean;
}

class EcoVerseStore {
  public simulations: SimulationEntry[] = [];
  public repoBDriftActive: boolean = false;
  public userSubscriptions: Record<string, string[]> = {};

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.repoBDriftActive = false;
    this.userSubscriptions = {};

    this.simulations = [
      // 1. Gradient Descent
      {
        id: "sim-gradient-descent",
        title: "Gradient Descent",
        description: `# Gradient Descent & Optimization
Interactive laboratory exploring non-convex loss surfaces, learning rate sensitivity, and momentum dynamics.

### Core Mathematical Model
The parameter update equation with Polyak Heavy-Ball momentum:

\`\`\`python
# Velocity update with momentum damping
v = beta * v + lr * grad_loss(w)
w = w - v
\`\`\`

### Key Parameters & Regimes
| Parameter | Symbol | Range | Dynamic Effect |
|---|---|---|---|
| Learning Rate | \`η\` | \`0.001 – 0.5\` | Step magnitude & divergence threshold |
| Momentum | \`β\` | \`0.0 – 0.99\` | Damps oscillations in steep ravines |

### Learning Objectives
- [x] Observe oscillatory overshoot in ill-conditioned quadratic valleys
- [x] Compare vanilla SGD vs Polyak momentum trajectories
- [ ] Find the global minimum of the double-well surface`,
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
        
        comments: [
          {
            id: "c-gd-1",
            authorName: "Maya Lin",
            authorAvatar: "https://api.dicebear.com/7.x/lorelei/svg?seed=MayaGreen",
            text: "The real-time contour loss curves helped me visualize momentum term damping! When η is too large, you can literally see it leap out of the convex well.",
            timestamp: "3 hours ago",
            likes: 34,
            score: 34,
            upvotes: 36,
            downvotes: 2,
            hasMindChangedBadge: true,
            replies: [
              {
                id: "c-gd-1-r1",
                authorName: "Dr. Aris Thorne",
                authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                text: "Exactly right Maya! If you try setting learning rate to 0.45 in the POE loop, the eigenvalues of the Hessian trigger immediate divergence.",
                timestamp: "2 hours ago",
                likes: 19,
                score: 19,
                upvotes: 20,
                downvotes: 1,
                isCreator: true,
                replies: [
                  {
                    id: "c-gd-1-r1-1",
                    authorName: "Alex Chen",
                    authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexBot",
                    text: "Just verified this in the slider, oscillation amplitude doubled every 2 steps!",
                    timestamp: "45 minutes ago",
                    likes: 7,
                    score: 7,
                    upvotes: 7,
                    downvotes: 0,
                    hasMindChangedBadge: false,
                  },
                ],
              },
            ],
          },
          {
            id: "c-gd-2",
            authorName: "Liam O'Connor",
            authorAvatar: "https://api.dicebear.com/7.x/micah/svg?seed=LiamIrish",
            text: "Can someone explain why momentum β=0.9 prevents getting stuck in saddle points?",
            timestamp: "1 hour ago",
            likes: 12,
            score: 12,
            upvotes: 14,
            downvotes: 2,
            replies: [
              {
                id: "c-gd-2-r1",
                authorName: "Devin K.",
                authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevinTech",
                text: "Because the accumulated velocity carries kinetic inertia past regions where the gradient ∇f ≈ 0.",
                timestamp: "25 minutes ago",
                likes: 15,
                score: 15,
                upvotes: 15,
                downvotes: 0,
              },
            ],
          },
        ],
      },

      // 2. Monty Hall Problem
      {
        id: "sim-monty-hall",
        title: "Monty Hall Problem",
        description: `# Monty Hall Probability Paradox
Test the counter-intuitive 3-door conditional probability problem through single-play reveals and high-speed Monte Carlo batch simulations.

### Theoretical Breakdown
> "Always switching yields a **2/3** win probability, while staying remains capped at **1/3**."

### Strategy Comparison
| Strategy | Expected Win Rate | Bayes Formulation |
|---|---|---|
| Stay | **33.3%** (1/3) | \`P(Car \| Door 1) = 1/3\` |
| Switch | **66.7%** (2/3) | \`P(Car \| Switch) = 2/3\` |

### Verification Steps
- [x] Run single trial with door choice
- [x] Host opens a goat door
- [ ] Execute N = 10,000 Monte Carlo test to verify convergence`,
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
        
        comments: [
          {
            id: "c-mh-1",
            authorName: "Rohan V.",
            authorAvatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanEarth",
            text: "Ran 10,000 iterations: switching won 66.8% of the time. Mind completely blown! I always thought it was 50/50.",
            timestamp: "5 hours ago",
            likes: 58,
            score: 58,
            upvotes: 61,
            downvotes: 3,
            hasMindChangedBadge: true,
            replies: [
              {
                id: "c-mh-1-r1",
                authorName: "Priya Sharma",
                authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                text: "That initial 50/50 instinct is the classic cognitive trap! Monty is filtering out bad information on your behalf.",
                timestamp: "4 hours ago",
                likes: 42,
                score: 42,
                upvotes: 42,
                downvotes: 0,
                isCreator: true,
              },
            ],
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

      },
    ];

    // Try loading saved user simulations from local data file if running in Node.js
    try {
      if (typeof window === "undefined") {
        const fs = require("fs");
        const path = require("path");
        const dataFilePath = path.join(process.cwd(), "data", "user_simulations.json");
        if (fs.existsSync(dataFilePath)) {
          const raw = fs.readFileSync(dataFilePath, "utf-8");
          const userSims = JSON.parse(raw);
          if (Array.isArray(userSims) && userSims.length > 0) {
            const idSet = new Set(userSims.map((s: SimulationEntry) => s.id));
            const defaults = this.simulations.filter((s) => !idSet.has(s.id));
            this.simulations = [...userSims, ...defaults];
          }
        }
      }
    } catch {
      // Ignore in browser or read-only serverless environment
    }
  }

  public getSimulation(id: string): SimulationEntry | undefined {
    return this.simulations.find((s) => s.id === id);
  }

  public addComment(
    simId: string,
    commentData: {
      text: string;
      authorName: string;
      authorAvatar: string;
      isCreator?: boolean;
      hasMindChangedBadge?: boolean;
      parentId?: string;
    }
  ): SimulationComment | null {
    const sim = this.getSimulation(simId);
    if (!sim) return null;

    if (!sim.comments) sim.comments = [];

    const newComment: SimulationComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      authorName: commentData.authorName,
      authorAvatar: commentData.authorAvatar,
      text: commentData.text,
      timestamp: "Just now",
      likes: 1,
      score: 1,
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      isCreator: commentData.isCreator || false,
      hasMindChangedBadge: commentData.hasMindChangedBadge || false,
      replies: [],
    };

    if (commentData.parentId) {
      const addReplyRecursive = (list: SimulationComment[]): boolean => {
        for (const item of list) {
          if (item.id === commentData.parentId) {
            if (!item.replies) item.replies = [];
            item.replies.unshift(newComment);
            return true;
          }
          if (item.replies && item.replies.length > 0) {
            if (addReplyRecursive(item.replies)) return true;
          }
        }
        return false;
      };

      const added = addReplyRecursive(sim.comments);
      if (!added) {
        sim.comments.unshift(newComment);
      }
    } else {
      sim.comments.unshift(newComment);
    }

    return newComment;
  }

  public voteComment(
    simId: string,
    commentId: string,
    direction: "up" | "down",
    currentVote?: "up" | "down" | null
  ): { score: number; userVote: "up" | "down" | null } | null {
    const sim = this.getSimulation(simId);
    if (!sim || !sim.comments) return null;

    let result: { score: number; userVote: "up" | "down" | null } | null = null;

    const voteRecursive = (list: SimulationComment[]): boolean => {
      for (const c of list) {
        if (c.id === commentId) {
          let newVote: "up" | "down" | null = direction;
          let delta = 0;

          if (currentVote === direction) {
            newVote = null;
            delta = direction === "up" ? -1 : 1;
          } else if (!currentVote) {
            delta = direction === "up" ? 1 : -1;
          } else {
            delta = direction === "up" ? 2 : -2;
          }

          c.score = (c.score ?? c.likes ?? 0) + delta;
          c.likes = Math.max(0, c.score);
          c.userVote = newVote;

          result = { score: c.score, userVote: newVote };
          return true;
        }

        if (c.replies && c.replies.length > 0) {
          if (voteRecursive(c.replies)) return true;
        }
      }
      return false;
    };

    voteRecursive(sim.comments);
    return result;
  }

  public voteSimulation(
    simId: string,
    direction: "up" | "down",
    currentVote?: "up" | "down" | null
  ): { likes: number; userVote: "up" | "down" | null } | null {
    const sim = this.getSimulation(simId);
    if (!sim) return null;

    let newVote: "up" | "down" | null = direction;
    let delta = 0;

    if (currentVote === direction) {
      newVote = null;
      delta = direction === "up" ? -1 : 1;
    } else if (!currentVote) {
      delta = direction === "up" ? 1 : -1;
    } else {
      delta = direction === "up" ? 2 : -2;
    }

    sim.likes = Math.max(0, (sim.likes ?? 0) + delta);
    return { likes: sim.likes, userVote: newVote };
  }

  public toggleRepoBDrift(): boolean {
    this.repoBDriftActive = !this.repoBDriftActive;
    return this.repoBDriftActive;
  }

  public getUserSubscriptions(userId: string): string[] {
    if (!this.userSubscriptions[userId]) {
      this.userSubscriptions[userId] = [];
    }
    return [...this.userSubscriptions[userId]];
  }

  public addUserSimulation(sim: SimulationEntry) {
    sim.isUserUploaded = true;
    const idx = this.simulations.findIndex((s) => s.id === sim.id);
    if (idx >= 0) {
      this.simulations[idx] = sim;
    } else {
      this.simulations.unshift(sim);
    }
  }

  public removeSimulation(id: string) {
    this.simulations = this.simulations.filter((s) => s.id !== id);
  }

  public toggleUserSubscription(
    userId: string,
    authorName: string
  ): { isSubscribed: boolean; subscriptions: string[] } {
    if (!this.userSubscriptions[userId]) {
      this.userSubscriptions[userId] = [];
    }
    const list = this.userSubscriptions[userId];
    const index = list.indexOf(authorName);
    let isSubscribed = false;
    if (index >= 0) {
      list.splice(index, 1);
      isSubscribed = false;
    } else {
      list.push(authorName);
      isSubscribed = true;
    }
    return { isSubscribed, subscriptions: [...list] };
  }

  public setUserSubscriptions(userId: string, subscriptions: string[]): string[] {
    this.userSubscriptions[userId] = Array.isArray(subscriptions) ? [...subscriptions] : [];
    return [...this.userSubscriptions[userId]];
  }
}

const globalForStore = globalThis as unknown as { ecoVerseStore?: EcoVerseStore };

let storeInstance = globalForStore.ecoVerseStore;
if (
  !storeInstance ||
  typeof storeInstance.getUserSubscriptions !== "function" ||
  !(storeInstance as any)._hasMarkdownDesc
) {
  const existingSims = storeInstance?.simulations;
  const existingSubs = (storeInstance as any)?.userSubscriptions;
  storeInstance = new EcoVerseStore();
  (storeInstance as any)._hasMarkdownDesc = true;
  if (existingSubs) {
    storeInstance.userSubscriptions = existingSubs;
  }
  if (existingSims && existingSims.length > 0) {
    // Preserve user-uploaded simulations while using updated default simulations
    const userUploaded = existingSims.filter((s) => s.isUserUploaded);
    const idSet = new Set(userUploaded.map((s) => s.id));
    const defaults = storeInstance.simulations.filter((s) => !idSet.has(s.id));
    storeInstance.simulations = [...userUploaded, ...defaults];
  }
}

export const store = storeInstance;

if (process.env.NODE_ENV !== "production") {
  globalForStore.ecoVerseStore = store;
}
