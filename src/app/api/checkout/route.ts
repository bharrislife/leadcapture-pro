import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'LeadCapture Pro - Annual Subscription',
              description: 'Unlimited lead capture for all your trade shows. $599/year.',
            },
            unit_amount: 59900, // $599.00
            recurring: {
              interval: 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')}/?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}