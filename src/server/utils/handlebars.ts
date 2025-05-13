import dayjs from "dayjs";

export const handlebarsHelpers = {
  formatDate: (date: Date | string, format: string = "MMM D, YYYY") => {
    return dayjs(date).format(format);
  },
};
