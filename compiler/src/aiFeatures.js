import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const aiFeatureRequest = async (feature, code, language, problemDescription = '', constraints = '') => {
    try {
        let prompt = '';

        switch (feature) {
            case 'Hint':
                prompt = `As a programming mentor, provide helpful hints for solving this coding problem.

Problem Description: ${problemDescription || 'No specific problem provided'}
Constraints: ${constraints || 'No specific constraints provided'}
Current Code (${language}):
${code}

Please provide:
1. **Strategic Hints** - General approach without giving away the complete solution
2. **Key Insights** - Important observations about the problem
3. **Optimization Tips** - Suggestions for improving efficiency
4. **Common Pitfalls** - What to avoid

Format your response in markdown with clear sections. Don't provide the complete solution, just guide the thinking process.`;
                break;

            case 'Feedback':
                prompt = `As a coding mentor, provide constructive feedback on this solution.

Problem Description: ${problemDescription || 'No specific problem provided'}
Constraints: ${constraints || 'No specific constraints provided'}
Student's Code (${language}):
${code}

Please analyze and provide feedback on:
1. **Correctness** - Does the solution address the problem requirements?
2. **Code Quality** - Readability, naming conventions, structure
3. **Efficiency** - Time and space complexity analysis
4. **Best Practices** - Language-specific recommendations
5. **Improvements** - Specific suggestions for enhancement

Be encouraging while providing constructive criticism. Format in markdown.`;
                break;

            case 'Explain':
                prompt = `As a programming educator, explain this code in detail.

Problem Context: ${problemDescription || 'No specific problem provided'}
Constraints: ${constraints || 'No specific constraints provided'}
Code to Explain (${language}):
${code}

Please provide a comprehensive explanation including:
1. **Overview** - What the code does at a high level
2. **Step-by-Step Breakdown** - Line-by-line or block-by-block explanation
3. **Algorithm/Logic** - The underlying approach and reasoning
4. **Data Structures Used** - Why these structures were chosen
5. **Edge Cases** - How the code handles special scenarios

Make it educational and easy to understand. Use markdown formatting with code snippets where helpful.`;
                break;

            case 'Complexity':
                prompt = `As an algorithms expert, analyze the complexity of this code.

Code to Analyze (${language}):
${code}

Please provide a detailed complexity analysis:

## Time Complexity
- **Big O Notation**: Provide the time complexity with justification
- **Best Case**: Analysis of optimal input scenario
- **Average Case**: Typical performance expectation
- **Worst Case**: Analysis of challenging input scenario

## Space Complexity
- **Memory Usage**: Additional space beyond input
- **Auxiliary Space**: Extra variables, data structures
- **Stack Space**: For recursive algorithms

## Optimization Opportunities
- Potential improvements to reduce complexity
- Alternative approaches with better performance
- Trade-offs between time and space

## Scalability Assessment
- How the solution performs with large inputs
- Memory constraints considerations
- Performance bottlenecks identification

Format in markdown with clear mathematical notation where applicable.`;
                break;

            default:
                return {
                    success: false,
                    error: "Unknown AI feature requested"
                };
        }

        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContent(prompt);

        return {
            success: true,
            result: response.response.text()
        };
    } catch (error) {
        console.error('Error during AI feature request:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

export default aiFeatureRequest;
