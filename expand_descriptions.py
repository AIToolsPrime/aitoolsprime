import json

def expand_en(tool):
    name = tool['name']
    desc = tool.get('description', tool['excerpt'])
    features = tool.get('features', [])
    best_for = tool.get('best_for', '')
    pricing = tool.get('pricing_note', '')

    sentences = [s.strip() for s in desc.split('.') if s.strip()]
    # Keep first 2-3 sentences as core intro
    core = '. '.join(sentences[:2]) + '.'
    extra = sentences[2:] if len(sentences) > 2 else []

    parts = [core]

    # What makes it unique (1 sentence from tagline)
    tagline = tool.get('tagline', '').lower()
    if tagline:
        parts.append(
            f"As its tagline suggests, {name} is designed for users who need {tagline}, "
            f"delivering on this promise through intelligent automation and thoughtful design."
        )

    # Best for (1 sentence)
    if best_for:
        parts.append(f"This tool is best suited for {best_for[0].lower()}{best_for[1:]}.")

    # Use case variety / platform support (1 sentence)
    if features:
        parts.append(
            f"Whether you need {features[0].lower()}, {features[1].lower()}, "
            f"or {features[2].lower()}, {name} handles it all within a single, unified platform."
        )

    # Extra from original description (ensure ends with period)
    if extra:
        extra_text = '. '.join(extra)
        if extra_text and not extra_text.endswith('.'):
            extra_text += '.'
        parts.append(extra_text)

    # Pricing (1-2 sentences)
    if pricing:
        parts.append(f"In terms of pricing, {pricing[0].lower()}{pricing[1:]}.")
        parts.append(
            f"This makes {name} accessible whether you are just getting started "
            f"or need advanced capabilities for professional use."
        )

    # Closing recommendation (1 sentence)
    parts.append(
        f"Overall, {name} stands out as a top choice in its category, "
        f"combining powerful AI capabilities with an intuitive user experience "
        f"that delivers consistent, high-quality results."
    )

    return ' '.join(parts)


def expand_es(tool):
    name = tool['name']
    desc = tool.get('description', tool['excerpt'])
    features = tool.get('features', [])
    best_for = tool.get('best_for', '')
    pricing = tool.get('pricing_note', '')

    sentences = [s.strip() for s in desc.split('.') if s.strip()]
    core = '. '.join(sentences[:2]) + '.'
    extra = sentences[2:] if len(sentences) > 2 else []

    parts = [core]

    tagline = tool.get('tagline', '').lower()
    if tagline:
        parts.append(
            f"Como sugiere su eslogan, {name} está diseñado para usuarios que necesitan {tagline}, "
            f"cumpliendo esta promesa mediante automatización inteligente y diseño cuidado."
        )

    if best_for:
        parts.append(f"Esta herramienta es ideal para {best_for[0].lower()}{best_for[1:]}.")

    if features:
        parts.append(
            f"Ya sea que necesites {features[0].lower()}, {features[1].lower()}, "
            f"o {features[2].lower()}, {name} lo maneja todo dentro de una plataforma unificada."
        )

    if extra:
        extra_text = '. '.join(extra)
        if extra_text and not extra_text.endswith('.'):
            extra_text += '.'
        parts.append(extra_text)

    if pricing:
        parts.append(f"En cuanto a precios, {pricing[0].lower()}{pricing[1:]}.")
        parts.append(
            f"Esto hace que {name} sea accesible tanto para quienes recién comienzan "
            f"como para quienes necesitan capacidades avanzadas."
        )

    parts.append(
        f"En resumen, {name} destaca como una de las mejores opciones en su categoría, "
        f"combinando potentes capacidades de IA con una experiencia de usuario intuitiva "
        f"que ofrece resultados consistentes y de alta calidad."
    )

    return ' '.join(parts)


with open('C:/Users/Daniel/ai-reviews/data/reviews-en.json', 'r', encoding='utf-8-sig') as f:
    en_data = json.load(f)

for tool in en_data:
    tool['description'] = expand_en(tool)

with open('C:/Users/Daniel/ai-reviews/data/reviews-en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)
print(f'EN: Expanded descriptions for {len(en_data)} tools')

with open('C:/Users/Daniel/ai-reviews/data/reviews-es.json', 'r', encoding='utf-8-sig') as f:
    es_data = json.load(f)

for tool in es_data:
    tool['description'] = expand_es(tool)

with open('C:/Users/Daniel/ai-reviews/data/reviews-es.json', 'w', encoding='utf-8') as f:
    json.dump(es_data, f, indent=2, ensure_ascii=False)
print(f'ES: Expanded descriptions for {len(es_data)} tools')
