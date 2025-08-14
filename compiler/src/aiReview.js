import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const aiReview = async (content, language) => {
    try {
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Consider yourself as a code reviewer. Review this ${language} code:
                        ${content}
                        Please provide a comprehensive code review in markdown format. Structure your response as follows:
                        ## Overall Assessment
                        Brief summary of code quality
                        ## Strengths
                        - Use bullet points for positive aspects
                        - Each point should be clear and specific
                        ## Issues Found
                        - Use bullet points for problems
                        - Include severity level (**Critical**/**Major**/**Minor**)
                        ## Specific Recommendations
                        1. Use numbered lists for actionable improvements
                        2. Include \`code examples\` when helpful
                        3. Explain the reasoning behind each suggestion
                        ## Best Practices
                        - Additional tips for improvement
                        - Industry standards to follow
                        Use proper markdown formatting with:
                        - **Bold** for emphasis  
                        - \`inline code\` for code snippets  
                        - \`\`\`\${language} blocks for code examples  
                        - > Blockquotes for important notes
                        Keep bullet points concise but informative.
                        just provide the review without any additional text or explanations.`;
        
        const response = await model.generateContent(prompt);
        return {
            success: true,
            review: response.response.text()
        };
    } catch (error) {
        console.error('Error during AI review:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export default aiReview;
