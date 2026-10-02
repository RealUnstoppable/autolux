import re

with open('index.html', 'r') as f:
    content = f.read()

gallery = re.search(r'<section id="gallery">.*?</section>', content, re.DOTALL)
if gallery:
    print(gallery.group(0))
