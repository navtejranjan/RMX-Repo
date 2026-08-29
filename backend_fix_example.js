// To fix the "ReferenceError: action is not defined" error once and for all,
// add this single line at the very top of your doPost(e) function:

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  
  // ✅ ADD THIS LINE:
  var action = body.action;
  
  // Now ALL your existing code will work automatically!
  if (action == "login") {
     // ...
  }
  
  // ... rest of your code
}
