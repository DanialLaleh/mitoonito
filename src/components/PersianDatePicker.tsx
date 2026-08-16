"use client";

import { useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

export default function PersianDatePicker({
  name,
  defaultValue,
  placeholder = "انتخاب تاریخ",
  withTime = false,
}: {
  name: string;
  defaultValue?: string; // اگر withTime باشد: ISO کامل، وگرنه: yyyy-mm-dd
  placeholder?: string;
  withTime?: boolean;
}) {
  const [value, setValue] = useState<DateObject | null>(
    defaultValue ? new DateObject(new Date(defaultValue)) : null
  );

  const isoValue = value
    ? withTime
      ? value.toDate().toISOString().slice(0, 16)
      : value.toDate().toISOString().slice(0, 10)
    : "";

  return (
    <div>
      <input type="hidden" name={name} value={isoValue} />
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        value={value}
        onChange={(date) => setValue(date as DateObject)}
        placeholder={placeholder}
        inputClass="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        calendarPosition="bottom-right"
        plugins={withTime ? [<TimePicker key="time" position="bottom" />] : []}
        format={withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD"}
      />
    </div>
  );
}
