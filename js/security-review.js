const { execSync } = require("child_process");
const axios = require("axios");

async function runSecurityReview() {
  console.log("==== SECURITY REVIEW START ====");

  console.log("Event:", process.env.GITHUB_EVENT_NAME);
  console.log("Base Ref:", process.env.GITHUB_BASE_REF);
  console.log("API KEY exists:", !!process.env.ANTHROPIC_API_KEY);

  let diff = "";

  try {
    if (process.env.GITHUB_EVENT_NAME === "pull_request") {
      console.log("Running PR diff...");
      diff = execSync(
        `git diff origin/${process.env.GITHUB_BASE_REF}...HEAD`
      ).toString();
    } else {
      console.log("Running push diff...");
      diff = execSync("git diff HEAD^ HEAD").toString();
    }
  } catch (err) {
    console.log("⚠ Could not compute diff:", err.message);
  }

  if (!diff.trim()) {
    console.log("No changes detected.");
    process.exit(0);
  }

  // 🔒 Giới hạn kích thước diff để tránh vượt token
  const MAX_DIFF_CHARS = 12000; // ~3-4k tokens input
  if (diff.length > MAX_DIFF_CHARS) {
    console.log("Diff too large, truncating...");
    diff = diff.slice(0, MAX_DIFF_CHARS);
  }

  console.log("Final diff length:", diff.length);

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,           // 🔒 giới hạn output token
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: `You are a senior security engineer.
Review the following git diff for security vulnerabilities.
Only report:
- Critical
- High
- Medium

Be concise and structured.

${diff}`
          }
        ]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        timeout: 30000
      }
    );

    console.log("==== SECURITY REVIEW RESULT ====");
    console.log(response.data.content[0].text);

  } catch (error) {
    console.log("❌ Claude API Error:");
    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

runSecurityReview();
