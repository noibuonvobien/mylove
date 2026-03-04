const { execSync } = require("child_process");
const axios = require("axios");

const apiKey = process.env.ANTHROPIC_API_KEY;

async function runReview() {
  try {
    let diff = "";

    try {
      diff = execSync(
        `git diff origin/${process.env.GITHUB_BASE_REF}...HEAD`
      ).toString();
    } catch {
      diff = execSync("git diff HEAD").toString();
    }

    if (!diff) {
      console.log("No changes detected.");
      return;
    }

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Review the following code changes for security vulnerabilities:\n\n${diff}`,
          },
        ],
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    console.log(response.data.content[0].text);
  } catch (error) {
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

runReview();
