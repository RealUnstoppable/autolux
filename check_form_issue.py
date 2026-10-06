import sys

def check_form_issue():
    with open('admin.html', 'r') as f:
        content = f.read()

    print("Checking admin.html")
    if 'id="log-msg"' in content:
        print("log-msg container already exists")
    else:
        print("log-msg container does NOT exist")

    if 'id="log-userId"' in content:
        print("log-userId exists")

    if 'alert(\'Service Log created successfully!\')' in content:
        print("alert for service log exists")
    else:
        print("alert for service log does NOT exist")

check_form_issue()
