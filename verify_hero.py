import re

with open('index.html', 'r') as f:
    content = f.read()

hero_css_matches = re.findall(r'\.hero\s*{[^}]*background-image:[^}]*}', content)
print("CSS Rules for hero background image:")
for match in hero_css_matches:
    print(match)

hero_html = re.search(r'<header class="hero">.*?</header>', content, re.DOTALL)
if hero_html:
    print("\nHero HTML:")
    print(hero_html.group(0))

