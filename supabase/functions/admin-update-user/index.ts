
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verificar se o usuário é o Rafael
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user || user.email !== 'rafael.christiano@yahoo.com.br') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado: apenas o super administrador pode executar esta ação' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { userId, action, newEmail, newPassword } = await req.json()

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'userId e action são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let result
    
    if (action === 'update_email' && newEmail) {
      const { data, error } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { email: newEmail }
      )
      result = { data, error }
    } else if (action === 'update_password' && newPassword) {
      const { data, error } = await supabaseClient.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )
      result = { data, error }
    } else {
      return new Response(
        JSON.stringify({ error: 'Ação inválida ou parâmetros faltando' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Log da operação
    await supabaseClient.from('audit_logs').insert({
      user_id: user.id,
      action_type: action.toUpperCase(),
      table_name: 'auth.users',
      record_id: userId,
      details: {
        target_user_id: userId,
        action: action,
        updated_field: action === 'update_email' ? 'email' : 'password'
      }
    })

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
