import sys

def modify_test():
    with open('tests/utils.test.js', 'r') as f:
        content = f.read()

    search = "import { escapeHTML, submitToFirestore } from '../js/utils.js';"
    replace = "import { escapeHTML, submitDetailingRequestCore } from '../js/utils.js';"

    if search in content:
        content = content.replace(search, replace)

    search2 = "describe('submitToFirestore'"
    replace2 = "describe('submitDetailingRequestCore'"

    if search2 in content:
        content = content.replace(search2, replace2)

    search3 = "submitToFirestore('bookings'"
    replace3 = "submitDetailingRequestCore('123'"

    if search3 in content:
        content = content.replace(search3, replace3)

    search4 = "expect(submitToFirestore).toBeDefined();"
    replace4 = "expect(submitDetailingRequestCore).toBeDefined();"

    if search4 in content:
        content = content.replace(search4, replace4)

    search7 = "submitToFirestore handles errors during addDoc"
    replace7 = "submitDetailingRequestCore handles errors during addDoc"

    if search7 in content:
        content = content.replace(search7, replace7)

    search8 = "submitToFirestore succeeds with valid data"
    replace8 = "submitDetailingRequestCore succeeds with valid data"

    if search8 in content:
        content = content.replace(search8, replace8)

    search9 = "submitToFirestore succeeds"
    replace9 = "submitDetailingRequestCore succeeds"

    if search9 in content:
        content = content.replace(search9, replace9)


    with open('tests/utils.test.js', 'w') as f:
        f.write(content)

    print("Test fixed")

if __name__ == '__main__':
    modify_test()
