const monthInfo = [
  { key: 'jan', name: { 'en-us': 'January', 'pt-br': 'Janeiro' }, totalDays: 31 },
  { key: 'feb', name: { 'en-us': 'February', 'pt-br': 'Fevereiro' }, totalDays: 28 },
  { key: 'mar', name: { 'en-us': 'March', 'pt-br': 'Março' }, totalDays: 31 },
  { key: 'apr', name: { 'en-us': 'April', 'pt-br': 'Abril' }, totalDays: 30 },
  { key: 'may', name: { 'en-us': 'May', 'pt-br': 'Maio' }, totalDays: 31 },
  { key: 'jun', name: { 'en-us': 'June', 'pt-br': 'Junho' }, totalDays: 30 },
  { key: 'jul', name: { 'en-us': 'July', 'pt-br': 'Julho' }, totalDays: 31 },
  { key: 'aug', name: { 'en-us': 'August', 'pt-br': 'Agosto' }, totalDays: 31 },
  { key: 'sep', name: { 'en-us': 'September', 'pt-br': 'Setembro' }, totalDays: 30 },
  { key: 'oct', name: { 'en-us': 'October', 'pt-br': 'Outubro' }, totalDays: 31 },
  { key: 'nov', name: { 'en-us': 'November', 'pt-br': 'Novembro' }, totalDays: 30 },
  { key: 'dec', name: { 'en-us': 'December', 'pt-br': 'Dezembro' }, totalDays: 31 }
];

const weekdays = [
  { 'en-us': { short: 'Sun', full: 'Sunday' }, 'pt-br': { short: 'Dom', full: 'Domingo' } },
  { 'en-us': { short: 'Mon', full: 'Monday' }, 'pt-br': { short: 'Seg', full: 'Segunda-feira' } },
  { 'en-us': { short: 'Tue', full: 'Tuesday' }, 'pt-br': { short: 'Ter', full: 'Terça-feira' } },
  { 'en-us': { short: 'Wed', full: 'Wednesday' }, 'pt-br': { short: 'Qua', full: 'Quarta-feira' } },
  { 'en-us': { short: 'Thu', full: 'Thursday' }, 'pt-br': { short: 'Qui', full: 'Quinta-feira' } },
  { 'en-us': { short: 'Fri', full: 'Friday' }, 'pt-br': { short: 'Sex', full: 'Sexta-feira' } },
  { 'en-us': { short: 'Sat', full: 'Saturday' }, 'pt-br': { short: 'Sáb', full: 'Sábado' } },
];

class TDate {

  constructor(year, month, day) {
    var _year = TDate.adjustYear(year);
    var _month = TDate.adjustMonth(month);
    var _day = TDate.adjustDay(day, _month, _year);

    this.getYear = () => _year;
    this.getMonth = () => _month;
    this.getDay = () => _day;
  }

  static adjustYear(year) {
    return year < 1 ? 1 : (year > 9999 ? 9999 : year);
  }

  static adjustMonth(month) {
    return month < 1 ? 1 : (month > 12 ? 12 : month);
  }

  static adjustDay(day, month, year) {
    let total = TDate.getDaysInMonth(month, year);
    return day < 1 ? 1 : (day > total ? total : day);
  }

  static getDaysInMonth(month, year) {
    return monthInfo[month - 1].totalDays + (month == 2 && TDate.isLeapYear(year) ? 1 : 0);
  }

  static isLeapYear(year) {
    return year % 100 == 0 ? (year % 400 == 0) : (year % 4 == 0);
  }

  isLeapYear = () => TDate.isLeapYear(this.getYear());

  static getYearFirstWeekday(year) {
    let previous = year - 1;
    return (year + Math.floor(previous / 4)
      - Math.floor(previous / 100)
      + Math.floor(previous / 400)) % 7;
  }

  getDayOfYear() {
    let count = 0;
    let month = this.getMonth();
    for (let i = 1; i < month; i++) {
      let index = i - 1;
      count += monthInfo[index].totalDays;
    }
    return count + this.getDay() + (month > 2 && this.isLeapYear() ? 1 : 0);
  }

  getWeekday() {
    let dof = this.getDayOfYear();
    let fwd = TDate.getYearFirstWeekday(this.getYear());

    return (dof - 1 + fwd) % 7;
  }

  static getMonthFirstWeekday(month, year) {

  }

  toString = () => `${this.getDay()}/${this.getMonth()}/${this.getYear()}`;
}

class TCalendar {

  constructor(element) {
    let now = new Date();

    var _month;
    var _year;

    this.element = element;
    this.setMonth = function (month) {
      _month = TDate.adjustMonth(month);
    }
    this.setYear = function (year) {
      _year = TDate.adjustYear(year);
    }
    this.getMonth = () => _month;
    this.getYear = () => _year;

    this.setMonth(now.getMonth()+1);
    this.setYear(now.getFullYear());
  }

