(function () {
  "use strict";

  var monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
  var weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  var today = new Date();
  var currentYear = today.getFullYear();
  var currentMonth = today.getMonth();
  var yearSelect = document.getElementById("yearSelect");
  var monthGrid = document.getElementById("monthGrid");

  function countMonth(year, month) {
    var days = new Date(year, month + 1, 0).getDate();
    var workdays = 0;
    for (var day = 1; day <= days; day += 1) {
      var weekday = new Date(year, month, day).getDay();
      if (weekday !== 0 && weekday !== 6) workdays += 1;
    }
    return { days: days, workdays: workdays, weekends: days - workdays };
  }

  function makeCalendar(year, month) {
    var stats = countMonth(year, month);
    var firstWeekday = new Date(year, month, 1).getDay();
    var html = '<article class="month-card' + (year === currentYear && month === currentMonth ? ' current' : '') + '">';
    html += '<div class="month-top"><div class="month-name">' + monthNames[month];
    if (year === currentYear && month === currentMonth) html += '<span class="current-label">本月</span>';
    html += '</div><div class="month-workdays">' + stats.workdays + '<small>出勤日</small></div></div>';
    html += '<div class="weekday-row" aria-hidden="true">';
    weekdays.forEach(function (weekday) { html += '<span>' + weekday + '</span>'; });
    html += '</div><div class="days-grid" aria-label="' + year + '年' + monthNames[month] + '日历">';
    for (var blank = 0; blank < firstWeekday; blank += 1) html += '<span class="day empty"></span>';
    for (var day = 1; day <= stats.days; day += 1) {
      var weekday = new Date(year, month, day).getDay();
      var dayType = weekday === 0 || weekday === 6 ? "weekend" : "workday";
      html += '<span class="day ' + dayType + '">' + day + '</span>';
    }
    html += '</div><div class="month-stats"><span><strong>' + stats.days + '</strong>总天数</span><span><strong>' + stats.weekends + '</strong>周末</span></div></article>';
    return { html: html, stats: stats };
  }

  function render(year) {
    var annualDays = 0;
    var annualWorkdays = 0;
    var annualWeekends = 0;
    var cards = [];
    for (var month = 0; month < 12; month += 1) {
      var result = makeCalendar(year, month);
      cards.push(result.html);
      annualDays += result.stats.days;
      annualWorkdays += result.stats.workdays;
      annualWeekends += result.stats.weekends;
    }
    document.getElementById("summaryYear").textContent = year;
    document.getElementById("annualDays").textContent = annualDays;
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
