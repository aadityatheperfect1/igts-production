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
    pricePerPack: 240,
    discountRate: 0.50,
    comboDiscountRate: 0.583333,
    testSchedule: {
      pack1: {
        test1: '29th Dec 2024',
        test2: '2nd Jan 2025',
        test3: '6th Jan 2025'
      },
      pack2: {
        test1: '10th Jan 2025',
        test2: '18th Jan 2025',
        test3: '22nd Jan 2025'
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
    pricePerPack: 240,
    discountRate: 0.50,
    comboDiscountRate: 0.583333,
    testSchedule: {
      pack1: {
        test1: '29th Dec 2024',
        test2: '2nd Jan 2025',
        test3: '6th Jan 2025'
      },
      pack2: {
        test1: '10th Jan 2025',
        test2: '18th Jan 2025',
        test3: '22nd Jan 2025'
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
    pricePerPack: 240,
    discountRate: 0.50,
    comboDiscountRate: 0.583333,
    testSchedule: {
      pack1: {
        test1: '29th Dec 2024',
        test2: '2nd Jan 2025',
        test3: '6th Jan 2025'
      },
      pack2: {
        test1: '10th Jan 2025',
        test2: '18th Jan 2025',
        test3: '22nd Jan 2025'
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
    pricePerPack: 240,
    discountRate: 0.50,
    comboDiscountRate: 0.583333,
    testSchedule: {
      pack1: {
        test1: '29th Dec 2024',
        test2: '2nd Jan 2025',
        test3: '6th Jan 2025'
      },
      pack2: {
        test1: '10th Jan 2025',
        test2: '18th Jan 2025',
        test3: '22nd Jan 2025'
      }
    }
  },
];

export default tests;
