(function () {
  "use strict";

  var monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  var weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  var today = new Date();
  var currentYear = today.getFullYear();
  var currentMonth = today.getMonth();
  var yearSelect = document.getElementById("yearSelect");
  var monthGrid = document.getElementById("monthGrid");

  function addHoliday(holidays, year, month, day, name) {
    var key = year + "-" + month + "-" + day;
    if (!holidays[key]) holidays[key] = name;
  }

  function getJapaneseHolidays(year) {
    var holidays = {};
    addHoliday(holidays, year, 0, 1, "元日");
    addHoliday(holidays, year, 0, nthWeekday(year, 0, 1, 2), "成人の日");
    addHoliday(holidays, year, 1, 11, "建国記念の日");
    addHoliday(holidays, year, 1, 23, "天皇誕生日");
    addHoliday(holidays, year, 2, vernalEquinoxDay(year), "春分の日");
    addHoliday(holidays, year, 3, 29, "昭和の日");
    addHoliday(holidays, year, 4, 3, "憲法記念日");
    addHoliday(holidays, year, 4, 4, "みどりの日");
    addHoliday(holidays, year, 4, 5, "こどもの日");
    addHoliday(holidays, year, 6, nthWeekday(year, 6, 1, 3), "海の日");
    addHoliday(holidays, year, 7, 11, "山の日");
    addHoliday(holidays, year, 8, nthWeekday(year, 8, 1, 3), "敬老の日");
    addHoliday(holidays, year, 8, autumnalEquinoxDay(year), "秋分の日");
    addHoliday(holidays, year, 9, nthWeekday(year, 9, 1, 2), "スポーツの日");
    addHoliday(holidays, year, 10, 3, "文化の日");
    addHoliday(holidays, year, 10, 23, "勤労感謝の日");

    // The Olympic Games caused one-off date changes in 2020 and 2021.
    if (year === 2020) {
      addHoliday(holidays, year, 6, 23, "海の日");
      addHoliday(holidays, year, 6, 24, "スポーツの日");
      addHoliday(holidays, year, 7, 10, "山の日");
      delete holidays[year + "-6-" + nthWeekday(year, 6, 1, 3)];
      delete holidays[year + "-7-11"];
      delete holidays[year + "-9-" + nthWeekday(year, 9, 1, 2)];
      delete holidays[year + "-10-" + nthWeekday(year, 10, 1, 2)];
      addHoliday(holidays, year, 8, 21, "敬老の日");
    }
    if (year === 2021) {
      addHoliday(holidays, year, 6, 22, "海の日");
      addHoliday(holidays, year, 6, 23, "スポーツの日");
      addHoliday(holidays, year, 7, 8, "山の日");
      delete holidays[year + "-6-" + nthWeekday(year, 6, 1, 3)];
      delete holidays[year + "-7-" + nthWeekday(year, 7, 1, 2)];
      delete holidays[year + "-8-" + nthWeekday(year, 8, 1, 2)];
      delete holidays[year + "-10-" + nthWeekday(year, 10, 1, 2)];
    }

    // A weekday between two holidays is a 国民の休日.
    for (var month = 0; month < 12; month += 1) {
      var days = new Date(year, month + 1, 0).getDate();
      for (var day = 2; day < days; day += 1) {
        var key = year + "-" + month + "-" + day;
        var date = new Date(year, month, day);
        var previous = holidays[year + "-" + month + "-" + (day - 1)];
        var next = holidays[year + "-" + month + "-" + (day + 1)];
        if (!holidays[key] && date.getDay() !== 0 && date.getDay() !== 6 && previous && next) {
          addHoliday(holidays, year, month, day, "国民の休日");
        }
      }
    }

    // When a holiday falls on Sunday, the next non-holiday day is a 振替休日.
    Object.keys(holidays).forEach(function (key) {
      var parts = key.split("-").map(Number);
      var date = new Date(parts[0], parts[1], parts[2]);
      if (date.getDay() !== 0) return;
      var substitute = new Date(parts[0], parts[1], parts[2] + 1);
      while (holidays[dateKey(substitute)]) substitute.setDate(substitute.getDate() + 1);
      addHoliday(holidays, substitute.getFullYear(), substitute.getMonth(), substitute.getDate(), "振替休日");
    });
    return holidays;
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
  }

  function nthWeekday(year, month, weekday, occurrence) {
    var first = new Date(year, month, 1).getDay();
    return 1 + (weekday - first + 7) % 7 + (occurrence - 1) * 7;
  }

  function vernalEquinoxDay(year) {
    return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  }

  function autumnalEquinoxDay(year) {
    return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  }

  function countMonth(year, month, holidays) {
    var days = new Date(year, month + 1, 0).getDate();
    var workdays = 0;
    var weekends = 0;
    var holidayCount = 0;
    for (var day = 1; day <= days; day += 1) {
      var weekday = new Date(year, month, day).getDay();
      if (weekday === 0 || weekday === 6) weekends += 1;
      if (holidays[year + "-" + month + "-" + day]) holidayCount += 1;
      if (weekday !== 0 && weekday !== 6 && !holidays[year + "-" + month + "-" + day]) workdays += 1;
    }
    return { days: days, workdays: workdays, weekends: weekends, holidays: holidayCount };
  }

  function makeCalendar(year, month, holidays) {
    var stats = countMonth(year, month, holidays);
    var firstWeekday = new Date(year, month, 1).getDay();
    var html = '<article class="month-card' + (year === currentYear && month === currentMonth ? ' current' : '') + '">';
    html += '<div class="month-top"><div class="month-name">' + monthNames[month];
    if (year === currentYear && month === currentMonth) html += '<span class="current-label">今月</span>';
    html += '</div><div class="month-workdays">' + stats.workdays + '<small>出勤日</small></div></div>';
    html += '<div class="weekday-row" aria-hidden="true">';
    weekdays.forEach(function (weekday) { html += '<span>' + weekday + '</span>'; });
    html += '</div><div class="days-grid" aria-label="' + year + '年' + monthNames[month] + 'のカレンダー">';
    for (var blank = 0; blank < firstWeekday; blank += 1) html += '<span class="day empty"></span>';
    for (var day = 1; day <= stats.days; day += 1) {
      var weekday = new Date(year, month, day).getDay();
      var holidayName = holidays[year + "-" + month + "-" + day];
      var dayType = weekday === 0 || weekday === 6 ? "weekend" : "workday";
      if (holidayName) dayType += " holiday";
      var visibleHolidayName = holidayName && weekday !== 0 && weekday !== 6 ? holidayName : "";
      var label = year + "年" + (month + 1) + "月" + day + "日" + (visibleHolidayName ? "、" + visibleHolidayName : (dayType === "weekend" ? "、土日" : "、平日"));
      html += '<span class="day ' + dayType + '" aria-label="' + label + '" title="' + label + '"><b>' + day + '</b>' + (visibleHolidayName ? '<small class="holiday-name">' + visibleHolidayName + '</small>' : '') + '</span>';
    }
    html += '</div><div class="month-stats"><span><strong>' + stats.weekends + '</strong>土日</span><span><strong>' + stats.holidays + '</strong>祝日</span></div></article>';
    return { html: html, stats: stats };
  }

  function render(year) {
    var annualWorkdays = 0;
    var annualWeekends = 0;
    var holidays = getJapaneseHolidays(year);
    var cards = [];
    var monthOrder = [];
    for (var index = 0; index < 12; index += 1) monthOrder.push(index);
    monthOrder.forEach(function (month) {
      var result = makeCalendar(year, month, holidays);
      cards.push(result.html);
      annualWorkdays += result.stats.workdays;
      annualWeekends += result.stats.weekends;
    });
    document.getElementById("summaryYear").textContent = year;
    document.getElementById("annualWorkdays").textContent = annualWorkdays;
    document.getElementById("annualWeekends").textContent = annualWeekends;
    monthGrid.innerHTML = cards.join("");
  }

  for (var year = currentYear - 5; year <= currentYear + 5; year += 1) {
    var option = document.createElement("option");
    option.value = year;
    option.textContent = year + "年";
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
  yearSelect.addEventListener("change", function () { render(Number(yearSelect.value)); });
  render(currentYear);
}());
