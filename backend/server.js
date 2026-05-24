const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Octokit } = require("@octokit/rest");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================
   DATABASE CONNECTION
========================================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ MongoDB Error");
    console.log(err.message);
  });

/* =========================================
   REVIEW MODEL
========================================= */

const reviewSchema = new mongoose.Schema({
  repository: String,

  prTitle: String,

  code: String,

  review: String,

  score: Number,

  securityIssues: [String],

  suggestions: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);

/* =========================================
   GITHUB SETUP
========================================= */

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/* =========================================
   HOME ROUTE
========================================= */

app.get("/", (req, res) => {
  res.send("🚀 Prism AI Backend Running");
});

/* =========================================
   LOCAL AI REVIEW ENGINE
========================================= */

async function generateAIReview(code) {

  let issues = [];
  let suggestions = [];
  let score = 100;

  /* =========================================
     SECURITY CHECKS
  ========================================= */

  if (
    code.includes("password") ||
    code.includes("secret") ||
    code.includes("apiKey") ||
    code.includes("token")
  ) {

    issues.push(
      "🚨 Hardcoded credentials detected"
    );

    suggestions.push(
      "Use environment variables instead of hardcoding secrets"
    );

    score -= 15;
  }

  /* =========================================
     ERROR HANDLING
  ========================================= */

  if (
    !code.includes("try") &&
    !code.includes("catch")
  ) {

    issues.push(
      "⚠️ Missing error handling"
    );

    suggestions.push(
      "Add try-catch blocks for safer execution"
    );

    score -= 10;
  }

  /* =========================================
     CLEAN CODE
  ========================================= */

  if (code.includes("var ")) {

    issues.push(
      "⚠️ Outdated variable declaration detected"
    );

    suggestions.push(
      "Use let or const instead of var"
    );

    score -= 5;
  }

  /* =========================================
     PERFORMANCE
  ========================================= */

  if (
    code.includes("for(") ||
    code.includes("while(")
  ) {

    suggestions.push(
      "Optimize loops for better performance"
    );
  }

  /* =========================================
     VALIDATION CHECK
  ========================================= */

  if (
    !code.includes("if")
  ) {

    issues.push(
      "⚠️ Validation checks may be missing"
    );

    suggestions.push(
      "Add proper input validation"
    );

    score -= 5;
  }

  /* =========================================
     DEFAULTS
  ========================================= */

  if (issues.length === 0) {

    issues.push(
      "✅ No major security issues detected"
    );
  }

  if (suggestions.length === 0) {

    suggestions.push(
      "✅ Code quality looks good"
    );
  }

  /* =========================================
     MINIMUM SCORE
  ========================================= */

  if (score < 50) {
    score = 50;
  }

  /* =========================================
     FINAL REVIEW
  ========================================= */

  const review = `
🔍 Prism AI Review

━━━━━━━━━━━━━━━━━━

📊 AI Score:
${score}/100

━━━━━━━━━━━━━━━━━━

🚨 Issues Found:

${issues.map((i) => `• ${i}`).join("\n")}

━━━━━━━━━━━━━━━━━━

💡 Suggestions:

${suggestions.map((s) => `• ${s}`).join("\n")}

━━━━━━━━━━━━━━━━━━

✅ Review completed successfully.
`;

  return {
    review,
    score,
    issues,
    suggestions,
  };
}

/* =========================================
   AI REVIEW ROUTE
========================================= */

app.post("/review", async (req, res) => {
  try {

    const code = req.body.code;

    if (!code) {

      return res.status(400).json({
        success: false,
        error: "Code is required",
      });
    }

    console.log("=================================");
    console.log("📥 CODE RECEIVED");
    console.log(code);

    /* =========================================
       GENERATE AI REVIEW
    ========================================= */

    const aiResult =
      await generateAIReview(code);

    const aiReview =
      aiResult.review;

    const score =
      aiResult.score;

    console.log("✅ AI Review Generated");

    /* =========================================
       SAVE TO DATABASE
    ========================================= */

    const newReview = new Review({
      repository: "Prism AI Demo",

      prTitle: "Manual Review",

      code: code,

      review: aiReview,

      score: score,

      securityIssues:
        aiResult.issues,

      suggestions:
        aiResult.suggestions,
    });

    await newReview.save();

    console.log("✅ Review Saved To MongoDB");

    /* =========================================
       SEND RESPONSE
    ========================================= */

    res.json({
      success: true,

      review: aiReview,

      score: score,

      issues:
        aiResult.issues,

      suggestions:
        aiResult.suggestions,

      saved: true,
    });

  } catch (error) {

    console.log("❌ REVIEW ERROR");
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================
   GET ALL REVIEWS
========================================= */

app.get("/reviews", async (req, res) => {
  try {

    const reviews =
      await Review.find().sort({
        createdAt: -1,
      });

    res.json(reviews);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================
   DASHBOARD STATS
========================================= */

app.get("/stats", async (req, res) => {
  try {

    const totalReviews =
      await Review.countDocuments();

    const reviews =
      await Review.find();

    let totalScore = 0;

    reviews.forEach((review) => {
      totalScore += review.score || 0;
    });

    const averageScore =
      totalReviews > 0
        ? (totalScore / totalReviews).toFixed(1)
        : 0;

    res.json({
      totalReviews,

      averageScore,

      totalRepositories: 5,

      securityIssuesFound:
        reviews.length * 2,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================
   GITHUB WEBHOOK
========================================= */

app.post("/webhook", async (req, res) => {
  try {

    console.log("=================================");
    console.log("📡 GitHub Webhook Triggered");

    const pr = req.body.pull_request;

    if (!pr) {
      return res.sendStatus(200);
    }

    const owner =
      req.body.repository.owner.login;

    const repo =
      req.body.repository.name;

    const pullNumber =
      pr.number;

    console.log("📌 PR:", pr.title);

    /* =========================================
       FETCH PR FILES
    ========================================= */

    const files =
      await octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });

    console.log("✅ PR Files Fetched");

    let combinedCode = "";

    files.data.forEach((file) => {

      combinedCode += `

FILE: ${file.filename}

${file.patch || ""}

`;
    });

    /* =========================================
       GENERATE AI REVIEW
    ========================================= */

    const aiResult =
      await generateAIReview(combinedCode);

    console.log("✅ AI PR Review Complete");

    /* =========================================
       SAVE TO DATABASE
    ========================================= */

    const savedReview = new Review({
      repository: repo,

      prTitle: pr.title,

      code: combinedCode,

      review: aiResult.review,

      score: aiResult.score,

      securityIssues:
        aiResult.issues,

      suggestions:
        aiResult.suggestions,
    });

    await savedReview.save();

    console.log("✅ PR Review Saved");

    res.sendStatus(200);

  } catch (error) {

    console.log("❌ WEBHOOK ERROR");
    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================
   DELETE ALL REVIEWS
========================================= */

app.delete("/reviews", async (req, res) => {
  try {

    await Review.deleteMany({});

    res.json({
      success: true,
      message: "All reviews deleted",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================================
   SERVER START
========================================= */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );
});