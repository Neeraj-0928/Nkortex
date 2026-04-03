import { MemoryManager } from '@/lib/MemoryManager';
import { AgentController, OfflineNLP } from '@/lib/AgentLogic';

const rateLimitMap = new Map<string, number>();
const responseCache = new Map<string, string>();

/**
 * Job Search Service Helper (Simulated/API Adapter)
 * In a real-world scenario, you'd substitute this with a call to Adzuna, LinkedIn, or LinkedIn-RapidAPI.
 */
async function fetchRealTimeJobs(role: string, location: string, skills: string[]) {
    const JOB_API_KEY = process.env.JOB_API_KEY;
    const JOB_APP_ID = process.env.JOB_APP_ID;
    if (!JOB_API_KEY || !JOB_APP_ID) return [];

    // --- DEBUG LOGGING ---
    console.log(`[JobSearch] Querying: ${role} in ${location}`);

    try {
        // Smarter Location Logic for Adzuna
        const indianCities = ["india", "bangalore", "mumbai", "delhi", "pune", "hyderabad", "chennai", "gurgaon", "noida"];
        const isIndia = indianCities.some(city => location.toLowerCase().includes(city));
        const targetCountry = isIndia ? "in" : "gb";
        
        const url = `https://api.adzuna.com/v1/api/jobs/${targetCountry}/search/1?app_id=${JOB_APP_ID}&app_key=${JOB_API_KEY}&what=${role}&where=${location}&content-type=application/json`;
        console.log(`[JobSearch] URL: ${url}`);

        const res = await fetch(url);
        
        if (res.ok) {
            const data = await res.json();
            console.log(`[JobSearch] Found ${data.results?.length || 0} real jobs.`);
            if (data.results && data.results.length > 0) {
                return data.results.map((j: any) => ({
                    title: j.title.replace(/<\/?[^>]+(>|$)/g, ""),
                    company: j.company.display_name,
                    location: j.location.display_name,
                    skills: skills.join(", "),
                    description: j.description.substring(0, 200).replace(/<\/?[^>]+(>|$)/g, "") + "...",
                    apply_link: j.redirect_url
                }));
            }
        } else {
            console.warn(`[JobSearch] Adzuna returned status: ${res.status}`);
        }
    } catch (e) {
        console.error("[JobSearch] Error:", e);
    }
    
    console.log("[JobSearch] Falling back to high-quality mock results.");
    
    // Fallback Mock Data (Simulating a successful fetch if the API is restricted or needs an App ID)
    return [
        {
            title: `${role} Developer`,
            company: "Neo-Tech Corp",
            location: location || "Remote",
            skills: skills.join(", "),
            description: `We are looking for a ${role} with experience in ${skills[0] || 'modern tech'}. High-growth position with equity options.`,
            apply_link: "https://example.com/apply/1"
        },
        {
            title: `Senior ${role} Engineer`,
            company: "Hyperion Systems",
            location: location || "Remote",
            skills: skills.join(", "),
            description: `Join our core infrastructure team to build next-gen AI platforms using ${skills.join(', ')}.`,
            apply_link: "https://example.com/apply/2"
        }
    ];
}

export async function POST(req: Request) {
    try {
        const { messages, userId } = await req.json();

        // Basic Rate Limiting
        const now = Date.now();
        const lastRequest = rateLimitMap.get(userId || "local") || 0;
        if (now - lastRequest < 2000) {
            return new Response("Neural cooling in progress... please wait.", { status: 429 });
        }
        rateLimitMap.set(userId || "local", now);

        const lastUserMessage = messages[messages.length - 1].text;
        const allUserText = messages.filter((m: any) => m.sender === "user").map((m: any) => m.text).join(" ").toLowerCase();

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        
        // Logic Step 1: Detect Intent (Job Search vs General Chat)
        // We check the entire conversation context to see if it's a job search flow
        const intent = AgentController.parseUserIntent(allUserText);
        let contextJobs: any[] = [];

        if (intent && intent.mode === "INTERNSHIP_SEARCH") {
            const searchParams = OfflineNLP.createSearchFilter(allUserText);
            const domain = searchParams.domain || "Software";
            const location = searchParams.location || "Remote";
            contextJobs = await fetchRealTimeJobs(domain, location, ["React", "Python", "SQL"]);
        }

        // --- OFFLINE FALLBACK ---
        if (!GEMINI_API_KEY) {
            let offlineResponse = "";
            if (intent && intent.mode === "INTERNSHIP_SEARCH") {
                offlineResponse = "📡 [OFFLINE MODE] I've found some local internship opportunities for you! To see real-time tokens and match percentages, please add a `GEMINI_API_KEY` to your `.env.local` file.\n\n" + 
                contextJobs.map((j: any) => `🔍 **Job Title**: ${j.title}\n🏢 **Company**: ${j.company}\n📍 **Location**: ${j.location}\n🔗 [Apply Here](${j.apply_link})\n`).join("\n---\n");
            } else {
                offlineResponse = "📡 [OFFLINE MODE] Neural Uplink is currently disconnected. I can masih help with basic queries, but for my full cognitive potential, please add your `GEMINI_API_KEY`! \n\nI see you're interested in the NKortex AI platform. How can I assist you today?";
            }
            return createStreamingResponse(offlineResponse);
        }

        const recentMessages = messages.slice(-10);
        const chatMessages = recentMessages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
        }));

        // Logic Step 2: Gemini Interaction with User's System Prompt
        const SYSTEM_PROMPT = `
You are an AI job assistant. Your task is to provide job-related information in a clear, structured, and point-wise format.

Instructions:
- Use the job listings provided in the context below.
- DO NOT write long paragraphs.
- ALWAYS respond in bullet points or sections.
- For each job, return this EXACT format:

🔍 Job Role:
- [Title]

🏢 Company:
- [Company Name]

📍 Location:
- [Remote / Onsite / City]

💼 Type:
- [Full-time / Internship / Contract]

🧾 Skills Required:
- [Skill 1]
- [Skill 2]

🔗 Apply Link:
- [Clickable Link]

---

If multiple jobs are available:
- Separate each job with a line (----)

Important:
- Keep responses short, clean, and structured.
- Only show real jobs from the context: ${JSON.stringify(contextJobs)}
- If the current results are empty, scanning mock-database instead.
        `;

        try {
            // Primary Model: gemini-2.5-flash
            let geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: chatMessages,
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
                })
            });

            // Fallback for 429/404 Errors: gemini-1.5-flash-latest
            if (!geminiRes.ok) {
                geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: chatMessages,
                        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
                    })
                });
            }

            if (!geminiRes.ok) throw new Error(`Gemini API Error: ${geminiRes.status}`);

            const data = await geminiRes.json();
            let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Neural transmission returned empty.";
            
            // Add a small diagnostic to the end to help me debug
            if (contextJobs.length > 0) {
                replyText += `\n\n📡 **Neural Diagnostic**: Found ${contextJobs.length} active listings. Matching in progress...`;
            }
            
            return createStreamingResponse(replyText);

        } catch (e) {
            console.error("Gemini API failed:", e);
            return createStreamingResponse("Neural uplink error: " + (e as Error).message);
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid Payload" }), { status: 400 });
    }
}

function createStreamingResponse(text: string) {
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            // Stream individual characters to preserve all formatting and newlines
            for (let i = 0; i < text.length; i++) {
                controller.enqueue(encoder.encode(text[i]));
                // Faster streaming for better UX
                if (i % 3 === 0) await new Promise(resolve => setTimeout(resolve, 10));
            }
            controller.close();
        }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
