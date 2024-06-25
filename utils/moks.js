const mockPrismaClient = {
    user: {
        findUnique: jest.fn(),
    },
    natural_Person: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    legal_Person: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
    relationship_Natural_Legal: {
        findFirst: jest.fn(),
        create: jest.fn(),
    },
};  


module.exports = {
  mockPrismaClient,
};
