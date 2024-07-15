export const shortenNumber = (value: string | number, numbersAfterComma: number = 1) => {
  const number = Number(value);

  switch (true) {
    case number >= 1_000_000_000:
      return `${Number((number / 1_000_000_000).toFixed(numbersAfterComma))}b`;
    case number >= 1_000_000:
      return `${Number((number / 1_000_000).toFixed(numbersAfterComma))}m`;
    case number >= 1_000:
      return `${Number((number / 1_000).toFixed(numbersAfterComma))}k`;
    default:
      return `${number}`;
  }
};

export enum ChartStatisticsPeriod {
  LastYear = 'last_year',
  LastMonth = 'last_month',
}
