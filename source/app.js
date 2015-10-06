(function() {
  'use strict';

  var eX = require('extendedjs');

  var h1 = eX.create('h1#myId.myClass', {
    text: 'Hello World!'
  });

  eX.render('body', h1);
})();