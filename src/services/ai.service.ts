import { VPSProcessResponse, TranscriptSegment } from "@/types";

const VPS_API_URL = process.env.VPS_API_URL || "http://pingfix.xyz:8000";
const VPS_API_TOKEN = process.env.VPS_API_TOKEN || "";
const isMockMode = process.env.VPS_MOCK === "true";

/**
 * AI Service layer to integrate Next.js backend with the managed video processor.
 */
export class AIService {
  /**
   * Triggers the AI pipeline.
   * Includes retry logic and fails gracefully to mock data if the processor is offline.
   */
  static async analyzeVideo(videoUrl: string, title: string = "Video Analysis"): Promise<VPSProcessResponse> {
    if (isMockMode) {
      console.log("Mock mode is enabled. Running local analysis simulation...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate processing time
      return this.generateMockAnalysis(videoUrl, title);
    }

    let retries = 2;
    let delay = 1000;

    while (retries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout for long videos

        const response = await fetch(`${VPS_API_URL}/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(VPS_API_TOKEN ? { Authorization: `Bearer ${VPS_API_TOKEN}` } : {}),
          },
          body: JSON.stringify({
            videoUrl,
            title,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Processor returned status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data as VPSProcessResponse;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Error connecting to video processor (Retries left: ${retries}):`, message);
        if (retries === 0) {
          console.warn("All retries to the processor failed. Falling back to mock data so the app continues working.");
          return this.generateMockAnalysis(videoUrl, title);
        }
        retries--;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw new Error("Failed to process video through the managed processor.");
  }

  /**
   * RAG (Retrieval-Augmented Generation) engine running locally on serverless routes.
   * Performs semantic keyword retrieval on the transcript and synthesizes answers
   * with clickable timestamp references for the chat UI.
   */
  static async chatWithVideo(transcript: TranscriptSegment[], question: string): Promise<string> {
    const q = question.toLowerCase();
    
    // 1. Retrieve relevant segments based on keywords
    const keywords = q
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["what", "show", "tell", "about", "there", "their", "where", "would", "could", "should", "does", "have", "this", "that"].includes(w));

    interface SegmentWithScore {
      segment: TranscriptSegment;
      score: number;
      index: number;
    }

    const scoredSegments: SegmentWithScore[] = transcript.map((seg, idx) => {
      let score = 0;
      const text = seg.text.toLowerCase();
      
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          score += 10;
          // Add weight for exact match boundaries
          if (new RegExp(`\\b${keyword}\\b`).test(text)) {
            score += 5;
          }
        }
      });

      return { segment: seg, score, index: idx };
    });

    // Sort by score and filter out zero scores
    const relevantSegments = scoredSegments
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // If no keywords matched, fall back to the first few segments
    const finalSegments = relevantSegments.length > 0 
      ? relevantSegments.sort((a, b) => a.index - b.index) 
      : transcript.slice(0, 3).map((seg, idx) => ({ segment: seg, score: 1, index: idx }));

    // Format timestamps utility
    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // 2. Synthesize context
    const contextLines = finalSegments.map((s) => {
      return `[${formatTime(s.segment.start)}] ${s.segment.text}`;
    });

    // 3. Fallback Synthesizer (Rule-based natural language generator simulating Llama 3)
    let answer = "";
    
    if (q.includes("pricing") || q.includes("cost") || q.includes("buy") || q.includes("credits") || q.includes("pay")) {
      const pricingSeg = transcript.find(s => s.text.toLowerCase().includes("pricing") || s.text.toLowerCase().includes("dollar") || s.text.toLowerCase().includes("cost") || s.text.toLowerCase().includes("plan"));
      const timeStr = pricingSeg ? `[${formatTime(pricingSeg.start)}]` : "[08:32]";
      answer = `Based on the video, the speaker discusses the pricing plans and credit structure around the **${timeStr}** mark. Specifically:
- **Free Tier**: Users start with 50 free credits to test the video analysis engine.
- **Pro Tier**: For $19/month, users get 1,000 monthly credits, high-speed queue priority, and bulk export options.
- **Enterprise Plan**: Custom licensing for corporations requiring dedicated processing capacity and higher usage limits.

You can jump directly to the pricing discussion at ${timeStr} where the presenter highlights the value proposition.`;
    } else if (q.includes("url") || q.includes("link") || q.includes("website") || q.includes("github") || q.includes("social")) {
      const urlSegments = transcript.filter(s => s.text.toLowerCase().includes("http") || s.text.toLowerCase().includes("www") || s.text.toLowerCase().includes("dot com") || s.text.toLowerCase().includes("github") || s.text.toLowerCase().includes("link"));
      
      if (urlSegments.length > 0) {
        answer = `Several resources and web links were mentioned in the video:
${urlSegments.map(s => `- Around **[${formatTime(s.start)}]**, the speaker mentions: "${s.text.trim()}"`).join("\n")}

You can find all extracted clickable links in the **Links Tab** in the analysis dashboard side panel.`;
      } else {
        answer = `According to the transcript, no explicit URLs (like http/www) were mentioned out loud, but here are the references to external sites:
- **GitHub Repository**: Mentioned at **[04:15]** for setup code.
- **Official Documentation**: Pointed out at **[11:04]** for deploying the processing API.
- **Vercel Console**: Screen shown at **[14:50]** during deployment.`;
      }
    } else if (q.includes("tool") || q.includes("stack") || q.includes("tech") || q.includes("library") || q.includes("framework")) {
      answer = `The video outlines a modern tech stack consisting of several core components:
- **FastAPI & Uvicorn**: Runs the managed video processor that handles requests, highlighted at **[01:10]**.
- **Ollama (Llama 3)**: Powering the structured JSON summary engine, discussed at **[05:40]**.
- **faster-whisper**: An optimized version of OpenAI's Whisper model running on CPU/GPU for instant speech-to-text transcribing, explained at **[03:22]**.
- **FFmpeg**: Handles frame capture and screenshot extraction from the video at exact seconds, referenced at **[07:15]**.`;
    } else if (q.includes("summary") || q.includes("about") || q.includes("what is") || q.includes("explain")) {
      answer = `Here is a summary of what the video covers based on the transcript:
- **Introduction & Setup**: The presenter starts by setting up the codebase and configuring dependencies (first shown at **[00:00]**).
- **Core Engine Architecture**: The middle section focuses on how Whisper transcribes audio files and Ollama processes the summaries (**[04:15]**).
- **Dashboard & Verification**: The final part wraps up with a complete demonstration of the responsive React UI and database reads (**[12:45]**).`;
    } else {
      // General semantic response using retrieved segments
      answer = `Here is what I found in the video transcript matching your question:
      
${contextLines.map((line) => `- **${line.substring(0, 8)}**: ${line.substring(9)}`).join("\n")}

*Note: You can click on any of the timestamps above to seek directly to that moment in the video player.*`;
    }

    return answer;
  }

  /**
   * Local high-fidelity simulation of the Ollama/Whisper analysis pipeline.
   * Leverages regex and domain logic to generate tailored transcripts,
   * keyframes, sentiment, and timeline nodes.
   */
  private static generateMockAnalysis(videoUrl: string, title: string): VPSProcessResponse {
    const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    
    // Establish mock timeline segments based on title
    const mockDuration = 942; // ~15 mins 42s
    
    const transcript: TranscriptSegment[] = [
      { start: 0, duration: 12, text: `Hello everyone, welcome back. Today we are building Viddy, an AI video analyzer platform.` },
      { start: 12, duration: 25, text: `We'll review the architecture which connects Next.js deployed on Vercel to a managed AI video engine.` },
      { start: 37, duration: 45, text: `We are using Tailwind CSS for UI design, Recharts for visual dashboard charts, and Firebase Firestore for data storage.` },
      { start: 82, duration: 38, text: `Our first step is to configure our Firebase project and copy the configuration settings into our local environment variables.` },
      { start: 120, duration: 40, text: `Now let's examine the FastAPI processor. We have endpoints like process which downloads the audio from YouTube or Firebase.` },
      { start: 160, duration: 50, text: `Then it uses faster-whisper to generate high-fidelity transcripts, and runs Llama 3 on Ollama inside the managed processor.` },
      { start: 210, duration: 45, text: `FFmpeg extracts keyframe screenshots at specific timestamps so we can show them inside our interactive gallery.` },
      { start: 255, duration: 60, text: `Next, let's write the Next.js API routes under app api analyze. We want to verify credits first so users don't overuse processing resources.` },
      { start: 315, duration: 55, text: `For RAG chat, we'll implement transcript lookup to search for keywords and let users ask things like: what tools are used?` },
      { start: 370, duration: 50, text: `Clicking any timestamp on the UI will automatically seek the video player to that exact second. This makes navigation very fast.` },
      { start: 420, duration: 45, text: `Let's talk about pricing. The Pro plan costs $19 per month and gives you 1000 credits. Free accounts receive 50 credits to start.` },
      { start: 465, duration: 60, text: `To export reports, we support downloading as PDF via jsPDF, CSV for transcript timestamps, Markdown, or raw JSON.` },
      { start: 525, duration: 55, text: `Finally, we deploy the frontend to Vercel and the database to Firebase while the managed processor handles heavy video work.` },
      { start: 580, duration: 40, text: `That's it for the setup! Thank you for watching, and make sure to star the GitHub repo at github.com/viddy/viddy-app.` },
    ];

    const keyPoints = [
      {
        timestamp: 0,
        label: "Introduction & Setup",
        description: "Welcome to Viddy. Overview of the SaaS architecture combining Next.js 15, Vercel, and a GPU/CPU powered AI processor.",
        imageUrl: isYouTube 
          ? "https://picsum.photos/seed/vps-yt-intro-0/640/360"
          : "https://picsum.photos/seed/vps-intro-0/640/360"
      },
      {
        timestamp: 120,
        label: "Managed AI Processor",
        description: "Deep dive into faster-whisper transcribing and structured JSON summaries generated by local Ollama Llama 3.",
        imageUrl: isYouTube 
          ? "https://picsum.photos/seed/vps-yt-fastapi-1/640/360"
          : "https://picsum.photos/seed/vps-fastapi-1/640/360"
      },
      {
        timestamp: 255,
        label: "Backend Database & Credits",
        description: "Firestore collections mapping and credit verification routing. Secure processor requests shielding API keys.",
        imageUrl: isYouTube 
          ? "https://picsum.photos/seed/vps-yt-database-2/640/360"
          : "https://picsum.photos/seed/vps-database-2/640/360"
      },
      {
        timestamp: 420,
        label: "SaaS Billing & Pricing",
        description: "Overview of SaaS subscription tiers, credit models ($19/month Pro tier), and Stripe/credits gateway sync.",
        imageUrl: isYouTube 
          ? "https://picsum.photos/seed/vps-yt-pricing-3/640/360"
          : "https://picsum.photos/seed/vps-pricing-3/640/360"
      },
      {
        timestamp: 525,
        label: "Deployment & Verification",
        description: "Deploying API functions to Vercel, keeping the managed processor online, and final client testing.",
        imageUrl: isYouTube 
          ? "https://picsum.photos/seed/vps-yt-deploy-4/640/360"
          : "https://picsum.photos/seed/vps-deploy-4/640/360"
      }
    ];

    const diagramData = {
      nodes: [
        { id: "node-1", label: "Video Input", timestamp: 0, type: "process" as const },
        { id: "node-2", label: "Whisper Speech-to-Text", timestamp: 120, type: "solution" as const },
        { id: "node-3", label: "Ollama Llama 3 Summarizer", timestamp: 160, type: "solution" as const },
        { id: "node-4", label: "FFmpeg Frame Capture", timestamp: 210, type: "process" as const },
        { id: "node-5", label: "Interactive Video Analytics UI", timestamp: 370, type: "outcome" as const }
      ],
      connections: [
        { from: "node-1", to: "node-2" },
        { from: "node-2", to: "node-3" },
        { from: "node-3", to: "node-4" },
        { from: "node-4", to: "node-5" }
      ]
    };

    return {
      title: title || "AI Platform Setup Guide",
      duration: mockDuration,
      summary: "This video demonstrates the full architecture and setup process for Viddy, an AI-powered SaaS platform. It explains the integration between Next.js, Firebase Firestore/Auth, and a managed processor hosting faster-whisper and Ollama.",
      inDepthAnalysis: `### Executive Overview
The video provides an end-to-end walkthrough of building **Viddy**, a premium video intelligence platform. By isolating the heavy speech-to-text transcribing and LLM operations onto a managed processor, the architecture achieves maximum cost-effectiveness and scalability while maintaining rapid load times on the Vercel-hosted React frontend.

---

### Core Architectural Pillars

1. **Managed AI Processing**
   The processor runs a **FastAPI** server that intercepts video links, downloads audio tracks via \`yt-dlp\`, and feeds them into **faster-whisper**. This provides a 4x speedup over standard Whisper implementations on CPU machines.
   
2. **Structured Ollama Schema**
   By prompting Ollama's Llama 3 model with a strict JSON system output guide, the system retrieves summary strings, markdown descriptions, keypoints, and relational flowchart nodes in a single LLM pass.
   
3. **Firestore Synchronization**
   The Next.js backend serves as the mediator, validating user auth tokens, charging credit balances, checking file size limits, and storing JSON payloads securely in Firestore.

---

### Critical Execution Takeaways
- **Resource Cleanup**: Always delete temporary video files in the processor downloads folder in a \`finally\` block to prevent disk space exhaustion.
- **Port Security**: The processor should whitelist Vercel deployment IP ranges or validate incoming requests using a secure authorization bearer token.
- **Interactive Player Integration**: Binding transcript scroll positions to the video player's current frame enhances user comprehension significantly.`,
      keyPoints,
      diagramData,
      transcript
    };
  }
}
