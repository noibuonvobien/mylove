const fs = require("fs");
const { execSync } = require("child_process");
const axios = require("axios");

const apiKey = process.env.ANTHROPIC_API_KEY;

// Lấy git diff của PR
const diff = execSync("git diff origin/main").toString();

async function runReview() {
  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: "claude-3-5-sonnet-20241022",
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
}

runReview();
