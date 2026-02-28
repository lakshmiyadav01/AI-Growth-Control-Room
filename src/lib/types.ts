export interface HookScore {
  retention: number;
  emotion: number;
  curiosity: number;
  impact: number;
  overall: number;
}

export interface VideoScene {
  scene: number;
  visual: string;
  camera: string;
  lighting: string;
  duration: string;
}

export interface VideoConcept {
  scenes: VideoScene[];
  overlayText: string;
  ctaEnding: string;
}

export interface Campaign {
  id: string; // Unique identifier (UUID or timestamp based)
  topic: string; // The prompt used to generate this
  platform?: string;
  targetAudience?: string;
  tone?: string;
  primaryHook: string;
  cinematicReelScript: string;
  instagramCaption?: string;
  linkedInCaption?: string;
  youtubeCaption?: string;
  twitterCaption?: string;
  hashtags: string[];
  cta: string;
  engagementPredictionScore: number;
  contentStrategyAdvice: string;
  hookIntelligence: HookScore;
  videoStoryboard: VideoConcept;
  createdAt: number;
}
