const moment = require('moment');

function timeConvert(date) {
  return moment(date).format('MMMM Do YYYY');
};

module.exports = timeConvert;