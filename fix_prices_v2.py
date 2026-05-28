import json

# Corrections: tool_id -> (new_price, new_price_type)
corrections = {
    "claude-code": ("$20/mo", "paid"),
    "windsurf": ("$15/mo", "freemium"),
    "tabnine": ("$9/mo", "freemium"),
    "devin": ("$20/mo", "paid"),
    "bolt-new": ("$25/mo", "freemium"),
    "semrush-ai": ("$139.95/mo", "paid"),
    "surfer-seo": ("$99/mo", "paid"),
    "frase": ("$49/mo", "paid"),
    "marketmuse": ("Custom", "custom"),
    "zapier-ai": ("$19.99/mo", "freemium"),
}

# ES suffix: /mo -> /mes
corrections_es = {
    "claude-code": ("$20/mes", "paid"),
    "windsurf": ("$15/mes", "freemium"),
    "tabnine": ("$9/mes", "freemium"),
    "devin": ("$20/mes", "paid"),
    "bolt-new": ("$25/mes", "freemium"),
    "semrush-ai": ("$139.95/mes", "paid"),
    "surfer-seo": ("$99/mes", "paid"),
    "frase": ("$49/mes", "paid"),
    "marketmuse": ("Custom", "custom"),
    "zapier-ai": ("$19.99/mes", "freemium"),
}

for file, corr in [("data/reviews-en.json", corrections), ("data/reviews-es.json", corrections_es)]:
    path = f"C:\\Users\\Daniel\\ai-reviews\\{file}"
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    count = 0
    for item in data:
        tid = item.get("id")
        if tid in corr:
            new_price, new_type = corr[tid]
            old_price = item["price"]
            old_type = item["price_type"]
            item["price"] = new_price
            item["price_type"] = new_type
            print(f"  [{file}] {tid}: '{old_price}'/{old_type} -> '{new_price}'/{new_type}")
            count += 1

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\n{file}: {count} corrections applied\n")
