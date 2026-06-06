const globalForMockDb = global as unknown as {
  _mockDb: {
    users: Record<string, any>;
    videos: Record<string, any>;
    analysis: Record<string, any>;
    frames: Record<string, any[]>;
  };
};

if (!globalForMockDb._mockDb) {
  globalForMockDb._mockDb = {
    users: {
      "mock-user-id": {
        uid: "mock-user-id",
        name: "Demo User",
        email: "demo@viddy.ai",
        createdAt: new Date().toISOString(),
        credits: 50,
      },
    },
    videos: {},
    analysis: {},
    frames: {},
  };
}

export const mockDb = globalForMockDb._mockDb;
