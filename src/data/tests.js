import { disconnect } from "mongoose";

// tests.js
const tests = [
  {
    id: 'gate-mock-for-ece-electrical',
    title: 'Electronics and Communication Engineering',
    description: 'Discover our test series package tailored mainly for ECE, Electronics, Electrical and designed to boost your GATE preparation.',
    includes: '*Includes 3 mock tests',
    imageUrl: 'https://ik.imagekit.io/dhanak2k25/ece-branch.png',
    altText: 'btech ece branch',
    pricePerPack: 200,
    discountRate: 0.50,
    testSchedule: {
      pack1: {
        test1: '7-10 PM 11th Jan 2025',
        test2: '7-10 PM 12th Jan 2025',
        test3: '7-10 PM 13th Jan 2025'
      },
      pack2: {
        test1: '4-7 PM 15th Jan 2025',
        test2: '4-7 PM 16th Jan 2025',
        test3: '4-7 PM 17th Jan 2025'
      }
    }
  },
  {
    id: 'gate-mock-for-aerospace',
    title: 'Aerospace Engineering',
    description: 'Discover our test series package tailored mainly for Aerospace Engineering, designed to boost your GATE preparation.',
    includes: '*Includes 3 mock tests',
    imageUrl: 'https://ik.imagekit.io/dhanak2k25/aerospace-branch.png',
    altText: 'btech aerospace branch',
    pricePerPack: 199,
    discountRate: 0.50,
    testSchedule: {
      pack1: {
        test1: '7-10 PM 11th Jan 2025',
        test2: '7-10 PM 12th Jan 2025',
        test3: '7-10 PM 13th Jan 2025'
      },
      pack2: {
        test1: '4-7 PM 15th Jan 2025',
        test2: '4-7 PM 16th Jan 2025',
        test3: '4-7 PM 17th Jan 2025'
      }
    }
  },
  {
    id: 'gate-mock-for-mechanical',
    title: 'Mechanical Engineering',
    description: 'Discover our test series package tailored mainly for Mechanical Engineering, designed to boost your GATE preparation.',
    includes: '*Includes 3 mock tests',
    imageUrl: 'https://ik.imagekit.io/dhanak2k25/mechanical-branch.png',
    altText: 'btech mechanical branch',
    pricePerPack: 199,
    discountRate: 0.40,
    testSchedule: {
      pack1: {
        test1: '7-10 PM 11th Jan 2025',
        test2: '7-10 PM 12th Jan 2025',
        test3: '7-10 PM 13th Jan 2025'
      },
      pack2: {
        test1: '4-7 PM 15th Jan 2025',
        test2: '4-7 PM 16th Jan 2025',
        test3: '4-7 PM 17th Jan 2025'
      }
    }
  },
  {
    id: 'gate-mock-for-physics',
    title: 'Physics',
    description: 'Discover our test series package tailored mainly for Physics Domain, designed to boost your GATE preparation.',
    includes: '*Includes 3 mock tests',
    imageUrl: 'https://ik.imagekit.io/dhanak2k25/physics-branch.png',
    altText: 'btech physics branch',
    pricePerPack: 199,
    discountRate: 0.40,
    testSchedule: {
      pack1: {
        test1: '7-10 PM 11th Jan 2025',
        test2: '7-10 PM 12th Jan 2025',
        test3: '7-10 PM 13th Jan 2025'
      },
      pack2: {
        test1: '4-7 PM 15th Jan 2025',
        test2: '4-7 PM 16th Jan 2025',
        test3: '4-7 PM 17th Jan 2025'
      }
    }
  },
];

export default tests;
