const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
  country: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  natural_Person: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  legal_Person: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  investment_Account_Natural: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  investment_Account_Legal: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  relationship_Natural_Legal: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  country_Tax_Residence: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  pEP: {
    create: jest.fn(),
  },
  income_Range: {
    findMany: jest.fn(),
  },
  occupation: {
    findMany: jest.fn(),
  },
  educational_Level: {
    findMany: jest.fn(),
  },
};  


module.exports = {
  mockPrismaClient,
};
