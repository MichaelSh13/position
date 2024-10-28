export const timeStringToMs = (time?: string | number): number | undefined => {
  if (!time) {
    return;
  }

  if (typeof time === 'number') {
    return time;
  }

  const parsedTime = parseFloat(time);
  if (!isNaN(parsedTime) && /^\d+$/.test(time)) {
    return parsedTime;
  }

  const units: { [key: string]: number } = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
    w: 604_800_000,
    M: 2_592_000_000,
    y: 31_536_000_000,
  };

  for (const unit in units) {
    if (time.endsWith(unit)) {
      const timeValue = parseInt(time.slice(0, -unit.length), 10);
      return timeValue * units[unit];
    }
  }

  throw new Error('Unsupported time format');
};
