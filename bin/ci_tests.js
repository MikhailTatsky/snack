var url = phantom.args[0];

var page = new WebPage();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
var timer;
page.onConsoleMessage = function (msg) {
  console.log(msg);
  clearTimeout(timer);
  // exit after 3 seconds of no messages
  timer = setTimeout(function () {
    phantom.exit();
  }, 300);
};

page.open(url, function(status){
  if (status !== "success") {
    console.log("Unable to access network: " + status);
    phantom.exit(1);
    return
  }

  page.evaluate(addLogging);
});

function addLogging() {
  var current_test_assertions = [];

  QUnit.testDone = function(result) {
    var name = result.module + ': ' + result.name;
    var i;

    if (result.failed) {
      console.log('Assertion Failed: ' + name);

      for (i = 0; i < current_test_assertions.length; i++) {
        console.log('    ' + current_test_assertions[i]);
      }
    } else {
      console.log(name);
    }

    current_test_assertions = [];
  };

  QUnit.log = function(details) {
    var response;

    if (details.result) {
      return;
    }

    response = details.message || '';

    if (typeof details.expected !== 'undefined') {
      if (response) {
        response += ', ';
      }

      response += 'expected: ' + details.expected + ', but was: ' + details.actual;
    }

    current_test_assertions.push('Failed assertion: ' + response);
  };

  // timer for PhantomJS, prints final results multiple times, prematurely w/o it :\
  var timer;
  QUnit.done = function( result ) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      console.log('');
      console.log('Took ' + result.runtime +  'ms to run ' + result.total + ' tests. ' + result.passed + ' passed, ' + result.failed + ' failed.');
    }, 250);
  };
}

