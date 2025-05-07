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

1. Security issues or vulnerabilities
2. Performance improvement suggestions
3. Best practices recommendations
4. Code organization and readability
5. Potential bugs or edge cases

CODE TO REVIEW:
\`\`\`
${code}
\`\`\`

Format your response in Markdown with the following requirements:
- Use clear headings for each section
- Add at least one blank line between each point or recommendation
- Use bullet points for individual items
- Include code examples where relevant
- Be specific and actionable in your feedback

Your response should be well-formatted with proper spacing between sections and points.
`;

    // Call the Gemini API with the correct URL format
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

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error during code review:", error);
    return NextResponse.json(
      { error: "Failed to process code review request" },
      { status: 500 }
    );
  }
} 