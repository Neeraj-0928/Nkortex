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
        const locations = [
            "remote", "new york", "san francisco", "california", "london", "berlin", "delhi", "mumbai", "bangalore", 
            "pune", "hyderabad", "chennai", "toronto", "vancouver", "sydney", "melbourne", "usa", "uk", "india", "canada", "germany"
        ];
        const domains = [
            "frontend", "backend", "fullstack", "data science", "data scientist", "devops", "machine learning", 
            "ai engineer", "software engineer", "intern", "internship", "react", "python", "java", "javascript", "cloud",
            "academic", "teaching", "researcher", "professor", "scholarship", "tutor", "education", "scientist"
        ];

        let locFilter = locations.find(loc => qs.includes(loc));
        let domFilter = domains.find(dom => qs.includes(dom));

        // Attempt to extract the "what" part if no domain match found
        if (!domFilter) {
            const jobMatch = qs.match(/(?:find|search|for)\s+(?:a|an)?\s*([^in|at|near|location]+)/);
            if (jobMatch) domFilter = jobMatch[1].trim();
        }

        return {
            location: locFilter || "Global",
            domain: domFilter || "Software Engineer"
        };
    }

    // 2.5. Dynamic Skill Generator
    static getRelevantSkills(domain: string): string[] {
        const d = domain.toLowerCase();
        if (d.includes("academic") || d.includes("research") || d.includes("professor") || d.includes("scholarship")) {
            return ["Research", "Teaching", "Publication", "Grant Writing", "Academia", "Analysis"];
        }
        if (d.includes("data scientist") || d.includes("machine learning") || d.includes("ai")) {
            return ["Python", "PyTorch", "NLP", "Scikit-Learn", "Analytical Modeling", "SQL"];
        }
        if (d.includes("frontend") || d.includes("react")) {
            return ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion", "UI/UX"];
        }
        if (d.includes("backend") || d.includes("node")) {
            return ["Node.js", "PostgreSQL", "Docker", "Redis", "Rest API", "System Architecture"];
        }
        return ["React", "Python", "Problem Solving", "Communication", "Teamwork", "Agility"];
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

        if (msg.includes("internship") || msg.includes("job") || msg.includes("work") || msg.includes("hiring") || msg.includes("opportunity") || msg.includes("academic") || msg.includes("scholarship") || msg.includes("research")) {
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
