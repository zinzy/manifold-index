import { format, isAfter, isBefore, startOfDay } from 'date-fns';

export interface LiturgicalDay {
    year: 'Year One' | 'Year Two';
    season: string;
    week: string;
    day: string;
}

export function getLiturgicalDay(date: Date): LiturgicalDay {
    const d = startOfDay(date);
    const dayOfWeek = format(d, 'EEEE');
    const ymd = format(d, 'yyyy-MM-dd');

    // Hardcoded for Spring 2026 for MVP purposes
    let season = 'Lent';
    let week = 'Week of 2 Lent';

    if (ymd >= '2026-02-18' && ymd <= '2026-02-21') {
        week = 'Ash Wednesday and Following';
    } else if (ymd >= '2026-02-22' && ymd <= '2026-02-28') {
        week = 'Week of 1 Lent';
    } else if (ymd >= '2026-03-01' && ymd <= '2026-03-07') {
        week = 'Week of 2 Lent';
    } else if (ymd >= '2026-03-08' && ymd <= '2026-03-14') {
        week = 'Week of 3 Lent';
    } else if (ymd >= '2026-03-15' && ymd <= '2026-03-21') {
        week = 'Week of 4 Lent';
    } else if (ymd >= '2026-03-22' && ymd <= '2026-03-28') {
        week = 'Week of 5 Lent';
    } else if (ymd >= '2026-03-29' && ymd <= '2026-04-04') {
        week = 'Holy Week';
    } else if (ymd >= '2026-04-05' && ymd <= '2026-04-11') {
        season = 'Easter';
        week = 'Easter Week';
    }

    return {
        year: 'Year Two', // 2026 is Year Two until Advent
        season,
        week,
        day: dayOfWeek
    };
}
