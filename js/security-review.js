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

  console.log("Diff length:", diff.length);

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a senior security engineer. Review the following code diff for security vulnerabilities:\n\n${diff}`
          }
        ]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
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
