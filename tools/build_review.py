#!/usr/bin/env python3
"""Builds maths-review.js: "Brush up" practice for number skills learned before Year 7.
Prime numbers, factors, rounding to 10/100/1,000, numbers in words, place value and the four
fraction operations. Every answer is computed here. Run from the repo root: python3 tools/build_review.py
The questions are added to the main bank (MATHS) in the browser, with ids r0001… so the 3,000
Year 7 questions keep their ids."""
import json, math, random
from collections import Counter
from fractions import Fraction

R = random.Random(20261005)
BANK, SEEN = [], set()
PER_TOPIC = 80

def fmt(n):
    if isinstance(n, float) and n.is_integer(): n = int(n)
    if isinstance(n, int): return f"{n:,}"
    return f"{n:,.4f}".rstrip("0").rstrip(".")
def frac(f):
    f = Fraction(f)
    return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"
def mixed(f):
    f = Fraction(f); w, r = divmod(f.numerator, f.denominator)
    if r == 0: return str(w)
    return f"{w} {r}/{f.denominator}" if w else f"{r}/{f.denominator}"
def is_prime(n): return n > 1 and all(n % d for d in range(2, int(n ** .5) + 1))
def factors(n): return [d for d in range(1, n + 1) if n % d == 0]
def pf(n):
    out, d = [], 2
    while n > 1:
        while n % d == 0: out.append(d); n //= d
        d += 1
    return out

def add(topic, obj, q, kind, ans, why, opts=None):
    if q in SEEN: return False
    SEEN.add(q)
    d = {"t": topic, "o": obj, "q": q, "k": kind, "a": ans, "w": why}
    if opts is not None: d["c"] = opts
    BANK.append(d)
    return True
def mc(topic, obj, q, correct, wrong, why):
    wrong = [w for w in dict.fromkeys(wrong) if w != correct][:3]
    if len(wrong) < 3: return False
    opts = [correct] + wrong
    R.shuffle(opts)
    return add(topic, obj, q, "c", opts.index(correct), why, opts=opts)

# =============================== Prime numbers ===============================
T = "Prime numbers"
PRIMES = [p for p in range(2, 200) if is_prime(p)]
TRICKY = [1, 9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 77, 81, 85, 87, 91, 93, 95, 99, 111, 117, 119, 121, 133, 143]
def why_not_prime(n):
    if n == 1: return "1 is not prime: a prime has exactly two factors, and 1 has only one."
    a = next(d for d in range(2, n) if n % d == 0)
    return f"{n} is not prime because {n} = {a} × {n // a}."
def pr_which():
    p = R.choice([q for q in PRIMES if q < 100 and q > 2]); w = R.sample([x for x in TRICKY if x < 100], 3)
    mc(T, "Recognise prime numbers", "Which of these numbers is a prime number?", str(p), [str(x) for x in w],
       f"{p} has exactly two factors: 1 and {p}. " + " ".join(why_not_prime(x) for x in w))
def pr_not():
    ps = R.sample([q for q in PRIMES if q < 100], 3); n = R.choice([x for x in TRICKY if x < 100])
    mc(T, "Recognise prime numbers", "Which of these numbers is NOT a prime number?", str(n), [str(x) for x in ps],
       why_not_prime(n) + f" {', '.join(map(str, ps))} are all prime: each has only the factors 1 and itself.")
def pr_isit():
    n = R.choice([R.choice(PRIMES[:40]), R.choice(TRICKY), R.randint(2, 150)])
    yes = is_prime(n)
    add(T, "Decide whether a number is prime", f"Is {n} a prime number?", "c", 0 if yes else 1,
        (f"Yes. {n} is only divisible by 1 and {n}. Check: it does not divide by 2, 3, 5 or 7." if yes and n > 7 else f"Yes. {n} has exactly two factors, 1 and {n}." if yes
         else "No. " + why_not_prime(n)), opts=["Yes", "No"])
