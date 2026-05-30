export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatus = 'Not Started' | 'Attempted' | 'Solved';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
  explanationAr?: string;
}

export interface Problem {
  id: string;
  title: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  examples: Example[];
  constraints: string;
  constraintsAr: string;
  acceptanceRate: number;
  status: ProblemStatus;
  orderIndex: number;
}

export const difficultyOrder: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export const difficultyConfig: Record<Difficulty, { color: string; dot: string }> = {
  Easy: {
    color: 'bg-algora-green/15 text-algora-green border-algora-green/30',
    dot: 'bg-algora-green',
  },
  Medium: {
    color: 'bg-algora-gold/15 text-algora-gold border-algora-gold/30',
    dot: 'bg-algora-gold',
  },
  Hard: {
    color: 'bg-algora-red/15 text-algora-red border-algora-red/30',
    dot: 'bg-algora-red',
  },
};

export const categoryList = [
  'Arrays',
  'Strings',
  'Hash Table',
  'Linked List',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Binary Search',
  'Sorting',
  'Stack',
  'Queue',
  'Math',
  'Recursion',
  'Greedy',
  'Two Pointers',
  'Sliding Window',
];

export const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    titleAr: 'مجموع اثنين',
    slug: 'two-sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    descriptionAr: 'باستخدام مصفوفة من الأعداد الصحيحة `nums` وعدد صحيح `target`، أعد فهري العددين بحيث يكون مجموعهما يساوي `target`.\n\nيمكنك افتراض أن كل مدخل سيكون له حل واحد بالضبط، ولا يمكنك استخدام نفس العنصر مرتين.\n\nيمكنك إرجاع الإجابة بأي ترتيب.',
    difficulty: 'Easy',
    category: 'Hash Table',
    tags: ['Arrays', 'Hash Table'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].', explanationAr: 'بما أن nums[0] + nums[1] == 9، نُرجع [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '', explanationAr: '' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: '', explanationAr: '' },
    ],
    constraints: '2 <= nums.length <= 10⁴\n-10⁹ <= nums[i] <= 10⁹\n-10⁹ <= target <= 10⁹\nOnly one valid answer exists.',
    constraintsAr: '2 <= nums.length <= 10⁴\n-10⁹ <= nums[i] <= 10⁹\n-10⁹ <= target <= 10⁹\nيوجد إجابة صالحة واحدة فقط.',
    acceptanceRate: 78.5,
    status: 'Solved',
    orderIndex: 1,
  },
  {
    id: '2',
    title: 'Valid Palindrome',
    titleAr: 'السلسلة المتطابقة الصالحة',
    slug: 'valid-palindrome',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
    descriptionAr: 'تُعتبر العبارة متطابقة إذا كان بعد تحويل جميع الحروف الكبيرة إلى صغيرة وإزالة جميع الأحرف غير الأبجدية الرقمية، فإنها تُقرأ بنفس الطريقة من الأمام والخلف.\n\nباستخدام سلسلة `s`، أعد `true` إذا كانت متطابقة، أو `false` بخلاف ذلك.',
    difficulty: 'Easy',
    category: 'Two Pointers',
    tags: ['Strings', 'Two Pointers'],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.', explanationAr: '"amanaplanacanalpanama" متطابقة.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.', explanationAr: '"raceacar" ليست متطابقة.' },
      { input: 's = " "', output: 'true', explanation: 'An empty string reads the same forward and backward.', explanationAr: 'سلسلة فارغة تُقرأ بنفس الطريقة.' },
    ],
    constraints: '1 <= s.length <= 2 * 10⁵\ns consists only of printable ASCII characters.',
    constraintsAr: '1 <= s.length <= 2 * 10⁵\ns تتكون فقط من أحرف ASCII المطبوعة.',
    acceptanceRate: 62.3,
    status: 'Solved',
    orderIndex: 2,
  },
  {
    id: '3',
    title: 'Binary Search',
    titleAr: 'البحث الثنائي',
    slug: 'binary-search',
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
    descriptionAr: 'باستخدام مصفوفة من الأعداد الصحيحة `nums` مرتبة تصاعدياً وعدد صحيح `target`، اكتب دالة للبحث عن `target` في `nums`. إذا وُجد `target`، أعد فهرسه. وإلا، أعد `-1`.\n\nيجب أن تكتب خوارزمية بتعقيد زمني `O(log n)`.',
    difficulty: 'Easy',
    category: 'Binary Search',
    tags: ['Arrays', 'Binary Search'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4', explanationAr: '9 موجود في nums وفهرسه 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1', explanationAr: '2 غير موجود في nums لذا نُرجع -1' },
    ],
    constraints: '1 <= nums.length <= 10⁴\n-10⁴ < nums[i], target < 10⁴\nAll the integers in nums are unique.\nnums is sorted in ascending order.',
    constraintsAr: '1 <= nums.length <= 10⁴\n-10⁴ < nums[i], target < 10⁴\nجميع الأعداد في nums فريدة.\nnums مرتبة تصاعدياً.',
    acceptanceRate: 85.2,
    status: 'Not Started',
    orderIndex: 3,
  },
  {
    id: '4',
    title: 'Maximum Subarray',
    titleAr: 'أكبر مصفوفة فرعية',
    slug: 'maximum-subarray',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    descriptionAr: 'باستخدام مصفوفة أعداد صحيحة `nums`، ابحث عن المصفوفة الفرعية ذات أكبر مجموع وأعد مجموعها.',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Arrays', 'Dynamic Programming', 'Divide and Conquer'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.', explanationAr: 'المصفوفة الفرعية [4,-1,2,1] لديها أكبر مجموع 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'The subarray [1] has the largest sum 1.', explanationAr: 'المصفوفة الفرعية [1] لديها أكبر مجموع 1.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.', explanationAr: 'المصفوفة الفرعية [5,4,-1,7,8] لديها أكبر مجموع 23.' },
    ],
    constraints: '1 <= nums.length <= 10⁵\n-10⁴ <= nums[i] <= 10⁴',
    constraintsAr: '1 <= nums.length <= 10⁵\n-10⁴ <= nums[i] <= 10⁴',
    acceptanceRate: 54.8,
    status: 'Attempted',
    orderIndex: 4,
  },
  {
    id: '5',
    title: 'Longest Palindromic Substring',
    titleAr: 'أطول سلسلة فرعية متطابقة',
    slug: 'longest-palindromic-substring',
    description: 'Given a string `s`, return the longest palindromic substring in `s`.',
    descriptionAr: 'باستخدام سلسلة `s`، أعد أطول سلسلة فرعية متطابقة في `s`.',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Strings', 'Dynamic Programming'],
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.', explanationAr: '"aba" إجابة صالحة أيضاً.' },
      { input: 's = "cbbd"', output: '"bb"', explanation: '', explanationAr: '' },
    ],
    constraints: '1 <= s.length <= 1000\ns consist of only digits and English letters.',
    constraintsAr: '1 <= s.length <= 1000\ns تتكون فقط من أرقام وحروف إنجليزية.',
    acceptanceRate: 52.3,
    status: 'Not Started',
    orderIndex: 5,
  },
  {
    id: '6',
    title: 'Product of Array Except Self',
    titleAr: 'حاصل ضرب المصفوفة باستثناء الذات',
    slug: 'product-of-array-except-self',
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in `O(n)` time and without using the division operation.',
    descriptionAr: 'باستخدام مصفوفة أعداد صحيحة `nums`، أعد مصفوفة `answer` بحيث `answer[i]` يساوي حاصل ضرب جميع عناصر `nums` باستثناء `nums[i]`.\n\nيجب أن تكتب خوارزمية تعمل بزمن `O(n)` وبدون استخدام عملية القسمة.',
    difficulty: 'Medium',
    category: 'Arrays',
    tags: ['Arrays', 'Prefix Sum'],
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'The product of all elements except nums[0] is 2*3*4 = 24.', explanationAr: 'حاصل ضرب جميع العناصر باستثناء nums[0] هو 2*3*4 = 24.' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: '', explanationAr: '' },
    ],
    constraints: '2 <= nums.length <= 10⁵\n-30 <= nums[i] <= 30\nThe product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
    constraintsAr: '2 <= nums.length <= 10⁵\n-30 <= nums[i] <= 30\nيُضمن أن حاصل ضرب أي بادئة أو لاحقة من nums يتسع في عدد صحيح 32 بت.',
    acceptanceRate: 61.4,
    status: 'Attempted',
    orderIndex: 6,
  },
  {
    id: '7',
    title: '3Sum',
    titleAr: 'مجموع ثلاثة',
    slug: '3sum',
    description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
    descriptionAr: 'باستخدام مصفوفة أعداد صحيحة `nums`، أعد جميع الثلاثيات `[nums[i], nums[j], nums[k]]` بحيث `i != j`، `i != k`، و `j != k`، و `nums[i] + nums[j] + nums[k] == 0`.\n\nلاحظ أن مجموعة الحلول يجب ألا تحتوي على ثلاثيات مكررة.',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Arrays', 'Sorting', 'Two Pointers'],
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]', explanation: '', explanationAr: '' },
      { input: 'nums = [0,1,1]', output: '[]', explanation: '', explanationAr: '' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]', explanation: '', explanationAr: '' },
    ],
    constraints: '3 <= nums.length <= 3000\n-10⁵ <= nums[i] <= 10⁵',
    constraintsAr: '3 <= nums.length <= 3000\n-10⁵ <= nums[i] <= 10⁵',
    acceptanceRate: 36.2,
    status: 'Not Started',
    orderIndex: 7,
  },
  {
    id: '8',
    title: 'Container With Most Water',
    titleAr: 'الحاوية ذات أكبر كمية ماء',
    slug: 'container-with-most-water',
    description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the ith line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
    descriptionAr: 'باستخدام مصفوفة أعداد صحيحة `height` بطول `n`. هناك `n` خطوط عمودية مرسومة بحيث نقطتا نهاية الخط i هما `(i, 0)` و `(i, height[i])`.\n\nابحث عن خطين يشكلان مع المحور x حاوية، بحيث تحتوي الحاوية على أكبر كمية من الماء.\n\nأعد الحد الأقصى من الماء الذي يمكن للحاوية تخزينه.',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Arrays', 'Greedy', 'Two Pointers'],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between indices 1 and 8.', explanationAr: 'أكبر مساحة بين الفهرسين 1 و 8.' },
      { input: 'height = [1,1]', output: '1', explanation: '', explanationAr: '' },
    ],
    constraints: 'n == height.length\n2 <= n <= 10⁵\n0 <= height[i] <= 10⁴',
    constraintsAr: 'n == height.length\n2 <= n <= 10⁵\n0 <= height[i] <= 10⁴',
    acceptanceRate: 59.1,
    status: 'Solved',
    orderIndex: 8,
  },
  {
    id: '9',
    title: 'Merge K Sorted Lists',
    titleAr: 'دمج قوائم مرتبة',
    slug: 'merge-k-sorted-lists',
    description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
    descriptionAr: 'باستخدام مصفوفة من `k` قوائم مرتبطة `lists`، كل قائمة مرتبطة مرتبة تصاعدياً.\n\nادمج جميع القوائم المرتبطة في قائمة مرتبطة واحدة مرتبة وأعدها.',
    difficulty: 'Hard',
    category: 'Linked List',
    tags: ['Linked List', 'Heap', 'Divide and Conquer'],
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'The linked-lists are: [1->4->5, 1->3->4, 2->6].', explanationAr: 'القوائم المرتبطة هي: [1->4->5, 1->3->4, 2->6].' },
      { input: 'lists = []', output: '[]', explanation: '', explanationAr: '' },
      { input: 'lists = [[]]', output: '[]', explanation: '', explanationAr: '' },
    ],
    constraints: 'k == lists.length\n0 <= k <= 10⁴\n0 <= lists[i].length <= 500\n-10⁴ <= lists[i][j] <= 10⁴',
    constraintsAr: 'k == lists.length\n0 <= k <= 10⁴\n0 <= lists[i].length <= 500\n-10⁴ <= lists[i][j] <= 10⁴',
    acceptanceRate: 34.7,
    status: 'Not Started',
    orderIndex: 9,
  },
  {
    id: '10',
    title: 'Median of Two Sorted Arrays',
    titleAr: 'وسيط مصفوفتين مرتبتين',
    slug: 'median-of-two-sorted-arrays',
    description: 'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
    descriptionAr: 'باستخدام مصفوفتين مرتبتين `nums1` و `nums2` بحجم `m` و `n` على التوالي، أعد وسيط المصفوفتين المرتبتين.\n\nيجب أن يكون التعقيد الزمني الكلي `O(log (m+n))`.',
    difficulty: 'Hard',
    category: 'Binary Search',
    tags: ['Arrays', 'Binary Search', 'Divide and Conquer'],
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1,2,3] and median is 2.', explanationAr: 'المصفوفة المدمجة = [1,2,3] والوسيط هو 2.' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000', explanation: 'merged array = [1,2,3,4] and median is (2+3)/2 = 2.5.', explanationAr: 'المصفوفة المدمجة = [1,2,3,4] والوسيط هو (2+3)/2 = 2.5.' },
    ],
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10⁶ <= nums1[i], nums2[i] <= 10⁶',
    constraintsAr: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10⁶ <= nums1[i], nums2[i] <= 10⁶',
    acceptanceRate: 28.4,
    status: 'Not Started',
    orderIndex: 10,
  },
  {
    id: '11',
    title: 'Climbing Stairs',
    titleAr: 'تسلق السلالم',
    slug: 'climbing-stairs',
    description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?',
    descriptionAr: 'أنت تتسلق درجاً. يستغرق الأمر `n` خطوة للوصول إلى القمة.\n\nفي كل مرة يمكنك تسلق `1` أو `2` خطوة. كم عدد الطرق المميزة لتسلق القمة؟',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways: 1+1 and 2.', explanationAr: 'هناك طريقتان: 1+1 و 2.' },
      { input: 'n = 3', output: '3', explanation: 'There are three ways: 1+1+1, 1+2, and 2+1.', explanationAr: 'هناك ثلاث طرق: 1+1+1، 1+2، و 2+1.' },
    ],
    constraints: '1 <= n <= 45',
    constraintsAr: '1 <= n <= 45',
    acceptanceRate: 91.5,
    status: 'Solved',
    orderIndex: 11,
  },
  {
    id: '12',
    title: 'LRU Cache',
    titleAr: 'ذاكرة مؤقتة LRU',
    slug: 'lru-cache',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity, evict the least recently used key.\n\nThe functions `get` and `put` must each run in `O(1)` average time complexity.',
    descriptionAr: 'صمم هيكل بيانات يتبع قيود ذاكرة LRU (الأقل استخداماً مؤخراً).\n\nنفذ فئة `LRUCache`:\n- `LRUCache(int capacity)` تهيئة ذاكرة LRU بسعة موجبة.\n- `int get(int key)` أعد قيمة المفتاح إذا وُجد، وإلا أعد -1.\n- `void put(int key, int value)` حدّث قيمة المفتاح إذا وُجد. وإلا أضف الزوج المفتاح-القيمة. إذا تجاوز عدد المفاتيح السعة، احذف المفتاح الأقل استخداماً مؤخراً.\n\nيجب أن تعمل الدالتان `get` و `put` بتعقيد زمني `O(1)` في المتوسط.',
    difficulty: 'Hard',
    category: 'Hash Table',
    tags: ['Hash Table', 'Linked List', 'Design'],
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,null,-1,3,4]', explanation: '', explanationAr: '' },
    ],
    constraints: '1 <= capacity <= 300\n0 <= key <= 10⁴\n0 <= value <= 10⁵\nAt most 2 * 10⁵ calls will be made to get and put.',
    constraintsAr: '1 <= capacity <= 300\n0 <= key <= 10⁴\n0 <= value <= 10⁵\nسيتم إجراء 2 * 10⁵ استدعاء كحد أقصى لـ get و put.',
    acceptanceRate: 31.2,
    status: 'Attempted',
    orderIndex: 12,
  },
  {
    id: '13',
    title: 'Reverse Linked List',
    titleAr: 'عكس القائمة المرتبطة',
    slug: 'reverse-linked-list',
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    descriptionAr: 'باستخدام `head` لقائمة مرتبطة أحادية، اعكس القائمة وأعدها.',
    difficulty: 'Easy',
    category: 'Linked List',
    tags: ['Linked List', 'Recursion'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: '', explanationAr: '' },
      { input: 'head = [1,2]', output: '[2,1]', explanation: '', explanationAr: '' },
      { input: 'head = []', output: '[]', explanation: '', explanationAr: '' },
    ],
    constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
    constraintsAr: 'عدد العقد في القائمة في النطاق [0, 5000].\n-5000 <= Node.val <= 5000',
    acceptanceRate: 88.3,
    status: 'Not Started',
    orderIndex: 13,
  },
  {
    id: '14',
    title: 'Word Search',
    titleAr: 'البحث عن الكلمة',
    slug: 'word-search',
    description: 'Given an `m x n` grid of characters `board` and a string `word`, return `true` if word exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.',
    descriptionAr: 'باستخدام شبكة `m x n` من الأحرف `board` وسلسلة `word`، أعد `true` إذا وُجدت الكلمة في الشبكة.\n\nيمكن بناء الكلمة من حروف الخلايا المتجاورة تسلسلياً، حيث الخلايا المتجاورة متجاورة أفقياً أو عمودياً. لا يمكن استخدام نفس خلية الحرف أكثر من مرة.',
    difficulty: 'Medium',
    category: 'Recursion',
    tags: ['Arrays', 'Recursion', 'Backtracking'],
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true', explanation: '', explanationAr: '' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: 'true', explanation: '', explanationAr: '' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: 'false', explanation: '', explanationAr: '' },
    ],
    constraints: 'm == board.length\nn = board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15\nboard and word consists of only lowercase and uppercase English letters.',
    constraintsAr: 'm == board.length\nn = board[i].length\n1 <= m, n <= 6\n1 <= word.length <= 15\nboard و word تتكونان فقط من حروف إنجليزية صغيرة وكبيرة.',
    acceptanceRate: 45.6,
    status: 'Not Started',
    orderIndex: 14,
  },
];

export function getProblemById(id: string): Problem | undefined {
  return mockProblems.find(p => p.id === id);
}

export function getProblemBySlug(slug: string): Problem | undefined {
  return mockProblems.find(p => p.slug === slug);
}
