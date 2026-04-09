import re
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(script_dir, 'wiki_full.html')

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all divsort opening tags with their params
divsort_pattern = r'<div class="divsort"([^>]*)>'
param_blocks = list(re.finditer(divsort_pattern, content))
print(f"Found {len(param_blocks)} divsort blocks")

# For each block, extract params and the following pet name/number
results = []
for i, match in enumerate(param_blocks):
    attrs = match.group(1)
    p1 = re.search(r'data-param1="([^"]*)"', attrs)
    p2 = re.search(r'data-param2="([^"]*)"', attrs)
    p4 = re.search(r'data-param4="([^"]*)"', attrs)
    p5 = re.search(r'data-param5="([^"]*)"', attrs)
    p6 = re.search(r'data-param6="([^"]*)"', attrs)

    start = match.end()
    if i + 1 < len(param_blocks):
        end = param_blocks[i+1].start()
    else:
        end = min(start + 5000, len(content))

    block = content[start:end]

    no_match = re.search(r'NO\.(\d+)', block)
    title_match = re.search(r'title="([^"]*?)"', block)

    # Also extract element type from image alt text
    elem_imgs = re.findall(r'alt="[^"]*\u5c5e\u6027[_ ]([^."]*)', block)

    if no_match and title_match:
        results.append({
            'no': no_match.group(1),
            'name': title_match.group(1),
            'param1': p1.group(1) if p1 else '',
            'param2': p2.group(1) if p2 else '',
            'param4': p4.group(1) if p4 else '',
            'param5': p5.group(1) if p5 else '',
            'param6': p6.group(1) if p6 else '',
            'elem_imgs': '/'.join(elem_imgs) if elem_imgs else '',
        })

print(f"Extracted {len(results)} pets\n")

tsv_path = os.path.join(script_dir, 'pets_data.tsv')
with open(tsv_path, 'w', encoding='utf-8') as out:
    out.write('\u7f16\u53f7\t\u7cbe\u7075\u540d\u79f0\t\u5c5e\u6027\t\u8fdb\u5316\u9636\u6bb5\t\u5730\u533a\u5f62\u6001\t\u5f62\u6001\u53d8\u4f53\t\u5f02\u8272\t\u5c5e\u6027\u56fe\u6807\n')
    for r in results:
        out.write(f"NO.{r['no']}\t{r['name']}\t{r['param2']}\t{r['param1']}\t{r['param4']}\t{r['param5']}\t{r['param6']}\t{r['elem_imgs']}\n")

for r in results:
    print(f"NO.{r['no']}\t{r['name']}\t{r['param2']}\t{r['param1']}\t{r['param4']}\t{r['param5']}\t{r['param6']}\t{r['elem_imgs']}")

# Summary stats
print(f"\n=== Summary ===")
print(f"Total pets: {len(results)}")

# Count by element
from collections import Counter
elem_counter = Counter(r['param2'] for r in results)
print(f"\nBy element type:")
for elem, count in elem_counter.most_common():
    print(f"  {elem}: {count}")

# Count shiny
shiny = [r for r in results if r['param6'] == '\u662f']
print(f"\nShiny/\u5f02\u8272 pets ({len(shiny)}):")
for r in shiny:
    print(f"  NO.{r['no']} {r['name']} ({r['param2']})")

# Count by evolution stage
stage_counter = Counter(r['param1'] for r in results)
print(f"\nBy evolution stage:")
for stage, count in stage_counter.most_common():
    print(f"  {stage}: {count}")

# Region forms
region_counter = Counter(r['param4'] for r in results)
print(f"\nBy region form (param4):")
for form, count in region_counter.most_common():
    print(f"  {form}: {count}")

# param5 forms
p5_counter = Counter(r['param5'] for r in results)
print(f"\nBy form variant (param5):")
for form, count in p5_counter.most_common():
    print(f"  {form}: {count}")
