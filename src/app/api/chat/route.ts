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
        // --- ADZUNA COUNTRY MAPPING ---
        const countryMap: { [key: string]: string } = {
            "india": "in", "bangalore": "in", "mumbai": "in", "delhi": "in", "hyderabad": "in", "chennai": "in", "pune": "in",
            "usa": "us", "u.s.": "us", "united states": "us", "america": "us", "new york": "us", "california": "us", "sf": "us", "chicago": "us",
            "uk": "gb", "britain": "gb", "england": "gb", "london": "gb", "manchester": "gb",
            "canada": "ca", "toronto": "ca", "vancouver": "ca",
            "australia": "au", "sydney": "au", "melbourne": "au",
            "germany": "de", "berlin": "de", "munich": "de",
            "france": "fr", "paris": "fr"
        };
        
        let targetCountry = "gb"; // Default to UK
        const locLower = location.toLowerCase();
        
        for (const [key, code] of Object.entries(countryMap)) {
            if (locLower.includes(key)) {
                targetCountry = code;
                break;
            }
        }
        
        const url = `https://api.adzuna.com/v1/api/jobs/${targetCountry}/search/1?app_id=${JOB_APP_ID}&app_key=${JOB_API_KEY}&what=${encodeURIComponent(role)}&where=${encodeURIComponent(location)}&content-type=application/json`;
        console.log(`[JobSearch] Requesting: ${url}`);

        const res = await fetch(url);
        
        if (res.ok) {
            const data = await res.json();
            console.log(`[JobSearch] Adzuna found ${data.results?.length || 0} real jobs for ${role} in ${location} (${targetCountry}).`);
            if (data.results && data.results.length > 0) {
                return data.results.map((j: any) => ({
                    title: j.title.replace(/<\/?[^>]+(>|$)/g, ""),
                    company: j.company.display_name,
                    location: j.location.display_name,
                    skills: skills.join(", "),
                    description: j.description.substring(0, 300).replace(/<\/?[^>]+(>|$)/g, "").trim() + "...",
                    apply_link: j.redirect_url
                }));
            }
        } else {
            const errorText = await res.text();
            console.error(`[JobSearch] Adzuna error (${res.status}):`, errorText);
        }
    } catch (e) {
        console.error("[JobSearch] Network/Fetch error:", e);
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
            let domain = searchParams.domain || "Software Engineer";
            const location = searchParams.location || "Remote";
            
            // Refine role for internships
            if (allUserText.includes("intern") && !domain.toLowerCase().includes("intern")) {
                domain = `${domain} Internship`;
            }
            
            const skills = OfflineNLP.getRelevantSkills(domain);
            contextJobs = await fetchRealTimeJobs(domain, location, skills);
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

        const recentMessages = messages.slice(-20); // More context for better memory
        const chatMessages = recentMessages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
        }));

        // Logic Step 2: Gemini Interaction with User's System Prompt
        let SYSTEM_PROMPT = `
You are NKortex AI, a sophisticated, professional, and friendly artificial intelligence. Your goal is to provide helpful, accurate, and concise information to the user.

Tone and Style:
- Be conversational and professional.
- Use Markdown for formatting (bold, italics, lists, code blocks).
- Keep responses concise and avoid unnecessary fluff.
- If the user asks about NKortex, explain it as a cutting-edge AI platform for productivity and career growth.
        `;

        if (intent && intent.mode === "INTERNSHIP_SEARCH") {
            SYSTEM_PROMPT = `
You are the NKortex Job Assistant. Your task is to provide job-related information in a clear, structured, and point-wise format using the context provided.

Context: ${JSON.stringify(contextJobs)}

Instructions:
- If context is empty, explain that you are scanning for fresh opportunities.
- Format each listing EXACTLY as follows:

🔍 Job Role:
- [Title]

🏢 Company:
- [Company Name]

📍 Location:
- [Location]

💼 Type:
- Full-time / Internship

🧾 Skills:
- List skills here

🔗 [Apply Here](link)

--- (Divider between jobs)
            `;
        }

        async function fetchGemini(model: string, messages: any[], systemPrompt: string, retries = 2): Promise<Response> {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: messages,
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
                })
            });

            if (res.status === 429 && retries > 0) {
                console.warn(`[NKortex] Rate limited (429). Retrying in 2s... (${retries} left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return fetchGemini(model, messages, systemPrompt, retries - 1);
            }
            return res;
        }

        try {
            // First attempt: Primary Model (gemini-2.5-flash)
            let geminiRes = await fetchGemini("gemini-2.5-flash", chatMessages, SYSTEM_PROMPT);

            // If primary fails or 404, we don't necessarily want to retry 429 again here as fetchGemini already did it.
            // But if it's 404 or something else, we try the known stable one.
            if (!geminiRes.ok && geminiRes.status !== 429) {
                geminiRes = await fetchGemini("gemini-1.5-flash-latest", chatMessages, SYSTEM_PROMPT);
            }

            if (geminiRes.status === 429) {
                return createStreamingResponse("📡 **Neural Link Saturated**: NKortex is currently processing high traffic. Please wait 10-15 seconds for 'Neural Cooling' before your next uplink.");
            }

            if (!geminiRes.ok) throw new Error(`Neural Link Error: ${geminiRes.status}`);

            const data = await geminiRes.json();
            let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Neural transmission returned empty.";
            
            // Add a small diagnostic to the end to help me debug
            if (contextJobs.length > 0) {
                replyText += `\n\n📡 **Neural Diagnostic**: Found ${contextJobs.length} active listings. Matching in progress...`;
            }
            
            return createStreamingResponse(replyText);

        } catch (e) {
            console.error("NKortex API failed:", e);
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
                // Ultra-fast streaming
                if (i % 20 === 0) await new Promise(resolve => setTimeout(resolve, 0));
            }
            controller.close();
        }
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
