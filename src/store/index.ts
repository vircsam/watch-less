import { create } from "zustand";
import { UserProfile, Video } from "@/types";

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  videos: Video[];
  
  setUser: (user: UserProfile | null) => void;
  setCredits: (credits: number) => void;
  setVideos: (videos: Video[]) => void;
  addVideo: (video: Video) => void;
  setIsLoading: (isLoading: boolean) => void;
  
  fetchProfile: (uid: string, name?: string, email?: string) => Promise<UserProfile>;
  fetchVideos: (uid: string) => Promise<Video[]>;
  loginMockUser: () => Promise<UserProfile>;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  videos: [],

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCredits: (credits) => set((state) => ({
    user: state.user ? { ...state.user, credits } : null
  })),
  setVideos: (videos) => set({ videos }),
  addVideo: (video) => set((state) => ({ videos: [video, ...state.videos] })),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchProfile: async (uid, name, email) => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name, email }),
      });
      if (!res.ok) throw new Error("Failed to sync profile");
      
      const profile = (await res.json()) as UserProfile;
      set({ user: profile, isAuthenticated: true, isLoading: false });
      return profile;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchVideos: async (uid) => {
    try {
      const res = await fetch(`/api/videos?userId=${uid}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      const list = (await res.json()) as Video[];
      set({ videos: list });
      return list;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  loginMockUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: "mock-user-id",
          name: "Demo User",
          email: "demo@viddy.ai",
        }),
      });
      const profile = (await res.json()) as UserProfile;
      set({ user: profile, isAuthenticated: true, isLoading: false });
      // Fetch user videos
      const videosRes = await fetch(`/api/videos?userId=${profile.uid}`);
      if (videosRes.ok) {
        const list = await videosRes.json();
        set({ videos: list });
      }
      return profile;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, videos: [] });
  },
}));
