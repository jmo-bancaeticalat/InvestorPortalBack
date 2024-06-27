const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
  profile: {
    findMany: jest.fn(),
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
  images_Documents: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  document_Type: {
    findFirst: jest.fn(),
  },
  scales: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn()
  },
  risk_Profile: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  risk_Profile_Question_Selection: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  responses_Risk_Profile: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  risk_Profile_Questions: {
    findMany: jest.fn(),
  }
};  

const mockJwtVerify = jest.fn();


module.exports = {
  mockPrismaClient,
  mockJwtVerify,
};
