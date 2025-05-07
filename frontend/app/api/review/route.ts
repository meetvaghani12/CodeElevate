import { NextRequest, NextResponse } from "next/server";

// You should store this in an environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY";

// Update with correct model name
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = "gemini-1.5-flash"; // Updated to use the correct model name

export async function POST(request: NextRequest) {
  try {
    const { code, fileName } = await request.json();
    
    if (!code || code.trim() === "") {
      return NextResponse.json(
        { error: "No code provided" },
        { status: 400 }
      );
    }

    // Prepare the prompt for Gemini
    const prompt = `
You are an expert code reviewer. Please review the following ${fileName ? `file (${fileName})` : 'code'} and provide detailed feedback including:

1. First, provide a score out of 100 for the code quality, followed by a brief explanation of the score.
2. Count and list the total number of issues found (security, performance, best practices, bugs, etc.)
3. Security issues or vulnerabilities
4. Performance improvement suggestions
5. Best practices recommendations
6. Code organization and readability
7. Potential bugs or edge cases
8. In Which Language is the code written?

CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

Format your response in Markdown with the following requirements:
- Start with a "Score: X/100" heading, followed by a brief explanation
- Include a "Total Issues Found: X" heading right after the score
- Use clear headings for each section
- Add at least one blank line between each point or recommendation
- Use bullet points for individual items
- Include code examples where relevant
- Be specific and actionable in your feedback

Your response should be well-formatted with proper spacing between sections and points.
`;

    // Call the Gemini API
    const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      }),
    });

    const data = await response.json();
    
    // Check for errors in the API response
    if (data.error) {
      console.error("Gemini API error:", data.error);
      return NextResponse.json(
        { error: "Failed to get code review from Gemini: " + data.error.message },
        { status: 500 }
      );
    }

    // Extract the review content
    const review = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "No review generated. Please try again.";

    // Extract score and issues count from the review
    const scoreMatch = review.match(/Score:\s*(\d+)\/100/i);
    const issuesMatch = review.match(/Total Issues Found:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
    const issuesCount = issuesMatch ? parseInt(issuesMatch[1]) : null;

    return NextResponse.json({ review, score, issuesCount });
  } catch (error) {
    console.error("Error during code review:", error);
    return NextResponse.json(
      { error: "Failed to process code review request" },
      { status: 500 }
    );
  }
} 