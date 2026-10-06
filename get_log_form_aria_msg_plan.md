I've found the issue with `create-service-log-form` in `admin.html`. The feedback message is currently using `alert()` which is not good for accessibility.

I will modify the `admin.html` file to:
1. Add a message container `<div id="log-msg" aria-live="polite" style="margin-top: 15px; font-weight: 600;"></div>` below the "Create Service Log" button in the form.
2. Update the javascript `submit` event listener for `create-service-log-form` to display success/error messages in the `#log-msg` container instead of using `alert()`.
