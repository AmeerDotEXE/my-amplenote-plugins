
export const TimeSectionFormat = {
	/** @param {Date} date */
	day: (date) => {
		if (VIEW_TYPE == "days") return `${TimeSectionFormat._months[date.getMonth()]} ${date.getDate().toString().padStart(2, "0")}`;
		
		let isToday = isDateToday(date);
		return (isToday ? `${TimeSectionFormat._days[date.getDay()].slice(0, 3)}, ${date.getDate().toString().padStart(2, "0")} ${TimeSectionFormat._months[date.getMonth()]}` : TimeSectionFormat._days[date.getDay()].slice(0, 3));
	},
	/** @param {Date} date */
	week: (date) => {
		const newDate = new Date(date);
		let weekOffset = (newDate.getDay() - START_OF_DAY_OFFSET + 7) % 7;

		newDate.setDate(newDate.getDate() - weekOffset);
		const weekStart = newDate.getDate();
		const monthStart = TimeSectionFormat._months[newDate.getMonth()].slice(0, 3);

		newDate.setDate(weekStart + 6);
		const weekEnd = newDate.getDate().toString().padStart(2, "0");
		const monthEnd = TimeSectionFormat._months[newDate.getMonth()].slice(0, 3);

		return `${weekStart.toString().padStart(2, "0")}${monthStart != monthEnd ? ` ${monthStart}` : ""}-${weekEnd} ${monthEnd}`;
	},
	/** @param {Date} date */
	month: (date) => {
		if (VIEW_TYPE == "months") return date.getFullYear();
		return TimeSectionFormat._months[date.getMonth()];
	},
	/** @param {Date} date */
	year: (date) => {
		if (VIEW_TYPE == "years") return "";
		return date.getFullYear();
	},
	/** @param {Date} date */
	life: (date) => "",

	_days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saterday"],
	_months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const TimeSectionTitle = {
	/** @param {Date} date */
	day: (date) => {
		if (VIEW_TYPE == "days") return TimeSectionFormat._days[date.getDay()];

		let isToday = isDateToday(date);
		return (isToday ? "Today" : `${TimeSectionFormat._months[date.getMonth()].slice(0, 3)} ${date.getDate().toString().padStart(2, "0")}`);
	},
	/** @param {Date} date */
	week: (date) => {
		if (VIEW_TYPE == "weeks") {
			const weekInYear = weeksInYear(date);
			return `W${weekInYear[1].toString().padStart(2, '0')}, ${weekInYear[0]}`;
		}
		return `Week`;
	},
	/** @param {Date} date */
	month: (date) => {
		if (VIEW_TYPE == "months") return TimeSectionFormat._months[date.getMonth()];
		return `Month`;
	},
	/** @param {Date} date */
	year: (date) => {
		if (VIEW_TYPE == "years") return date.getFullYear();
		return `Year`;
	},
	/** @param {Date} date */
	life: (date) => `Life`,
};
export const TimeSectionAction = {
	day: {
		/** @param {Date} date */
		"-1": (date) => date.setDate(date.getDate() - 1),
		/** @param {Date} date */
		"0": (date) => {
			const today = new Date();
			date.setDate(today.getDate());
			date.setMonth(today.getMonth());
			date.setFullYear(today.getFullYear());
		},
		/** @param {Date} date */
		"1": (date) => date.setDate(date.getDate() + 1),
	},
	week: {
		/** @param {Date} date */
		"-1": (date) => {
			date.setDate(date.getDate() - 7 - ((date.getDay() - START_OF_DAY_OFFSET + 7) % 7))
		},
		/** @param {Date} date */
		"0": (date) => {
			const today = new Date();
			date.setDate(today.getDate());
			date.setMonth(today.getMonth());
			date.setFullYear(today.getFullYear());
		},
		/** @param {Date} date */
		"1": (date) => date.setDate(date.getDate() + 7 - ((date.getDay() - START_OF_DAY_OFFSET + 7) % 7)),
	},
	month: {
		/** @param {Date} date */
		"-1": (date) => {
			date.setDate(1);
			date.setMonth(date.getMonth() - 1);
		},
		/** @param {Date} date */
		"0": (date) => {
			const today = new Date();
			date.setMonth(today.getMonth());
			date.setFullYear(today.getFullYear());
		},
		/** @param {Date} date */
		"1": (date) => {
			date.setDate(1);
			date.setMonth(date.getMonth() + 1);
		},
	},
	year: {
		/** @param {Date} date */
		"-1": (date) => {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(date.getFullYear() - 1)
		},
		/** @param {Date} date */
		"0": (date) => {
			const today = new Date();
			date.setFullYear(today.getFullYear());
		},
		/** @param {Date} date */
		"1": (date) => {
			date.setDate(1);
			date.setMonth(0);
			date.setFullYear(date.getFullYear() + 1)
		},
	},
};
export const TimeSectionNote = {
	/** @param {Date} date */
	day: (date) => `${TimeSectionFormat._months[date.getMonth()]} ${date.getDate()}${
		{ "1": "st", "2": "nd", "3": "rd" }[date.getDate().toString().slice(-1)] || "th"
	}, ${date.getFullYear()}`,
	/** @param {Date} date */
	week: (date) => {
		const weekInYear = weeksInYear(date);
		return `Week ${weekInYear[1]}, ${weekInYear[0]}`;
	},
	/** @param {Date} date */
	month: (date) => `${TimeSectionFormat._months[date.getMonth()]} ${date.getFullYear()}`,
	/** @param {Date} date */
	year: (date) => `${date.getFullYear()} goals`,
	/** @param {Date} date */
	life: (date) => `Life goals`,
};
export const TimeSectionOffset = {
	/** @param {Date} date */
	day: (date, offset) => date.setDate(date.getDate() + offset),
	/** @param {Date} date */
	week: (date, offset) => date.setDate(date.getDate() + (offset * 7)),
	/** @param {Date} date */
	month: (date, offset) => date.setMonth(date.getMonth() + offset),
	/** @param {Date} date */
	year: (date, offset) => date.setFullYear(date.getFullYear() + offset),
};

export function canHighlightSection(date, timeSection) {
	if (timeSection == "life") return false;

	let isToday = isDateToday(date, {
		ignoreDays: ["week","month","year"].includes(timeSection),
		ignoreWeeks: ["month","year"].includes(timeSection),
		ignoreMonths: ["week","year"].includes(timeSection),
	});
	return isToday;
}

export function isDateToday(date, {
	ignoreDays = false,
	ignoreWeeks = true,
	ignoreMonths = false,
} = {}) {
	const today = new Date();
	let isToday = true;
	if (!ignoreDays && isToday && date.getDate() != today.getDate()) isToday = false;
	if (!ignoreWeeks && isToday) {
		if (weeksInYear(date)[1] != weeksInYear(today)[1]) isToday = false;
	}
	if (!ignoreMonths && isToday && date.getMonth() != today.getMonth()) isToday = false;
	if (isToday && date.getFullYear() != today.getFullYear()) isToday = false;
	return isToday;
}



// https://stackoverflow.com/a/6117889
function weeksInYear(date) {
    d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
}
