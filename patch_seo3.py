import re

with open("index.html", "r") as f:
    content = f.read()

# Add meta tags for geo.position and ICBM for better local SEO
seo_tags_addition = """    <meta name="geo.position" content="34.1207;-84.0044">
    <meta name="ICBM" content="34.1207, -84.0044">"""

if "geo.position" not in content:
    content = content.replace('<meta name="geo.placename" content="Buford, GA">', '<meta name="geo.placename" content="Buford, GA">\n' + seo_tags_addition)

with open("index.html", "w") as f:
    f.write(content)
