import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CarData {
  brand: string;
  model: string;
  year: string;
  fuelType?: string;
  transmission?: string;
  color?: string;
}

// Parse XML response from regcheck.org.uk
const parseXmlResponse = (xmlText: string): CarData | null => {
  try {
    // Extract values from XML using regex
    const getValue = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i');
      const match = xmlText.match(regex);
      return match ? match[1].trim() : '';
    };

    // Get CurrentTextValue from nested elements
    const getNestedValue = (parentTag: string): string => {
      const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)</${parentTag}>`, 'i');
      const parentMatch = xmlText.match(parentRegex);
      if (parentMatch) {
        const currentTextMatch = parentMatch[1].match(/<CurrentTextValue>([^<]*)<\/CurrentTextValue>/i);
        return currentTextMatch ? currentTextMatch[1].trim() : '';
      }
      return '';
    };

    const brand = getNestedValue('CarMake') || getValue('MakeDescription');
    const model = getNestedValue('CarModel') || getValue('ModelDescription');
    const year = getValue('RegistrationYear') || getValue('ModelYear') || '';
    const fuelType = getNestedValue('FuelType') || getValue('FuelDescription') || '';
    const transmission = getNestedValue('Transmission') || '';
    const color = getNestedValue('Colour') || getValue('ColourDescription') || '';

    if (!brand && !model) {
      console.log("No car data found in XML response");
      return null;
    }

    return {
      brand,
      model,
      year,
      fuelType,
      transmission,
      color,
    };
  } catch (error) {
    console.error("Error parsing XML:", error);
    return null;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrationNumber } = await req.json();

    if (!registrationNumber) {
      return new Response(
        JSON.stringify({ error: "Registreringsnummer krävs" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean and validate registration number
    const cleanRegNumber = registrationNumber.replace(/\s/g, '').toUpperCase();
    
    // Swedish registration number formats:
    // Old format: ABC 123 (3 letters + 3 digits)
    // New format: ABC 12D (3 letters + 2 digits + 1 letter/digit)
    const regexOld = /^[A-Z]{3}\d{3}$/;
    const regexNew = /^[A-Z]{3}\d{2}[A-Z0-9]$/;
    
    if (!regexOld.test(cleanRegNumber) && !regexNew.test(cleanRegNumber)) {
      return new Response(
        JSON.stringify({ error: "Ogiltigt svenskt registreringsnummer. Format: ABC 123 eller ABC 12D" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Looking up car with registration: ${cleanRegNumber}`);

    // Call regcheck.org.uk API
    const apiUrl = `https://www.regcheck.org.uk/api/reg.asmx/CheckSweden?RegistrationNumber=${encodeURIComponent(cleanRegNumber)}&username=supabaseG`;
    
    console.log(`Calling API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/xml",
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: "Kunde inte hämta bilinfo. Försök igen senare." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const xmlText = await response.text();
    console.log("API Response received:", xmlText.substring(0, 500));

    // Check for error response
    if (xmlText.includes("<vehicleJson />") || xmlText.includes("<vehicleJson/>")) {
      return new Response(
        JSON.stringify({ error: "Ingen bil hittades med detta registreringsnummer" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const carData = parseXmlResponse(xmlText);

    if (!carData) {
      return new Response(
        JSON.stringify({ error: "Kunde inte tolka bildata. Kontrollera registreringsnumret." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsed car data:", carData);

    return new Response(
      JSON.stringify({ carData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in car-lookup function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Okänt fel" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
