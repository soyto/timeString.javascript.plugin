/* global moment */
(function() {
  //As seen on stackoverflow source code (https://cdn.sstatic.net/Js/stub.en.js)
  String.prototype.formatUnicorn = String.prototype.formatUnicorn || function() {
    var e = this.toString();

    if (!arguments.length) { return e; }

    var t = typeof arguments[0];
    var n = 'string' == t || 'number' == t ? Array.prototype.slice.call(arguments) : arguments[0];

    for (var i in n) {
      e = e.replace(new RegExp('\\{' + i + '\\}', 'gi'), n[i]);
    }
    return e;
  };
})();
(function(moment) {

  var FORMAT_AGO_BEFORE = 'Hace';
  var FORMAT_AGO_AFTER = 'Dentro de';

  var FORMAT_SECONDS = '{ago} unos segundos';

  var FORMAT_MINUTES_SINGULAR = '{ago} un minuto';
  var FORMAT_MINUTES_PLURAL = '{ago} {diff_minutes} minutos';

  var FORMAT_HOURS_SINGULAR = '{ago} una hora';
  var FORMAT_HOURS_PLURAL = '{ago} {diff_hours} horas';

  var FORMAT_DAYS_SINGULAR = '{tomorrowOrYesterday} a las {hour_24}:{minute}';
  var FORMAT_DAYS_PLURAL = '{ago} {diff_days} dias';

  var FORMAT_MONTHS = '{day} de {month_full}';
  var FORMAT_YEARS = '{day} {month_short} {year_4}';

  //TimeString
  function TimeString() {
    var $this = this;

    var _formats = {
      'ago_before': FORMAT_AGO_BEFORE,
      'ago_after': FORMAT_AGO_AFTER,
      'seconds': FORMAT_SECONDS,
      'minutes_singular': FORMAT_MINUTES_SINGULAR,
      'minutes_plural': FORMAT_MINUTES_PLURAL,
      'hours_singular': FORMAT_HOURS_SINGULAR,
      'hours_plural': FORMAT_HOURS_PLURAL,
      'days_singular': FORMAT_DAYS_SINGULAR,
      'days_plural': FORMAT_DAYS_PLURAL,
      'months': FORMAT_MONTHS,
      'years': FORMAT_YEARS
    };

    //Get formats
    $this.$$getFormats = function() { return _formats; };

    //Set a format
    $this.$$setFormat = function(keyName, value) { _formats[keyName] = value; };

    //Format date
    $this.format = function(fromDate, toDate) {

      fromDate = _checkIfIsMomentDate(fromDate);
      toDate = _checkIfIsMomentDate(toDate);

      //Not from date, dont do nothin
      if(fromDate == null) { return null; }
      //Not to date? just now
      if(toDate == null) { toDate = moment(); }


      var _milliseconds = fromDate.diff(toDate);

      var _data = {
        'fromDate': fromDate,
        'toDate': toDate,
        'milliseconds': _milliseconds,
        'ago': _milliseconds > 0,
        'seconds': Math.floor(Math.abs(_milliseconds) / (1000)),
        'minutes': Math.floor(Math.abs(_milliseconds) / (60 * 1000)),
        'hours': Math.floor(Math.abs(_milliseconds) / (60 * 60 * 1000)),
        'days': Math.floor(Math.abs(_milliseconds) / (24 * 60 * 60 * 1000)),
      };


      //Seconds range
      if(_data['minutes'] === 0) { return _formatOutput(_formats['seconds'], _data); }

      //Minutes range
      if(_data['hours'] === 0) {
        if(_data['minutes'] === 1) { return _formatOutput(_formats['minutes_singular'], _data); }
        else { return _formatOutput(_formats['minutes_plural'], _data); }
      }

      //Hours range
      if(_data['days'] === 0) {

        var _fromDay = fromDate.format('DD');
        var _toDay = toDate.format('DD');

        if(_data['hours'] === 1) { return _formatOutput(_formats['hours_singular'], _data); }
        else if(_data['hours'] >= 12 && _fromDay != _toDay) { return _formatOutput(_formats['days_singular'], _data); }
        else { return _formatOutput(_formats['hours_plural'], _data); }
      }

      //1 day diff
      if(_data['days'] === 1) { return _formatOutput(_formats['days_singular'], _data); }

      //Less than 7 days
      if(_data['days'] < 7) { return _formatOutput(_formats['days_plural'], _data); }

      var _fromYear = fromDate.format('YYYY');
      var _toYear = toDate.format('YYYY');

      if(_fromYear == _toYear) { return _formatOutput(_formats['months'], _data); }
      else { return _formatOutput(_formats['years'], _data); }
    };

    function _formatOutput(format, data) {

      var _formatData = {
        'ago': data['ago'] ? _formats['ago_after']: _formats['ago_before'],
        'diff_seconds': data['seconds'],
        'diff_minutes': data['minutes'],
        'diff_hours': data['hours'],
        'diff_days': data['days'],
        'second': data['fromDate'].format('ss'),
        'minute': data['fromDate'].format('mm'),
        'hour_12': data['fromDate'].format('hh'),
        'hour_24': data['fromDate'].format('HH'),
        'day': data['fromDate'].format('DD'),
        'day_of_week_short': data['fromDate'].format('ddd'),
        'day_of_week_full': data['fromDate'].format('dddd'),
        'month_numeric': data['fromDate'].format('MM'),
        'month_short': data['fromDate'].format('MMM'),
        'month_full': data['fromDate'].format('MMMM'),
        'year_2': data['fromDate'].format('YY'),
        'year_4': data['fromDate'].format('YYYY'),
        'tomorrowOrYesterday': data['ago'] ? 'Mañana' : 'Ayer',
      };


      return format.formatUnicorn(_formatData);
    }

    //Check if is a moment date
    function _checkIfIsMomentDate(date) {

      //If date is null, return null
      if(date == null) { return null; }

      //If doesnt have "_isAMomentObject" property
      if(!date['_isAMomentObject']) {

        //If instance of date... return moment wrapper if date isn't invalid
        if(date instanceof Date) {

          if(isNaN(date.getTime())) { return null; }
          return moment(date);
        }
        //If is a string...
        else if(typeof date == 'string') {

          //Convert as date
          var d = new Date(date);

          //Check if is not invalid
          if(isNaN(d.getTime())) { return null; }

          //Return
          return moment(d);
        }
        //Else return null
        else { return null; }

      }
      //If has that parameter, return date
      else { return date; }
    }

  }

  window.$timeString = new TimeString();
})(moment);
