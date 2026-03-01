export interface LectionaryEntry {
    season?: string;
    week?: string;
    day?: string;
    title?: string;
    citation: string;
    psalms: {
        morning: string[];
        evening: string[];
    };
    lessons: {
        morning: string;
        evening: string;
        first?: string;
        second?: string;
        gospel?: string; // Sometimes they differ, we need to inspect the data structure closer
        morning_gospel?: string; // Possible field
        evening_gospel?: string; // Possible field
    };
}

// We will refine this after inspecting the downloaded JSON
export type LectionaryData = LectionaryEntry[];
