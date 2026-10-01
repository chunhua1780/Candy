#!/usr/bin/env python3
"""Builds maths-bank.js: 3,000 Year 7 maths questions following the National Curriculum in England (Key Stage 3, Year 7 content).
Every answer is computed here, never typed by hand. Run from the repo root: python3 tools/build_maths.py"""
import json, math, random
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction

R = random.Random(20261007)
BANK, SEEN = [], set()

def fmt(n):
    """UK number format with a true minus sign: 12,345 · −4 · 0.25"""
    if isinstance(n, Fraction): n = float(n)
    if isinstance(n, float) and n.is_integer(): n = int(n)
    neg = n < 0; n = abs(n)
    s = f"{n:,}" if isinstance(n, int) else f"{n:,.4f}".rstrip("0").rstrip(".")
    return ("−" if neg else "") + s
def br(n):  # a negative number in brackets, for calculations like 5 × (−3)
    return f"({fmt(n)})" if n < 0 else fmt(n)
def frac(f):
    f = Fraction(f)
    if f.denominator == 1: return fmt(f.numerator)
    return ("−" if f < 0 else "") + f"{abs(f.numerator)}/{f.denominator}"
def mixed(f):
    f = Fraction(f); w, r = divmod(f.numerator, f.denominator)
    if r == 0: return str(w)
    return f"{w} {r}/{f.denominator}" if w else f"{r}/{f.denominator}"
def rnd(x, places):
    q = Decimal(1).scaleb(-places)
    return float(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP))
def sig(x, s):
    if x == 0: return 0
    d = Decimal(str(x)); e = d.adjusted()
    q = Decimal(1).scaleb(e - s + 1)
    v = d.quantize(q, rounding=ROUND_HALF_UP)
    return int(v) if e - s + 1 >= 0 else float(v)
def money(p): return f"£{p//100:,}.{p%100:02d}"

def add(topic, obj, q, kind, ans, why, opts=None, fig=None, unit=None):
    key = q + json.dumps(fig, sort_keys=True)
    if key in SEEN: return False
    SEEN.add(key)
    if kind == "n" and isinstance(ans, float):
        ans = round(ans, 6)
        if ans.is_integer(): ans = int(ans)
    d = {"t": topic, "o": obj, "q": q, "k": kind, "a": ans, "w": why}
    if opts is not None: d["c"] = opts
    if fig: d["f"] = fig
    if unit: d["u"] = unit
    BANK.append(d)
    return True
def mc(topic, obj, q, correct, wrong, why, fig=None):
    wrong = [w for w in dict.fromkeys(wrong) if w != correct][:3]
    if len(wrong) < 2: return False
    opts = [correct] + wrong; R.shuffle(opts)
    return add(topic, obj, q, "c", opts.index(correct), why, opts=opts, fig=fig)

NAMES = ["Amir", "Chloe", "Daniel", "Elif", "Freddie", "Hannah", "Isaac", "Jasmine", "Kai", "Layla", "Mason", "Nadia", "Oscar", "Phoebe", "Rohan", "Sophie", "Tom", "Yusuf", "Zoe", "Ben", "Aisha", "Jacob", "Mia", "Lucas"]
nm = lambda: R.choice(NAMES)

# =============================== Place value and ordering ===============================
def pv_powers10():
    n = R.choice([R.randint(2, 999) / 10, R.randint(2, 9999) / 100, R.randint(11, 99999)]); k = R.choice([10, 100, 1000]); op = R.choice("×÷")
    r = n * k if op == "×" else n / k
    if op == "÷" and len(f"{r:.10f}".rstrip("0").split(".")[1]) > 4: return
    add("Place value", "Multiply and divide by 10, 100 and 1,000", f"Work out {fmt(n)} {op} {fmt(k)}.", "n", r,
        f"{'Multiplying' if op=='×' else 'Dividing'} by {fmt(k)} moves every digit {len(str(k))-1} place{'s' if k>10 else ''} to the {'left' if op=='×' else 'right'}: {fmt(r)}.")
def pv_order_dec():
    base = R.randint(1, 9); xs = list({round(base + R.choice([0, 0.1, 0.01, 0.001]) * R.randint(1, 9) + R.choice([0, 0.05, 0.005]), 3) for _ in range(6)})[:4]
    if len(xs) < 4: return
    asc = sorted(xs); shown = xs[:]; R.shuffle(shown)
    if shown == asc: return
    j = lambda a: ", ".join(fmt(x) for x in a)
    mc("Place value", "Order positive and negative integers and decimals", f"Put these in order, smallest first: {j(shown)}", j(asc),
       [j(sorted(xs, key=lambda x: len(fmt(x)))), j(sorted(xs, reverse=True)), j(shown)], "Compare the whole numbers first, then tenths, hundredths and thousandths. Writing them with the same number of decimal places helps.")
def pv_value():
    n = R.randint(100000, 9999999) + R.randint(0, 999) / 1000; s = f"{n:.3f}"; digits = s.replace(".", "")
    names = {6: "millions", 5: "hundred thousands", 4: "ten thousands", 3: "thousands", 2: "hundreds", 1: "tens", 0: "ones", -1: "tenths", -2: "hundredths", -3: "thousandths"}
    ip = s.split(".")[0]; pos = R.randrange(len(digits)); d = digits[pos]
    if d == "0": return
    p = len(ip) - 1 - pos if pos < len(ip) else -(pos - len(ip) + 1)
    val = int(d) * Fraction(10) ** p
    add("Place value", "Understand place value in integers and decimals", f"What is the value of the digit {d} in {fmt(n)}?", "n", float(val) if p < 0 else int(val),
        f"The {d} is in the {names[p]} column, so it is worth {d} × {fmt(float(Fraction(10)**p)) if p<0 else fmt(10**p)} = {fmt(float(val)) if p<0 else fmt(int(val))}.")
def pv_compare():
    a = round(R.randint(-999, 999) / R.choice([10, 100]), 2); b = round(a + R.choice([-1, 1]) * R.choice([0.1, 0.01, 0.09, 1, 0.5]), 2)
    if a == b: return
    sym = "<" if a < b else ">"
    mc("Place value", "Use the symbols =, ≠, <, >, ≤, ≥", f"Which symbol makes this true?  {fmt(a)}  ?  {fmt(b)}", sym, [">" if sym == "<" else "<", "="],
       f"{fmt(min(a,b))} is smaller than {fmt(max(a,b))}" + (" (with negatives, the number further below zero is smaller)." if min(a, b) < 0 else "."))
def pv_between():
    a = R.randint(1, 98) / 10; b = round(a + 0.1, 1); m = round((a + b) / 2, 2)
    add("Place value", "Understand place value in integers and decimals", f"Which number is exactly halfway between {fmt(a)} and {fmt(b)}?", "n", m, f"({fmt(a)} + {fmt(b)}) ÷ 2 = {fmt(round(a+b,1))} ÷ 2 = {fmt(m)}.")

# =============================== Negative numbers ===============================
def neg_add():
    a, b = R.randint(-20, 20), R.randint(-20, 20); op = R.choice("+−")
    if a >= 0 and b >= 0: return
    r = a + b if op == "+" else a - b
    tip = "Subtracting a negative is the same as adding." if op == "−" and b < 0 else "Adding a negative is the same as subtracting." if op == "+" and b < 0 else "Use a number line and count through zero."
    add("Negative numbers", "Add and subtract positive and negative integers", f"Work out {fmt(a)} {op} {br(b)}.", "n", r, f"{tip} {fmt(a)} {op} {br(b)} = {fmt(r)}.")
def neg_mul():
    a, b = R.randint(-12, 12), R.randint(-12, 12)
    if a * b == 0 or (a > 0 and b > 0): return
    if R.random() < .5:
        add("Negative numbers", "Multiply and divide positive and negative integers", f"Work out {fmt(a)} × {br(b)}.", "n", a * b,
            f"{abs(a)} × {abs(b)} = {abs(a*b)}. {'Two negatives make a positive' if a<0 and b<0 else 'A negative times a positive is negative'}, so the answer is {fmt(a*b)}.")
    else:
        p = a * b
        add("Negative numbers", "Multiply and divide positive and negative integers", f"Work out {fmt(p)} ÷ {br(a)}.", "n", b,
            f"{abs(p)} ÷ {abs(a)} = {abs(b)}. {'The signs are the same, so the answer is positive' if (p<0)==(a<0) else 'The signs are different, so the answer is negative'}: {fmt(b)}.")
def neg_context():
    t = R.choice(["temp", "bank", "lift"])
    if t == "temp":
        a = R.randint(-15, 5); d = R.randint(3, 18); city = R.choice(["Oslo", "Moscow", "Helsinki", "Ottawa", "Reykjavik", "Warsaw"])
        add("Negative numbers", "Use negative numbers in context", f"At 6am the temperature in {city} was {fmt(a)}°C. By midday it was {d} degrees warmer. What was the temperature at midday?", "n", a + d, f"{fmt(a)} + {d} = {fmt(a+d)}°C.", unit="°C")
    elif t == "bank":
        a = R.randint(20, 150); s = R.randint(a + 5, a + 120); n = nm()
        add("Negative numbers", "Use negative numbers in context", f"{n} has £{a} in a bank account and spends £{s} using an overdraft. What is the new balance in pounds?", "n", a - s, f"{a} − {s} = {fmt(a-s)}, so the balance is −£{s-a}.", unit="£")
    else:
        a = R.randint(-3, 8); d = R.randint(2, 9)
        add("Negative numbers", "Use negative numbers in context", f"A lift is on floor {fmt(a)}. It goes down {d} floors. Which floor is it on now? (Floor 0 is the ground floor.)", "n", a - d, f"{fmt(a)} − {d} = {fmt(a-d)}.")
def neg_order():
    xs = R.sample(range(-30, 30), 5); asc = sorted(xs); shown = xs[:]
    if shown == asc or shown == asc[::-1]: return
    j = lambda a: ", ".join(fmt(x) for x in a)
    mc("Negative numbers", "Order positive and negative integers", f"Put these in order, smallest first: {j(shown)}", j(asc), [j(sorted(xs, key=abs)), j(sorted(xs, reverse=True)), j(shown)],
       "The further a negative number is below zero, the smaller it is.")

# =============================== Order of operations ===============================
def bidmas():
    a, b, c, d = R.randint(2, 12), R.randint(2, 12), R.randint(2, 9), R.randint(1, 9)
    forms = [
        (f"{a} + {b} × {c}", a + b * c, f"Multiply first: {b} × {c} = {b*c}. Then {a} + {b*c} = {a+b*c}."),
        (f"({a} + {b}) × {c}", (a + b) * c, f"Brackets first: {a} + {b} = {a+b}. Then × {c} = {(a+b)*c}."),
        (f"{a*c} ÷ {c} + {d}", a + d, f"Divide first: {a*c} ÷ {c} = {a}. Then + {d} = {a+d}."),
        (f"{b*c+d} − {b} × {c}", d, f"Multiply first: {b} × {c} = {b*c}. Then {b*c+d} − {b*c} = {d}."),
        (f"{a}² − {b} × {c}", a * a - b * c, f"Index first: {a}² = {a*a}. Then {b} × {c} = {b*c}. {a*a} − {b*c} = {fmt(a*a-b*c)}."),
        (f"{a} × ({b} − {c}) + {d}", a * (b - c) + d, f"Brackets: {b} − {c} = {fmt(b-c)}. Then {a} × {br(b-c)} = {fmt(a*(b-c))}, + {d} = {fmt(a*(b-c)+d)}."),
        (f"({a} + {b})² − {c}", (a + b) ** 2 - c, f"Brackets: {a} + {b} = {a+b}. Index: {a+b}² = {(a+b)**2}. Then − {c} = {(a+b)**2-c}."),
        (f"{c} + {a} × {b} − {d}", c + a * b - d, f"Multiply first: {a} × {b} = {a*b}. Then {c} + {a*b} − {d} = {c+a*b-d}."),
        (f"{a*b} ÷ ({b} × 1) − {c}", a - c, f"Brackets: {b} × 1 = {b}. {a*b} ÷ {b} = {a}. {a} − {c} = {fmt(a-c)}."),
    ]
    e, r, w = R.choice(forms)
    add("Order of operations", "Use conventional notation for priority of operations (BIDMAS)", f"Work out {e}.", "n", r, w)
