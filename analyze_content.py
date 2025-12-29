import json
import os
import re
from collections import defaultdict

print('='*60)
print('🔍 DEEP CONTENT ANALYSIS & DIAGRAM OPPORTUNITIES')
print('='*60)

courses_dir = 'data/courses'
course_files = [f for f in os.listdir(courses_dir) if f.endswith('.json') and f != 'index.json']

# Keywords that suggest a diagram would be helpful
diagram_keywords = [
    'workflow', 'pipeline', 'architecture', 'lifecycle', 'process', 'flow', 
    'structure', 'hierarchy', 'relationship', 'comparison', 'vs', 'versus',
    'interaction', 'sequence', 'loop', 'network', 'layer', 'stack', 'model',
    'system', 'component', 'cycle', 'tree', 'graph'
]

opportunities = []
inconsistencies = []

for cf in sorted(course_files):
    path = f'{courses_dir}/{cf}'
    try:
        with open(path) as f:
            course = json.load(f)
    except:
        continue
        
    course_title = course.get('title', cf)
    
    for module in course.get('modules', []):
        for lesson in module.get('lessons', []):
            content = lesson.get('content', {})
            lesson_title = lesson.get('title', 'Untitled')
            
            # Check content structure consistency
            if lesson.get('type') == 'quiz':
                continue

            if isinstance(content, list):
                # Array format (like math-for-ai)
                has_diagram = any(block.get('type') == 'mermaid' for block in content)
                
                # Scan text blocks for keywords
                for block in content:
                    if block.get('type') == 'text':
                        text = block.get('content', '').lower()
                        if any(k in text for k in diagram_keywords) and not has_diagram:
                            score = sum(1 for k in diagram_keywords if k in text)
                            if score >= 1:
                                opportunities.append({
                                    'course': course_title,
                                    'lesson': lesson_title,
                                    'context': text[:100] + '...',
                                    'keywords': [k for k in diagram_keywords if k in text],
                                    'file': cf,
                                    'priority': 'Medium' if score > 1 else 'Low'
                                })
            
            elif isinstance(content, dict):
                # Object format with sections
                sections = content.get('sections', [])
                if not sections:
                    inconsistencies.append(f'{course_title} - {lesson_title}: Empty content/sections')
                
                for section in sections:
                    sec_title = section.get('title', '')
                    sec_content = section.get('content', '')
                    has_diagram = 'diagram' in section
                    
                    # Check for keywords in title or content
                    text_to_check = (sec_title + ' ' + sec_content).lower()
                    
                    if not has_diagram:
                        found_keywords = [k for k in diagram_keywords if k in text_to_check]
                        if found_keywords:
                            # Higher weight for title matches
                            if any(k in sec_title.lower() for k in diagram_keywords):
                                opportunities.append({
                                    'course': course_title,
                                    'lesson': lesson_title,
                                    'section': sec_title,
                                    'keywords': found_keywords,
                                    'file': cf,
                                    'priority': 'High'
                                })
                            elif len(found_keywords) >= 2:
                                opportunities.append({
                                    'course': course_title,
                                    'lesson': lesson_title,
                                    'section': sec_title,
                                    'keywords': found_keywords,
                                    'file': cf,
                                    'priority': 'Medium'
                                })

# Group by course
grouped_opps = defaultdict(list)
for op in opportunities:
    grouped_opps[op['course']].append(op)

print(f'\nFound {len(opportunities)} potential diagram opportunities across {len(grouped_opps)} courses.')
print(f'Found {len(inconsistencies)} content inconsistencies.\n')

print('📋 TOP RECOMMENDATIONS (High Priority):')
print('-' * 60)

count = 0
for course, ops in grouped_opps.items():
    high_pri = [o for o in ops if o.get('priority') == 'High']
    if high_pri:
        print(f'\n📘 {course}:')
        for op in high_pri:  # Show all high priority
            print(f"  • Lesson: {op['lesson']}")
            print(f"    Section: {op.get('section', 'N/A')}")
            print(f"    Keywords: {', '.join(op['keywords'])}")
            print(f"    File: {op['file']}")
            count += 1

print(f'\nTotal High Priority Recommendations: {count}')

if inconsistencies:
    print('\n⚠️ INCONSISTENCIES:')
    for inc in inconsistencies:
        print(f'  • {inc}')
