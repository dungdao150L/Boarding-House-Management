describe('billingClient', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.dontMock('axios');
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test('calculates billing locally', () => {
    const { calculateLocally } = require('../src/services/billingClient');

    const result = calculateLocally({
      electricityUnitPrice: 3500,
      electricityUsage: 10,
      roomFee: 3000000,
      serviceFee: 100000,
      waterUnitPrice: 15000,
      waterUsage: 2,
    });

    expect(result.electricityFee).toBe(35000);
    expect(result.waterFee).toBe(30000);
    expect(result.totalAmount).toBe(3165000);
  });

  test('uses local fallback when remote billing service is unavailable', async () => {
    process.env.NODE_ENV = 'production';
    process.env.BILLING_FALLBACK = 'true';
    jest.doMock('axios', () => ({
      post: jest.fn().mockRejectedValue(new Error('service down')),
    }));

    const { calculateBilling } = require('../src/services/billingClient');
    const result = await calculateBilling({
      electricityUnitPrice: 3500,
      electricityUsage: 1,
      roomFee: 1000,
      serviceFee: 100,
      waterUnitPrice: 15000,
      waterUsage: 1,
    });

    expect(result.totalAmount).toBe(19600);
  });

  test('uses remote billing service result when available', async () => {
    process.env.NODE_ENV = 'production';
    jest.doMock('axios', () => ({
      post: jest.fn().mockResolvedValue({
        data: {
          electricityFee: 7000,
          totalAmount: 120000,
          waterFee: 13000,
        },
      }),
    }));

    const { calculateBilling } = require('../src/services/billingClient');
    const result = await calculateBilling({
      electricityUnitPrice: 3500,
      electricityUsage: 2,
      roomFee: 100000,
      serviceFee: 0,
      waterUnitPrice: 13000,
      waterUsage: 1,
    });

    expect(result).toEqual({
      electricityFee: 7000,
      totalAmount: 120000,
      waterFee: 13000,
    });
  });

  test('throws remote billing error when fallback is disabled', async () => {
    process.env.NODE_ENV = 'production';
    process.env.BILLING_FALLBACK = 'false';
    jest.doMock('axios', () => ({
      post: jest.fn().mockRejectedValue(new Error('billing unavailable')),
    }));

    const { calculateBilling } = require('../src/services/billingClient');

    await expect(calculateBilling({
      electricityUnitPrice: 3500,
      electricityUsage: 1,
      roomFee: 1000,
      serviceFee: 100,
      waterUnitPrice: 15000,
      waterUsage: 1,
    })).rejects.toThrow('billing unavailable');
  });
});
