// Local NLP Engine implementation for completely offline skill extraction

export class OfflineNLP {
    // 1. Keyword Extractor Tool (Rule-based NLP)
    static extractSkills(description: string): string[] {
        const text = description.toLowerCase();
        const techStack = [
            "react", "nextjs", "python", "fastapi", "node.js",
            "mongodb", "postgresql", "docker", "aws", "kubernetes",
            "machine learning", "ai", "nlp", "llm", "css", "html"
        ];

        return techStack.filter(skill => text.includes(skill));
    }

    // 2. City/Domain Filtering Engine
    static createSearchFilter(query: string) {
        let qs = query.toLowerCase();
        const locations = ["remote", "new york", "san francisco", "india", "london", "berlin", "delhi", "mumbai", "bangalore", "pune", "hyderabad"];
        const domains = ["frontend", "backend", "fullstack", "data science", "data scientist", "devops", "machine learning", "ai engineer"];

        const locFilter = locations.find(loc => qs.includes(loc));
        const domFilter = domains.find(dom => qs.includes(dom));

        return {
            location: locFilter,
            domain: domFilter
        };
    }

    // 3. Matching Score between User Profile and Internships
    static calculateMatchScore(userSkills: string[], internshipSkills: string[]): number {
        if (internshipSkills.length === 0) return 0;

        let matchCount = 0;
        const normalizedUserSkills = userSkills.map(s => s.toLowerCase());

        for (const skill of internshipSkills) {
            if (normalizedUserSkills.includes(skill.toLowerCase())) {
                matchCount++;
            }
        }

        // Confidence percentage 0-100
        return Math.min(Math.round((matchCount / internshipSkills.length) * 100), 100);
    }
}

// 4. Deterministic planning layer (Agent Flow Logic)
export class AgentController {
    static parseUserIntent(message: string) {
        const msg = message.toLowerCase();

        if (msg.includes("internship") || msg.includes("job") || msg.includes("work") || msg.includes("hiring") || msg.includes("opportunity")) {
            return {
                mode: "INTERNSHIP_SEARCH",
                params: OfflineNLP.createSearchFilter(msg)
            };
        }

        if (msg.includes("summarize") || msg.includes("tldr")) {
            return { mode: "SUMMARIZATION", params: null };
        }

        return { mode: "GENERAL_CHAT", params: null };
    }
}
