"use client";

import { useEffect, useState } from "react";

export default function Home() {

  const [stats, setStats] = useState({
    totalReviews: 0,
    averageScore: 0,
    securityIssuesFound: 0,
  });

  const [reviews, setReviews] = useState([]);

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);

  const [aiReview, setAiReview] = useState("");

  /* =========================================
     FETCH STATS
  ========================================= */

  const fetchStats = async () => {

    try {

      const response =
        await fetch("http://localhost:5000/stats");

      const data = await response.json();

      setStats(data);

    } catch (error) {

      console.log(error);
    }
  };

  /* =========================================
     FETCH REVIEWS
  ========================================= */

  const fetchReviews = async () => {

    try {

      const response =
        await fetch("http://localhost:5000/reviews");

      const data = await response.json();

      setReviews(data);

    } catch (error) {

      console.log(error);
    }
  };

  /* =========================================
     ANALYZE CODE
  ========================================= */

  const analyzeCode = async () => {

    if (!code) {
      alert("Paste code first");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/review",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            code,
          }),
        }
      );

      const data = await response.json();

      setAiReview(data.review);

      fetchStats();

      fetchReviews();

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);
    }
  };

  /* =========================================
     LOAD DATA
  ========================================= */

  useEffect(() => {

    fetchStats();

    fetchReviews();

  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* GLOW EFFECTS */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>

      {/* NAVBAR */}

      <nav className="flex items-center justify-between px-10 py-6 border-b border-zinc-800 backdrop-blur-xl sticky top-0 z-50 bg-black/40">

        <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Prism AI
        </h1>

        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition duration-300 shadow-xl shadow-cyan-500/30">
          Connect GitHub
        </button>

      </nav>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-6 py-24 text-center relative z-10">

        <h1 className="text-6xl md:text-7xl font-black leading-tight mb-8 animate-pulse">

          AI Powered

          <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Code Reviews
          </span>

        </h1>

        <p className="text-zinc-400 text-xl max-w-3xl mx-auto mb-10">
          Detect bugs, vulnerabilities, performance issues and improve your pull requests instantly using AI.
        </p>

      </section>

      {/* STATS */}

      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6 mb-24 relative z-10">

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 hover:-translate-y-2 transition duration-300 shadow-2xl">

          <p className="text-zinc-400 text-sm">
            Total Reviews
          </p>

          <h2 className="text-5xl font-black mt-3">
            {stats.totalReviews}
          </h2>

        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 hover:-translate-y-2 transition duration-300 shadow-2xl">

          <p className="text-zinc-400 text-sm">
            Security Issues
          </p>

          <h2 className="text-5xl font-black mt-3 text-red-400">
            {stats.securityIssuesFound}
          </h2>

        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 hover:-translate-y-2 transition duration-300 shadow-2xl">

          <p className="text-zinc-400 text-sm">
            Average Score
          </p>

          <h2 className="text-5xl font-black mt-3 text-cyan-400">
            {Math.round(stats.averageScore)}%
          </h2>

        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 hover:-translate-y-2 transition duration-300 shadow-2xl">

          <p className="text-zinc-400 text-sm">
            Live Status
          </p>

          <h2 className="text-4xl font-black mt-3 text-green-400">
            ONLINE
          </h2>

        </div>

      </section>

      {/* CODE ANALYZER */}

      <section className="max-w-7xl mx-auto px-6 mb-24 relative z-10">

        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <h2 className="text-4xl font-black mb-8">
            Analyze Your Code
          </h2>

          <textarea
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="
              w-full
              h-72
              bg-black
              border
              border-zinc-700
              rounded-2xl
              p-6
              text-green-400
              font-mono
              outline-none
              resize-none
              focus:border-cyan-500
              transition
            "
          />

          <button
            onClick={analyzeCode}
            className="mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 transition duration-300 shadow-xl shadow-cyan-500/30"
          >

            {loading ? "Analyzing..." : "Analyze Code"}

          </button>

        </div>

      </section>

      {/* AI REVIEW */}

      {aiReview && (

        <section className="max-w-7xl mx-auto px-6 mb-24 relative z-10">

          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">

            <h2 className="text-4xl font-black mb-8 text-cyan-400">
              AI Review Result
            </h2>

            <pre className="whitespace-pre-wrap text-zinc-300 leading-8">
              {aiReview}
            </pre>

          </div>

        </section>

      )}

      {/* RECENT REVIEWS */}

      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">

        <div className="flex items-center justify-between mb-10">

          <h2 className="text-4xl font-black">
            Recent Reviews
          </h2>

          <p className="text-zinc-400">
            Live Database Reviews
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {reviews.map((review: any, index) => (

            <div
              key={index}
              className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 hover:-translate-y-3 transition duration-300 shadow-2xl"
            >

              <div className="flex items-center justify-between mb-6">

                <h3 className="text-2xl font-bold">
                  {review.prTitle}
                </h3>

                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-xl font-black shadow-xl shadow-cyan-500/30">

                  {review.score}

                </div>

              </div>

              <div className="space-y-5">

                <div>

                  <p className="text-zinc-400 text-sm">
                    Repository
                  </p>

                  <p className="text-lg mt-2">
                    {review.repository}
                  </p>

                </div>

                <div>

                  <p className="text-zinc-400 text-sm">
                    Security Issues
                  </p>

                  <p className="text-red-400 mt-2">
                    {review.securityIssues?.join(", ")}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}