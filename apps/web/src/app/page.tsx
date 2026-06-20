import Link from "next/link";
import { cookies } from "next/headers";
import HeroCanvas from "@/components/hero-canvas";
import DynamicGraphPreview from "@/components/dynamic-graph-preview";

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies =
    typeof cookieStore.getAll === "function" ? cookieStore.getAll() : [];
  const isSignedIn = allCookies.some((cookie) =>
    cookie.name.startsWith("better-auth"),
  );

  return (
    <div className="font-body-md text-body-md antialiased selection:bg-primary/30 selection:text-primary-fixed">
      {/*  TopNavBar  */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface/60 backdrop-blur-md dark:bg-surface/60 border-b border-outline-variant transition-colors duration-300">
        <div className="flex items-center gap-8">
          <a
            className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim tracking-tight flex items-center gap-2"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              data-weight="fill"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              hub
            </span>
            Graphora
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            className="bg-primary hover:bg-primary-fixed text-on-primary px-4 py-2 rounded font-medium transition-colors active:scale-95 duration-200"
            href={isSignedIn ? "/dashboard" : "/login"}
          >
            {isSignedIn ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>
      <main>
        {/*  Hero Section  */}
        <section
          className="relative min-h-230.25 flex flex-col justify-center items-center pt-24 pb-16 px-margin-desktop overflow-hidden border-b border-outline-variant"
          id="hero-section"
        >
          {/*  Canvas Placeholder for Force Graph  */}
          <HeroCanvas />
          <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary font-label-mono text-label-mono">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Graphora Engine v1.0 Live
            </div>
            <h1 className="font-headline-lg text-headline-lg md:text-[56px] md:leading-[1.1] font-bold text-on-surface mb-6 tracking-tight">
              Visualize your graph data,{" "}
              <span className="text-primary">instantly.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10">
              Upload a CSV, get interactive network visualizations and
              centrality metrics in seconds. Designed for architects and data
              scientists who demand precision without the boilerplate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                className="bg-primary hover:bg-primary-fixed text-on-primary px-6 py-3 rounded font-medium transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] flex items-center justify-center gap-2"
                href={isSignedIn ? "/dashboard" : "/login"}
              >
                {isSignedIn ? "Go to Dashboard" : "Get started free"}
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>

          {/*  Dynamic Graph Editor Preview  */}

          <div className="relative z-10 w-full max-w-5xl mx-auto mt-20 glass-panel rounded-xl overflow-hidden shadow-2xl border border-outline-variant">
            <div className="h-8 border-b border-outline-variant bg-surface-container-lowest/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-outline-variant/50"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant/50"></div>
              <div className="w-3 h-3 rounded-full bg-outline-variant/50"></div>
            </div>
            <div
              className="aspect-video w-full
 bg-background/50"
            >
              <DynamicGraphPreview />
            </div>
          </div>
        </section>
        {/*  Features Section  */}
        <section
          className="py-24 px-margin-desktop border-b border-outline-variant relative z-10 bg-surface-container-lowest/50"
          id="features"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                Everything you need to understand your networks.
              </h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">
                Powerful tools designed for complex data architectures.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  database
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Dataset Store
                </h3>
                <p className="text-on-surface-variant">
                  Upload and manage multiple CSV graph datasets securely.
                </p>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  analytics
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Graph Generation
                </h3>
                <p className="text-on-surface-variant">
                  Auto-detect directed, weighted graphs and render them
                  instantly.
                </p>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  query_stats
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Metrics Evaluation
                </h3>
                <p className="text-on-surface-variant">
                  Degree, Betweenness, Closeness, and PageRank computed
                  automatically.
                </p>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  dashboard
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Interactive Dashboard
                </h3>
                <p className="text-on-surface-variant">
                  Filter, search, and explore your graph visually in real time.
                </p>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  sync
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Processing Tracker
                </h3>
                <p className="text-on-surface-variant">
                  Live status updates as your dataset moves from upload to
                  ready.
                </p>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-outline-variant hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary mb-4 text-[32px]">
                  edit
                </span>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Graph Editor
                </h3>
                <p className="text-on-surface-variant">
                  Rename, re-analyze, and share your graphs with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*  How it Works Section  */}
        <section
          className="py-24 px-margin-desktop border-b border-outline-variant relative z-10 bg-background"
          id="how-it-works"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                Up and running in three steps.
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start relative">
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-outline-variant z-0"></div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg mb-4 shadow-[0_0_15px_rgba(192,193,255,0.4)]">
                  1
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Upload your CSV
                </h3>
                <p className="text-on-surface-variant">
                  Drag and drop your edge list.
                </p>
              </div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-primary text-primary flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Wait for analysis
                </h3>
                <p className="text-on-surface-variant">
                  We compute all metrics automatically.
                </p>
              </div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-outline-variant text-outline flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2">
                  Explore your graph
                </h3>
                <p className="text-on-surface-variant">
                  Filter, search, and share interactively.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/*  Benefits Section  */}
        <section className="py-24 px-margin-desktop border-b border-outline-variant relative z-10 bg-surface-container-lowest/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                Why teams choose Graphora.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant text-center">
                <span className="material-symbols-outlined text-primary mb-4 text-[48px]">
                  code_off
                </span>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
                  No code required
                </h3>
              </div>
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant text-center">
                <span className="material-symbols-outlined text-primary mb-4 text-[48px]">
                  bolt
                </span>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
                  Results in seconds
                </h3>
              </div>
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant text-center">
                <span className="material-symbols-outlined text-primary mb-4 text-[48px]">
                  share
                </span>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
                  Share with anyone
                </h3>
              </div>
            </div>
          </div>
        </section>
        {/*  Comparison Section  */}
        <section
          className="py-24 px-margin-desktop border-b border-outline-variant relative z-10 bg-background"
          id="compare"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                How Graphora stacks up.
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-outline-variant font-medium text-on-surface-variant">
                      Feature
                    </th>
                    <th className="p-4 border-b border-outline-variant font-bold text-primary bg-primary/5 rounded-tl-lg">
                      Graphora
                    </th>
                    <th className="p-4 border-b border-outline-variant font-medium text-on-surface">
                      Gephi
                    </th>
                    <th className="p-4 border-b border-outline-variant font-medium text-on-surface">
                      Cytoscape
                    </th>
                    <th className="p-4 border-b border-outline-variant font-medium text-on-surface">
                      NetworkX
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-outline-variant/50">
                    <td className="p-4 text-on-surface-variant">
                      Interactive visualization
                    </td>
                    <td className="p-4 text-primary bg-primary/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <span className="material-symbols-outlined">close</span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="p-4 text-on-surface-variant">
                      Centrality metrics
                    </td>
                    <td className="p-4 text-primary bg-primary/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/50">
                    <td className="p-4 text-on-surface-variant">CSV upload</td>
                    <td className="p-4 text-primary bg-primary/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-on-surface-variant rounded-bl-lg">
                      No code required
                    </td>
                    <td className="p-4 text-primary bg-primary/5 rounded-br-lg">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-on-surface-variant">
                      <span className="material-symbols-outlined">close</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {/*  Pricing Section  */}
        <section
          className="py-24 px-margin-desktop border-b border-outline-variant relative z-10 bg-surface-container-lowest/50"
          id="pricing"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-4">
                Simple, transparent pricing.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant flex flex-col">
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
                  Free
                </h3>
                <div className="text-3xl font-bold text-on-surface mb-6">
                  $0
                  <span className="text-body-md font-normal text-on-surface-variant">
                    /mo
                  </span>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Up to 1,000 nodes
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Basic metrics
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Community support
                  </li>
                </ul>
                <a
                  className="w-full border border-outline-variant hover:border-primary text-primary px-4 py-2 rounded text-center font-medium transition-colors"
                  href="#"
                >
                  Get Started Free
                </a>
              </div>
              <div className="bg-primary/10 p-8 rounded-xl border border-primary relative flex flex-col">
                <div className="absolute top-0 right-0 bg-primary text-on-primary px-3 py-1 rounded-bl-lg rounded-tr-xl font-label-mono text-xs font-bold">
                  POPULAR
                </div>
                <h3 className="font-headline-md text-headline-md font-semibold text-primary mb-2">
                  Pro
                </h3>
                <div className="text-3xl font-bold text-on-surface mb-6">
                  $49
                  <span className="text-body-md font-normal text-on-surface-variant">
                    /mo
                  </span>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Unlimited nodes
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Advanced metrics &amp; export
                  </li>
                  <li className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check
                    </span>{" "}
                    Priority support
                  </li>
                </ul>
                <a
                  className="w-full bg-primary hover:bg-primary-fixed text-on-primary px-4 py-2 rounded text-center font-medium transition-colors"
                  href="#"
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          </div>
        </section>
        {/*  Footer  */}
        <footer className="w-full py-12 px-margin-desktop border-t border-outline-variant bg-surface-container-lowest dark:bg-background relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div className="flex flex-col items-start gap-2">
              <a
                className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2"
                href="#"
              >
                <span
                  className="material-symbols-outlined"
                  data-weight="fill"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  hub
                </span>
                Graphora
              </a>
              <p className="text-on-surface-variant font-label-mono text-label-mono text-sm max-w-xs mt-2">
                Designed for architects and data scientists who demand
                precision.
              </p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto pt-8 border-t border-outline-variant/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-on-surface-variant font-label-mono text-label-mono text-sm">
              © 2026 Graphora Inc. Built for architects.
            </p>
            <div className="flex gap-4">
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
