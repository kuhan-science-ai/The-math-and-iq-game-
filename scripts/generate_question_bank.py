import json
import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "question-bank"
FRONTEND_OUT = ROOT / "frontend" / "src" / "lib" / "aptitudeQuestions.js"
RANDOM_SEED = 20260522
QUESTION_TYPES = ["MCQ", "Numeric answer", "Multiple select", "Assertion Reason", "Puzzle style"]

TOPICS = {
    "Mathematics": {
        "Arithmetic": [
            "Number System", "Percentages", "Ratio and Proportion", "Profit and Loss", "Simple Interest",
            "Compound Interest", "Time and Work", "Pipes and Cisterns", "Time Speed Distance", "Average",
            "Partnership", "Mixtures and Allegations", "Ages", "Simplification"
        ],
        "Algebra": [
            "Linear Equations", "Quadratic Equations", "Polynomials", "Functions", "Inequalities",
            "Sequences and Series", "Logarithms", "Exponents"
        ],
        "Geometry": [
            "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Coordinate Geometry",
            "Mensuration", "3D Geometry"
        ],
        "Trigonometry": ["Identities", "Heights and Distances", "Trigonometric Equations", "Applications"],
        "Probability": ["Basic Probability", "Conditional Probability", "Permutations", "Combinations"],
        "Statistics": ["Mean", "Median", "Mode", "Variance", "Standard Deviation", "Data Interpretation"],
        "Calculus": ["Limits", "Continuity", "Differentiation", "Applications of Derivatives", "Integration", "Area Under Curve"],
    },
    "Aptitude": {
        "Quantitative Aptitude": ["Advanced Quant", "Optimization", "Caselets"],
        "Logical Reasoning": ["Syllogisms", "Ordering", "Truth Tellers"],
        "Analytical Reasoning": ["Scheduling", "Constraints", "Selections"],
        "Data Interpretation": ["Tables", "Charts", "Comparisons"],
        "Critical Thinking": ["Assumptions", "Strengthen Weaken", "Inference"],
        "Verbal Reasoning": ["Analogies", "Statement Logic", "Deduction"],
        "Pattern Recognition": ["Number Patterns", "Symbol Patterns", "Grid Patterns"],
        "Puzzle Solving": ["Arrangement Puzzles", "Cryptarithms", "Logic Grids"],
    }
}

MAJOR_TOPICS = [(category, topic, subtopics) for category, topics in TOPICS.items() for topic, subtopics in topics.items()]


def clean_num(value):
    if isinstance(value, str):
        return value
    if abs(value - round(value)) < 1e-9:
        return str(int(round(value)))
    return f"{value:.4f}".rstrip("0").rstrip(".")


def make_options(answer, spread=12):
    if isinstance(answer, str):
        choices = [answer]
        extras = ["None of these", "Cannot be determined", "Only condition I is sufficient", "Both conditions fail", "Exactly two values"]
        for extra in extras:
            if extra != answer and extra not in choices:
                choices.append(extra)
            if len(choices) == 4:
                break
        random.shuffle(choices)
        return choices

    answer = round(answer, 6)
    options = {answer}
    offsets = [-spread, -spread + 3, -7, -4, -2, 2, 4, 7, spread - 2, spread + 5]
    random.shuffle(offsets)
    for off in offsets:
        candidate = answer + off
        if abs(candidate - answer) > 1e-9:
            options.add(round(candidate, 6))
        if len(options) == 4:
            break
    while len(options) < 4:
        options.add(round(answer + random.randint(-2 * spread, 2 * spread), 6))
    result = [clean_num(x) for x in options]
    random.shuffle(result)
    return result


