import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEST_RECIPIENT = 'mahad@datavoxx.se'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: roles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    const allowed = (roles || []).some(
      (r: { role: string }) => r.role === 'owner' || r.role === 'admin'
    )
    if (!allowed) return json({ error: 'Forbidden' }, 403)

    const body = await req.json().catch(() => null)
    const requestId = body?.requestId
    const mode = body?.mode === 'customer' ? 'customer' : 'test'
    if (typeof requestId !== 'string' || requestId.length < 10) {
      return json({ error: 'requestId krävs' }, 400)
    }

    const { data: request, error: reqError } = await admin
      .from('showroom_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle()

    if (reqError || !request) return json({ error: 'Förfrågan hittades inte' }, 404)

    const recipient = mode === 'test' ? TEST_RECIPIENT : request.email
    if (!recipient) return json({ error: 'Ingen mottagaradress' }, 400)

    if (mode === 'customer' && !request.test_sent_at) {
      return json({ error: 'Skicka ett testmejl först' }, 400)
    }

    const result = await sendTemplateEmail('showroom-invite', recipient, {
      templateData: {
        companyName: request.company_name ?? undefined,
        contactName: request.contact_name ?? undefined,
        selectedTemplate: request.selected_template ?? undefined,
        message: request.notes ?? undefined,
      },
      idempotencyKey: `showroom-invite-${mode}-${request.id}-${
        mode === 'test' ? Date.now() : 'final'
      }`,
    })

    if (!result.sent) {
      return json({ error: 'Mottagaren är blockerad för utskick', reason: result.reason }, 200)
    }

    const now = new Date().toISOString()
    await admin
      .from('showroom_requests')
      .update(
        mode === 'test'
          ? { test_sent_at: now, status: request.status === 'sent' ? 'sent' : 'tested' }
          : { sent_at: now, status: 'sent' }
      )
      .eq('id', request.id)

    return json({ success: true, mode, recipient })
  } catch (error) {
    console.error('send-showroom-email error:', error)
    return json({ error: (error as Error).message }, 500)
  }
})