  getMonthPage() { // retorna matriz representando a exibição do mês
    let fwd = (new TDate(this.getYear(), this.getMonth(), 1)).getWeekday();
    let t_previous = TDate.getDaysInMonth((this.getMonth() > 1 ? this.getMonth() - 1 : 12), this.getYear());
    let t_current = TDate.getDaysInMonth(this.getMonth(), this.getYear());
    let page = [];
    for (let i = 1; i <= 42; i++) {
      let r = i - fwd; // relative
      // definitive
      let d = (r < 1 ? { day: t_previous + r, type: 'previous' } :
        (r > t_current ? { day: r - t_current, type: 'next' } : { day: r, type: 'current' }));
      let row = Math.floor((i - 1) / 7);
      let col = (i - 1) % 7;
      page[row] = page[row] ?? [];
      page[row][col] = d;
    }
    return page;
  }

  updateCalendarPage() {
    let rows = this.element.getElementsByClassName('t-calendar-table-row');
    let currentPage = this.getMonthPage();
    for (let i = 0; i < rows.length; i++) {
      let days = rows[i].getElementsByTagName('td');
      for (let j = 0; j < days.length; j++) {
        days[j].innerText = currentPage[i][j].day;
      }
    }
  }
}

var calendars = [];

let calendarElements = document.getElementsByClassName('t-calendar');
for (c of calendarElements) {
  buildCalendar(c);
  let cal = new TCalendar(c);
  calendars.push(cal);
  cal.updateCalendarPage();

}

function buildCalendar(c) { // c is the calendar element

  function createCalendarHeader() {
    let calendarHeader = document.createElement('div');
    calendarHeader.classList.add('t-calendar-header');
    calendarHeader.append(createCalendarHeaderTitle(), createCalendarControl());
    return calendarHeader;
  }

  function createCalendarHeaderTitle() {
    let calendarTitle = document.createElement('div');
    calendarTitle.classList.add('t-calendar-title');
    calendarTitle.append(createCalendarMonthName(), createCalendarYearNumber());
    return calendarTitle;
  }

  function createCalendarMonthName() {
    let monthName = document.createElement('span');
    monthName.classList.add('t-calendar-month');
    return monthName;
  }

  function createCalendarYearNumber() {
    let yearNumber = document.createElement('span');
    yearNumber.classList.add('t-calendar-year');
    return yearNumber;
  }

  function createIncreaseMonth() {
    let arrowDown = document.createElement('span');
    arrowDown.classList.add(['t-ctrl', 'arrow-down']);
    arrowDown.innerText = '\u25bc';
    return arrowDown;
  }

  function createDecreaseMonth() {
    let arrowUp = document.createElement('span');
    arrowUp.classList.add(['t-ctrl', 'arrow-up']);
    arrowUp.innerText = '\u25b2';
    return arrowUp;
  }

  function createCloseCalendar() {
    let close = document.createElement('span');
    close.classList.add(['t-ctrl', 'close']);
    close.innerText = '\u274c';
    return close;
  }

  function createCalendarControl() {
    let control = document.createElement('div');
    control.classList.add('t-calendar-control');
    control.append(createIncreaseMonth(), createDecreaseMonth(), createCloseCalendar());
    return control;
  }

  function createCalendarWeekdayColumn(index, lang) {
    let col = document.createElement('th');
    col.classList.add('t-calendar-weekday');
    col.innerText = weekdays[index][lang].short;
    return col;
  }

  function createCalendarWeekdayRow() {
    let weekdayRow = document.createElement('tr');
    weekdayRow.classList.add('t-weekday-row');
    for (let i = 0; i < weekdays.length; i++)
      weekdayRow.append(createCalendarWeekdayColumn(i, 'pt-br'));
    return weekdayRow;
  }

  function createCalendarTableHeader() {
    let tableHeader = document.createElement('thead');
    tableHeader.classList.add('t-calendar-table-header');
    tableHeader.append(createCalendarWeekdayRow());
    return tableHeader;
  }

  function createCalendarWeekRow() {
    let row = document.createElement('tr');
    row.classList.add('t-calendar-table-row');
    for (let j = 0; j < 7; j++) {
      let day = document.createElement('td');
      day.classList.add('t-calendar-day');
      day.innerText = 1; // remove
      row.append(day);
    }
    return row;
  }

  function createCalendarTableBody() {
    let tableBody = document.createElement('tbody');
    tableBody.classList.add('t-calendar-table-body');
    for (let i = 0; i < 6; i++)
      tableBody.append(createCalendarWeekRow());
    return tableBody;
  }

  function createCalendarTable() {
    let table = document.createElement('table');
    table.classList.add('t-calendar-table');
    table.append(createCalendarTableHeader(), createCalendarTableBody());
    return table;
  }

  function createCalendarBody() {
    let calendarBody = document.createElement('div');
    calendarBody.classList.add('t-calendar-body');
    calendarBody.append(createCalendarTable());
    return calendarBody;
  }

  function buildAll(c) {
    c.append(createCalendarHeader(), createCalendarBody());
  }

  buildAll(c);
}