def bidmas_brackets():
    a, b, c = R.randint(2, 9), R.randint(2, 9), R.randint(2, 9)
    target = (a + b) * c
    mc("Order of operations", "Use conventional notation for priority of operations (BIDMAS)", f"Where do the brackets go to make this true?  {a} + {b} × {c} = {target}",
       f"({a} + {b}) × {c}", [f"{a} + ({b} × {c})", f"{a} + {b} × ({c})", f"({a}) + {b} × {c}"], f"({a} + {b}) × {c} = {a+b} × {c} = {target}. Without brackets you would multiply first and get {a+b*c}.")

# =============================== Factors, multiples and primes ===============================
def pf(n):
    out, d = [], 2
    while n > 1:
        while n % d == 0: out.append(d); n //= d
        d += 1
    return out
def pf_str(fs):
    from collections import Counter
    return " × ".join(f"{p}{'²³⁴⁵⁶'[k-2] if k>1 else ''}" for p, k in sorted(Counter(fs).items()))
def fm_hcf():
    g = R.choice([2, 3, 4, 5, 6, 7, 8, 9, 12, 15]); a, b = g * R.randint(2, 12), g * R.randint(2, 12)
    if a == b: return
    h = math.gcd(a, b)
    add("Factors, multiples and primes", "Find the highest common factor (HCF)", f"What is the highest common factor (HCF) of {a} and {b}?", "n", h,
        f"{a} = {pf_str(pf(a))} and {b} = {pf_str(pf(b))}. Multiply the prime factors they share: HCF = {h}.")
def fm_lcm():
    a, b = R.randint(3, 18), R.randint(3, 18)
    if a == b: return
    l = a * b // math.gcd(a, b)
    add("Factors, multiples and primes", "Find the lowest common multiple (LCM)", f"What is the lowest common multiple (LCM) of {a} and {b}?", "n", l,
        f"Multiples of {a}: {', '.join(str(a*k) for k in range(1, min(6, l//a)+1))}… The first one that is also a multiple of {b} is {l}.")
def fm_pf():
    n = R.choice([2, 3, 5, 7]) * R.choice([2, 3, 5]) * R.choice([2, 3, 4, 5, 6, 7, 9, 10])
    if n < 20: return
    fs = pf(n); right = pf_str(fs)
    wrong = set()
    for _ in range(12):
        f2 = fs[:]; i = R.randrange(len(f2)); f2[i] = R.choice([2, 3, 5, 7, 11])
        if math.prod(f2) != n: wrong.add(pf_str(f2))
    mc("Factors, multiples and primes", "Write a number as a product of its prime factors", f"Write {n} as a product of prime factors.", right, list(wrong) + [f"{n//fs[0]} × {fs[0]}"],
       f"Keep dividing by primes: {' × '.join(map(str, fs))} = {n}, which is {right}.")
def fm_prime():
    ps = [p for p in range(20, 120) if all(p % d for d in range(2, int(p**.5) + 1))]
    p = R.choice(ps); nonp = [n for n in range(21, 120) if n % 2 and n % 5 and not all(n % d for d in range(2, int(n**.5) + 1))]
    w = R.sample(nonp, 3)
    mc("Factors, multiples and primes", "Use the concepts of prime numbers", "Which of these numbers is prime?", str(p), [str(x) for x in w],
       f"{p} has exactly two factors, 1 and {p}. " + "; ".join(f"{x} = {pf_str(pf(x)).replace('²','²')}" for x in w) + ".")
