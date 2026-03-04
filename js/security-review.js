const { execSync } = require("child_process");
const axios = require("axios");

async function runSecurityReview() {
  console.log("==== SECURITY REVIEW START ====");

  console.log("Event:", process.env.GITHUB_EVENT_NAME);
  console.log("Base Ref:", process.env.GITHUB_BASE_REF);
  console.log("API KEY exists:", !!process.env.OPENAI_API_KEY);

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
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a senior security engineer."
          },
          {
            role: "user",
            content: `Review this code diff for security vulnerabilities:\n\n${diff}`
          }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("==== SECURITY REVIEW RESULT ====");
    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.log("❌ OpenAI API Error:");
    if (error.response) {
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

runSecurityReview();
