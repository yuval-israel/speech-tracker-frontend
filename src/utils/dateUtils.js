import { differenceInMonths, differenceInYears, parseISO } from 'date-fns';

export const calculateAge = (birthDateString) => {
    if (!birthDateString) return '--';

    const birthDate = new Date(birthDateString);
    const now = new Date();

    const years = differenceInYears(now, birthDate);
    const months = differenceInMonths(now, birthDate) % 12;

    if (years > 0) {
        return `${years}y ${months}m`;
    }
    return `${months}m`;
};
