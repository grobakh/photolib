function uuid() {
  var now = new Date().getTime();
  now += Math.pow(10, 13) * Math.floor((Math.random() * 100) + 1);
  return now.toString(36);
}

// get back new Date(parseInt('xxxxxxxxxx', 36) % Math.pow(10,13))