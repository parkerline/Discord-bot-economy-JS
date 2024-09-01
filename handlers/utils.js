// utils.js
function setIntervalInSeconds(callback, seconds) {
  setInterval(callback, seconds * 1000);
}

module.exports = {
  setIntervalInSeconds,
};
