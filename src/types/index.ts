export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  credits: number;
}

export interface Video {
  id: string;
  userId: string;
  title: string;
  sourceUrl: string;
  duration: number; // in seconds
  createdAt: string;
  status: "processing" | "completed" | "failed";
  thumbnailUrl?: string;
}

export interface KeyPoint {
  timestamp: number; // in seconds
  label: string;
  description: string;
  imageUrl?: string;
}

export interface Chapter {
  timestamp: number; // in seconds
  label: string;
}

export interface ExtractedUrl {
  url: string;
  label: string;
  timestamp?: number;
}

export interface Entity {
  name: string;
  type: "person" | "company" | "product" | "location" | "technology";
  count: number;
}

export interface TimelineItem {
  timestamp: number;
  summary: string;
  imageUrl?: string;
  insight?: string;
}

export interface SentimentHistoryItem {
  timestamp: number;
  sentiment: "positive" | "neutral" | "negative";
  score: number; // 0 to 100
}

export interface SentimentData {
  positive: number; // percentage
  neutral: number;
  negative: number;
  history: SentimentHistoryItem[];
}

export interface DiagramNode {
  id: string;
  label: string;
  timestamp: number;
  type: "problem" | "process" | "solution" | "outcome";
}

export interface DiagramConnection {
  from: string;
  to: string;
}

export interface DiagramData {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
}

export interface TranscriptSegment {
  text: string;
  start: number; // in seconds
  duration: number; // in seconds
}

export interface VideoAnalysis {
  id: string;
  videoId: string;
  summary: string; // Executive summary
  detailedSummary: string; // In-depth analysis markdown
  keyPoints: KeyPoint[];
  chapters: Chapter[];
  urls: ExtractedUrl[];
  entities: Entity[];
  timeline: TimelineItem[];
  sentiment: SentimentData;
  diagramData: DiagramData;
  transcript: TranscriptSegment[];
}

export interface KeyFrame {
  id: string;
  videoId: string;
  timestamp: number;
  imageUrl: string;
  description: string;
  score: number; // 0 to 100
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface VPSProcessResponse {
  title: string;
  duration: number;
  summary: string;
  inDepthAnalysis: string;
  keyPoints: {
    timestamp: number;
    label: string;
    description: string;
    imageUrl: string;
  }[];
  diagramData: {
    nodes: { id: string; label: string; timestamp: number; type: string }[];
    connections: { from: string; to: string }[];
  };
  transcript: TranscriptSegment[];
}
