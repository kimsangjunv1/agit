export type CheerUpPayload = {
    postId: number;
    batchId: string;
    count: number;
    userId: string;
    knownBatchIds?: string[];
};

export type CheerUpResult = {
    batchId: string;
    likes: number;
    applied: boolean;
    acknowledgedBatchIds: string[];
};

export type CheerUpState = {
    likes: number;
    acknowledgedBatchIds: string[];
};
