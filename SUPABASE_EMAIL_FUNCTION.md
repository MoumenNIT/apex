// Supabase Edge Function for sending emails
// Deploy to: supabase/functions/send-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, template, variables } = await req.json()

    // Email templates
    const templates = {
      order_confirmation: generateOrderConfirmationEmail(variables),
      order_status: generateOrderStatusEmail(variables),
      admin_notification: generateAdminNotificationEmail(variables),
    }

    const htmlContent = templates[template] || ''

    // Send email using Resend or similar service
    // For now, we'll log it (you can replace with actual email service)
    console.log(`Email to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Template: ${template}`)
    console.log(`HTML: ${htmlContent}`)

    // In production, replace with actual email service:
    // - Resend: https://resend.com
    // - SendGrid: https://sendgrid.com
    // - Mailgun: https://www.mailgun.com
    // - AWS SES: https://aws.amazon.com/ses/

    return new Response(
      JSON.stringify({ success: true, message: `Email queued to ${to}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Email Templates
function generateOrderConfirmationEmail(vars) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { color: #e63946; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .section { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
          .button { display: inline-block; background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Order Confirmation</div>
          
          <p>Hi ${vars.name},</p>
          <p>Thank you for your order! We're excited to process it.</p>
          
          <div class="section">
            <strong>Order Details</strong>
            <div class="item">
              <span>Order #</span>
              <span>${vars.orderNumber}</span>
            </div>
            <div class="item">
              <span>Order Date</span>
              <span>${vars.orderDate}</span>
            </div>
          </div>

          <div class="section">
            <strong>Items Ordered</strong>
            ${vars.items.map(item => `
              <div class="item">
                <span>${item.name} (qty: ${item.quantity})</span>
                <span>$${(item.price / 100).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="item" style="font-weight: bold; border-top: 2px solid #e63946;">
              <span>Total</span>
              <span>$${(vars.totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>

          <div class="section">
            <strong>Shipping Address</strong>
            <p>${vars.shippingAddress}</p>
          </div>

          <p>We will send you a tracking number as soon as your order ships.</p>
          
          <a href="${vars.trackingUrl}" class="button">Track Your Order</a>
          
          <div class="footer">
            <p>ApexSys Store | Thank you for shopping with us!</p>
            <p>© 2025 ApexSys. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateOrderStatusEmail(vars) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { color: #e63946; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .status-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #e63946; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
          .button { display: inline-block; background: #e63946; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Order Status Update</div>
          
          <p>Hi ${vars.name},</p>
          <p>${vars.statusMessage}</p>
          
          <div class="status-box">
            <strong>Order #${vars.orderNumber}</strong><br>
            Status: <strong>${vars.status.toUpperCase()}</strong>
          </div>

          <p>You can track your order progress at any time.</p>
          
          <a href="${vars.trackingUrl}" class="button">View Order Details</a>
          
          <div class="footer">
            <p>ApexSys Store | Thank you for shopping with us!</p>
            <p>© 2025 ApexSys. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

function generateAdminNotificationEmail(vars) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
          .header { color: #e63946; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .data-section { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 10px 0; font-family: monospace; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">⚠️ ${vars.subject}</div>
          
          <div class="alert-box">
            <strong>Admin Notification</strong><br>
            ${vars.message}
          </div>

          <div>
            <strong>Timestamp:</strong> ${vars.timestamp}
          </div>

          ${vars.data ? `
            <div class="data-section">
              <strong>Data:</strong><br>
              ${JSON.stringify(vars.data, null, 2)}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This is an automated notification from ApexSys Admin System</p>
          </div>
        </div>
      </body>
    </html>
  `
}
