// Supabase Edge Function: submit-form
// Runtime: Deno / Supabase Edge Runtime
// Validates and saves form submissions into the PostgreSQL database.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const submissionData = await req.json();

    // 1. Server-side validation
    const { full_name, phone, city, state, form_type, age } = submissionData;
    if (!full_name || full_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Invalid full name. At least 2 characters required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const normalizedPhone = cleanPhone.length === 12 && cleanPhone.startsWith("91")
      ? cleanPhone.slice(2)
      : cleanPhone.slice(-10);

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return new Response(
        JSON.stringify({ error: "Invalid Indian mobile phone number. Must be 10 digits starting with 6-9." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ageNum = parseInt(String(age), 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 120) {
      return new Response(
        JSON.stringify({ error: "Invalid age value." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Generate unique reference code
    const refId = `VN-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 3. Connect to Supabase using internal service-role credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from("form_submissions")
      .insert({
        reference_id: refId,
        form_type: form_type || "citizen_welfare",
        full_name: full_name.trim(),
        age: ageNum,
        phone: normalizedPhone,
        email: submissionData.email?.trim() || null,
        city: city.trim(),
        state: state.trim(),
        address: submissionData.address?.trim() || null,
        preferred_language: submissionData.preferred_language || "Hindi",
        additional_details: submissionData.additional_details?.trim() || null,
        fields_payload: submissionData.fields_payload || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference_id: refId,
        id: data.id,
        created_at: data.created_at,
        message: "Form saved successfully to Supabase database.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process form submission" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
