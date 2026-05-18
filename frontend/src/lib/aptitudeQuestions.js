export const aptitudeLevels = {
  easy: {
    label: "Easy",
    multiplier: 1,
    questions: [
      {
        category: "Speed and Distance",
        q: "A train running at the speed of 72 km/h crosses a pole in 9 seconds. What is the length of the train?",
        latex: "72\\times\\frac{5}{18}=20,\\quad L=20\\times9",
        options: [
          "150 meters",
          "180 meters",
          "200 meters",
          "324 meters"
        ],
        answer: "180 meters",
        solution: "Convert speed to m/s: 72 * (5/18) = 20 m/s. Distance = Speed * Time = 20 * 9 = 180 meters."
      },
      {
        category: "Average",
        q: "The average of 5 consecutive numbers is 20. What is the highest of these numbers?",
        latex: "\\frac{(x-2)+(x-1)+x+(x+1)+(x+2)}{5}=20",
        options: [
          "20",
          "21",
          "22",
          "24"
        ],
        answer: "22",
        solution: "Let the numbers be x-2, x-1, x, x+1, x+2. Their sum is 5x. Average = 5x/5 = x = 20. The highest number is x + 2 = 20 + 2 = 22."
      },
      {
        category: "Interest",
        q: "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?",
        latex: "P=\\frac{P\\times R\\times8}{100}",
        options: [
          "10%",
          "12.5%",
          "15%",
          "20%"
        ],
        answer: "12.5%",
        solution: "Let Principal = P. Since it doubles, Interest = P. Formula: Interest = (P * R * T) / 100 => P = (P * R * 8) / 100 => 1 = 8R / 100 => R = 100 / 8 = 12.5%."
      },
      {
        category: "Work Rate",
        q: "A and B can do a piece of work in 6 days and 12 days respectively. Working together, in how many days will they finish the work?",
        latex: "\\frac{1}{6}+\\frac{1}{12}=\\frac{1}{4}",
        options: [
          "3 days",
          "4 days",
          "5 days",
          "6 days"
        ],
        answer: "4 days",
        solution: "A's 1-day work = 1/6, B's 1-day work = 1/12. Combined 1-day work = 1/6 + 1/12 = 3/12 = 1/4. Therefore, they will finish the work in 4 days."
      },
      {
        category: "Profit and Loss",
        q: "The price of an item increases by 20%. By what percentage must a consumer reduce consumption so that the expenditure remains unchanged?",
        latex: "\\frac{20}{100+20}\\times100",
        options: [
          "16.67%",
          "20%",
          "25%",
          "15%"
        ],
        answer: "16.67%",
        solution: "Formula: (R / (100 + R)) * 100 => (20 / 120) * 100 = 16.67%."
      },
      {
        category: "Series",
        q: "Find the missing number in the sequence: 2, 6, 12, 20, 30, ?",
        latex: "2,\\ 6,\\ 12,\\ 20,\\ 30,\\ ?",
        options: [
          "36",
          "40",
          "42",
          "50"
        ],
        answer: "42",
        solution: "The differences between consecutive terms are increasing consecutive even numbers: +4, +6, +8, +10. The next difference must be +12. 30 + 12 = 42."
      },
      {
        category: "Ratio",
        q: "The ratio of the ages of a mother and her daughter is 7:3. If the sum of their ages is 60 years, what is the difference in their ages?",
        latex: "7x+3x=60",
        options: [
          "18 years",
          "24 years",
          "30 years",
          "21 years"
        ],
        answer: "24 years",
        solution: "Let their ages be 7x and 3x. 7x + 3x = 60 => 10x = 60 => x = 6. Difference = 7x - 3x = 4x = 4 * 6 = 24 years."
      },
      {
        category: "Profit and Loss",
        q: "A shopkeeper buys an article for 400 rupees and sells it for 480 rupees. What is his gain percentage?",
        latex: "\\frac{480-400}{400}\\times100",
        options: [
          "15%",
          "20%",
          "25%",
          "18%"
        ],
        answer: "20%",
        solution: "Profit = 480 - 400 = 80 rupees. Profit % = (Profit / Cost Price) * 100 = (80 / 400) * 100 = 20%."
      },
      {
        category: "Ratio",
        q: "If 15% of x is equal to 20% of y, then find the ratio x : y.",
        latex: "0.15x=0.20y",
        options: [
          "3:4",
          "4:3",
          "2:3",
          "3:2"
        ],
        answer: "4:3",
        solution: "0.15x = 0.20y => x/y = 0.20 / 0.15 = 20/15 = 4/3. Thus, the ratio is 4:3."
      },
      {
        category: "Speed and Distance",
        q: "A man covers a distance of 12 km at a speed of 4 km/h and another 15 km at a speed of 5 km/h. What is his average speed for the entire journey?",
        latex: "\\frac{12+15}{\\frac{12}{4}+\\frac{15}{5}}",
        options: [
          "4.2 km/h",
          "4.5 km/h",
          "4.8 km/h",
          "5 km/h"
        ],
        answer: "4.5 km/h",
        solution: "Time 1 = 12/4 = 3 hours. Time 2 = 15/5 = 3 hours. Total distance = 12 + 15 = 27 km. Total time = 3 + 3 = 6 hours. Average speed = 27 / 6 = 4.5 km/h."
      }
    ]
  },
  medium: {
    label: "Medium",
    multiplier: 1.6,
    questions: [
      {
        category: "Permutations",
        q: "In how many distinct ways can the letters of the word 'DESIGN' be arranged so that the vowels always come together?",
        latex: "5!\\times2!",
        options: [
          "120",
          "240",
          "360",
          "720"
        ],
        answer: "240",
        solution: "Vowels are E and I (2 letters, treated as 1 block). Remaining consonants are D, S, G, N (4 letters). Total entities to arrange = 4 + 1 = 5. Arrangements = 5! = 120. Internal vowel arrangements = 2! = 2. Total = 120 * 2 = 240."
      },
      {
        category: "Probability",
        q: "A bag contains 5 white, 4 red, and 3 blue balls. If two balls are drawn at random simultaneously, what is the probability that both are red?",
        latex: "\\frac{\\binom{4}{2}}{\\binom{12}{2}}",
        options: [
          "1/11",
          "2/11",
          "1/22",
          "3/22"
        ],
        answer: "1/11",
        solution: "Total balls = 12. Ways to draw 2 balls = 12C2 = (12 * 11) / (2 * 1) = 66. Ways to draw 2 red balls = 4C2 = (4 * 3) / (2 * 1) = 6. Probability = 6 / 66 = 1/11."
      },
      {
        category: "Aptitude",
        q: "The dynamic population of a bacterial culture triples every 4 hours. If the initial count is 100, what will it be after 16 hours?",
        latex: "100\\times3^{4}",
        options: [
          "1200",
          "2700",
          "6400",
          "8100"
        ],
        answer: "8100",
        solution: "Number of cycles = 16 / 4 = 4 cycles. Population = 100 * (3^4) = 100 * 81 = 8100."
      },
      {
        category: "Interest",
        q: "Find the compound interest on 10,000 rupees for 2 years at 10% per annum, compounded annually.",
        latex: "10000(1+\\frac{10}{100})^{2}-10000",
        options: [
          "2000 rupees",
          "2100 rupees",
          "2200 rupees",
          "2500 rupees"
        ],
        answer: "2100 rupees",
        solution: "Amount = 10000 * (1 + 10/100)^2 = 10000 * 1.21 = 12100 rupees. Interest = 12100 - 10000 = 2100 rupees."
      },
      {
        category: "Advanced Math",
        q: "If log(x) + log(x-3) = log(4), find the valid real value of x.",
        latex: "\\log x+\\log(x-3)=\\log4",
        options: [
          "4",
          "1",
          "-1",
          "4 or -1"
        ],
        answer: "4",
        solution: "log(x * (x-3)) = log(4) => x^2 - 3x = 4 => x^2 - 3x - 4 = 0 => (x-4)(x+1) = 0. Since log cannot take negative inputs, x must be 4."
      },
      {
        category: "Probability",
        q: "A card is drawn at random from a standard pack of 52 cards. What is the probability that it is either a King or a Heart?",
        latex: "\\frac{4+13-1}{52}",
        options: [
          "4/13",
          "16/52",
          "17/52",
          "2/13"
        ],
        answer: "4/13",
        solution: "Number of Kings = 4. Number of Hearts = 13. Overlap (King of Hearts) = 1. Total favorable cards = 4 + 13 - 1 = 16. Probability = 16/52 = 4/13."
      },
      {
        category: "Geometry",
        q: "Find the area of a triangle with vertices at coordinates (0,0), (4,0), and (0,6).",
        latex: "\\frac{1}{2}\\times4\\times6",
        options: [
          "12",
          "24",
          "10",
          "8"
        ],
        answer: "12",
        solution: "This is a right-angled triangle with base 4 units along the x-axis and height 6 units along the y-axis. Area = 0.5 * base * height = 0.5 * 4 * 6 = 12."
      },
      {
        category: "Interest",
        q: "An investor divides 5000 dollars into two accounts, one paying 5% simple interest and the other 8%. If the total annual interest earned is 310 dollars, how much was invested at 5%?",
        latex: "0.05x+0.08(5000-x)=310",
        options: [
          "2000 dollars",
          "3000 dollars",
          "2500 dollars",
          "1500 dollars"
        ],
        answer: "3000 dollars",
        solution: "Let x be invested at 5%. Then (5000-x) is invested at 8%. 0.05x + 0.08(5000-x) = 310 => 0.05x + 400 - 0.08x = 310 => -0.03x = -90 => x = 3000 dollars."
      },
      {
        category: "Series",
        q: "The 4th term of an arithmetic progression is 14 and the 9th term is 29. Find the first term.",
        latex: "a+3d=14,\\quad a+8d=29",
        options: [
          "2",
          "5",
          "8",
          "3"
        ],
        answer: "5",
        solution: "a + 3d = 14 and a + 8d = 29. Subtracting the equations gives 5d = 15 => d = 3. Substituting back: a + 3(3) = 14 => a = 5."
      },
      {
        category: "Speed and Distance",
        q: "A motorboat whose speed is 15 km/h in still water goes 30 km downstream and comes back in a total of 4 hours 30 minutes. Find the speed of the stream.",
        latex: "\\frac{30}{15+v}+\\frac{30}{15-v}=4.5",
        options: [
          "4 km/h",
          "5 km/h",
          "6 km/h",
          "10 km/h"
        ],
        answer: "5 km/h",
        solution: "Let stream speed be v. 30/(15+v) + 30/(15-v) = 4.5. Testing options: If v=5, 30/20 + 30/10 = 1.5 + 3 = 4.5 hours. Matches perfectly."
      }
    ]
  },
  insane: {
    label: "Insane",
    multiplier: 2.4,
    questions: [
      {
        category: "Aptitude",
        q: "Find the number of positive integer solutions to the equation x + y + z = 10.",
        latex: "x+y+z=10,\\quad x,y,z>0",
        options: [
          "36",
          "45",
          "120",
          "28"
        ],
        answer: "36",
        solution: "Using the stars and bars formula for positive integers: (n-1)C(r-1) where n=10 and r=3. This gives (10-1)C(3-1) = 9C2 = (9 * 8) / 2 = 36."
      },
      {
        category: "Advanced Math",
        q: "Evaluate the derivative of f(x) = x^x at the point x = 1.",
        latex: "\\frac{d}{dx}x^{x}\\bigg|_{x=1}",
        options: [
          "0",
          "1",
          "e",
          "2"
        ],
        answer: "1",
        solution: "Let y = x^x => ln(y) = x*ln(x). Differentiating implicitly: (1/y)(dy/dx) = ln(x) + x(1/x) = ln(x) + 1. Thus dy/dx = x^x * (ln(x) + 1). At x = 1, 1^1 * (ln(1) + 1) = 1 * (0 + 1) = 1."
      },
      {
        category: "Geometry",
        q: "What is the angle between the hands of a clock at 3:40?",
        latex: "|30H-5.5M|",
        options: [
          "120 degrees",
          "130 degrees",
          "140 degrees",
          "150 degrees"
        ],
        answer: "130 degrees",
        solution: "Formula: |30H - 5.5M| where H=3 and M=40. |30(3) - 5.5(40)| = |90 - 220| = |-130| = 130 degrees."
      },
      {
        category: "Geometry",
        q: "A cube of side 4 cm is painted red on all its faces and then cut into smaller cubes of side 1 cm. How many small cubes have exactly two faces painted?",
        latex: "12(n-2),\\quad n=4",
        options: [
          "8",
          "16",
          "24",
          "32"
        ],
        answer: "24",
        solution: "Cubes with 2 faces painted are always located along the edges, excluding the corners. Formula: 12 * (n - 2) where n is the side division factor. Here n = 4. 12 * (4 - 2) = 12 * 2 = 24."
      },
      {
        category: "Number Theory",
        q: "Find the units digit of the big exponential number: 7^245.",
        latex: "7^{245}",
        options: [
          "1",
          "3",
          "7",
          "9"
        ],
        answer: "7",
        solution: "The units digit of powers of 7 follows a cyclical pattern of 4 steps: 7, 9, 3, 1. Divide the exponent 245 by 4. The remainder is 1. The 1st number in the cycle is 7."
      },
      {
        category: "Number Theory",
        q: "Find the sum of all two-digit numbers which leave a remainder of 2 when divided by 5.",
        latex: "12+17+22+\\cdots+97",
        options: [
          "945",
          "963",
          "981",
          "1000"
        ],
        answer: "963",
        solution: "The sequence is 12, 17, 22, ..., 97. This is an AP with first term a=12, common difference d=5, and last term l=97. Number of terms n = ((97-12)/5) + 1 = 18. Sum = (n/2)*(a+l) = 9 * (12 + 97) = 9 * 109 = 963."
      },
      {
        category: "Probability",
        q: "A committee of 4 is to be chosen from 5 men and 4 women. What is the probability that the committee contains an equal number of men and women?",
        latex: "\\frac{\\binom{5}{2}\\binom{4}{2}}{\\binom{9}{4}}",
        options: [
          "10/21",
          "20/21",
          "5/14",
          "3/7"
        ],
        answer: "10/21",
        solution: "Total ways to choose 4 members from 9 = 9C4 = 126. Favorable ways (2 men from 5 AND 2 women from 4) = 5C2 * 4C2 = 10 * 6 = 60. Probability = 60 / 126 = 10 / 21."
      },
      {
        category: "Aptitude",
        q: "Find the value of k if the lines 2x - 3y = 5 and kx + 4y = 7 are perpendicular to each other.",
        latex: "\\frac{2}{3}\\times\\frac{-k}{4}=-1",
        options: [
          "6",
          "-6",
          "3",
          "6"
        ],
        answer: "6",
        solution: "Slope of first line m1 = 2/3. Slope of second line m2 = -k/4. For perpendicular lines, m1 * m2 = -1 => (2/3) * (-k/4) = -1 => -2k / 12 = -1 => -2k = -12 => k = 6."
      },
      {
        category: "Series",
        q: "If a matrix A has a size of 3x3 and its determinant value is 5, find the value of the determinant of (2A).",
        latex: "\\det(2A)=2^{3}\\det(A)",
        options: [
          "10",
          "20",
          "40",
          "80"
        ],
        answer: "40",
        solution: "For an n x n matrix, det(cA) = (c^n) * det(A). Here, n=3 and c=2. det(2A) = (2^3) * 5 = 8 * 5 = 40."
      },
      {
        category: "Aptitude",
        q: "Evaluate the infinite nested radical value: x = sqrt(6 + sqrt(6 + sqrt(6 + ...)))",
        latex: "x=\\sqrt{6+\\sqrt{6+\\cdots}}",
        options: [
          "2",
          "3",
          "6",
          "Infinite"
        ],
        answer: "6",
        solution: "Square both sides to get: x^2 = 6 + x => x^2 - x - 6 = 0 => (x-3)(x+2) = 0. Since a principal root cannot yield a negative value, x must be 3."
      }
    ]
  },
  impossible: {
    label: "Impossible",
    multiplier: 3.5,
    questions: [
      {
        category: "Number Theory",
        q: "Find the remainder when 2^100 is divided by 101.",
        latex: "2^{100}\\bmod101",
        options: [
          "1",
          "2",
          "50",
          "100"
        ],
        answer: "1",
        solution: "By Fermat's Little Theorem, if p is a prime number and a is not divisible by p, then a^(p-1) leaves a remainder of 1 when divided by p. Here, 101 is prime, so 2^100 mod 101 = 1."
      },
      {
        category: "Aptitude",
        q: "What is the exact value of the infinite sum: 1/2 + 2/4 + 3/8 + 4/16 + ... + n/(2^n)?",
        latex: "\\sum_{n=1}^{\\infty}\\frac{n}{2^{n}}",
        options: [
          "1.5",
          "2",
          "2.5",
          "3"
        ],
        answer: "2",
        solution: "This is an arithmetic-geometric series (AGS). Let S = 1/2 + 2/4 + 3/8 + 4/16 + ... Multiply by 1/2: (1/2)S = 1/4 + 2/8 + 3/16 + ... Subtracting the second equation from the first: (1/2)S = 1/2 + 1/4 + 1/8 + 1/16 + ... The right side is an infinite geometric progression with sum = (1/2) / (1 - 1/2) = 1. So (1/2)S = 1 => S = 2."
      },
      {
        category: "Series",
        q: "Determine the number of trailing zeros in the decimal evaluation of 1000 factorial (1000!).",
        latex: "\\lfloor\\frac{1000}{5}\\rfloor+\\lfloor\\frac{1000}{25}\\rfloor+\\cdots",
        options: [
          "200",
          "240",
          "248",
          "249"
        ],
        answer: "249",
        solution: "Use Legendre's formula to count the factors of 5: floor(1000/5) + floor(1000/25) + floor(1000/125) + floor(1000/625) = 200 + 40 + 8 + 1 = 249 zeros."
      },
      {
        category: "Combinatorics",
        q: "Find the number of ways to distribute 5 distinct rings across 4 distinct fingers such that any finger can hold any number of rings and their vertical stack ordering matters.",
        latex: "5!\\times\\binom{8}{3}",
        options: [
          "1024",
          "6720",
          "20160",
          "3360"
        ],
        answer: "6720",
        solution: "This can be modeled by placing dividers. Arrange the 5 distinct rings in a sequence (5! ways). Now place 3 identical dividers among/around them to split them into 4 fingers. This is equivalent to inserting items into slots, yielding a total variation path product equal to 5! * (5+4-1)C(4-1) = 120 * 8C3 = 120 * 56 = 6720."
      },
      {
        category: "Series",
        q: "Determine the total number of subsets of the set containing items {1, 2, 3, ..., 10} that do not contain any two consecutive integers.",
        latex: "F_{10+2}",
        options: [
          "89",
          "144",
          "233",
          "55"
        ],
        answer: "144",
        solution: "The number of valid independent subsets for a set of size n follows the Fibonacci sequence relationship F(n+2). For n=10, the answer is the 12th Fibonacci number, which is 144."
      },
      {
        category: "Number Theory",
        q: "Find the total number of positive integers n less than 100 such that the totient calculation value phi(n) is exactly equal to n/2.",
        latex: "\\phi(n)=\\frac{n}{2},\\quad n<100",
        options: [
          "3",
          "6",
          "8",
          "0"
        ],
        answer: "3",
        solution: "For phi(n) to equal n/2, the number n must have only 2 as its unique prime factor. Therefore, n must be a power of 2. Powers of 2 less than 100 are 2, 4, 8, 16, 32, and 64. However, the question specifies that phi(n) must equal n/2, which holds true for all numbers where 2 is the ONLY prime factor. Checking the values: there are exactly 6 valid powers of 2."
      },
      {
        category: "Advanced Math",
        q: "Evaluate the definite integral of ln(x) / (1 + x^2) from 0 to infinity.",
        latex: "\\int_{0}^{\\infty}\\frac{\\ln x}{1+x^{2}}dx",
        options: [
          "0",
          "pi/2",
          "1",
          "Negative Infinity"
        ],
        answer: "0",
        solution: "Using the substitution x = 1/t, the bounds swap and the ln(x) changes sign to -ln(t), causing the exact integral value to equal its own negative inverse, which forces the integration area value to zero."
      },
      {
        category: "Advanced Math",
        q: "Find the total number of real roots for the system equation: x^2 = cos(x).",
        latex: "x^{2}=\\cos(x)",
        options: [
          "0",
          "1",
          "2",
          "Infinite"
        ],
        answer: "2",
        solution: "The graph of y = x^2 is a parabola opening upwards with its vertex at (0,0). The graph of y = cos(x) starts at (0,1) and drops off. They intersect exactly twice: once in the positive domain and once in the negative domain."
      },
      {
        category: "Combinatorics",
        q: "How many elements of the symmetric group S_4 have an order exactly equal to 3?",
        latex: "S_{4},\\quad \\text{order}=3",
        options: [
          "3",
          "6",
          "8",
          "12"
        ],
        answer: "8",
        solution: "Elements of order 3 in S_4 are exclusively the 3-cycles. The number of 3-cycles in a symmetric group of size 4 is given by the combination formula 4C3 * (3-1)! = 4 * 2 = 8."
      },
      {
        category: "Profit and Loss",
        q: "In a tournament with 10 players, every pair plays exactly one match against each other. If there are no draws, what is the minimum number of players who must have won at least 4 matches?",
        latex: "\\binom{10}{2}=45",
        options: [
          "1",
          "2",
          "5",
          "7"
        ],
        answer: "5",
        solution: "Total matches played = 10C2 = 45 matches, which means the sum of all wins is 45. If at most 4 players won 4 or more matches, the remaining 6 players won at most 3 matches. Max total wins would be (4 * 9) + (6 * 3) = 36 + 18 = 54, which easily allows room. To minimize the count of players with >= 4 wins while preserving the win sum: if 5 players win 5 matches and 5 players win 4 matches, the total is 45 wins, showing that it is mathematically mandatory for at least 5 players to reach a minimum threshold of 4 wins."
      }
    ]
  }
};

export const aptitudeCounts = [5, 10, 15, 20];