def pr_next():
    n = R.randint(1, 140); p = next(q for q in PRIMES if q > n)
    skipped = [x for x in range(n + 1, p)]
    add(T, "Find prime numbers", f"What is the first prime number after {n}?", "n", p,
        (f"Check the numbers after {n}: " + ", ".join(f"{x} = {next(d for d in range(2, x) if x % d == 0)} × {x // next(d for d in range(2, x) if x % d == 0)}" for x in skipped[:4]) + ("…" if len(skipped) > 4 else "") + f". {p} has no factors except 1 and itself." if skipped
         else f"{p} is the next number, and it has no factors except 1 and itself."))
def pr_count():
    a = R.randint(1, 80); b = a + R.randint(8, 22)
    ps = [p for p in PRIMES if a < p < b]
    add(T, "Find prime numbers", f"How many prime numbers are there between {a} and {b}?", "n", len(ps),
        f"The prime numbers between {a} and {b} are {', '.join(map(str, ps))}: {len(ps)} of them." if ps else f"There are none between {a} and {b}.")
def pr_list():
    a = R.choice([1, 10, 20, 30, 40, 50]); ps = [p for p in PRIMES if a <= p <= a + 20]
    right = ", ".join(map(str, ps))
    wrong = [", ".join(map(str, sorted(ps + [x]))) for x in R.sample([t for t in range(a, a + 21) if t % 2 and not is_prime(t)], 2)]
    wrong.append(", ".join(map(str, ps[:-1])))
    wrong.append(", ".join(map(str, [p for p in ps if p != 2] + ([1] if a == 1 else []))))
    mc(T, "Know prime numbers up to 100", f"Which list shows all the prime numbers from {a} to {a+20}?", right, wrong,
       f"The prime numbers from {a} to {a+20} are {right}. " + ("Remember 1 is not prime and 2 is the only even prime." if a == 1 else "Odd numbers like " + ", ".join([str(t) for t in range(a, a + 21) if t % 2 and not is_prime(t)][:4]) + " are not prime because they have other factors."))
def pr_factor():
    n = R.randint(12, 150); ps = sorted(set(pf(n)))
    if len(ps) < 2: return
    p = R.choice(ps); w = [str(x) for x in R.sample([q for q in PRIMES[:10] if n % q], 2)] + [str(R.choice([d for d in factors(n) if not is_prime(d) and d > 1] or [1]))]
    mc(T, "Find prime factors", f"Which of these is a prime factor of {n}?", str(p), w,
       f"{n} = {' × '.join(map(str, pf(n)))}, so its prime factors are {', '.join(map(str, ps))}. A prime factor must be prime and divide {n} exactly.")
def pr_sum():
    a = R.randint(1, 40); b = a + R.randint(6, 14); ps = [p for p in PRIMES if a <= p <= b]
    if not ps: return
    add(T, "Find prime numbers", f"Add together all the prime numbers from {a} to {b}.", "n", sum(ps), f"The primes are {', '.join(map(str, ps))}. {' + '.join(map(str, ps))} = {sum(ps)}.")
PRIME_FNS = [pr_which, pr_which, pr_not, pr_isit, pr_isit, pr_next, pr_count, pr_list, pr_factor, pr_sum]

# =============================== Factors ===============================
T2 = "Factors"
RICH = [n for n in range(12, 151) if len(factors(n)) >= 4]
def fpairs(n): return ", ".join(f"{a} × {n // a}" for a in factors(n) if a * a <= n)
def fa_all():
    n = R.choice(RICH); fs = factors(n); right = ", ".join(map(str, fs))
    miss = R.choice(fs[1:-1]); extra = R.choice([d for d in range(2, n) if n % d][:12])
    wrong = [", ".join(map(str, [d for d in fs if d != miss])), ", ".join(map(str, sorted(fs + [extra]))), ", ".join(map(str, fs[1:-1])),
             ", ".join(map(str, [d for d in fs if d != R.choice(fs[1:-1])]))]
    mc(T2, "List all the factors of a number", f"Which list shows ALL the factors of {n}?", right, wrong,
       f"Find factors in pairs: {fpairs(n)}. So the factors of {n} are {right}. Don't forget 1 and {n}.")
