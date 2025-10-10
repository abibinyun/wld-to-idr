import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { wldAmount, userId } = await request.json();

    // Validation
    if (!wldAmount || !userId) {
      return NextResponse.json(
        { error: 'WLD amount and user ID are required' },
        { status: 400 }
      );
    }

    if (parseFloat(wldAmount) <= 0) {
      return NextResponse.json(
        { error: 'WLD amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get current WLD to IDR rate (mock data - in real app, fetch from API)
    const wldRate = 28500;
    const idrAmount = parseFloat(wldAmount) * wldRate;

    // Calculate fee (2.5%)
    const feeRate = 0.025;
    const fee = idrAmount * feeRate;
    const finalAmount = idrAmount - fee;

    // Mock transaction processing
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      wldAmount: parseFloat(wldAmount),
      idrAmount: finalAmount,
      fee,
      rate: wldRate,
      status: 'pending',
      timestamp: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    // In a real app, you would:
    // 1. Verify user balance
    // 2. Create transaction in database
    // 3. Generate wallet address for WLD deposit
    // 4. Set up blockchain monitoring
    // 5. Send confirmation email

    return NextResponse.json({
      success: true,
      transaction,
      message: 'Transaction created successfully. Please send WLD to the provided address.'
    });

  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current conversion rate
    const wldRate = 28500; // Mock rate - in real app, fetch from cryptocurrency API
    
    // Mock market data
    const marketData = {
      rate: wldRate,
      change24h: 2.5, // percentage
      volume24h: 1500000, // in USD
      lastUpdated: new Date().toISOString(),
      high24h: 29000,
      low24h: 28000
    };

    return NextResponse.json({
      success: true,
      data: marketData
    });

  } catch (error) {
    console.error('Rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion rate' },
      { status: 500 }
    );
  }
}