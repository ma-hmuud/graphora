import Link from "next/link";
import { cookies } from "next/headers";
import HeroCanvas from "@/components/hero-canvas";
import DynamicGraphPreview from "@/components/dynamic-graph-preview";
import { ModeToggle } from "@/components/mode-toggle";

export default async function Home() {
  const cookieStore = await cookies();
  const allCookies =
    typeof cookieStore.getAll === "function" ? cookieStore.getAll() : [];
  const isSignedIn = allCookies.some((cookie) =>
    cookie.name.startsWith("better-auth"),
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 antialiased selection:bg-[#c0c1ff]/30 selection:text-[#c0c1ff]">
      {/*  TopNavBar  */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-slate-50/80 dark:bg-[#0e1220]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
        <div className="flex items-center gap-8">
          <a
            className="text-xl font-extrabold text-primary-container dark:text-[#c0c1ff] tracking-tight flex items-center gap-2"
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
          <ModeToggle />
          <Link
            className="bg-primary-container hover:bg-[#6c6fed] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors duration-200 active:scale-95"
            href={isSignedIn ? "/dashboard" : "/login"}
          >
            {isSignedIn ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </nav>

      <main>
        {/*  Hero Section  */}
        <section
          className="relative min-h-[650px] flex flex-col justify-center items-center pt-28 pb-16 px-6 overflow-hidden border-b border-slate-200 dark:border-white/10"
          id="hero-section"
        >
          {/* Force Graph Interactive Background */}
          <HeroCanvas />

          <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-primary-container/20 bg-primary-container/5 dark:border-[#c0c1ff]/20 dark:bg-[#c0c1ff]/5 text-primary-container dark:text-[#c0c1ff] text-[10px] uppercase tracking-widest font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container dark:bg-[#c0c1ff] animate-pulse"></span>
              Graphora Engine v1.0 Live
            </div>
            <h1 className="text-3xl md:text-[56px] md:leading-[1.1] font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight max-w-3xl">
              Visualize your graph data,{" "}
              <span className="bg-linear-to-r from-primary-container to-[#6366F1] dark:from-[#c0c1ff] dark:via-primary-fixed dark:to-white bg-clip-text text-transparent">
                instantly.
              </span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Upload a CSV, get interactive network visualizations and
              centrality metrics in seconds. Designed for architects and data
              scientists who demand precision without the boilerplate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                className="bg-primary-container hover:bg-[#6c6fed] text-white px-6 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(192,193,255,0.25)] flex items-center justify-center gap-2 active:scale-[0.98]"
                href={isSignedIn ? "/dashboard" : "/login"}
              >
                {isSignedIn ? "Go to Dashboard" : "Get started free"}
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>

          {/*  Dynamic Graph Editor Preview  */}
          <div className="relative z-10 w-full max-w-5xl mx-auto mt-20 bg-gray-50 dark:bg-[#111420]/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-xl">
            <div className="h-9 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161a2b]/50 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/10"></div>
            </div>
            <div className="aspect-video w-full bg-slate-100 dark:bg-[#090b14]">
              <DynamicGraphPreview />
            </div>
          </div>
        </section>

        {/*  Features Section  */}
        <section
          className="py-24 px-6 border-b border-slate-200 dark:border-white/10 relative z-10 bg-slate-50/50 dark:bg-[#111420]/30"
          id="features"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                Everything you need to understand your networks.
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl mx-auto">
                Powerful tools designed for complex data architectures.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  database
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Dataset Store
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload and manage multiple CSV graph datasets securely.
                </p>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  analytics
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Graph Generation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Auto-detect directed, weighted graphs and render them
                  instantly.
                </p>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  query_stats
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Metrics Evaluation
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Degree, Betweenness, Closeness, and PageRank computed
                  automatically.
                </p>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  dashboard
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Interactive Dashboard
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Filter, search, and explore your graph visually in real time.
                </p>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  sync
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Processing Tracker
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Live status updates as your dataset moves from upload to
                  ready.
                </p>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[32px]">
                  edit
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Graph Editor
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Rename, re-analyze, and share your graphs with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  How it Works Section  */}
        <section
          className="py-24 px-6 border-b border-slate-200 dark:border-white/10 relative z-10 bg-slate-50 dark:bg-[#0B0F19]"
          id="how-it-works"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                Up and running in three steps.
              </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center relative">
              <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-slate-200 dark:bg-white/10 z-0"></div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-lg mb-4 shadow-sm dark:shadow-[0_0_15px_rgba(192,193,255,0.2)]">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Upload your CSV
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Drag and drop your edge list.
                </p>
              </div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111420] border border-primary-container/40 dark:border-primary-container/30 text-primary-container flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Wait for analysis
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  We compute all metrics automatically.
                </p>
              </div>
              <div className="flex-1 relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111420] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Explore your graph
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Filter, search, and share interactively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  Why Graphora Section  */}
        <section className="py-24 px-6 border-b border-slate-200 dark:border-white/10 relative z-10 bg-slate-50/50 dark:bg-[#111420]/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                Why teams choose Graphora.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-[#111420]/80 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] transition-colors duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[48px]">
                  code_off
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  No code required
                </h3>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] transition-colors duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[48px]">
                  bolt
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Results in seconds
                </h3>
              </div>
              <div className="bg-white dark:bg-[#111420]/80 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 hover:bg-slate-50 dark:hover:bg-[#111420] transition-colors duration-300">
                <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] mb-4 text-[48px]">
                  share
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Share with anyone
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/*  Comparison Section  */}
        <section
          className="py-24 px-6 border-b border-slate-200 dark:border-white/10 relative z-10 bg-slate-50 dark:bg-[#0B0F19]"
          id="compare"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                How Graphora stacks up.
              </h2>
            </div>
            <div className="overflow-x-auto bg-white dark:bg-[#111420]/80 rounded-2xl border border-slate-200 dark:border-white/10 p-2 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-slate-200 dark:border-white/10 font-medium text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5 rounded-t-xl text-xs uppercase tracking-wider">
                      Graphora
                    </th>
                    <th className="p-4 border-b border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                      Gephi
                    </th>
                    <th className="p-4 border-b border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                      Cytoscape
                    </th>
                    <th className="p-4 border-b border-slate-200 dark:border-white/10 font-medium text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                      NetworkX
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                      Interactive visualization
                    </td>
                    <td className="p-4 text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-300 dark:text-slate-600">
                      <span className="material-symbols-outlined">close</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                      Centrality metrics
                    </td>
                    <td className="p-4 text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-100 dark:border-white/5">
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm">
                      CSV upload
                    </td>
                    <td className="p-4 text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-700 dark:text-slate-300 text-sm rounded-bl-lg">
                      No code required
                    </td>
                    <td className="p-4 text-primary-container dark:text-[#c0c1ff] bg-primary-container/5 dark:bg-[#c0c1ff]/5 rounded-br-lg">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined">check</span>
                    </td>
                    <td className="p-4 text-slate-300 dark:text-slate-600">
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
          className="py-24 px-6 border-b border-slate-200 dark:border-white/10 relative z-10 bg-slate-50/50 dark:bg-[#111420]/30"
          id="pricing"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                Simple, transparent pricing.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-[#111420]/80 p-8 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col hover:border-primary-container/20 dark:hover:border-[#c0c1ff]/20 transition-all duration-300">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                  Free
                </h3>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  $0
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    /mo
                  </span>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Up to 1,000 nodes
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Basic metrics
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Community support
                  </li>
                </ul>
                <a
                  className="w-full border border-slate-200 dark:border-white/10 hover:border-primary-container/30 dark:hover:border-[#c0c1ff]/30 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-lg text-center font-semibold text-xs tracking-wider uppercase transition-colors"
                  href="#"
                >
                  Get Started Free
                </a>
              </div>

              <div className="bg-primary-container/5 dark:bg-[#c0c1ff]/5 p-8 rounded-2xl border border-primary-container/30 dark:border-[#c0c1ff]/30 relative flex flex-col shadow-[0_0_30px_rgba(192,193,255,0.05)] hover:border-primary-container/50 dark:hover:border-[#c0c1ff]/50 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-primary-container text-white px-3 py-1 rounded-bl-xl rounded-tr-2xl text-[10px] font-bold tracking-wider uppercase">
                  POPULAR
                </div>
                <h3 className="text-lg font-bold text-primary-container dark:text-[#c0c1ff] mb-2">
                  Pro
                </h3>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                  $49
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    /mo
                  </span>
                </div>
                <ul className="flex-1 space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Unlimited nodes
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Advanced metrics &amp; export
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="material-symbols-outlined text-primary-container dark:text-[#c0c1ff] text-[20px]">
                      check
                    </span>{" "}
                    Priority support
                  </li>
                </ul>
                <a
                  className="w-full bg-primary-container hover:bg-[#6c6fed] text-white px-4 py-2.5 rounded-lg text-center font-semibold text-xs tracking-wider uppercase transition-colors"
                  href="#"
                >
                  Upgrade to Pro
                </a>
              </div>
            </div>
          </div>
        </section>

        {/*  Footer  */}
        <footer className="w-full py-12 px-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0e1220]/85 backdrop-blur-md relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div className="flex flex-col items-start gap-2">
              <a
                className="font-bold text-primary-container dark:text-[#c0c1ff] flex items-center gap-2 text-xl"
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
              <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xs mt-2 leading-relaxed">
                Designed for architects and data scientists who demand
                precision.
              </p>
            </div>
          </div>
          <div className="max-w-6xl mx-auto pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © 2026 Graphora Inc. Built for architects.
            </p>
            <div className="flex gap-4">
              <a
                className="text-slate-600 hover:text-primary-container dark:text-slate-400 dark:hover:text-[#c0c1ff] transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                className="text-slate-600 hover:text-primary-container dark:text-slate-400 dark:hover:text-[#c0c1ff] transition-colors"
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
