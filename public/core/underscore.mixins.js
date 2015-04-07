_.mixin({
  getURIparams: function (obj) {
    var result = '';
    var first = true;
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        result += first ? '' : '&';
        first = false;
        result += encodeURIComponent(prop) + '=' + encodeURIComponent(obj[prop]);
      }
    }
    return result;
  }
});