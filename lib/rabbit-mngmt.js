import request from 'request';

function RabbitManagmentAPI(_options) {
  const options = _options || {};
  this.hostname = options.hostname || 'localhost:55672';
  this.username = options.username || 'guest';
  this.password = options.password || 'guest';
  this.protocol = options.protocol || 'http';
}

RabbitManagmentAPI.prototype.sendRequest = function sendRequest(method, path, body, callback) {
  request({
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    url: `${this.protocol}://${this.username}:${this.password}@${this.hostname}/api/${path}`,
    body,
  }, (err, res, dataJson) => {
    // console.log(err);
    // console.log(res.statusCode);
    // console.log('data: ', data);
    if (err) {
      callback(err);
    } else if (res.statusCode > 200) {
      callback(new Error(`Status code: ${res.statusCode}`));
    } else if (dataJson === 'Not found.') {
      callback(new Error('Undefined.'));
    } else {
      const data = JSON.parse(dataJson);
      callback(null, res, data);
    }
  });
};

module.exports = RabbitManagmentAPI;
