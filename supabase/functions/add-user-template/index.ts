import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse form data from n8n
    const formData = await req.formData()
    const user_id = formData.get('user_id') as string
    const template_name = formData.get('template_name') as string
    const request_id = formData.get('request_id') as string | null
    const template_image = formData.get('template_image') as File

    console.log('Received request:', { user_id, template_name, request_id, hasImage: !!template_image })

    if (!user_id || !template_name || !template_image) {
      console.error('Missing required fields:', { user_id, template_name, hasImage: !!template_image })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, template_name, template_image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Upload image to storage
    const fileName = `${template_name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`
    const filePath = `${user_id}/${fileName}`
    
    console.log('Uploading to storage:', filePath)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('templates')
      .upload(filePath, template_image, { 
        upsert: true,
        contentType: 'image/png'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload template image', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Upload successful:', uploadData)

    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('templates')
      .getPublicUrl(filePath)

    const templateUrl = urlData.publicUrl
    console.log('Public URL:', templateUrl)

    // 2. Get next display_order for this user
    const { data: existingTemplates, error: fetchError } = await supabase
      .from('user_templates')
      .select('display_order')
      .eq('user_id', user_id)
      .order('display_order', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching existing templates:', fetchError)
    }

    const nextOrder = existingTemplates?.[0]?.display_order 
      ? existingTemplates[0].display_order + 1 
      : 1

    console.log('Next display_order:', nextOrder)

    // 3. Insert new template into user_templates
    const { data: insertData, error: insertError } = await supabase
      .from('user_templates')
      .insert({
        user_id,
        name: template_name,
        template_url: templateUrl,
        display_order: nextOrder
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting user_template:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user template', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Template created:', insertData)

    // 4. Update request status to completed (if request_id provided)
    if (request_id) {
      const { error: updateError } = await supabase
        .from('template_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', request_id)

      if (updateError) {
        console.error('Error updating request status:', updateError)
        // Don't fail the whole request, just log the error
      } else {
        console.log('Request status updated to completed')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        template: insertData,
        message: `Template "${template_name}" added successfully for user ${user_id}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
