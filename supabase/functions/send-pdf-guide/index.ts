import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendPdfRequest {
  email: string;
  helpTopic: string;
  description?: string;
}

const getGuideContent = (helpTopic: string): { subject: string; html: string } => {
  switch (helpTopic) {
    case "Skapa annonser":
      return {
        subject: "Din guide för att skapa bilannonser - Bilgen",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 28px; margin-bottom: 24px;">Guide: Skapa effektiva bilannonser</h1>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">1. Börja med rätt information</h2>
            <p style="color: #555; line-height: 1.6;">Fyll i alla biluppgifter noggrant - märke, modell, årsmodell, miltal och pris. Ju mer exakt information, desto bättre annons.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">2. Lyft fram utrustningen</h2>
            <p style="color: #555; line-height: 1.6;">Använd snabbvalsknapparna för vanlig utrustning och lägg till unika features i textfältet. Köpare söker ofta efter specifik utrustning.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">3. Välj rätt fokus</h2>
            <p style="color: #555; line-height: 1.6;">Bestäm vad som ska lyftas fram mest - finansiering, skick/utrustning eller en balanserad mix. Detta anpassar annonsens struktur.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">4. Lägg till finansieringsdetaljer</h2>
            <p style="color: #555; line-height: 1.6;">Inkludera räntor, kampanjer och försäkringserbjudanden för att göra annonsen mer säljande.</p>
            
            <p style="color: #888; margin-top: 40px; font-size: 14px;">Med vänliga hälsningar,<br>Bilgen-teamet</p>
          </div>
        `
      };
    case "Research bilar":
      return {
        subject: "Din guide för bilresearch - Bilgen",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 28px; margin-bottom: 24px;">Guide: Effektiv bilresearch</h1>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">1. Använd mallarna</h2>
            <p style="color: #555; line-height: 1.6;">Våra fördefinierade mallar hjälper dig ställa rätt frågor - vanliga problem, jämföra modeller eller djupdyka i en specifik bil.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">2. Var specifik</h2>
            <p style="color: #555; line-height: 1.6;">Ju mer specifik du är med märke, modell och årsmodell, desto mer relevant information får du tillbaka.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">3. Följ upp</h2>
            <p style="color: #555; line-height: 1.6;">Ställ följdfrågor för att gräva djupare. AI:n kommer ihåg konversationen så du kan bygga vidare.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">4. Använd kunskapen</h2>
            <p style="color: #555; line-height: 1.6;">Ta med insikterna till kundmöten - kunder uppskattar säljare som verkligen kan sina bilar.</p>
            
            <p style="color: #888; margin-top: 40px; font-size: 14px;">Med vänliga hälsningar,<br>Bilgen-teamet</p>
          </div>
        `
      };
    case "Skriva emails":
      return {
        subject: "Din guide för professionella emails - Bilgen",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 28px; margin-bottom: 24px;">Guide: Professionella kundmejl</h1>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">1. Välj rätt mall</h2>
            <p style="color: #555; line-height: 1.6;">Använd "Ny kontakt" för utåtriktade mejl, "Svara kund" för att besvara förfrågningar, eller "Köpintresse" för uppföljningar.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">2. Fyll i kontexten</h2>
            <p style="color: #555; line-height: 1.6;">Ge AI:n tillräckligt med kontext - kundens namn, vilken bil det gäller, och vad du vill uppnå med mejlet.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">3. Personifiera</h2>
            <p style="color: #555; line-height: 1.6;">Är du inloggad anpassas mejlen automatiskt med ditt företagsnamn för en personlig touch.</p>
            
            <h2 style="color: #333; font-size: 20px; margin-top: 32px;">4. Granska och skicka</h2>
            <p style="color: #555; line-height: 1.6;">Läs alltid igenom det genererade mejlet och gör eventuella justeringar innan du skickar.</p>
            
            <p style="color: #888; margin-top: 40px; font-size: 14px;">Med vänliga hälsningar,<br>Bilgen-teamet</p>
          </div>
        `
      };
    default:
      return {
        subject: "Din guide från Bilgen",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #000; font-size: 28px; margin-bottom: 24px;">Tack för ditt intresse!</h1>
            <p style="color: #555; line-height: 1.6;">Vi har tagit emot din förfrågan och återkommer snart med mer information.</p>
            <p style="color: #888; margin-top: 40px; font-size: 14px;">Med vänliga hälsningar,<br>Bilgen-teamet</p>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, helpTopic, description }: SendPdfRequest = await req.json();
    
    console.log(`Sending PDF guide for topic: ${helpTopic} to: ${email}`);

    const guide = getGuideContent(helpTopic);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Bilgen <onboarding@resend.dev>",
        to: [email],
        subject: guide.subject,
        html: guide.html,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-pdf-guide function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