def fa_count():
    n = R.choice(RICH); fs = factors(n)
    add(T2, "List all the factors of a number", f"How many factors does {n} have?", "n", len(fs), f"Factor pairs: {fpairs(n)}. The factors are {', '.join(map(str, fs))}: {len(fs)} factors.")
def fa_not():
    n = R.choice(RICH); fs = factors(n)
    if len(fs) < 5: return
    bad = R.choice([d for d in range(3, n) if n % d and d < n // 2] or [n - 1])
    w = [str(x) for x in R.sample(fs[1:-1], 3)]
    mc(T2, "Recognise factors", f"Which of these is NOT a factor of {n}?", str(bad), w,
       f"{n} ÷ {bad} = {n // bad} remainder {n % bad}, so {bad} is not a factor. " + " ".join(f"{x} × {n // int(x)} = {n}." for x in w))
def fa_pair():
    n = R.choice(RICH); a = R.choice(factors(n)[1:-1])
    add(T2, "Find factor pairs", f"{a} × ? = {n}. What is the missing number?", "n", n // a, f"{n} ÷ {a} = {n // a}, so {a} × {n // a} = {n}. {a} and {n // a} are a factor pair of {n}.")
def fa_largest():
    n = R.choice(RICH); fs = factors(n)
    add(T2, "Recognise factors", f"What is the largest factor of {n}, apart from {n} itself?", "n", fs[-2], f"The smallest factor bigger than 1 is {fs[1]}, so the largest one below {n} is {n} ÷ {fs[1]} = {fs[-2]}.")
def fa_pf():
    n = R.choice([x for x in RICH if len(pf(x)) >= 3]); fs = pf(n); right = " × ".join(map(str, fs))
    wrong = set()
    for _ in range(20):
        f2 = fs[:]; i = R.randrange(len(f2)); f2[i] = R.choice([2, 3, 5, 7])
        if math.prod(f2) != n: wrong.add(" × ".join(map(str, sorted(f2))))
    a = fs[0]; wrong.add(f"{a} × {n // a}")
    mc(T2, "Write a number as a product of prime factors", f"Which shows {n} as a product of prime factors?", right, list(wrong),
       f"Use a factor tree: keep dividing by primes. {n} ÷ {fs[0]} = {n // fs[0]}" + "".join(f", ÷ {p} = {n // math.prod(fs[:i+2])}" for i, p in enumerate(fs[1:-1])) + f". So {n} = {right}. Every number in the answer must be prime.")
def fa_missing():
    n = R.choice([x for x in RICH if len(pf(x)) >= 3]); fs = pf(n); i = R.randrange(len(fs)); shown = fs[:i] + ["?"] + fs[i+1:]
    add(T2, "Write a number as a product of prime factors", f"{n} = {' × '.join(map(str, shown))}. What is the missing prime factor?", "n", fs[i],
        f"Multiply the numbers you know: {math.prod(fs) // fs[i]}. {n} ÷ {math.prod(fs) // fs[i]} = {fs[i]}.")
def fa_hcf():
    g = R.choice([2, 3, 4, 5, 6, 8, 9, 12]); a, b = g * R.randint(2, 9), g * R.randint(2, 9)
    if a == b: return
    h = math.gcd(a, b)
    add(T2, "Find common factors", f"What is the highest common factor of {a} and {b}?", "n", h,
        f"Factors of {a}: {', '.join(map(str, factors(a)))}. Factors of {b}: {', '.join(map(str, factors(b)))}. The biggest number in both lists is {h}.")
def fa_common():
    a, b = R.sample(RICH[:40], 2); cf = [d for d in factors(a) if b % d == 0]
    add(T2, "Find common factors", f"How many common factors do {a} and {b} have?", "n", len(cf),
        f"Factors of {a}: {', '.join(map(str, factors(a)))}. Factors of {b}: {', '.join(map(str, factors(b)))}. In both lists: {', '.join(map(str, cf))}, which is {len(cf)}.")
FACTOR_FNS = [fa_all, fa_all, fa_count, fa_not, fa_pair, fa_largest, fa_pf, fa_missing, fa_hcf, fa_common]

# =============================== Rounding ===============================
T3 = "Rounding to 10, 100 and 1,000"
PNAME = {10: "ten", 100: "hundred", 1000: "thousand"}
COL = {10: ("tens", "ones"), 100: ("hundreds", "tens"), 1000: ("thousands", "hundreds")}
def round_half_up(n, p): return (n + p // 2) // p * p
def rd_basic():
    p = R.choice([10, 100, 1000])
    kind = R.choice(["any", "any", "five", "carry"])
    lo = {10: 100, 100: 1000, 1000: 10000}[p]
    n = R.randint(lo, 999999 if p == 1000 else lo * 100)
    if kind == "five": n = n // p * p + p // 2 + (R.randint(0, p // 10 - 1) if p > 10 else 0)  # the deciding digit is 5
    if kind == "carry": n = (n // (p * 10)) * (p * 10) + 9 * p + R.randint(p // 2, p - 1)   # rounding up crosses the next column
    r = round_half_up(n, p)
    if r == n: return
    big, small = COL[p]; d = (n // (p // 10)) % 10
    add(T3, f"Round to the nearest {p:,}", f"Round {fmt(n)} to the nearest {p:,}.", "n", r,
        f"Look at the {small} digit: it is {d}. {'5 or more, so round up' if d >= 5 else 'Less than 5, so round down'}: {fmt(n)} → {fmt(r)}." + (" The 9s roll over into the next column." if kind == "carry" and d >= 5 else ""))
def rd_which():
    p = R.choice([10, 100, 1000]); target = R.randint(3, 99) * p * (10 if p == 1000 else 1)
    target = target // p * p
    good = target - p // 2 + R.randint(0, p - 1)
    if good == target: return
    wrong = [target + p // 2 + R.randint(0, p // 2 - 1), target - p // 2 - R.randint(1, p // 2), target + p + R.randint(0, p // 2 - 1), target - p - R.randint(0, p // 2)]
    wrong = [w for w in wrong if round_half_up(w, p) != target]
    mc(T3, "Reason about rounding", f"Which number rounds to {fmt(target)} when rounded to the nearest {p:,}?", fmt(good), [fmt(w) for w in wrong],
       f"Numbers from {fmt(target - p // 2)} up to {fmt(target + p // 2 - 1)} round to {fmt(target)}. {fmt(good)} is in that range.")
def rd_bounds():
    p = R.choice([10, 100, 1000]); target = R.randint(2, 90) * p
    small = R.choice([True, False])
    ans = target - p // 2 if small else target + p // 2 - 1
    add(T3, "Reason about rounding", f"A whole number rounds to {fmt(target)} to the nearest {p:,}. What is the {'smallest' if small else 'largest'} it could be?", "n", ans,
        f"Halfway between {fmt(target - p)} and {fmt(target)} is {fmt(target - p // 2)}, and halfway rounds up. So the numbers that round to {fmt(target)} go from {fmt(target - p // 2)} to {fmt(target + p // 2 - 1)}.")
def rd_three():
    n = R.randint(10000, 99999)
    p = R.choice([10, 100, 1000])
    add(T3, "Round to the nearest 10, 100 and 1,000", f"{fmt(n)} rounded to the nearest 10 is {fmt(round_half_up(n, 10))}. What is it rounded to the nearest {p:,}?" if p != 10 else f"{fmt(n)} rounded to the nearest 1,000 is {fmt(round_half_up(n, 1000))}. What is it rounded to the nearest 10?", "n", round_half_up(n, p),
        f"Always round the original number, {fmt(n)}, not an answer you already rounded. Look at the {COL[p][1]} digit, {(n // (p // 10)) % 10}: {fmt(round_half_up(n, p))}.")
ROUND_FNS = [rd_basic, rd_basic, rd_basic, rd_which, rd_bounds, rd_three]

# =============================== Numbers in words ===============================
T4 = "Numbers in words"
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def w99(n): return ONES[n] if n < 20 else TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
def w999(n):
    h, r = divmod(n, 100)
    if not h: return w99(r)
    return ONES[h] + " hundred" + (" and " + w99(r) if r else "")
def words(n):
    if n == 0: return "zero"
    parts = []
    for size, name in ((10**6, "million"), (1000, "thousand")):
        if n >= size: parts.append(w999(n // size) + " " + name); n %= size
    if n: parts.append(("and " if parts and n < 100 else "") + w999(n))
    return " ".join(parts)
assert words(30407) == "thirty thousand four hundred and seven" and words(3005) == "three thousand and five" and words(2000050) == "two million and fifty"
def tricky_number():
    digits = R.choice([4, 5, 5, 6, 6, 7])
    s = [str(R.randint(1, 9))] + [R.choice("0000123456789") for _ in range(digits - 1)]
    return int("".join(s))
def nw_digits():
    n = tricky_number()
    add(T4, "Write numbers given in words", f"Write this number in digits: {words(n)}.", "n", n,
        f"Split it at the words million and thousand: " + " | ".join(f"{name}: {v}" for name, v in (("millions", n // 10**6), ("thousands", n // 1000 % 1000), ("the rest", n % 1000)) if v or name == "the rest") + f". Fill any empty columns with 0: {fmt(n)}.")
def variants(n):
    s = str(n); out = set()
    for i in range(1, len(s)):
        t = s[:i] + s[i+1:] + "0"; out.add(int(t))
        t = s[:i] + "0" + s[i:-1]; out.add(int(t))
    out.add(n * 10); out.add(n // 10)
    for i in range(len(s) - 1):
        t = list(s); t[i], t[i+1] = t[i+1], t[i]
        if t[0] != "0": out.add(int("".join(t)))
    out.discard(n)
    return [x for x in out if x > 0]
def nw_words():
    n = tricky_number(); v = variants(n); R.shuffle(v)
    mc(T4, "Read and write numbers in words", f"Which shows {fmt(n)} written in words?", words(n), [words(x) for x in v],
       f"Read it in groups: {fmt(n)} → " + ", ".join(f"{w999(g)} {name}".strip() for g, name in ((n // 10**6, "million"), (n // 1000 % 1000, "thousand"), (n % 1000, "")) if g) + f". So it is “{words(n)}”.")
def nw_compare():
    a = tricky_number(); b = R.choice(variants(a))
    big = max(a, b)
    add(T4, "Read numbers in words", f"Which is bigger: “{words(a)}” or “{words(b)}”?", "c", [words(a), words(b)].index(words(big)),
        f"In digits: {fmt(a)} and {fmt(b)}. {fmt(big)} is bigger.", opts=[words(a), words(b)])
WORD_FNS = [nw_digits, nw_digits, nw_digits, nw_words, nw_words, nw_compare]

# =============================== Place value ===============================
T5 = "Place value of digits"
ORDER = ["millions", "hundred thousands", "ten thousands", "thousands", "hundreds", "tens", "ones", "tenths", "hundredths", "thousandths"]
INT_PLACES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands", "millions"]
def unique_digit_number(decimals=0):
    for _ in range(100):
        whole = R.randint(1000, 9999999); dec = R.randint(0, 10**decimals - 1) if decimals else 0
        s = str(whole) + (("." + str(dec).zfill(decimals)) if decimals else "")
        c = Counter(ch for ch in s if ch.isdigit())
        cand = [ch for ch, k in c.items() if k == 1 and ch != "0"]
        if cand: return s, R.choice(cand)
    return None, None
def place_of(s, d):
    whole, _, dec = s.partition(".")
    if d in whole: return INT_PLACES[len(whole) - 1 - whole.index(d)], 10 ** (len(whole) - 1 - whole.index(d))
    i = dec.index(d); return ["tenths", "hundredths", "thousandths"][i], Fraction(1, 10 ** (i + 1))
def show(s):
    whole, _, dec = s.partition("."); return f"{int(whole):,}" + ("." + dec if dec else "")
def pv_value():
    s, d = unique_digit_number(R.choice([0, 0, 0, 3]))
    name, unit = place_of(s, d); val = int(d) * unit
    ans = float(val) if isinstance(val, Fraction) else val
    add(T5, "Know the value of each digit", f"What is the value of the digit {d} in {show(s)}?", "n", round(ans, 6) if isinstance(ans, float) else ans,
        f"The {d} is in the {name} place, so it is worth {d} × {fmt(float(unit)) if isinstance(unit, Fraction) else fmt(unit)} = {fmt(round(float(val), 6))}.")
def pv_name():
    s, d = unique_digit_number(R.choice([0, 0, 0, 3]))
    name, _ = place_of(s, d); i = ORDER.index(name)
    near = [ORDER[j] for j in (i - 1, i + 1, i - 2, i + 2) if 0 <= j < len(ORDER)]
    mc(T5, "Name the place of a digit", f"In {show(s)}, which place is the digit {d} in?", name, near,
       f"Count the columns from the ones: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions. After the decimal point: tenths, hundredths, thousandths. The {d} is in the {name} place.")
def pv_digit():
    n = R.randint(100000, 9999999); s = str(n); place = R.choice(INT_PLACES[:len(s)])
    d = s[len(s) - 1 - INT_PLACES.index(place)]
    add(T5, "Name the place of a digit", f"In {fmt(n)}, which digit is in the {place} place?", "n", int(d),
        f"From the right: ones {s[-1]}, tens {s[-2]}, hundreds {s[-3]}" + (f", thousands {s[-4]}" if len(s) > 3 else "") + (f", ten thousands {s[-5]}" if len(s) > 4 else "") + (f", hundred thousands {s[-6]}" if len(s) > 5 else "") + (f", millions {s[-7]}" if len(s) > 6 else "") + f". The {place} digit is {d}.")
def pv_build():
    n = tricky_number(); s = str(n)
    parts = [(int(ch), INT_PLACES[len(s) - 1 - i]) for i, ch in enumerate(s) if ch != "0"]
    R.shuffle(parts)
    add(T5, "Partition numbers", "What number is " + ", ".join(f"{a} {p if a != 1 else p[:-1] if p != 'ones' else 'one'}" for a, p in parts) + "?", "n", n,
        "Put each digit in its column and write 0 in any empty column: " + fmt(n) + ".")
def pv_more():
    n = R.randint(10000, 999999); p = R.choice([10, 100, 1000, 10000, 100000]); up = R.choice([True, False])
    if not up and n < p: return
    r = n + p if up else n - p
    add(T5, "Find more or less", f"What is {fmt(p)} {'more' if up else 'less'} than {fmt(n)}?", "n", r,
        f"Only the {INT_PLACES[int(math.log10(p))]} column changes (watch out if it goes past 9 or below 0): {fmt(n)} {'+' if up else '−'} {fmt(p)} = {fmt(r)}.")
PV_FNS = [pv_value, pv_value, pv_name, pv_name, pv_digit, pv_build, pv_more]

# =============================== Fractions ===============================
DENS = [2, 3, 4, 5, 6, 8, 9, 10, 12]
def proper(dens=DENS):
    d = R.choice(dens); return Fraction(R.randint(1, d - 1), d)
def mixnum():
    d = R.choice([2, 3, 4, 5, 6, 8]); return R.randint(1, 4) + Fraction(R.randint(1, d - 1), d)
def lcm(a, b): return a * b // math.gcd(a, b)
def simp_note(num, den):
    f = Fraction(num, den); s = ""
    if f.denominator != den: s += f" Simplify (divide top and bottom by {math.gcd(num, den)}): {frac(f)}."
    if f > 1 and f.denominator != 1: s += f" As a mixed number: {mixed(f)}."
    return s
def addsub(op):
    t = R.choice(["same", "diff", "diff", "mixed"])
    if t == "same":
        d = R.choice(DENS); a, b = Fraction(R.randint(1, d - 1), d), Fraction(R.randint(1, d - 1), d)
    elif t == "diff": a, b = proper(), proper()
    else: a, b = mixnum(), R.choice([mixnum(), proper()])
    if op == "−" and b > a: a, b = b, a
    r = a + b if op == "+" else a - b
    if r <= 0 or (t == "same" and a.denominator != b.denominator): return
    topic = "Adding fractions" if op == "+" else "Subtracting fractions"
    q = f"Work out {mixed(a)} {op} {mixed(b)}. Give your answer in its simplest form."
    if t == "same" or a.denominator == b.denominator:
        L = a.denominator
        why = f"The denominators are the same, so {'add' if op == '+' else 'subtract'} the numerators and keep the denominator."
    else:
        L = lcm(a.denominator, b.denominator)
        why = f"Find a common denominator: {L} (the lowest common multiple of {a.denominator} and {b.denominator})."
    if t == "mixed":
        conv = [f"{mixed(x)} = {x.numerator}/{x.denominator}" for x in (a, b) if x > 1 and x.denominator != 1]
        why = f"Change mixed numbers to improper fractions: {' and '.join(conv)}. " + why
    na, nb = a * L, b * L
    why += f" {int(na)}/{L} {op} {int(nb)}/{L} = {int(na + nb if op == '+' else na - nb)}/{L}." + simp_note(int(na + nb if op == '+' else na - nb), L)
    add(topic, f"{'Add' if op == '+' else 'Subtract'} fractions", q, "f", mixed(r), why)
def fr_add(): addsub("+")
def fr_sub(): addsub("−")
def fr_mul():
    t = R.choice(["whole", "frac", "frac", "mixed"])
    if t == "whole": a, b = proper(), Fraction(R.randint(2, 12))
    elif t == "frac": a, b = proper(), proper()
    else: a, b = mixnum(), R.choice([proper(), Fraction(R.randint(2, 5))])
    r = a * b
    why = (f"Change the mixed number to an improper fraction: {mixed(a)} = {a.numerator}/{a.denominator}. " if t == "mixed" else "")
    if b.denominator == 1:
        why += f"Multiply the numerator by {b.numerator}: {a.numerator} × {b.numerator} = {a.numerator * b.numerator}, so {a.numerator * b.numerator}/{a.denominator}."
        why += simp_note(a.numerator * b.numerator, a.denominator)
    else:
        why += f"Multiply the tops and multiply the bottoms: {a.numerator} × {b.numerator} = {a.numerator * b.numerator} and {a.denominator} × {b.denominator} = {a.denominator * b.denominator}, so {a.numerator * b.numerator}/{a.denominator * b.denominator}."
        why += simp_note(a.numerator * b.numerator, a.denominator * b.denominator)
    add("Multiplying fractions", "Multiply fractions", f"Work out {mixed(a)} × {mixed(b)}. Give your answer in its simplest form.", "f", mixed(r), why)
def fr_div():
    t = R.choice(["byWhole", "wholeBy", "frac", "frac", "mixed"])
    if t == "byWhole": a, b = proper(), Fraction(R.randint(2, 6))
    elif t == "wholeBy": a, b = Fraction(R.randint(1, 6)), proper([2, 3, 4, 5, 6, 8])
    elif t == "frac": a, b = proper(), proper()
    else: a, b = mixnum(), proper([2, 3, 4, 5, 6])
    r = a / b
    flip = Fraction(b.denominator, b.numerator)
    why = (f"Change the mixed number to an improper fraction: {mixed(a)} = {a.numerator}/{a.denominator}. " if t == "mixed" else "")
    why += f"Keep, change, flip: keep {frac(a)}, change ÷ to ×, flip {frac(b)} to {b.denominator}/{b.numerator}. "
    why += f"{frac(a)} × {b.denominator}/{b.numerator} = {a.numerator * b.denominator}/{a.denominator * b.numerator}." + simp_note(a.numerator * b.denominator, a.denominator * b.numerator)
    add("Dividing fractions", "Divide fractions", f"Work out {mixed(a)} ÷ {mixed(b)}. Give your answer in its simplest form.", "f", mixed(r), why)

TOPICS = [
    ("Prime numbers", PRIME_FNS),
    ("Factors", FACTOR_FNS),
    ("Rounding to 10, 100 and 1,000", ROUND_FNS),
    ("Numbers in words", WORD_FNS),
    ("Place value of digits", PV_FNS),
    ("Adding fractions", [fr_add]),
    ("Subtracting fractions", [fr_sub]),
    ("Multiplying fractions", [fr_mul]),
    ("Dividing fractions", [fr_div]),
]
for topic, fns in TOPICS:
    start = len(BANK); tries = 0
    while len(BANK) - start < PER_TOPIC:
        tries += 1
        if tries > 200000: raise SystemExit(f"Not enough unique questions for {topic}: {len(BANK)-start}")
        before = len(BANK); R.choice(fns)()
        if len(BANK) > before: BANK[-1]["t"] = topic
    del BANK[start + PER_TOPIC:]

# ---------- checks: recompute every answer independently ----------
for i, q in enumerate(BANK):
    q["id"] = f"r{i+1:04d}"
    if q["k"] == "c": assert 0 <= q["a"] < len(q["c"]) and len(set(q["c"])) == len(q["c"]), q
    if q["t"] == "Prime numbers" and q["q"].startswith("Is "):
        n = int(q["q"].split()[1]); assert q["a"] == (0 if is_prime(n) else 1)
    if q["q"].startswith("Write this number in digits: "):
        assert words(q["a"]) == q["q"][29:-1], q
    if q["q"].startswith("Round "):
        n = int(q["q"].split()[1].replace(",", "")); p = int(q["q"].split("nearest ")[1].rstrip(".").replace(",", ""))
        assert q["a"] == round_half_up(n, p) and abs(q["a"] - n) <= p / 2, q
    if q["k"] == "f":
        expr = q["q"].split("Work out ")[1].split(". Give")[0]
        def pv(s):
            s = s.strip(); parts = s.split(" ")
            return Fraction(parts[0]) + (Fraction(parts[1]) if len(parts) > 1 else 0)
        for op in (" + ", " − ", " × ", " ÷ "):
            if op in expr:
                x, y = map(pv, expr.split(op)); want = {" + ": x + y, " − ": x - y, " × ": x * y, " ÷ ": x / y}[op]
        assert pv(q["a"]) == want, q
assert len(BANK) == PER_TOPIC * len(TOPICS)

out = "/* Year 7 maths, Brush up: number skills from earlier years (primes, factors, rounding, numbers in words, place value, fractions). Built by tools/build_review.py. */\n"
out += "const REVIEW_TOPICS=" + json.dumps([t for t, _ in TOPICS]) + ";\n"
out += "const REVIEW=" + json.dumps(BANK, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += "MATHS.push(...REVIEW); MATHS_TOPICS.push(...REVIEW_TOPICS);\n"
open("maths-review.js", "w").write(out)
print(len(BANK), "questions,", round(len(out) / 1024), "KB")
print(Counter(q["t"] for q in BANK))
print(Counter(q["k"] for q in BANK))
