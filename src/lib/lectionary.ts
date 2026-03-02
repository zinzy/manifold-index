import { getLiturgicalDay } from './liturgy';
import year1 from '../data/dol-year-1.json';
import year2 from '../data/dol-year-2.json';

export interface LectionaryEntry {
    year: string;
    season: string;
    week: string;
    day: string;
    title?: string;
    psalms: {
        morning: string[];
        evening: string[];
    };
    lessons: {
        first?: string;
        second?: string;
        gospel?: string;
        morning?: string;
        evening?: string;
    };
}

export function getDailyReadings(date: Date): { title?: string, day: string, week: string, psalms: string[], lessons: string[] } {
    const litDay = getLiturgicalDay(date);

    const data = litDay.year === 'Year One' ? year1 : year2;

    const entry = (data as LectionaryEntry[]).find((d) =>
        d.season === litDay.season &&
        d.week === litDay.week &&
        d.day === litDay.day
    );

    if (!entry) {
        return { day: litDay.day, week: litDay.week, psalms: [], lessons: [] };
    }

    const { psalms, lessons } = entry;

    const allPsalms = [
        ...(psalms?.morning || []),
        ...(psalms?.evening || [])
    ].map(p => `Psalm ${p}`);

    const allLessons = Object.values(lessons || {}).filter(Boolean) as string[];

    return {
        title: entry.title,
        day: litDay.day,
        week: litDay.week,
        psalms: allPsalms,
        lessons: allLessons
    };
}