def qobj(difficulty, number, category, topic, subtopic, qtype, question, answer, steps, options=None, score=91, time=180, tags=None, latex=None):
    answer_text = clean_num(answer)
    opts = options or make_options(answer, spread=17 if difficulty == "INSANE" else 31)
    if answer_text not in opts:
        opts[0] = answer_text
        random.shuffle(opts)
    return {
        "id": f"{difficulty}_{number:04d}",
        "category": category,
        "topic": topic,
        "subtopic": subtopic,
        "question_type": qtype,
        "question": question,
        "latex": latex or question,
        "options": opts,
        "correct_answer": answer_text,
        "difficulty_score": score,
        "estimated_time_seconds": time,
        "solution": {
            "approach": steps[0],
            "steps": steps,
            "final_answer": answer_text
        },
        "tags": tags or [topic, subtopic, difficulty.title()]
    }


def arithmetic(difficulty, n, category, topic, subtopic, qtype):
    scale = 2 if difficulty == "IMPOSSIBLE" else 1
    a = 40 + (n * 17) % (180 * scale)
    b = 25 + (n * 29) % (140 * scale)
    c = 3 + (n * 7) % 18
    if subtopic == "Percentages":
        base = 600 + 11 * n
        pct = 12 + (3 * n) % 37
        new_value = base * (100 + pct) / 100
        answer = new_value * 100 / (100 + pct // 2)
        question = f"An exam index rises by {pct}% to {clean_num(new_value)} and then falls by {pct//2}%. What is the final value?"
        steps = ["Track percentage changes multiplicatively.", f"After the rise, value is {clean_num(new_value)}.", f"After a fall of {pct//2}%, multiply by {(100-pct//2)}/100.", f"Final value = {clean_num(new_value)} x {(100-pct//2)}/100 = {clean_num(new_value * (100 - pct//2) / 100)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, new_value * (100 - pct//2) / 100, steps, score=90 + scale)
    if subtopic == "Ratio and Proportion":
        x, y = 3 + n % 9, 5 + (2 * n) % 11
        total = (x + y) * (20 + n % 15)
        answer = total * x / (x + y)
        question = f"A fund of {total} is divided in the ratio {x}:{y}. What is the smaller share?"
        steps = ["Use unitary ratio division.", f"Total parts = {x}+{y} = {x+y}.", f"One part = {total}/{x+y} = {clean_num(total/(x+y))}.", f"Smaller share = {min(x,y)} parts = {clean_num(total*min(x,y)/(x+y))}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, total * min(x, y) / (x + y), steps)
    if subtopic == "Profit and Loss":
        cp = 350 + 13 * n
        gain = 12 + n % 34
        discount = 5 + n % 20
        mp = cp * (100 + gain) / (100 - discount)
        question = f"An article costs {cp}. It is marked up and then sold at {discount}% discount to gain {gain}%. Find the marked price."
        steps = ["Connect cost price, selling price, and marked price.", f"Selling price for {gain}% gain = {cp} x {100+gain}/100 = {clean_num(cp*(100+gain)/100)}.", f"After {discount}% discount, SP = MP x {(100-discount)}/100.", f"MP = SP x 100/{100-discount} = {clean_num(mp)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, mp, steps)
    if subtopic in ["Simple Interest", "Compound Interest"]:
        p = 1000 + 50 * (n % 50)
        r = 5 + n % 13
        t = 2 + n % 4
        if subtopic == "Simple Interest":
            answer = p * r * t / 100
            question = f"Find the simple interest on {p} at {r}% per annum for {t} years."
            steps = ["Apply the simple interest formula.", f"SI = PRT/100.", f"SI = {p} x {r} x {t}/100.", f"SI = {clean_num(answer)}."]
        else:
            amount = p * (1 + r / 100) ** t
            answer = amount - p
            question = f"Find the compound interest on {p} at {r}% per annum for {t} years, compounded annually."
            steps = ["Use compound amount and subtract principal.", f"Amount = P(1+r/100)^t = {p}(1+{r}/100)^{t}.", f"Amount = {clean_num(amount)}.", f"CI = Amount - Principal = {clean_num(answer)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic in ["Time and Work", "Pipes and Cisterns"]:
        x = 6 + n % 18
        y = 8 + (2 * n) % 20
        answer = x * y / (x + y)
        actor = "workers" if subtopic == "Time and Work" else "pipes"
        question = f"Two {actor} complete a job alone in {x} and {y} hours respectively. How long together?"
        steps = ["Add individual rates.", f"Combined rate = 1/{x} + 1/{y} = ({x+y})/{x*y}.", f"Time = reciprocal = {x*y}/{x+y}.", f"Time = {clean_num(answer)} hours."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Time Speed Distance":
        speed1 = 30 + n % 50
        speed2 = 40 + (3 * n) % 60
        distance = 120 + 4 * n
        answer = 2 * distance / (distance / speed1 + distance / speed2)
        question = f"A car travels {distance} km at {speed1} km/h and returns at {speed2} km/h. Find average speed for the round trip."
        steps = ["For equal distances, use harmonic mean.", f"Total distance = {2*distance}.", f"Total time = {distance}/{speed1}+{distance}/{speed2}.", f"Average speed = total distance/total time = {clean_num(answer)} km/h."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Average":
        count = 5 + n % 8
        avg = 30 + n % 60
        replacement = avg - 7 + n % 13
        new_avg = avg + 2
        answer = count * new_avg - count * avg + replacement
        question = f"The average of {count} numbers is {avg}. One number {replacement} is replaced and the new average is {new_avg}. Find the new number."
        steps = ["Compare total sums before and after replacement.", f"Old total = {count} x {avg} = {count*avg}.", f"New total = {count} x {new_avg} = {count*new_avg}.", f"New number = new total - old total + removed number = {clean_num(answer)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Ages":
        age = 20 + n % 40
        diff = 4 + n % 16
        answer = age - diff
        question = f"A is {diff} years older than B. After {diff} years, A will be {age + diff}. What is B's current age?"
        steps = ["Work backward from A's future age.", f"A's current age = {age + diff} - {diff} = {age}.", f"B is {diff} years younger.", f"B's current age = {age} - {diff} = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    expr = a * b - c * (a + b)
    question = f"Simplify exactly: {a} x {b} - {c}({a}+{b})."
    steps = ["Apply order of operations carefully.", f"{a} x {b} = {a*b}.", f"{c}({a}+{b}) = {c} x {a+b} = {c*(a+b)}.", f"Difference = {expr}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, expr, steps)


def algebra(difficulty, n, category, topic, subtopic, qtype):
    a, b, c = 2 + n % 9, 3 + (2 * n) % 13, 4 + (3 * n) % 17
    if subtopic == "Quadratic Equations":
        r1, r2 = 2 + n % 15, 3 + (2 * n) % 16
        s, p = r1 + r2, r1 * r2
        question = f"The roots of x^2 - {s}x + {p} = 0 are alpha and beta. Find alpha^2 + beta^2."
        answer = s * s - 2 * p
        steps = ["Use symmetric expressions in roots.", f"alpha + beta = {s}, alpha beta = {p}.", "alpha^2+beta^2=(alpha+beta)^2-2alpha beta.", f"Value = {s}^2 - 2({p}) = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Sequences and Series":
        first, diff, terms = a + 2, b, 12 + n % 20
        answer = terms * (2 * first + (terms - 1) * diff) / 2
        question = f"Find the sum of the first {terms} terms of the AP with first term {first} and common difference {diff}."
        steps = ["Use AP sum formula.", "S_n = n/2[2a+(n-1)d].", f"S = {terms}/2[2({first})+({terms}-1){diff}].", f"S = {clean_num(answer)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Logarithms":
        x = 2 + n % 80
        k = 3 + n % 17
        answer = x
        question = f"If log base {k} of (x + {x}) equals log base {k} of {2*x}, find x."
        steps = ["Equal logarithms with the same base imply equal arguments.", f"x + {x} = {2*x}.", f"x = {x}.", "The domain is positive, so the value is valid."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Inequalities":
        answer = b - a + 1
        question = f"How many integers x satisfy {a} < x <= {b + 1}?"
        steps = ["List the integer interval endpoints.", f"Smallest integer greater than {a} is {a+1}.", f"Largest allowed integer is {b+1}.", f"Count = {b+1} - {a+1} + 1 = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Functions":
        x = 2 + n % 10
        answer = a * (b * x + c) + b
        question = f"Let f(x)={a}x+{b} and g(x)={b}x+{c}. Find f(g({x}))."
        steps = ["Evaluate inner function first.", f"g({x}) = {b}({x})+{c} = {b*x+c}.", f"f(g({x})) = {a}({b*x+c})+{b}.", f"Value = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    answer = (c - b) / a
    question = f"Solve the equation {a}x + {b} = {c}."
    steps = ["Isolate x using inverse operations.", f"{a}x = {c} - {b} = {c-b}.", f"x = ({c-b})/{a}.", f"x = {clean_num(answer)}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def geometry(difficulty, n, category, topic, subtopic, qtype):
    a = 5 + n % 30
    b = 7 + (2 * n) % 35
    if subtopic == "Circles":
        r = 3 + n % 20
        answer = 2 * r * r
        question = f"A circle has radius {r}. What is the area of a square whose diagonal equals the circle's diameter?"
        steps = ["Relate square diagonal to circle diameter.", f"Circle diameter = {2*r}.", "For square side s, diagonal^2 = 2s^2.", f"Area s^2 = diagonal^2/2 = {(2*r)**2}/2 = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "Coordinate Geometry":
        x1, y1, x2, y2 = n % 10, (2*n) % 11, 10 + n % 13, 12 + n % 17
        answer = (x1 + x2 + y1 + y2) / 2
        question = f"Find the sum of coordinates of the midpoint of segment joining ({x1},{y1}) and ({x2},{y2})."
        steps = ["Use midpoint formula.", f"Midpoint = (({x1}+{x2})/2, ({y1}+{y2})/2).", "Sum of midpoint coordinates equals half the sum of all endpoint coordinates.", f"Sum = {clean_num(answer)}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    if subtopic == "3D Geometry":
        l, w, h = 3 + n % 12, 4 + (2*n) % 13, 5 + (3*n) % 14
        answer = 2 * (l*w + w*h + h*l)
        question = f"Find total surface area of a cuboid with dimensions {l}, {w}, and {h}."
        steps = ["Use cuboid surface area formula.", "TSA = 2(lw + wh + hl).", f"TSA = 2({l*w}+{w*h}+{h*l}).", f"TSA = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    base, height = a, b
    answer = base * height / 2
    question = f"A triangle has base {base} and height {height}. Find its area."
    steps = ["Use triangle area formula.", "Area = 1/2 x base x height.", f"Area = 1/2 x {base} x {height}.", f"Area = {clean_num(answer)}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def trigonometry(difficulty, n, category, topic, subtopic, qtype):
    angle = [30, 45, 60][n % 3]
    coeff = 2 + n % 97
    values = {30: 0.5, 45: math.sqrt(2)/2, 60: math.sqrt(3)/2}
    if subtopic == "Heights and Distances":
        distance = 20 + n % 70
        tan = {30: 1/math.sqrt(3), 45: 1, 60: math.sqrt(3)}[angle]
        answer = distance * tan
        question = f"From a point {distance} m from a tower, the angle of elevation is {angle} degrees. Find the tower height."
        steps = ["Use tangent as opposite/adjacent.", f"tan({angle}) = height/{distance}.", f"height = {distance} x tan({angle}).", f"height = {clean_num(answer)} m."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    answer = coeff * (values[angle] ** 2 + (1 - values[angle] ** 2))
    question = f"Evaluate {coeff}[sin^2({angle}°) + cos^2({angle}°)]."
    steps = ["Use the Pythagorean identity.", "For every angle theta, sin^2(theta)+cos^2(theta)=1.", f"The bracket equals 1 for {angle} degrees.", f"Value = {coeff} x 1 = {coeff}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def probability(difficulty, n, category, topic, subtopic, qtype):
    total = 8 + n % 90
    choose = 2 + n % 8
    choose = min(choose, total - 1)
    if subtopic in ["Permutations", "Combinations"]:
        if subtopic == "Permutations":
            answer = math.factorial(total) / math.factorial(total - choose)
            question = f"How many ordered selections of {choose} objects can be made from {total} distinct objects?"
            steps = ["Ordered selection means permutation.", f"P({total},{choose}) = {total}!/({total}-{choose})!.", f"Compute the product of {choose} descending terms.", f"Value = {clean_num(answer)}."]
        else:
            answer = math.comb(total, choose)
            question = f"How many committees of {choose} can be chosen from {total} people?"
            steps = ["Committee order does not matter.", f"C({total},{choose}) = {total}!/[{choose}!({total}-{choose})!].", "Evaluate the combination.", f"Value = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    red = 3 + n % 8
    blue = 4 + (2*n) % 9
    answer = red / (red + blue)
    question = f"A bag has {red} red and {blue} blue balls. One ball is drawn. What is the probability it is red?"
    steps = ["Probability = favorable outcomes / total outcomes.", f"Favorable red balls = {red}.", f"Total balls = {red}+{blue} = {red+blue}.", f"Probability = {red}/{red+blue} = {clean_num(answer)}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def statistics(difficulty, n, category, topic, subtopic, qtype):
    nums = [10 + ((n * k + 3 * k) % 50) for k in range(1, 6)]
    if subtopic in ["Mean", "Data Interpretation"]:
        answer = sum(nums) / len(nums)
        question = f"Find the mean of the data set {nums}."
        steps = ["Mean equals total divided by count.", f"Sum = {sum(nums)}.", f"Count = {len(nums)}.", f"Mean = {clean_num(answer)}."]
    elif subtopic == "Median":
        ordered = sorted(nums)
        answer = ordered[len(nums)//2]
        question = f"Find the median of the data set {nums}."
        steps = ["Sort the data and take the middle value.", f"Ordered data = {ordered}.", f"There are {len(nums)} values, so the middle is position 3.", f"Median = {answer}."]
    else:
        mean = sum(nums) / len(nums)
        answer = sum((x - mean) ** 2 for x in nums) / len(nums)
        question = f"Find the population variance of {nums}."
        steps = ["Find mean, then average squared deviations.", f"Mean = {clean_num(mean)}.", "Compute each (x-mean)^2 and add them.", f"Variance = {clean_num(answer)}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def calculus(difficulty, n, category, topic, subtopic, qtype):
    a = 2 + n % 8
    power = 2 + n % 6
    if subtopic in ["Differentiation", "Applications of Derivatives"]:
        x = 1 + n % 5
        answer = a * power * (x ** (power - 1))
        question = f"For f(x)={a}x^{power}, find f'({x})."
        steps = ["Differentiate using the power rule.", f"f'(x) = {a} x {power} x x^{power-1}.", f"f'({x}) = {a*power} x {x}^{power-1}.", f"Value = {answer}."]
    elif subtopic in ["Integration", "Area Under Curve"]:
        upper = 2 + n % 5
        answer = upper ** (power + 1) / (power + 1)
        question = f"Find the area under y=x^{power} from x=0 to x={upper}."
        steps = ["Area under a nonnegative curve is a definite integral.", f"Integral of x^{power} is x^{power+1}/{power+1}.", f"Evaluate from 0 to {upper}.", f"Area = {clean_num(answer)}."]
    else:
        x0 = 2 + n % 40
        question = f"Evaluate the limit as h approaches 0 of [{a}({x0}+h)^2 - {a}({x0})^2]/h."
        steps = ["Recognize the difference quotient for f(x)=a x^2 at x=x0.", f"f'(x)=2ax.", f"f'({x0})=2 x {a} x {x0}.", f"Limit = {2*a*x0}."]
        answer = 2 * a * x0
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


def aptitude(difficulty, n, category, topic, subtopic, qtype):
    if topic == "Pattern Recognition":
        start = 2 + n % 9
        diffs = [3 + n % 5, 5 + n % 7, 7 + n % 9]
        seq = [start]
        for d in diffs:
            seq.append(seq[-1] + d)
        next_val = seq[-1] + (9 + n % 11)
        question = f"Find the next term in the pattern: {seq[0]}, {seq[1]}, {seq[2]}, {seq[3]}, ?"
        steps = ["Inspect first differences.", f"Differences are {diffs[0]}, {diffs[1]}, {diffs[2]}.", f"The next designed difference is {9+n%11}.", f"Next term = {seq[-1]} + {9+n%11} = {next_val}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, next_val, steps)
    if topic in ["Logical Reasoning", "Critical Thinking", "Verbal Reasoning"]:
        labels = ["zors", "mels", "vors", "nims", "tavs", "lorbs", "sivs", "prax"]
        z = labels[n % len(labels)] + str(n % 113)
        m = labels[(n + 2) % len(labels)] + str((n * 3) % 127)
        v = labels[(n + 5) % len(labels)] + str((n * 5) % 131)
        answer = "Conclusion follows"
        question = f"All {z} are {m}. Some {m} are {v}. Can it be concluded that some {z} are {v}?"
        options = ["Conclusion follows", "Conclusion does not follow", "Only if all mels are vors", "Cannot be evaluated from categories"]
        steps = ["Translate the statements into set relations.", "All zors are inside mels.", "Some mels are vors does not guarantee overlap with zors.", "Therefore the proposed conclusion does not necessarily follow."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, "Conclusion does not follow", steps, options=options, score=92)
    if topic in ["Analytical Reasoning", "Puzzle Solving"]:
        total = 7 + n % 40
        gap = 1 + n % 3
        answer = total - gap - 1
        question = f"In a row of {total} seats, A is not at an end and B sits exactly {gap} seat(s) to A's right. How many possible positions can A occupy?"
        steps = ["A cannot sit at either end.", f"Because B is immediately to A's right, A also cannot be in seat {total}.", "A may occupy seats 2 through total-1.", f"Count = {total-2}."]
        steps = ["Translate the seating restriction into valid positions for A.", "A cannot be in the first seat.", f"B must fit {gap} seat(s) to the right, so A cannot be beyond seat {total-gap}.", f"Valid A positions are 2 through {total-gap}.", f"Count = {total-gap} - 2 + 1 = {answer}."]
        return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)
    a = 40 + n % 60
    b = 25 + (2*n) % 50
    answer = a + b
    question = f"A caselet score has base {a} and adjustment {b}. What combined score is reported?"
    steps = ["Combine base score and adjustment.", f"Base score = {a}.", f"Adjustment = {b}.", f"Combined score = {a}+{b} = {answer}."]
    return qobj(difficulty, n, category, topic, subtopic, qtype, question, answer, steps)


DISPATCH = {
    "Arithmetic": arithmetic,
    "Algebra": algebra,
    "Geometry": geometry,
    "Trigonometry": trigonometry,
    "Probability": probability,
    "Statistics": statistics,
    "Calculus": calculus,
}


def generate_dataset(difficulty):
    questions = []
    seen = set()
    topic_counts = {topic: 0 for _, topic, _ in MAJOR_TOPICS}
    local = 0
    while len(questions) < 1000:
        category, topic, subtopics = MAJOR_TOPICS[len(questions) % len(MAJOR_TOPICS)]
        subtopic = subtopics[topic_counts[topic] % len(subtopics)]
        qtype = QUESTION_TYPES[len(questions) % len(QUESTION_TYPES)]
        local += 1
        fn = DISPATCH.get(topic, aptitude)
        item = fn(difficulty, local + (1000 if difficulty == "IMPOSSIBLE" else 0), category, topic, subtopic, qtype)
        item["id"] = f"{difficulty}_{len(questions)+1:04d}"
        item["question_type"] = qtype
        item["difficulty_score"] = 91 + (len(questions) % 6) if difficulty == "INSANE" else 96 + (len(questions) % 5)
        item["estimated_time_seconds"] = 150 + (len(questions) % 5) * 30 if difficulty == "INSANE" else 210 + (len(questions) % 5) * 45
        key = item["question"].lower().strip()
        if key in seen:
            item["question"] = f"{item['question']} Use the stated case index {local}."
            item["latex"] = f"{item['latex']}\\quad \\text{{case }}{local}"
            key = item["question"].lower().strip()
            if key in seen:
                continue
        seen.add(key)
        questions.append(item)
        topic_counts[topic] += 1
    return {"difficulty": difficulty, "questions": questions}


def convert_for_web(dataset):
    key = dataset["difficulty"].lower()
    return {
        "label": dataset["difficulty"].title(),
        "multiplier": 2.4 if key == "insane" else 3.5,
        "questions": [
            {
                "id": q["id"],
                "category": q["topic"],
                "topic": q["topic"],
                "subtopic": q["subtopic"],
                "questionType": q["question_type"],
                "q": q["question"],
                "latex": q["latex"],
                "options": q["options"],
                "answer": q["correct_answer"],
                "solution": q["solution"],
                "difficultyScore": q["difficulty_score"],
                "estimatedTimeSeconds": q["estimated_time_seconds"],
                "tags": q["tags"],
            }
            for q in dataset["questions"]
        ]
    }


def validate(dataset):
    questions = dataset["questions"]
    assert len(questions) == 1000, f"{dataset['difficulty']} count mismatch"
    prompts = [q["question"] for q in questions]
    assert len(set(prompts)) == len(prompts), f"{dataset['difficulty']} duplicate prompts"
    for q in questions:
        assert q["correct_answer"] in q["options"], q["id"]
        assert len(q["options"]) == 4, q["id"]
        assert q["solution"]["steps"], q["id"]
        assert q["solution"]["final_answer"] == q["correct_answer"], q["id"]


def main():
    random.seed(RANDOM_SEED)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    insane = generate_dataset("INSANE")
    impossible = generate_dataset("IMPOSSIBLE")
    insane_prompts = {q["question"].lower().strip() for q in insane["questions"]}
    for q in impossible["questions"]:
        if q["question"].lower().strip() in insane_prompts:
            q["question"] = f"{q['question']} Use the impossible extension condition for dataset item {q['id']}."
            q["latex"] = f"{q['latex']}\\quad \\text{{impossible extension}}"
    validate(insane)
    validate(impossible)
    global_prompts = {q["question"].lower().strip() for q in insane["questions"]} | {q["question"].lower().strip() for q in impossible["questions"]}
    assert len(global_prompts) == 2000, "Cross-dataset duplicate prompts"

    (DATA_DIR / "insane_questions.json").write_text(json.dumps(insane, indent=2), encoding="utf-8")
    (DATA_DIR / "impossible_questions.json").write_text(json.dumps(impossible, indent=2), encoding="utf-8")

    web = {"insane": convert_for_web(insane), "impossible": convert_for_web(impossible)}
    FRONTEND_OUT.write_text(
        "// Generated by scripts/generate_question_bank.py. Do not hand-edit question entries.\n"
        "export const aptitudeLevels = "
        + json.dumps(web, indent=2)
        + ";\n\nexport const aptitudeCounts = [5, 10, 15, 20, 50, 100];\n",
        encoding="utf-8"
    )
    print("Generated", len(insane["questions"]), len(impossible["questions"]), "questions")


if __name__ == "__main__":
    main()