def fm_factors():
    n = R.choice([24, 30, 36, 40, 42, 48, 54, 56, 60, 64, 72, 80, 84, 90, 96, 100, 108, 120, 144])
    fs = [d for d in range(1, n + 1) if n % d == 0]
    t = R.choice(["count", "sum", "pair"])
    if t == "count":
        add("Factors, multiples and primes", "Use the concepts of factors", f"How many factors does {n} have?", "n", len(fs), f"The factors of {n} are {', '.join(map(str, fs))}: {len(fs)} factors.")
    elif t == "pair":
        a = R.choice(fs[1:-1]); add("Factors, multiples and primes", "Use the concepts of factors", f"{a} × ? = {n}. What is the missing factor?", "n", n // a, f"{n} ÷ {a} = {n//a}.")
    else:
        k = R.choice([2, 3, 5]); s = sum(d for d in fs if d % k == 0)
        add("Factors, multiples and primes", "Use the concepts of factors and multiples", f"What is the sum of all the factors of {n} that are multiples of {k}?", "n", s,
            f"Factors of {n} that are multiples of {k}: {', '.join(str(d) for d in fs if d % k == 0)}. Their sum is {s}.")
def fm_problem():
    a, b = R.choice([(6, 8), (4, 10), (12, 15), (6, 9), (8, 12), (10, 15), (9, 12), (14, 21), (20, 30)]); t = R.choice(["bus", "pack"])
    if t == "bus":
        l = a * b // math.gcd(a, b)
        add("Factors, multiples and primes", "Solve problems with HCF and LCM", f"One bus leaves every {a} minutes and another every {b} minutes. They both leave at 9:00. After how many minutes will they next leave together?", "n", l, f"This is the LCM of {a} and {b}, which is {l}.", unit="min")
    else:
        x, y = a * R.randint(2, 5), b * R.randint(2, 5); h = math.gcd(x, y)
        add("Factors, multiples and primes", "Solve problems with HCF and LCM", f"{x} pens and {y} pencils are shared into identical packs with nothing left over. What is the greatest number of packs that can be made?", "n", h, f"This is the HCF of {x} and {y}, which is {h}.")

# =============================== Powers and roots ===============================
def pw_basic():
    t = R.choice(["sq", "cube", "sqrt", "cbrt", "pow", "sqsum"])
    if t == "sq": n = R.randint(11, 25); add("Powers and roots", "Use square numbers", f"What is {n}²?", "n", n * n, f"{n}² = {n} × {n} = {n*n}.")
    elif t == "cube": n = R.randint(2, 10); add("Powers and roots", "Use cube numbers", f"What is {n}³?", "n", n ** 3, f"{n}³ = {n} × {n} × {n} = {n**3}.")
    elif t == "sqrt": n = R.randint(4, 20); add("Powers and roots", "Use square roots", f"What is √{n*n}?", "n", n, f"{n} × {n} = {n*n}, so √{n*n} = {n}.")
    elif t == "cbrt": n = R.randint(2, 10); add("Powers and roots", "Use cube roots", f"What is the cube root of {n**3}?", "n", n, f"{n} × {n} × {n} = {n**3}, so ∛{n**3} = {n}.")
    elif t == "pow":
        b, e = R.choice([(2, R.randint(4, 10)), (3, R.randint(3, 6)), (5, R.randint(2, 4)), (10, R.randint(2, 6)), (4, 3), (6, 3)])
        sup = "⁰¹²³⁴⁵⁶⁷⁸⁹"; add("Powers and roots", "Use index notation", f"What is {b}{''.join(sup[int(c)] for c in str(e))}?", "n", b ** e, f"Multiply {b} by itself {e} times: {' × '.join([str(b)]*e)} = {fmt(b**e)}.")
    else:
        a, b = R.randint(2, 12), R.randint(2, 6); add("Powers and roots", "Use square and cube numbers", f"Work out {a}² + {b}³.", "n", a * a + b ** 3, f"{a}² = {a*a} and {b}³ = {b**3}. {a*a} + {b**3} = {a*a+b**3}.")
def pw_estimate():
    n = R.randint(5, 140)
    if int(n ** .5) ** 2 == n: return
    lo = int(n ** .5)
    mc("Powers and roots", "Estimate square roots", f"Between which two whole numbers does √{n} lie?", f"{lo} and {lo+1}", [f"{lo-1} and {lo}", f"{lo+1} and {lo+2}", f"{n//2} and {n//2+1}"],
       f"{lo}² = {lo*lo} and {lo+1}² = {(lo+1)**2}. {n} is between them, so √{n} is between {lo} and {lo+1}.")
def pw_squarecheck():
    sq = R.randint(4, 15) ** 2; w = [sq + R.choice([-3, -2, -1, 1, 2, 5]) for _ in range(5)]
    w = [x for x in dict.fromkeys(w) if int(x ** .5) ** 2 != x]
    mc("Powers and roots", "Recognise square numbers", "Which of these is a square number?", str(sq), [str(x) for x in w], f"{sq} = {int(sq**.5)} × {int(sq**.5)}.")

# =============================== Rounding and estimation ===============================
def rd_dp():
    x = round(R.uniform(0.1, 99), 4); p = R.choice([1, 2, 3]); r = rnd(x, p)
    if rnd(x, 4) == r: return
    add("Rounding and estimation", "Round numbers to a number of decimal places", f"Round {fmt(x)} to {p} decimal place{'s' if p>1 else ''}.", "n", r,
        f"Look at the digit in decimal place {p+1}. {'5 or more: round up' if int(f'{x:.6f}'.split('.')[1][p])>=5 else 'Less than 5: round down'}. Answer: {f'{r:.{p}f}'}.")
def rd_sf():
    x = R.choice([R.randint(1000, 999999), round(R.uniform(0.001, 0.999), 5), round(R.uniform(10, 999), 3)]); s = R.choice([1, 2, 3]); r = sig(x, s)
    if r == x: return
    add("Rounding and estimation", "Round numbers to a number of significant figures", f"Round {fmt(x)} to {s} significant figure{'s' if s>1 else ''}.", "n", r,
        f"The first significant figure is the first non-zero digit. Keep {s} significant figure{'s' if s>1 else ''} and round: {fmt(r)}.")
def rd_estimate():
    a = R.choice([R.randint(11, 99) + R.randint(1, 9) / 10, R.randint(101, 999)]); b = R.choice([R.randint(11, 99), round(R.uniform(2, 9.9), 1)])
    ea, eb = sig(a, 1), sig(b, 1); op = R.choice("×÷")
    if op == "÷":
        if eb == 0 or ea % eb: return
        e = ea // eb
    else: e = ea * eb
    w = [fmt(e * 10), fmt(e // 10) if e >= 100 else fmt(e + eb), fmt(e + ea)]
    mc("Rounding and estimation", "Estimate answers by rounding to one significant figure", f"Estimate {fmt(a)} {op} {fmt(b)} by rounding each number to 1 significant figure.", fmt(e), w,
       f"{fmt(a)} ≈ {fmt(ea)} and {fmt(b)} ≈ {fmt(eb)}. {fmt(ea)} {op} {fmt(eb)} = {fmt(e)}.")
def rd_bounds():
    n = R.randint(2, 99) * 10; u = R.choice(["cm", "kg", "m"])
    add("Rounding and estimation", "Use error intervals", f"A {'mass' if u=='kg' else 'length'} is {n} {u} to the nearest 10 {u}. What is the smallest it could be?", "n", n - 5, f"Halfway down to the next 10 is {n} − 5 = {n-5} {u}.", unit=u)

# =============================== Fractions ===============================
def fr_addsub():
    d1, d2 = R.choice([2, 3, 4, 5, 6, 8, 10, 12]), R.choice([2, 3, 4, 5, 6, 8, 9, 10, 12])
    a, b = Fraction(R.randint(1, d1 - 1), d1), Fraction(R.randint(1, d2 - 1), d2); op = R.choice("+−")
    if op == "−" and b > a: a, b = b, a
    r = a + b if op == "+" else a - b
    if r == 0 or a.denominator == b.denominator: return
    L = a.denominator * b.denominator // math.gcd(a.denominator, b.denominator)
    na, nb = a.numerator * (L // a.denominator), b.numerator * (L // b.denominator); nr = na + nb if op == "+" else na - nb
    add("Fractions", "Add and subtract fractions with different denominators", f"Work out {frac(a)} {op} {frac(b)}. Give your answer in its simplest form.", "f", mixed(r),
        f"Use a common denominator of {L}: {na}/{L} {op} {nb}/{L} = {nr}/{L}" + (f" = {mixed(r)}." if mixed(r) != f"{nr}/{L}" else "."))
def fr_mixed_ops():
    a = Fraction(R.randint(1, 3)) + Fraction(R.randint(1, 3), 4); b = Fraction(R.randint(1, 2)) + Fraction(R.randint(1, 2), R.choice([3, 4, 6])); op = R.choice("+−")
    if op == "−" and b > a: a, b = b, a
    r = a + b if op == "+" else a - b
    if r <= 0: return
    add("Fractions", "Add and subtract mixed numbers", f"Work out {mixed(a)} {op} {mixed(b)}. Give your answer in its simplest form.", "f", mixed(r),
        f"As improper fractions: {frac(a)} {op} {frac(b)} = {frac(r)}" + (f" = {mixed(r)}." if mixed(r) != frac(r) else "."))
def fr_mul():
    a = Fraction(R.randint(1, 9), R.randint(2, 10)); b = Fraction(R.randint(1, 9), R.randint(2, 10))
    if a >= 1 or b >= 1: return
    r = a * b
    add("Fractions", "Multiply fractions", f"Work out {frac(a)} × {frac(b)}. Give your answer in its simplest form.", "f", frac(r),
        f"Multiply the numerators and the denominators: {a.numerator*b.numerator}/{a.denominator*b.denominator}" + (f" = {frac(r)}." if Fraction(a.numerator*b.numerator, a.denominator*b.denominator).denominator != a.denominator*b.denominator else "."))
def fr_div():
    a = Fraction(R.randint(1, 9), R.randint(2, 10)); b = Fraction(R.randint(1, 9), R.randint(2, 10))
    if a >= 1 or b >= 1: return
    r = a / b
    add("Fractions", "Divide fractions", f"Work out {frac(a)} ÷ {frac(b)}. Give your answer in its simplest form.", "f", mixed(r),
        f"Keep, change, flip: {frac(a)} × {b.denominator}/{b.numerator} = {frac(r)}" + (f" = {mixed(r)}." if r > 1 and r.denominator != 1 else "."))
def fr_of():
    d = R.choice([3, 4, 5, 6, 7, 8, 9, 12]); n = R.randint(1, d - 1); amt = d * R.randint(3, 60); u = R.choice(["", "£", " kg", " m"])
    r = amt // d * n
    q = f"What is {n}/{d} of {'£' if u=='£' else ''}{fmt(amt)}{u if u!='£' else ''}?"
    add("Fractions", "Find a fraction of an amount", q, "n", r, f"{fmt(amt)} ÷ {d} = {fmt(amt//d)}, then × {n} = {fmt(r)}.", unit=(u.strip() or None))
def fr_reverse():
    d = R.choice([3, 4, 5, 8, 10]); n = R.randint(1, d - 1)
    if math.gcd(n, d) > 1: return
    whole = d * R.randint(4, 30); part = whole // d * n
    add("Fractions", "Find the whole from a fraction", f"{n}/{d} of a number is {part}. What is the number?", "n", whole, f"{part} ÷ {n} = {part//n} is 1/{d}. × {d} = {whole}.")
def fr_compare():
    a, b = Fraction(R.randint(1, 8), R.randint(2, 9)), Fraction(R.randint(1, 8), R.randint(2, 9))
    if a == b or a >= 1 or b >= 1: return
    big = max(a, b); L = a.denominator * b.denominator // math.gcd(a.denominator, b.denominator)
    add("Fractions", "Compare fractions", f"Which is larger: {frac(a)} or {frac(b)}?", "c", [frac(a), frac(b)].index(frac(big)),
        f"With denominator {L}: {frac(a)} = {a*L}/{L} and {frac(b)} = {b*L}/{L}. So {frac(big)} is larger.", opts=[frac(a), frac(b)])
def fr_simplify():
    a = Fraction(R.randint(1, 11), R.randint(2, 12)); k = R.randint(2, 9)
    if a >= 1: return
    add("Fractions", "Simplify fractions", f"Write {a.numerator*k}/{a.denominator*k} in its simplest form.", "f", frac(a), f"Divide top and bottom by their HCF, {math.gcd(a.numerator*k, a.denominator*k)}: {frac(a)}.")
def fr_mul_int():
    a = Fraction(R.randint(1, 7), R.randint(2, 8)); k = R.randint(2, 15)
    if a >= 1: return
    r = a * k
    add("Fractions", "Multiply fractions by integers", f"Work out {frac(a)} × {k}. Give your answer as a mixed number or whole number in its simplest form.", "f", mixed(r), f"{a.numerator} × {k} = {a.numerator*k}, so {a.numerator*k}/{a.denominator} = {mixed(r)}.")

# =============================== Decimals ===============================
def dc_ops():
    t = R.choice(["add", "sub", "mulint", "muldec", "divint"])
    if t in ("add", "sub"):
        a, b = round(R.uniform(1, 99), R.choice([1, 2, 3])), round(R.uniform(0.1, 50), R.choice([1, 2]))
        if t == "sub" and b > a: a, b = b, a
        r = round(a + b if t == "add" else a - b, 4); op = "+" if t == "add" else "−"
        add("Decimals", "Add and subtract decimals", f"Work out {fmt(a)} {op} {fmt(b)}.", "n", r, f"Line up the decimal points: {fmt(a)} {op} {fmt(b)} = {fmt(r)}.")
    elif t == "mulint":
        a = round(R.uniform(0.1, 30), R.choice([1, 2])); k = R.randint(2, 9); r = round(a * k, 4)
        add("Decimals", "Multiply decimals", f"Work out {fmt(a)} × {k}.", "n", r, f"{fmt(a)} × {k} = {fmt(r)}.")
    elif t == "muldec":
        a, b = R.randint(2, 9), R.randint(2, 9); da, db = R.choice([1, 10, 100]), R.choice([10, 100]); x, y = a / da, b / db; r = round(x * y, 6)
        add("Decimals", "Multiply decimals", f"Work out {fmt(x)} × {fmt(y)}.", "n", r, f"{a} × {b} = {a*b}. There are {len(str(da))-1 + len(str(db))-1} decimal places in the question, so the answer is {fmt(r)}.")
    else:
        k = R.randint(2, 9); r = round(R.uniform(0.1, 20), 2); a = round(r * k, 4)
        add("Decimals", "Divide decimals", f"Work out {fmt(a)} ÷ {k}.", "n", r, f"Short division, keeping the decimal point in line: {fmt(a)} ÷ {k} = {fmt(r)}.")
def dc_divdec():
    a = R.randint(2, 99); b = R.choice([0.1, 0.2, 0.5, 0.25, 0.4, 0.01]); r = a / b
    if not float(r).is_integer(): return
    add("Decimals", "Divide by a decimal", f"Work out {a} ÷ {fmt(b)}.", "n", int(r), f"Multiply both numbers to make the divisor whole, then divide: {a} ÷ {fmt(b)} = {fmt(int(r))}.")

# =============================== Percentages and FDP ===============================
def pc_of():
    p = R.choice([5, 10, 12.5, 15, 20, 25, 30, 35, 40, 45, 60, 65, 75, 80, 90, 1, 2.5, 17.5]); amt = R.choice([40, 60, 80, 120, 160, 200, 240, 360, 400, 480, 640, 800, 1200])
    r = amt * p / 100
    add("Percentages", "Find a percentage of an amount", f"What is {fmt(p)}% of {fmt(amt)}?", "n", r, f"{fmt(p)}% = {fmt(p)}/100. {fmt(amt)} × {fmt(p)} ÷ 100 = {fmt(r)}.")
def pc_change():
    p = R.choice([5, 10, 15, 20, 25, 30, 40, 50, 60, 75]); amt = R.choice([20, 40, 60, 80, 120, 150, 200, 250, 300, 400, 500]); up = R.random() < .5
    r = amt * (100 + p) / 100 if up else amt * (100 - p) / 100
    ctx = R.choice([(f"A jacket costs £{amt}. In a sale the price is reduced by {p}%. What is the sale price?", False, "£"),
                    (f"A school has {amt} pupils. Next year the number goes up by {p}%. How many pupils will there be?", True, None),
                    (f"A rent of £{amt} a week increases by {p}%. What is the new weekly rent?", True, "£")])
    q, up, u = ctx; r = amt * (100 + p) / 100 if up else amt * (100 - p) / 100
    if u is None and not float(r).is_integer(): return
    add("Percentages", "Increase and decrease by a percentage", q, "n", r, f"{'Increase' if up else 'Decrease'}: {fmt(amt)} × {fmt((100+p if up else 100-p)/100)} = {fmt(r)}." + (f" (Or find {p}% = {fmt(amt*p/100)} and {'add' if up else 'subtract'} it.)"), unit=u)
def pc_express():
    whole = R.choice([20, 25, 40, 50, 80, 200, 250, 400, 500]); part = R.randint(1, whole - 1); p = Fraction(part * 100, whole)
    if p.denominator not in (1, 2, 4): return
    ctx = R.choice([f"{nm()} scored {part} out of {whole} in a test. What percentage is that?", f"{part} out of {whole} people in a survey chose football. What percentage chose football?"])
    add("Percentages", "Express one quantity as a percentage of another", ctx, "n", float(p), f"{part}/{whole} × 100 = {fmt(float(p))}%.", unit="%")
def pc_fdp():
    f = R.choice([Fraction(1, 2), Fraction(1, 4), Fraction(3, 4), Fraction(1, 5), Fraction(2, 5), Fraction(3, 5), Fraction(4, 5), Fraction(1, 8), Fraction(3, 8), Fraction(5, 8), Fraction(7, 8),
                  Fraction(1, 10), Fraction(3, 10), Fraction(7, 10), Fraction(9, 10), Fraction(1, 20), Fraction(3, 20), Fraction(7, 20), Fraction(1, 25), Fraction(6, 25), Fraction(1, 50), Fraction(13, 50)])
    d = float(f); p = d * 100; t = R.choice(["f2d", "f2p", "p2f", "d2p", "p2d"])
    if t == "f2d": add("Percentages", "Convert between fractions, decimals and percentages", f"Write {frac(f)} as a decimal.", "n", d, f"{f.numerator} ÷ {f.denominator} = {fmt(d)}.")
    elif t == "f2p": add("Percentages", "Convert between fractions, decimals and percentages", f"Write {frac(f)} as a percentage.", "n", p, f"{frac(f)} = {fmt(d)} = {fmt(p)}%.", unit="%")
    elif t == "p2f": add("Percentages", "Convert between fractions, decimals and percentages", f"Write {fmt(p)}% as a fraction in its simplest form.", "f", frac(f), f"{fmt(p)}% = {fmt(p)}/100 = {frac(f)}.")
    elif t == "d2p": add("Percentages", "Convert between fractions, decimals and percentages", f"Write {fmt(d)} as a percentage.", "n", p, f"Multiply by 100: {fmt(d)} × 100 = {fmt(p)}%.", unit="%")
    else: add("Percentages", "Convert between fractions, decimals and percentages", f"Write {fmt(p)}% as a decimal.", "n", d, f"Divide by 100: {fmt(p)} ÷ 100 = {fmt(d)}.")
def pc_order():
    vals = R.sample([(Fraction(1, 2), "1/2"), (Fraction(3, 5), "0.6"), (Fraction(13, 20), "65%"), (Fraction(2, 5), "2/5"), (Fraction(9, 20), "45%"), (Fraction(7, 10), "0.7"), (Fraction(3, 4), "3/4"),
                     (Fraction(33, 100), "33%"), (Fraction(1, 3), "1/3"), (Fraction(8, 25), "0.32"), (Fraction(4, 5), "80%"), (Fraction(41, 50), "0.82")], 4)
    if len({v for v, _ in vals}) < 4: return
    asc = [s for _, s in sorted(vals)]; shown = [s for _, s in vals]
    if shown == asc: return
    mc("Percentages", "Order fractions, decimals and percentages", f"Put these in order, smallest first: {', '.join(shown)}", ", ".join(asc), [", ".join(shown), ", ".join(asc[::-1]), ", ".join(sorted(shown))],
       "Change them all to decimals: " + ", ".join(f"{s} = {fmt(round(float(v),3))}" for v, s in sorted(vals)) + ".")

# =============================== Ratio and proportion ===============================
def ra_simplify():
    g = R.randint(2, 12); a, b = R.randint(1, 9), R.randint(1, 9)
    if math.gcd(a, b) != 1 or a == b: return
    if R.random() < .7:
        mc("Ratio and proportion", "Simplify ratios", f"Write the ratio {a*g} : {b*g} in its simplest form.", f"{a} : {b}", [f"{b} : {a}", f"{a*2} : {b*2}", f"{a+1} : {b+1}", f"{a*g//math.gcd(a*g,2)} : {b*g//math.gcd(a*g,2)}"],
           f"Divide both parts by their HCF, {g}: {a} : {b}.")
    else:
        c = R.randint(1, 9)
        if math.gcd(math.gcd(a, b), c) != 1: return
        mc("Ratio and proportion", "Simplify ratios", f"Write the ratio {a*g} : {b*g} : {c*g} in its simplest form.", f"{a} : {b} : {c}", [f"{c} : {b} : {a}", f"{a*2} : {b*2} : {c*2}", f"{a+1} : {b} : {c}"], f"Divide all three parts by {g}.")
def ra_share():
    a, b = R.randint(1, 7), R.randint(1, 7)
    if a == b: return
    unit = R.randint(3, 40); tot = (a + b) * unit; n1, n2 = R.sample(NAMES, 2); ask = R.choice([0, 1])
    add("Ratio and proportion", "Divide a quantity in a given ratio", f"{n1} and {n2} share £{tot} in the ratio {a} : {b}. How much does {[n1,n2][ask]} get?", "n", [a, b][ask] * unit,
        f"There are {a} + {b} = {a+b} parts. One part is £{tot} ÷ {a+b} = £{unit}. {[n1,n2][ask]} gets {[a,b][ask]} × £{unit} = £{[a,b][ask]*unit}.", unit="£")
def ra_diff():
    a, b = R.randint(2, 9), R.randint(1, 8)
    if a <= b: return
    unit = R.randint(2, 15); diff = (a - b) * unit
    add("Ratio and proportion", "Solve ratio problems", f"Red and blue counters are in the ratio {a} : {b}. There are {diff} more red counters than blue. How many counters are there altogether?", "n", (a + b) * unit,
        f"The difference is {a} − {b} = {a-b} parts = {diff}, so one part is {unit}. Total {a+b} parts = {(a+b)*unit}.")
def ra_unitary():
    k = R.randint(2, 9); per = R.choice([35, 40, 45, 60, 75, 80, 120, 150, 250]); m = R.randint(2, 15)
    if m == k: return
    item = R.choice([("pencils", "p"), ("bottles of water", "p"), ("tickets", "£")])
    if item[1] == "£":
        add("Ratio and proportion", "Solve problems involving direct proportion", f"{k} {item[0]} cost £{k*per}. How much do {m} {item[0]} cost?", "n", m * per, f"One costs £{k*per} ÷ {k} = £{per}. {m} cost {m} × £{per} = £{m*per}.", unit="£")
    else:
        add("Ratio and proportion", "Solve problems involving direct proportion", f"{k} {item[0]} cost {k*per}p. How much do {m} {item[0]} cost, in pence?", "n", m * per, f"One costs {k*per}p ÷ {k} = {per}p. {m} cost {m} × {per} = {m*per}p.", unit="p")
def ra_recipe():
    s = R.choice([2, 4, 6, 8]); t = R.choice([3, 5, 10, 12, 9, 6]); g = R.choice([100, 120, 150, 200, 240, 300, 360])
    if s == t or (g * t) % s: return
    add("Ratio and proportion", "Scale quantities using ratio", f"A recipe for {s} people needs {g} g of flour. How much flour is needed for {t} people?", "n", g * t // s, f"For 1 person: {g} ÷ {s} = {fmt(g/s)} g. For {t}: {fmt(g/s)} × {t} = {g*t//s} g.", unit="g")
def ra_bestbuy():
    a, b = R.choice([(4, 6), (3, 5), (6, 10), (2, 5), (8, 12)]); pa, pb = R.randint(150, 400), R.randint(200, 700)
    ua, ub = Fraction(pa, a), Fraction(pb, b)
    if ua == ub: return
    better = "A" if ua < ub else "B"
    mc("Ratio and proportion", "Compare unit prices", f"Pack A has {a} yoghurts for {money(pa)}. Pack B has {b} yoghurts for {money(pb)}. Which is better value?", f"Pack {better}", [f"Pack {'B' if better=='A' else 'A'}", "They are the same value"],
       f"Price per yoghurt: A = {fmt(round(float(ua),2))}p, B = {fmt(round(float(ub),2))}p. Pack {better} is cheaper per yoghurt.")
def ra_fraction():
    a, b = R.randint(1, 8), R.randint(1, 8)
    if a == b: return
    f = Fraction(a, a + b)
    add("Ratio and proportion", "Relate ratios to fractions", f"Boys and girls in a club are in the ratio {a} : {b}. What fraction of the club are boys? Give your answer in its simplest form.", "f", frac(f), f"There are {a} + {b} = {a+b} parts and {a} are boys: {a}/{a+b}" + (f" = {frac(f)}." if f.denominator != a + b else "."))

# =============================== Algebra: expressions ===============================
def term(c, v):
    if c == 0: return ""
    if v == "": return fmt(c)
    return ("−" if c < 0 else "") + ("" if abs(c) == 1 else str(abs(c))) + v
def expr(terms):  # [(coef, var)] -> "3x + 2y − 5"
    out = ""
    for c, v in terms:
        if c == 0: continue
        t = term(abs(c), v)
        out += (t if not out else f" + {t}") if c > 0 else (f"−{t}" if not out else f" − {t}")
    return out or "0"
def al_collect():
    a, b, c, d = [R.choice([x for x in range(-9, 10) if x]) for _ in range(4)]; v1, v2 = R.choice([("x", "y"), ("a", "b"), ("m", "n"), ("p", "q")])
    q = expr([(a, v1), (b, v2), (c, v1), (d, v2)]); r = expr([(a + c, v1), (b + d, v2)])
    wrong = [expr([(a + c, v1), (b - d, v2)]), expr([(a - c, v1), (b + d, v2)]), expr([(a + c + b + d, v1 + v2)]), expr([(abs(a) + abs(c), v1), (abs(b) + abs(d), v2)])]
    mc("Algebra", "Simplify expressions by collecting like terms", f"Simplify {q}", r, wrong, f"Collect the {v1} terms: {fmt(a)} + {br(c)} = {fmt(a+c)}. Collect the {v2} terms: {fmt(b)} + {br(d)} = {fmt(b+d)}. Answer: {r}.")
def al_sub():
    x, y = R.randint(-5, 9), R.randint(-4, 8)
    f = R.choice([("3x + 2y", "3 × X + 2 × Y", 3 * x + 2 * y), ("5x − y", "5 × X − Y", 5 * x - y), ("x² + y", "X² + Y", x * x + y), ("2(x + y)", "2 × (X + Y)", 2 * (x + y)),
                  ("xy − 4", "X × Y − 4", x * y - 4), ("4x − 3y", "4 × X − 3 × Y", 4 * x - 3 * y), ("x² − 2y", "X² − 2 × Y", x * x - 2 * y), ("10 − 2x", "10 − 2 × X", 10 - 2 * x), ("7 + 3x", "7 + 3 × X", 7 + 3 * x)])
    uses_y = "y" in f[0]
    sub = f[1].replace("X", br(x)).replace("Y", br(y))
    given = f"x = {fmt(x)} and y = {fmt(y)}" if uses_y else f"x = {fmt(x)}"
    add("Algebra", "Substitute numerical values into expressions", f"Work out the value of {f[0]} when {given}.", "n", f[2], f"{f[0]} = {sub} = {fmt(f[2])}. Remember BIDMAS.")
def al_expand():
    a = R.choice([x for x in range(-6, 10) if x not in (0, 1, -1)]); b, c = R.randint(1, 9), R.choice([x for x in range(-9, 10) if x]); v = R.choice("xyanp")
    q = f"{fmt(a)}({expr([(b, v), (c, '')])})"; r = expr([(a * b, v), (a * c, "")])
    wrong = [expr([(a * b, v), (c, "")]), expr([(a * b, v), (-a * c, "")]), expr([(a + b, v), (a * c, "")]), expr([(b, v), (a * c, "")])]
    mc("Algebra", "Expand a single bracket", f"Expand {q}", r, wrong, f"Multiply each term inside the bracket by {fmt(a)}: {fmt(a)} × {term(b,v)} = {term(a*b,v)} and {fmt(a)} × {br(c)} = {fmt(a*c)}. Answer: {r}.")
def al_expand2():
    a, b, c, d = R.randint(2, 6), R.randint(1, 9), R.randint(2, 5), R.choice([x for x in range(-8, 9) if x]); v = R.choice("xym")
    q = f"{a}({term(1,v)} + {b}) + {c}({expr([(1, v), (d, '')])})"; r = expr([(a + c, v), (a * b + c * d, "")])
    wrong = [expr([(a + c, v), (b + d, "")]), expr([(a * c, v), (a * b + c * d, "")]), expr([(a + c, v), (a * b - c * d, "")])]
    mc("Algebra", "Expand and simplify", f"Expand and simplify {q}", r, wrong, f"{a}({v} + {b}) = {term(a,v)} + {a*b}. {c}({expr([(1,v),(d,'')])}) = {expr([(c,v),(c*d,'')])}. Add: {r}.")
def al_factorise():
    g = R.randint(2, 9); b, c = R.randint(1, 9), R.randint(1, 9); v = R.choice("xyab")
    if math.gcd(b, c) != 1: return
    sign = R.choice([1, -1]); q = expr([(g * b, v), (sign * g * c, "")]); r = f"{g}({expr([(b, v), (sign * c, '')])})"
    wrong = [f"{g}({expr([(b*g, v), (sign*c, '')])})", f"{b}({expr([(g, v), (sign*c*g//b if (c*g)%b==0 else sign*c, '')])})", f"{g}({expr([(b, v), (-sign*c, '')])})", f"{g*b}({v} {'+' if sign>0 else '−'} {c})"]
    mc("Algebra", "Factorise by taking out a common factor", f"Factorise fully: {q}", r, wrong, f"The highest common factor of {g*b} and {g*c} is {g}. {q} = {r}.")
def al_form():
    n = nm(); k = R.randint(2, 9); m = R.randint(2, 20)
    opts = [(f"{n} is x years old. Their brother is {k} years older. Write an expression for the brother's age.", f"x + {k}", [f"{k}x", f"x − {k}", f"{k} − x"]),
            (f"A pen costs p pence and a rubber costs {m}p. Write an expression, in pence, for the cost of {k} pens and one rubber.", f"{k}p + {m}", [f"{k} + {m}p", f"{k+m}p", f"p + {k*m}"]),
            (f"There are n sweets shared equally between {k} friends. Write an expression for how many each friend gets.", f"n/{k}", [f"{k}n", f"n − {k}", f"{k}/n"]),
            (f"A rectangle is {k} cm wide and x cm long. Write an expression for its perimeter.", f"2x + {2*k}", [f"{k}x", f"x + {k}", f"2x + {k}"])]
    q, r, w = R.choice(opts)
    mc("Algebra", "Form algebraic expressions", q, r, w, f"The expression is {r}.")
def al_vocab():
    items = [("3x + 5", "expression"), ("y = 2x + 1", "formula"), ("2x + 3 = 11", "equation"), ("2(x + 1) ≡ 2x + 2", "identity"), ("4x", "term")]
    s, r = R.choice(items); others = [x for x in ["expression", "formula", "equation", "identity", "term"] if x != r]
    mc("Algebra", "Understand the vocabulary of algebra", f"Which word best describes {s}?", r, R.sample(others, 3),
       {"expression": "An expression has terms but no equals sign.", "formula": "A formula connects two or more variables, like y = 2x + 1.", "equation": "An equation has an equals sign and can be solved for one value.",
        "identity": "An identity is true for every value of x (≡).", "term": "A term is a single part such as 4x."}[r])

# =============================== Equations ===============================
def eq_solve():
    x = R.randint(-9, 15); a = R.choice([2, 3, 4, 5, 6, 7, 8, 9]); b = R.choice([y for y in range(-20, 25) if y]); t = R.choice(["ax+b", "ax-b", "x/a+b", "a(x+b)", "both"])
    if t == "ax+b": lhs, rhs, w = f"{a}x + {b}" if b > 0 else f"{a}x − {-b}", a * x + b, f"Subtract {b} from both sides, then divide by {a}." if b > 0 else f"Add {-b} to both sides, then divide by {a}."
    elif t == "ax-b": b = abs(b); lhs, rhs, w = f"{a}x − {b}", a * x - b, f"Add {b} to both sides, then divide by {a}."
    elif t == "x/a+b":
        b = abs(b); lhs, rhs, w = f"x/{a} + {b}", None, f"Subtract {b} from both sides, then multiply by {a}."
        x = a * R.randint(-5, 8); rhs = x // a + b
    elif t == "a(x+b)": b = R.randint(1, 9); lhs, rhs, w = f"{a}(x + {b})", a * (x + b), f"Divide both sides by {a}, then subtract {b}. (Or expand first.)"
    else:
        c = R.randint(1, a - 1) if a > 1 else 1; d = R.randint(1, 20); lhs = f"{a}x + {d}"; rhs_expr = expr([(c, "x"), (d + (a - c) * x, "")])
        add("Equations", "Solve linear equations with the unknown on both sides", f"Solve {lhs} = {rhs_expr}.", "n", x, f"Subtract {term(c,'x')} from both sides: {term(a-c,'x')} + {d} = {fmt(d+(a-c)*x)}. Then {term(a-c,'x')} = {fmt((a-c)*x)}, so x = {fmt(x)}.")
        return
    add("Equations", "Solve linear equations", f"Solve {lhs} = {fmt(rhs)}.", "n", x, f"{w} x = {fmt(x)}.")
def eq_word():
    x = R.randint(2, 30); a = R.randint(2, 6); b = R.randint(1, 20); n = nm()
    add("Equations", "Form and solve linear equations", f"{n} thinks of a number, multiplies it by {a} and adds {b}. The answer is {a*x+b}. What was the number?", "n", x,
        f"{a}x + {b} = {a*x+b}. Subtract {b}: {a}x = {a*x}. Divide by {a}: x = {x}.")
def eq_angles():
    x = R.randint(10, 40); a, b = R.randint(1, 3), R.randint(1, 4)
    if a * x + b * x >= 180: return
    c = 180 - (a + b) * x
    add("Equations", "Form and solve equations from geometry", f"The angles in a triangle are {term(a,'x')}, {term(b,'x')} and {c}°. Find x.", "n", x,
        f"Angles in a triangle add to 180°: {a+b}x + {c} = 180, so {a+b}x = {180-c} and x = {x}.", unit="°")
def eq_formula():
    t = R.choice(["speed", "rect", "cost"])
    if t == "speed":
        s, tt = R.randint(20, 90), R.randint(2, 6); add("Equations", "Substitute into formulae", f"Use d = st to find the distance d (in km) when s = {s} km/h and t = {tt} hours.", "n", s * tt, f"d = {s} × {tt} = {s*tt} km.", unit="km")
    elif t == "rect":
        l, w = R.randint(3, 20), R.randint(2, 15); add("Equations", "Substitute into formulae", f"The perimeter of a rectangle is P = 2l + 2w. Find P when l = {l} and w = {w}.", "n", 2 * l + 2 * w, f"P = 2 × {l} + 2 × {w} = {2*l+2*w}.")
    else:
        f, r, n = R.randint(20, 60), R.randint(2, 9), R.randint(2, 12)
        add("Equations", "Substitute into formulae", f"A taxi fare in pounds is C = {r}m + {f}, where m is the number of miles. Find C when m = {n}.", "n", r * n + f, f"C = {r} × {n} + {f} = {r*n+f}.", unit="£")

# =============================== Sequences ===============================
def sq_next():
    a, d = R.randint(-10, 20), R.choice([x for x in range(-9, 12) if x]); seq = [a + d * i for i in range(5)]
    k = R.choice([6, 7, 8, 10])
    add("Sequences", "Generate terms of a sequence from a term-to-term rule", f"The sequence {', '.join(fmt(x) for x in seq[:4])}, … continues in the same way. What is term {k}?", "n", a + d * (k - 1),
        f"The rule is {'add' if d>0 else 'subtract'} {abs(d)}. Term {k} = {fmt(a)} + {k-1} × {br(d)} = {fmt(a+d*(k-1))}.")
def sq_nth():
    d, c = R.choice([x for x in range(-6, 10) if x]), R.randint(-9, 9)
    seq = [d * n + c for n in range(1, 5)]; r = expr([(d, "n"), (c, "")])
    wrong = [expr([(seq[0], "n"), (d, "")]), expr([(d, "n"), (seq[0], "")]), expr([(d, "n"), (-c, "")]), expr([(c if c else 1, "n"), (d, "")])]
    mc("Sequences", "Find the nth term of a linear sequence", f"What is the nth term of the sequence {', '.join(fmt(x) for x in seq)}, …?", r, wrong,
       f"It goes up by {fmt(d)} each time, so start with {term(d,'n')}. When n = 1, {term(d,'n')} = {fmt(d)}, and the first term is {fmt(seq[0])}, so adjust by {fmt(c)}: {r}.")
def sq_term():
    d, c = R.randint(2, 9), R.randint(-9, 9); n = R.choice([10, 12, 20, 25, 50, 100])
    add("Sequences", "Use the nth term to generate terms", f"The nth term of a sequence is {expr([(d,'n'),(c,'')])}. What is the {n}th term?", "n", d * n + c, f"{d} × {n} {'+' if c>=0 else '−'} {abs(c)} = {d*n+c}.")
def sq_inseq():
    d, c = R.randint(3, 8), R.randint(-5, 6); n = R.randint(8, 40); yes = d * n + c; no = yes + R.randint(1, d - 1)
    pick = R.choice([True, False]); val = yes if pick else no
    mc("Sequences", "Decide whether a number is in a sequence", f"Is {val} a term in the sequence with nth term {expr([(d,'n'),(c,'')])}?", "Yes" if pick else "No", ["No" if pick else "Yes", "Only if n is even"],
       f"Solve {expr([(d,'n'),(c,'')])} = {val}: n = {fmt(Fraction(val - c, d)) if (val-c)%d else (val-c)//d}. " + ("That is a whole number, so yes." if pick else "That is not a whole number, so no."))
def sq_special():
    t = R.choice(["sq", "tri", "fib", "geo"])
    if t == "sq": k = R.randint(6, 12); add("Sequences", "Recognise special sequences", f"1, 4, 9, 16, 25, … are the square numbers. What is term {k} of this sequence?", "n", k * k, f"These are square numbers. Term {k} = {k}² = {k*k}.")
    elif t == "tri": k = R.randint(6, 12); add("Sequences", "Recognise special sequences", f"1, 3, 6, 10, 15, … are triangular numbers. What is the {k}th triangular number?", "n", k * (k + 1) // 2, f"Add one more each time: the {k}th is {k} × {k+1} ÷ 2 = {k*(k+1)//2}.")
    elif t == "fib":
        a, b = R.randint(1, 5), R.randint(1, 6); s = [a, b]
        for _ in range(6): s.append(s[-1] + s[-2])
        add("Sequences", "Recognise special sequences", f"In this sequence each term is the sum of the two before it: {', '.join(map(str, s[:5]))}, … What is the 8th term?", "n", s[7], f"Continue: {', '.join(map(str, s[:8]))}. The 8th term is {s[7]}.")
    else:
        a, r = R.randint(1, 5), R.choice([2, 3]); s = [a * r ** i for i in range(6)]
        add("Sequences", "Recognise geometric sequences", f"What is the next term: {', '.join(map(str, s[:5]))}, …?", "n", s[5], f"Each term is multiplied by {r}: {s[4]} × {r} = {s[5]}.")

# =============================== Coordinates and graphs ===============================
def cg_mid():
    x1, y1, x2, y2 = [R.randint(-8, 10) for _ in range(4)]
    if (x1 + x2) % 2 or (y1 + y2) % 2 or (x1, y1) == (x2, y2): return
    mx, my = (x1 + x2) // 2, (y1 + y2) // 2
    add("Coordinates and graphs", "Find the midpoint of a line segment", f"A is ({fmt(x1)}, {fmt(y1)}) and B is ({fmt(x2)}, {fmt(y2)}). What are the coordinates of the midpoint of AB? Write them like (2, −3).", "t", f"({mx}, {my})",
        f"Add the x-coordinates and halve: ({fmt(x1)} + {br(x2)}) ÷ 2 = {fmt(mx)}. Do the same for y: {fmt(my)}. Midpoint ({fmt(mx)}, {fmt(my)}).")
def cg_online():
    m, c = R.choice([x for x in range(-4, 6) if x]), R.randint(-6, 8); x = R.randint(-5, 6)
    eq = f"y = {expr([(m,'x'),(c,'')])}"
    if R.random() < .5:
        add("Coordinates and graphs", "Work with coordinates on straight-line graphs", f"The point ({fmt(x)}, k) lies on the line {eq}. What is k?", "n", m * x + c, f"Substitute x = {fmt(x)}: y = {fmt(m)} × {br(x)} {'+' if c>=0 else '−'} {abs(c)} = {fmt(m*x+c)}.")
    else:
        pts = [(x, m * x + c)] + [(x + R.randint(1, 3), m * x + c + R.choice([-2, -1, 1, 2, 3])) for _ in range(4)]
        right = f"({fmt(pts[0][0])}, {fmt(pts[0][1])})"; wrong = [f"({fmt(a)}, {fmt(b)})" for a, b in pts[1:] if b != m * a + c]
        mc("Coordinates and graphs", "Work with coordinates on straight-line graphs", f"Which point lies on the line {eq}?", right, wrong, f"Substitute x = {fmt(pts[0][0])}: y = {fmt(pts[0][1])}, so {right} is on the line.")
def cg_gradient():
    m, c = R.choice([x for x in range(-5, 7) if x]), R.randint(-9, 9)
    mc("Coordinates and graphs", "Recognise the gradient and intercept of y = mx + c", f"What is the gradient of the line y = {expr([(m,'x'),(c,'')])}?", fmt(m), [fmt(c), fmt(-m), fmt(m + 1)], f"In y = mx + c the gradient is m, the number in front of x: {fmt(m)}.") \
        if R.random() < .5 else mc("Coordinates and graphs", "Recognise the gradient and intercept of y = mx + c", f"Where does the line y = {expr([(m,'x'),(c,'')])} cross the y-axis?", f"(0, {fmt(c)})", [f"(0, {fmt(m)})", f"({fmt(c)}, 0)", f"(0, {fmt(-c)})"], f"In y = mx + c the line crosses the y-axis at (0, c): (0, {fmt(c)}).")
def cg_lines():
    k = R.randint(-6, 6); t = R.choice(["x", "y"])
    mc("Coordinates and graphs", "Recognise horizontal and vertical lines", f"Which line is {'vertical' if t=='x' else 'horizontal'} and passes through ({fmt(k) if t=='x' else '3'}, {fmt(k) if t=='y' else '2'})?",
       f"{t} = {fmt(k)}", [f"{'y' if t=='x' else 'x'} = {fmt(k)}", f"y = {expr([(k if k else 2, 'x')])}", f"y = {expr([(1, 'x'), (k if k else 3, '')])}"],
       f"A {'vertical' if t=='x' else 'horizontal'} line has the same {t}-coordinate everywhere, so its equation is {t} = {fmt(k)}.")
def cg_translate():
    x, y = R.randint(-6, 6), R.randint(-6, 6); dx, dy = R.choice([x for x in range(-5, 6) if x]), R.choice([x for x in range(-5, 6) if x])
    add("Coordinates and graphs", "Describe translations", f"Point P ({fmt(x)}, {fmt(y)}) is translated {abs(dx)} {'right' if dx>0 else 'left'} and {abs(dy)} {'up' if dy>0 else 'down'}. Where does it end up? Write it like (2, −3).", "t", f"({x+dx}, {y+dy})",
        f"x: {fmt(x)} {'+' if dx>0 else '−'} {abs(dx)} = {fmt(x+dx)}. y: {fmt(y)} {'+' if dy>0 else '−'} {abs(dy)} = {fmt(y+dy)}.")

# =============================== Angles ===============================
def an_tri():
    a, b = R.randint(20, 100), R.randint(20, 100)
    if a + b >= 165: return
    add("Angles", "Use the sum of angles in a triangle", f"Two angles in a triangle are {a}° and {b}°. What is the third angle?", "n", 180 - a - b, f"Angles in a triangle add up to 180°. 180 − {a} − {b} = {180-a-b}°.", unit="°", fig={"t": "tri", "a": a, "b": b})
def an_iso():
    t = R.choice(["apex", "base"])
    if t == "apex":
        a = R.randrange(20, 160, 2); add("Angles", "Use properties of isosceles triangles", f"An isosceles triangle has a top (apex) angle of {a}°. What size is each of the two equal base angles?", "n", (180 - a) // 2, f"(180 − {a}) ÷ 2 = {(180-a)//2}°.", unit="°")
    else:
        b = R.randint(20, 85); add("Angles", "Use properties of isosceles triangles", f"Each base angle of an isosceles triangle is {b}°. What is the apex angle?", "n", 180 - 2 * b, f"180 − 2 × {b} = {180-2*b}°.", unit="°")
def an_line():
    t = R.choice(["line", "point", "vert"])
    if t == "line": a = R.randint(15, 165); add("Angles", "Use angles on a straight line", f"Two angles lie on a straight line. One is {a}°. What is the other?", "n", 180 - a, f"Angles on a straight line add up to 180°: 180 − {a} = {180-a}°.", unit="°", fig={"t": "line", "a": a})
    elif t == "point":
        a, b = R.randint(40, 150), R.randint(40, 150)
        if a + b >= 320: return
        add("Angles", "Use angles around a point", f"Three angles meet at a point. Two are {a}° and {b}°. What is the third?", "n", 360 - a - b, f"Angles around a point add up to 360°: 360 − {a} − {b} = {360-a-b}°.", unit="°", fig={"t": "point", "a": a, "b": b})
    else:
        a = R.randint(20, 160); add("Angles", "Use vertically opposite angles", f"Two straight lines cross. One of the angles is {a}°. What is the angle vertically opposite it?", "n", a, f"Vertically opposite angles are equal, so it is {a}°.", unit="°")
def an_parallel():
    a = R.randint(25, 155); k = R.choice(["alt", "corr", "coint"])
    name = {"alt": "alternate", "corr": "corresponding", "coint": "co-interior"}[k]; r = 180 - a if k == "coint" else a
    add("Angles", "Use alternate, corresponding and co-interior angles with parallel lines", f"The two lines are parallel. The marked angle is {a}°. What is the angle labelled x? (They are {name} angles.)", "n", r,
        {"alt": f"Alternate angles are equal: x = {a}°.", "corr": f"Corresponding angles are equal: x = {a}°.", "coint": f"Co-interior angles add up to 180°: x = 180 − {a} = {180-a}°."}[k], unit="°", fig={"t": "para", "a": a, "k": k})
def an_poly():
    n = R.randint(3, 12); names = {3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 11: "hendecagon", 12: "dodecagon"}
    t = R.choice(["sum", "int", "ext"])
    if t == "sum": add("Angles", "Find the sum of interior angles of a polygon", f"What is the sum of the interior angles of a {names[n]} ({n} sides)?", "n", (n - 2) * 180, f"({n} − 2) × 180 = {(n-2)*180}°.", unit="°")
    elif t == "int":
        if (n - 2) * 180 % n: return
        add("Angles", "Find interior angles of regular polygons", f"What is each interior angle of a regular {names[n]}?", "n", (n - 2) * 180 // n, f"Sum = ({n} − 2) × 180 = {(n-2)*180}°. Divide by {n}: {(n-2)*180//n}°.", unit="°")
    else:
        if 360 % n: return
        add("Angles", "Find exterior angles of regular polygons", f"What is each exterior angle of a regular {names[n]}?", "n", 360 // n, f"Exterior angles add up to 360°: 360 ÷ {n} = {360//n}°.", unit="°")
def an_quad():
    a, b, c = R.randint(50, 130), R.randint(50, 130), R.randint(40, 130)
    d = 360 - a - b - c
    if not 20 <= d <= 170: return
    add("Angles", "Use the sum of angles in a quadrilateral", f"Three angles of a quadrilateral are {a}°, {b}° and {c}°. What is the fourth?", "n", d, f"Angles in a quadrilateral add up to 360°: 360 − {a} − {b} − {c} = {d}°.", unit="°")
def an_type():
    d = R.choice([R.randint(5, 85), R.randint(95, 175), R.randint(185, 355), 90, 180])
    name = "right angle" if d == 90 else "straight angle" if d == 180 else "acute" if d < 90 else "obtuse" if d < 180 else "reflex"
    mc("Angles", "Classify angles", f"An angle measures {d}°. What type of angle is it?", name, [x for x in ["acute", "obtuse", "reflex", "right angle"] if x != name],
       "Acute < 90°, right = 90°, obtuse between 90° and 180°, straight = 180°, reflex > 180°.", fig={"t": "angle", "d": d} if d not in (180,) else None)

# =============================== Perimeter and area ===============================
def ar_shape():
    k = R.choice(["rect", "tri", "par", "trap"]); u = R.choice(["cm", "m"])
    if k == "rect":
        a, b = R.randint(3, 30), R.randint(2, 25); t = R.choice(["area", "per"])
        if t == "area": add("Perimeter and area", "Calculate the area of rectangles", f"Find the area of a rectangle {a} {u} by {b} {u}.", "n", a * b, f"Area = length × width = {a} × {b} = {a*b} {u}².", unit=u + "²", fig={"t": "rect", "a": a, "b": b, "u": u})
        else: add("Perimeter and area", "Calculate perimeter", f"Find the perimeter of a rectangle {a} {u} by {b} {u}.", "n", 2 * (a + b), f"Perimeter = 2 × ({a} + {b}) = {2*(a+b)} {u}.", unit=u, fig={"t": "rect", "a": a, "b": b, "u": u})
    elif k == "tri":
        b, h = R.randint(3, 24), R.randint(2, 20)
        add("Perimeter and area", "Calculate the area of triangles", f"Find the area of a triangle with base {b} {u} and perpendicular height {h} {u}.", "n", b * h / 2, f"Area = ½ × base × height = ½ × {b} × {h} = {fmt(b*h/2)} {u}².", unit=u + "²", fig={"t": "shape", "k": "tri", "b": b, "h": h, "u": u})
    elif k == "par":
        b, h = R.randint(3, 20), R.randint(2, 15)
        add("Perimeter and area", "Calculate the area of parallelograms", f"Find the area of a parallelogram with base {b} {u} and perpendicular height {h} {u}.", "n", b * h, f"Area = base × perpendicular height = {b} × {h} = {b*h} {u}².", unit=u + "²", fig={"t": "shape", "k": "par", "b": b, "h": h, "u": u})
    else:
        a, b, h = R.randint(2, 14), R.randint(4, 20), R.randint(2, 12)
        if a >= b: return
        add("Perimeter and area", "Calculate the area of trapezia", f"A trapezium has parallel sides {a} {u} and {b} {u} and height {h} {u}. Find its area.", "n", (a + b) * h / 2,
            f"Area = ½(a + b)h = ½ × ({a} + {b}) × {h} = {fmt((a+b)*h/2)} {u}².", unit=u + "²", fig={"t": "shape", "k": "trap", "a": a, "b": b, "h": h, "u": u})
def ar_compound():
    W, H = R.randint(8, 20), R.randint(6, 16); w, h = R.randint(2, W - 3), R.randint(2, H - 3); t = R.choice(["area", "per"])
    if t == "area": add("Perimeter and area", "Calculate the area of compound shapes", f"Find the area of this L-shape: {W} cm by {H} cm with a {w} cm by {h} cm corner removed.", "n", W * H - w * h, f"{W} × {H} − {w} × {h} = {W*H} − {w*h} = {W*H-w*h} cm².", unit="cm²", fig={"t": "lshape", "W": W, "H": H, "w": w, "h": h})
    else: add("Perimeter and area", "Calculate the perimeter of compound shapes", f"Find the perimeter of this L-shape: {W} cm by {H} cm with a {w} cm by {h} cm corner removed.", "n", 2 * (W + H), f"The missing edges add up to the full width and height, so the perimeter is 2 × ({W} + {H}) = {2*(W+H)} cm.", unit="cm", fig={"t": "lshape", "W": W, "H": H, "w": w, "h": h})
def ar_reverse():
    t = R.choice(["rect", "tri", "sq"])
    if t == "rect": a, b = R.randint(3, 15), R.randint(3, 15); add("Perimeter and area", "Find missing lengths from area", f"A rectangle has area {a*b} cm² and width {a} cm. What is its length?", "n", b, f"{a*b} ÷ {a} = {b} cm.", unit="cm")
    elif t == "tri": b, h = R.randint(2, 12) * 2, R.randint(3, 15); add("Perimeter and area", "Find missing lengths from area", f"A triangle has area {b*h//2} cm² and base {b} cm. What is its perpendicular height?", "n", h, f"Area = ½ × b × h, so h = 2 × {b*h//2} ÷ {b} = {h} cm.", unit="cm")
    else: s = R.randint(3, 20); add("Perimeter and area", "Find missing lengths from area", f"A square has an area of {s*s} cm². What is its perimeter?", "n", 4 * s, f"Side = √{s*s} = {s} cm. Perimeter = 4 × {s} = {4*s} cm.", unit="cm")

# =============================== Volume and measures ===============================
def vm_cuboid():
    l, w, h = R.randint(2, 15), R.randint(2, 12), R.randint(2, 10); t = R.choice(["vol", "vol", "sa", "rev"])
    if t == "vol": add("Volume and measures", "Calculate the volume of cuboids", f"Find the volume of a cuboid {l} cm by {w} cm by {h} cm.", "n", l * w * h, f"Volume = l × w × h = {l} × {w} × {h} = {l*w*h} cm³.", unit="cm³", fig={"t": "cuboid", "l": l, "w": w, "h": h})
    elif t == "sa": add("Volume and measures", "Calculate the surface area of cuboids", f"Find the total surface area of a cuboid {l} cm by {w} cm by {h} cm.", "n", 2 * (l * w + l * h + w * h), f"2 × ({l}×{w} + {l}×{h} + {w}×{h}) = 2 × ({l*w} + {l*h} + {w*h}) = {2*(l*w+l*h+w*h)} cm².", unit="cm²", fig={"t": "cuboid", "l": l, "w": w, "h": h})
    else: add("Volume and measures", "Calculate the volume of cuboids", f"A cuboid has volume {l*w*h} cm³. It is {l} cm long and {w} cm wide. How tall is it?", "n", h, f"{l*w*h} ÷ ({l} × {w}) = {l*w*h} ÷ {l*w} = {h} cm.", unit="cm")
def vm_convert():
    t = R.choice([("km", "m", 1000), ("m", "cm", 100), ("cm", "mm", 10), ("kg", "g", 1000), ("l", "ml", 1000), ("t", "kg", 1000), ("m", "mm", 1000)])
    big, small, k = t
    if R.random() < .5:
        x = R.choice([R.randint(2, 99) / 10, R.randint(2, 999) / 100, R.randint(1, 30)]); add("Volume and measures", "Convert between metric units", f"Convert {fmt(x)} {big} to {small}.", "n", round(x * k, 4), f"1 {big} = {fmt(k)} {small}, so multiply by {fmt(k)}: {fmt(round(x*k,4))} {small}.", unit=small)
    else:
        x = R.randint(5, 9999); add("Volume and measures", "Convert between metric units", f"Convert {fmt(x)} {small} to {big}.", "n", x / k, f"1 {big} = {fmt(k)} {small}, so divide by {fmt(k)}: {fmt(x/k)} {big}.", unit=big)
def vm_area_units():
    x = R.randint(2, 50); t = R.choice([("m²", "cm²", 10000), ("cm²", "mm²", 100)])
    add("Volume and measures", "Convert between units of area", f"Convert {x} {t[0]} to {t[1]}.", "n", x * t[2], f"1 {t[0][:-1]} = {int(t[2]**.5)} {t[1][:-1]}, so 1 {t[0]} = {int(t[2]**.5)} × {int(t[2]**.5)} = {fmt(t[2])} {t[1]}. {x} × {fmt(t[2])} = {fmt(x*t[2])} {t[1]}.", unit=t[1])
def vm_time():
    h1, m1 = R.randint(6, 20), R.choice(range(0, 60, 5)); d = R.randint(25, 230); e = h1 * 60 + m1 + d
    if e >= 24 * 60: return
    if R.random() < .5:
        add("Volume and measures", "Calculate with time", f"A film starts at {h1:02d}:{m1:02d} and lasts {d} minutes. What time does it finish? Use the 24-hour clock, like 14:05.", "t", f"{e//60:02d}:{e%60:02d}",
            f"{d} minutes = {d//60} h {d%60} min. {h1:02d}:{m1:02d} + {d//60} h {d%60} min = {e//60:02d}:{e%60:02d}.")
    else:
        add("Volume and measures", "Calculate with time", f"A journey leaves at {h1:02d}:{m1:02d} and arrives at {e//60:02d}:{e%60:02d}. How many minutes does it take?", "n", d, f"From {h1:02d}:{m1:02d} to {e//60:02d}:{e%60:02d} is {d//60} h {d%60} min = {d} minutes.", unit="min")
def vm_speed():
    s, t = R.choice([30, 40, 45, 50, 60, 70, 80]), R.choice([0.5, 1.5, 2, 2.5, 3, 4]); d = s * t; k = R.choice(["d", "s", "t"])
    if k == "d": add("Volume and measures", "Use compound units such as speed", f"A car travels at {s} km/h for {fmt(t)} hours. How far does it go?", "n", d, f"Distance = speed × time = {s} × {fmt(t)} = {fmt(d)} km.", unit="km")
    elif k == "s": add("Volume and measures", "Use compound units such as speed", f"A train travels {fmt(d)} km in {fmt(t)} hours. What is its average speed?", "n", s, f"Speed = distance ÷ time = {fmt(d)} ÷ {fmt(t)} = {s} km/h.", unit="km/h")
    else: add("Volume and measures", "Use compound units such as speed", f"How long does it take to cycle {fmt(d)} km at {s} km/h? Give your answer in hours.", "n", t, f"Time = distance ÷ speed = {fmt(d)} ÷ {s} = {fmt(t)} hours.", unit="hours")

# =============================== Probability ===============================
def pr_single():
    items = R.choice([("red", "blue", "green"), ("strawberry", "lemon", "orange"), ("gold", "silver", "bronze")]); counts = [R.randint(1, 9) for _ in items]; tot = sum(counts); i = R.randrange(3)
    thing = R.choice(["counters", "sweets", "beads"])
    add("Probability", "Calculate probabilities of single events", f"A bag has {', '.join(f'{c} {n}' for c, n in zip(counts, items))} {thing}. One is picked at random. What is the probability it is {items[i]}? Give your answer as a fraction in its simplest form.", "f", frac(Fraction(counts[i], tot)),
        f"There are {tot} {thing} and {counts[i]} are {items[i]}: P = {counts[i]}/{tot}" + (f" = {frac(Fraction(counts[i], tot))}." if math.gcd(counts[i], tot) > 1 else "."))
def pr_not():
    p = R.choice([0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.55, 0.6, 0.65, 0.7, 0.72, 0.8, 0.85, 0.9, 0.05, 0.38, 0.27])
    add("Probability", "Use the fact that probabilities sum to 1", f"The probability that it rains tomorrow is {fmt(p)}. What is the probability that it does not rain?", "n", round(1 - p, 4), f"P(not) = 1 − {fmt(p)} = {fmt(round(1-p,4))}.")
def pr_table():
    ps = [round(R.randint(5, 30) / 100, 2) for _ in range(3)]
    if sum(ps) >= 0.95: return
    m = round(1 - sum(ps), 2); cols = ["Red", "Blue", "Green", "Yellow"]; k = R.randrange(4)
    vals = ps[:k] + [None] + ps[k:]
    add("Probability", "Use the fact that probabilities sum to 1", f"A spinner lands on four colours. The table shows the probabilities. What is the probability it lands on {cols[k]}?", "n", m,
        f"The probabilities add up to 1: 1 − {' − '.join(fmt(p) for p in ps)} = {fmt(m)}.", fig={"t": "table", "head": ["Colour"] + cols, "rows": [["Probability"] + [("?" if v is None else fmt(v)) for v in vals]]})
def pr_expect():
    p = R.choice([Fraction(1, 2), Fraction(1, 4), Fraction(1, 5), Fraction(1, 6), Fraction(1, 3), Fraction(2, 5), Fraction(3, 10)]); n = p.denominator * R.randint(3, 40)
    what = {6: "a fair dice is rolled", 2: "a fair coin is flipped"}.get(p.denominator if p.numerator == 1 else 0, "a spinner is spun")
    add("Probability", "Calculate expected outcomes", f"The probability of winning a game is {frac(p)}. If you play {n} times, how many times would you expect to win?", "n", int(n * p), f"Expected = probability × number of trials = {frac(p)} × {n} = {int(n*p)}.")
def pr_dice():
    t = R.choice(["even", "gt", "prime", "mult3", "sum"])
    if t == "sum":
        s = R.randint(2, 12); ways = sum(1 for a in range(1, 7) for b in range(1, 7) if a + b == s)
        add("Probability", "List outcomes systematically", f"Two fair dice are rolled and the scores added. What is the probability of a total of {s}? Give your answer as a fraction in its simplest form.", "f", frac(Fraction(ways, 36)),
            f"There are 36 equally likely outcomes. {ways} of them give {s}: {ways}/36" + (f" = {frac(Fraction(ways,36))}." if math.gcd(ways, 36) > 1 else "."))
        return
    k = R.randint(2, 5)
    sets = {"even": ([2, 4, 6], "an even number"), "gt": ([x for x in range(1, 7) if x > k], f"a number greater than {k}"), "prime": ([2, 3, 5], "a prime number"), "mult3": ([3, 6], "a multiple of 3")}
    ok, desc = sets[t]
    add("Probability", "Calculate probabilities of single events", f"A fair six-sided dice is rolled. What is the probability of getting {desc}? Give your answer as a fraction in its simplest form.", "f", frac(Fraction(len(ok), 6)),
        f"The successful outcomes are {', '.join(map(str, ok))}: {len(ok)} out of 6 = {frac(Fraction(len(ok), 6))}.")
def pr_scale():
    ev = [("rolling a 7 on a normal dice", "impossible"), ("the sun rising tomorrow", "certain"), ("flipping heads on a fair coin", "even chance"), ("picking a red card from a normal pack", "even chance"),
          ("rolling a 6 on a fair dice", "unlikely"), ("rolling a number less than 6 on a fair dice", "likely"), ("picking a vowel from the letters of BANANA", "even chance"), ("it snowing in London in July", "unlikely")]
    e, r = R.choice(ev)
    mc("Probability", "Use the probability scale from 0 to 1", f"Which word best describes the probability of {e}?", r, [x for x in ["impossible", "unlikely", "even chance", "likely", "certain"] if x != r], f"It is {r}.")

# =============================== Statistics ===============================
def st_avg():
    n = R.randint(5, 8); xs = [R.randint(1, 30) for _ in range(n)]; t = R.choice(["mean", "median", "mode", "range"])
    shown = ", ".join(map(str, xs))
    if t == "mean":
        if sum(xs) % n:
            xs[-1] += n - sum(xs) % n
            shown = ", ".join(map(str, xs))
        add("Statistics", "Calculate the mean", f"Find the mean of {shown}.", "n", sum(xs) // n, f"Add them: {sum(xs)}. Divide by {n}: {sum(xs)//n}.")
    elif t == "median":
        s = sorted(xs); med = s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2
        add("Statistics", "Find the median", f"Find the median of {shown}.", "n", med, f"In order: {', '.join(map(str, s))}. The middle value is {fmt(med)}" + (" (halfway between the two middle values)." if n % 2 == 0 else "."))
    elif t == "mode":
        m = R.choice(xs); xs = xs + [m, m]; R.shuffle(xs)
        from collections import Counter
        c = Counter(xs).most_common()
        if len(c) > 1 and c[0][1] == c[1][1]: return
        add("Statistics", "Find the mode", f"Find the mode of {', '.join(map(str, xs))}.", "n", c[0][0], f"{c[0][0]} appears most often ({c[0][1]} times).")
    else: add("Statistics", "Find the range", f"Find the range of {shown}.", "n", max(xs) - min(xs), f"Largest − smallest = {max(xs)} − {min(xs)} = {max(xs)-min(xs)}.")
def st_missing():
    n = R.randint(4, 6); m = R.randint(5, 20); xs = [R.randint(1, 30) for _ in range(n - 1)]; last = m * n - sum(xs)
    if last < 0 or last > 60: return
    add("Statistics", "Calculate the mean", f"The mean of {n} numbers is {m}. {n-1} of them are {', '.join(map(str, xs))}. What is the missing number?", "n", last,
        f"Total = {n} × {m} = {m*n}. The known numbers add to {sum(xs)}, so the missing one is {m*n} − {sum(xs)} = {last}.")
def st_bar():
    labels = R.choice([["Mon", "Tue", "Wed", "Thu", "Fri"], ["Maths", "English", "Science", "Art", "PE"], ["Bus", "Car", "Walk", "Cycle", "Train"]])
    vals = [R.randint(1, 15) * 2 for _ in labels]; title = {"Mon": "Books borrowed", "Maths": "Favourite subject", "Bus": "How Year 7 travel to school"}[labels[0]]
    fig = {"t": "bar", "title": title, "labels": labels, "values": vals}; t = R.choice(["tot", "diff", "mean"])
    if t == "tot": add("Statistics", "Interpret bar charts", "Use the bar chart. What is the total of all the bars?", "n", sum(vals), " + ".join(map(str, vals)) + f" = {sum(vals)}.", fig=fig)
    elif t == "diff":
        i, j = R.sample(range(5), 2)
        if vals[i] <= vals[j]: return
        add("Statistics", "Interpret bar charts", f"Use the bar chart. How many more for {labels[i]} than for {labels[j]}?", "n", vals[i] - vals[j], f"{vals[i]} − {vals[j]} = {vals[i]-vals[j]}.", fig=fig)
    else:
        if sum(vals) % 5: return
        add("Statistics", "Interpret bar charts and calculate the mean", "Use the bar chart. What is the mean of the five bars?", "n", sum(vals) // 5, f"Total {sum(vals)} ÷ 5 = {sum(vals)//5}.", fig=fig)
def st_freq():
    vals = list(range(R.randint(0, 2), R.randint(0, 2) + 5)); fr = [R.randint(1, 9) for _ in vals]; tot = sum(fr); s = sum(v * f for v, f in zip(vals, fr))
    t = R.choice(["total", "mode", "sum", "mean"])
    fig = {"t": "table", "head": ["Number of pets", "Frequency"], "rows": [[str(v), str(f)] for v, f in zip(vals, fr)]}
    if t == "total": add("Statistics", "Interpret frequency tables", "The table shows how many pets the pupils in a class have. How many pupils are in the class?", "n", tot, f"Add the frequencies: {' + '.join(map(str, fr))} = {tot}.", fig=fig)
    elif t == "mode":
        if fr.count(max(fr)) > 1: return
        add("Statistics", "Interpret frequency tables", "The table shows how many pets the pupils in a class have. What is the modal number of pets?", "n", vals[fr.index(max(fr))], f"The highest frequency is {max(fr)}, for {vals[fr.index(max(fr))]} pets.", fig=fig)
    elif t == "sum": add("Statistics", "Interpret frequency tables", "The table shows how many pets the pupils in a class have. How many pets are there altogether?", "n", s, "Multiply each number of pets by its frequency and add: " + " + ".join(f"{v}×{f}" for v, f in zip(vals, fr)) + f" = {s}.", fig=fig)
    else:
        if s % tot: return
        add("Statistics", "Calculate the mean from a frequency table", "The table shows how many pets the pupils in a class have. What is the mean number of pets per pupil?", "n", s // tot, f"Total pets {s} ÷ {tot} pupils = {s//tot}.", fig=fig)
def st_pie():
    tot = R.choice([18, 24, 30, 36, 40, 45, 60, 72, 90, 120]); part = R.randint(1, tot - 1); ang = Fraction(part * 360, tot)
    if ang.denominator != 1: return
    add("Statistics", "Construct and interpret pie charts", f"In a survey of {tot} people, {part} chose swimming. What angle would swimming have on a pie chart?", "n", int(ang), f"Each person is 360 ÷ {tot} = {fmt(360/tot)}°. {part} × {fmt(360/tot)} = {int(ang)}°.", unit="°")
def st_line():
    hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm"]; v = R.randint(-2, 8); vals = []
    for _ in hours: vals.append(v); v = max(-4, min(20, v + R.choice([-2, -1, 0, 1, 2, 3])))
    fig = {"t": "lgraph", "title": "Temperature (°C)", "labels": hours, "values": vals}; t = R.choice(["read", "range", "rise"])
    if t == "read": i = R.randrange(7); add("Statistics", "Interpret line graphs", f"Use the line graph. What was the temperature at {hours[i]}?", "n", vals[i], f"Go up from {hours[i]} to the line, then across: {fmt(vals[i])}°C.", fig=fig, unit="°C")
    elif t == "range": add("Statistics", "Interpret line graphs", "Use the line graph. What is the range of the temperatures shown?", "n", max(vals) - min(vals), f"Highest {fmt(max(vals))}°C − lowest {fmt(min(vals))}°C = {max(vals)-min(vals)} degrees.", fig=fig, unit="°C")
    else:
        i = R.randrange(6); d = vals[i + 1] - vals[i]
        if d == 0: return
        add("Statistics", "Interpret line graphs", f"Use the line graph. By how many degrees did the temperature {'rise' if d>0 else 'fall'} between {hours[i]} and {hours[i+1]}?", "n", abs(d), f"{fmt(vals[i])}°C to {fmt(vals[i+1])}°C is a change of {abs(d)} degrees.", fig=fig, unit="°C")

QUOTAS = [
    ("Place value", [pv_powers10, pv_order_dec, pv_value, pv_compare, pv_between], 150),
    ("Negative numbers", [neg_add, neg_add, neg_mul, neg_context, neg_order], 180),
    ("Order of operations", [bidmas, bidmas, bidmas_brackets], 130),
    ("Factors, multiples and primes", [fm_hcf, fm_lcm, fm_pf, fm_prime, fm_factors, fm_problem], 170),
    ("Powers and roots", [pw_basic, pw_basic, pw_estimate, pw_squarecheck], 120),
    ("Rounding and estimation", [rd_dp, rd_sf, rd_estimate, rd_bounds], 140),
    ("Fractions", [fr_addsub, fr_mixed_ops, fr_mul, fr_div, fr_of, fr_reverse, fr_compare, fr_simplify, fr_mul_int], 250),
    ("Decimals", [dc_ops, dc_ops, dc_divdec], 140),
    ("Percentages", [pc_of, pc_change, pc_express, pc_fdp, pc_order], 210),
    ("Ratio and proportion", [ra_simplify, ra_share, ra_diff, ra_unitary, ra_recipe, ra_bestbuy, ra_fraction], 200),
    ("Algebra", [al_collect, al_sub, al_expand, al_expand2, al_factorise, al_form, al_vocab], 230),
    ("Equations", [eq_solve, eq_solve, eq_word, eq_angles, eq_formula], 180),
    ("Sequences", [sq_next, sq_nth, sq_term, sq_inseq, sq_special], 140),
    ("Coordinates and graphs", [cg_mid, cg_online, cg_gradient, cg_lines, cg_translate], 120),
    ("Angles", [an_tri, an_iso, an_line, an_parallel, an_poly, an_quad, an_type], 200),
    ("Perimeter and area", [ar_shape, ar_shape, ar_compound, ar_reverse], 150),
    ("Volume and measures", [vm_cuboid, vm_convert, vm_area_units, vm_time, vm_speed], 120),
    ("Probability", [pr_single, pr_not, pr_table, pr_expect, pr_dice, pr_scale], 100),
    ("Statistics", [st_avg, st_avg, st_missing, st_bar, st_freq, st_pie, st_line], 70),
]
TOTAL = 3000
assert sum(q for *_, q in QUOTAS) == TOTAL, sum(q for *_, q in QUOTAS)
for topic, fns, quota in QUOTAS:
    start = len(BANK); tries = 0
    while len(BANK) - start < quota:
        tries += 1
        if tries > 300000: raise SystemExit(f"Not enough unique questions for {topic}: {len(BANK)-start}")
        before = len(BANK); R.choice(fns)()
        if len(BANK) > before: BANK[-1]["t"] = topic
    del BANK[start + quota:]

TOPIC_ORDER = [t for t, *_ in QUOTAS]
for i, q in enumerate(BANK):
    q["id"] = f"k{i+1:04d}"
    assert q["k"] in ("n", "c", "f", "t"), q
    if q["k"] == "c": assert 0 <= q["a"] < len(q["c"]) and len(set(q["c"])) == len(q["c"]), q
    if q["k"] == "n": assert isinstance(q["a"], (int, float)) and not isinstance(q["a"], bool), q
assert len(BANK) == TOTAL and len({q["q"] + json.dumps(q.get("f")) for q in BANK}) == TOTAL
out = "/* Year 7 maths: 3,000 questions (National Curriculum in England, Key Stage 3). Built by tools/build_maths.py; answers are computed, not typed. */\n"
out += "const MATHS_TOPICS=" + json.dumps(TOPIC_ORDER) + ";\n"
out += "const MATHS=" + json.dumps(BANK, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += 'if(typeof module!=="undefined"&&module.exports)module.exports={MATHS,MATHS_TOPICS};\n'
open("maths-bank.js", "w").write(out)
from collections import Counter
print(len(BANK), "questions,", round(len(out) / 1024), "KB")
for t in TOPIC_ORDER: print(f"  {t:32s} {sum(1 for q in BANK if q['t']==t)}")
print(Counter(q["k"] for q in BANK))
